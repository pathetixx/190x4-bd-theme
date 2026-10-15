/**
 * @name 190x4Companion
 * @description Компаньон темы 190x4: таблички с именем у участников голосового канала, пометка своих сообщений для чата в стиле Telegram (свои — справа) и анимации рамок, табличек и аватарок всегда — без наведения мыши; единая раскладка панели голосового подключения.
 * @version 2.2.0
 * @author 190x4
 * @source https://github.com/pathetixx/190x4-bd-theme/tree/main/plugins
 * @updateUrl https://raw.githubusercontent.com/pathetixx/190x4-bd-theme/main/plugins/190x4Companion.plugin.js
 */

const { DOM, ReactUtils, Webpack, Data, UI } = BdApi;

// Палитры табличек — копия таблицы Discord (darkBackground), по ним
// строится тот же градиент, что Discord рисует в списке участников.
const PALETTES = {
    crimson: "#900007", berry: "#893A99", sky: "#0080B7", teal: "#086460",
    forest: "#2D5401", bubble_gum: "#DC3E97", violet: "#730BC8", cobalt: "#0131C2",
    clover: "#047B20", lemon: "#F6CD12", white: "#FFFFFF", black: "#000000"
};

const CDN = "https://cdn.discordapp.com/media/v1/collectibles-shop/";
const ROW = '[class*="voiceUser__"]';
const NAME = '[class*="username__"]';
const MSG = 'li[id^="chat-messages-"]';
const GROUP_START = '[class*="groupStart_"]';
// анимируемое: рамки аватаров (по sku и по пресету), анимированные аватарки
// (хэш a_…), видео табличек с именем
const ANIM = 'img[src*="/collectibles-shop/"], img[src*="avatar-decoration-presets/"], img[src*="/a_"], video[src*="/collectibles-shop/"]';

// Раскладку панели голосового подключения Discord выбирает экспериментом:
// в варианте 2 пинг стоит строкой над статусом, статус и название канала —
// одним блоком, значок сигнала крупный. Тема рассчитана на этот вариант,
// а у части людей Discord включает другой — строки налезают друг на друга.
// Включаем вариант 2 на сеанс (без записи в аккаунт), у всех одинаково.
const LAYOUT_EXPERIMENT = "2026-09-a11y-chassis-target-size";
const LAYOUT_VARIANT = 2;

module.exports = class Companion {
    constructor(meta) { this.meta = meta; }

    start() {
        this.UserStore = Webpack.getStore("UserStore");
        this.GuildMemberStore = Webpack.getStore("GuildMemberStore");
        this.AccessibilityStore = Webpack.getStore("AccessibilityStore");
        this.MessageStore = Webpack.getStore("MessageStore");
        this.settings = { alwaysAnimate: Data.load(this.meta.name, "alwaysAnimate") ?? true };
        this.pinLayout();

        DOM.addStyle(this.meta.name, `
            .x4np-host { isolation: isolate; border-radius: var(--radius-sm, 4px); }
            .x4np {
                position: absolute; inset: 0; z-index: -1;
                overflow: hidden; border-radius: inherit; pointer-events: none;
            }
            .x4np-media { height: 100%; width: 100%; overflow: hidden; }
            .x4np video {
                position: absolute; inset-inline-end: 0; top: 0;
                height: 100%; width: auto; object-position: right center;
                opacity: 0.6; transition: opacity 0.3s;
            }
            .x4np-host:hover .x4np video { opacity: 0.9; }
        `);

        // Пересканируем не чаще раза в 250 мс: MutationObserver на body
        // ловит сотни мутаций в секунду, работа — только по таймеру.
        this.scan = this.scan.bind(this);
        this.observer = new MutationObserver(() => {
            if (this.timer) return;
            this.timer = setTimeout(() => { this.timer = null; this.scan(); }, 250);
        });
        this.observer.observe(document.body, { childList: true, subtree: true });

        // Discord возвращает статичную картинку при уходе курсора (меняет src)
        // и ставит видео табличек на паузу — сразу возвращаем анимацию.
        this.srcObserver = new MutationObserver(muts => {
            if (!this.animating()) return;
            for (const m of muts) this.animateNode(m.target);
        });
        this.srcObserver.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["src"] });
        this.onPause = e => {
            const v = e.target;
            if (v?.tagName === "VIDEO" && this.animating() && (v.currentSrc || v.src || "").includes("/collectibles-shop/")) {
                setTimeout(() => v.isConnected && v.paused && v.play().catch(() => {}), 0);
            }
        };
        document.addEventListener("pause", this.onPause, true);
        this.scan();
    }

    getSettingsPanel() {
        return UI.buildSettingsPanel({
            settings: [{
                type: "switch",
                id: "alwaysAnimate",
                name: "Анимации всегда",
                note: "Рамки аватаров, таблички с именем и анимированные аватарки играют без наведения мыши. Если в Discord включено «уменьшение движения» — не трогаем.",
                value: this.settings.alwaysAnimate
            }],
            onChange: (_, id, value) => {
                this.settings[id] = value;
                Data.save(this.meta.name, id, value);
                if (value) this.animateAll(); else this.restoreStatic();
            }
        });
    }

    animating() {
        return this.settings?.alwaysAnimate && !this.AccessibilityStore?.useReducedMotion;
    }

    // Статичный URL → анимированный (null — менять нечего). Проверено по CDN:
    // collectibles-shop/<sku>/static → /animated (APNG), пресеты рамок
    // passthrough=false → true, аватарки a_<hash> → animated=true.
    static animatedSrc(src) {
        if (!src) return null;
        if (src.includes("/collectibles-shop/") && /\/static(\?|$)/.test(src)) return src.replace(/\/static(\?|$)/, "/animated$1");
        if (src.includes("avatar-decoration-presets/") && src.includes("passthrough=false")) return src.replace("passthrough=false", "passthrough=true");
        if (/\/a_[0-9a-f]+\.(webp|png|jpg|gif)/.test(src) && /\/(avatars|banners)\//.test(src) && !/[?&]animated=true/.test(src)) {
            return src + (src.includes("?") ? "&" : "?") + "animated=true";
        }
        return null;
    }

    animateNode(el) {
        if (el.tagName === "IMG") {
            const next = Companion.animatedSrc(el.getAttribute("src"));
            if (next) {
                el.dataset.x4Static = el.getAttribute("src");
                el.setAttribute("src", next);
            }
        } else if (el.tagName === "VIDEO" && (el.currentSrc || el.src || "").includes("/collectibles-shop/") && el.paused) {
            el.muted = true;
            el.loop = true;
            el.play().catch(() => {});
        }
    }

    animateAll() {
        if (!this.animating()) return;
        document.querySelectorAll(ANIM).forEach(el => this.animateNode(el));
    }

    restoreStatic() {
        document.querySelectorAll("img[data-x4-static]").forEach(img => {
            img.setAttribute("src", img.dataset.x4Static);
            delete img.dataset.x4Static;
        });
        document.querySelectorAll('video[src*="/collectibles-shop/"]').forEach(v => v.pause());
    }

    stop() {
        this.unpinLayout();
        this.observer?.disconnect();
        this.observer = null;
        this.srcObserver?.disconnect();
        this.srcObserver = null;
        document.removeEventListener("pause", this.onPause, true);
        this.restoreStatic();
        clearTimeout(this.timer);
        this.timer = null;
        document.querySelectorAll(".x4np").forEach(n => n.remove());
        document.querySelectorAll(".x4np-host").forEach(row => this.unhost(row));
        document.querySelectorAll("[data-x4-self], [data-x4-end]").forEach(li => {
            delete li.dataset.x4Self;
            delete li.dataset.x4End;
        });
        DOM.removeStyle(this.meta.name);
    }

    pinLayout() {
        try {
            this.Dispatcher = Webpack.getModule(m => m?.dispatch && m?.subscribe, { searchExports: true });
            const store = Webpack.getStore("ApexExperimentStore");
            // свой вариант, выставленный руками, не трогаем
            if (!this.Dispatcher || store?.getExperimentSessionOverride?.(LAYOUT_EXPERIMENT)) return;
            this.Dispatcher.dispatch({ type: "APEX_EXPERIMENT_SESSION_OVERRIDE_CREATE", experimentName: LAYOUT_EXPERIMENT, variantId: LAYOUT_VARIANT });
            this.layoutPinned = true;
        } catch (e) {
            console.error("[190x4Companion] layout pin failed", e);
        }
    }

    unpinLayout() {
        if (!this.layoutPinned) return;
        this.layoutPinned = false;
        try {
            this.Dispatcher?.dispatch({ type: "APEX_EXPERIMENT_SESSION_OVERRIDE_DELETE", experimentName: LAYOUT_EXPERIMENT });
        } catch (e) { /* Discord уже выгружается */ }
    }

    // user и guildId лежат в props строки войса (2 уровня вверх по fiber).
    rowProps(row) {
        let fiber = ReactUtils.getInternalInstance(row);
        for (let depth = 0; fiber && depth < 8; depth++, fiber = fiber.return) {
            const props = fiber.memoizedProps;
            if (props?.user?.id) return props;
        }
        return null;
    }

    // Как у Discord: серверная табличка участника важнее глобальной.
    nameplateFor(props) {
        const guildId = props.guildId ?? props.channel?.guild_id;
        const member = guildId ? this.GuildMemberStore?.getMember(guildId, props.user.id) : null;
        const user = this.UserStore?.getUser(props.user.id) ?? props.user;
        return member?.collectibles?.nameplate ?? user?.collectibles?.nameplate ?? null;
    }

    scan() {
        for (const row of document.querySelectorAll(ROW)) {
            try { this.render(row); } catch (e) { console.error(`[${this.meta.name}]`, e); }
        }
        try { this.markMessages(); } catch (e) { console.error(`[${this.meta.name}]`, e); }
        try { this.animateAll(); } catch (e) { console.error(`[${this.meta.name}]`, e); }
    }

    // Чат «как в Telegram» рисует тема, но в разметке Discord нет признака
    // «моё сообщение» и «последнее в группе». Ставим их атрибутами на <li>:
    //   data-x4-self — автор = текущий пользователь (тема уводит вправо);
    //   data-x4-end  — последнее сообщение группы (хвостик пузыря).
    // id элемента: chat-messages-<channelId>-<messageId>.
    markMessages() {
        const me = this.UserStore?.getCurrentUser()?.id;
        if (!me) return;
        for (const li of document.querySelectorAll(MSG)) {
            const [channelId, messageId] = li.id.slice("chat-messages-".length).split("-");
            const author = this.MessageStore?.getMessage(channelId, messageId)?.author?.id;
            const self = author === me;
            if (self !== (li.dataset.x4Self === "1")) {
                if (self) li.dataset.x4Self = "1"; else delete li.dataset.x4Self;
            }
            // Группа кончается, если дальше не продолжение: другой узел
            // (разделитель даты, «новые сообщения») или новый groupStart.
            const next = li.nextElementSibling;
            const end = !next?.matches(MSG) || !!next.querySelector(`:scope > ${GROUP_START}`);
            if (end !== (li.dataset.x4End === "1")) {
                if (end) li.dataset.x4End = "1"; else delete li.dataset.x4End;
            }
        }
    }

    render(row) {
        const props = this.rowProps(row);
        const plate = props && this.nameplateFor(props);
        const existing = row.querySelector(":scope > .x4np");

        if (!plate?.skuId) {
            if (existing) { existing.remove(); this.unhost(row); }
            return;
        }
        if (existing?.dataset.sku === plate.skuId) return this.updateMask(row, existing);
        existing?.remove();

        const color = PALETTES[plate.palette] ?? PALETTES.crimson;
        const node = document.createElement("div");
        node.className = "x4np";
        node.dataset.sku = plate.skuId;
        node.setAttribute("aria-hidden", "true");
        node.style.background = `linear-gradient(90deg, transparent 0%, ${color}14 20%, ${color}14 50%, ${color}33 100%)`;

        const media = document.createElement("div");
        media.className = "x4np-media";
        const video = document.createElement("video");
        video.src = `${CDN}${plate.skuId}/video`;
        video.poster = `${CDN}${plate.skuId}/static`;
        video.preload = "none";
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.tabIndex = -1;
        media.appendChild(video);
        node.appendChild(media);

        row.classList.add("x4np-host");
        row.prepend(node);
        this.updateMask(row, node);

        if (!row.dataset.x4npHover) {
            row.dataset.x4npHover = "1";
            row._x4npEnter = () => {
                if (this.AccessibilityStore?.useReducedMotion) return;
                row.querySelector(":scope > .x4np video")?.play().catch(() => {});
            };
            row._x4npLeave = () => { if (!this.animating()) row.querySelector(":scope > .x4np video")?.pause(); };
            row.addEventListener("mouseenter", row._x4npEnter);
            row.addEventListener("mouseleave", row._x4npLeave);
        }
    }

    // Картинка таблички приглушается под ником — маска с началом за концом
    // имени, как у Discord в списке участников.
    updateMask(row, node) {
        const name = row.querySelector(NAME);
        if (!name) return;
        const end = Math.round(name.getBoundingClientRect().right - row.getBoundingClientRect().left) + 10;
        const mask = `linear-gradient(to right, rgba(0, 0, 0, 0.3) ${end}px, rgb(0, 0, 0) ${end + 50}px)`;
        const media = node.firstChild;
        if (media.style.maskImage !== mask) media.style.maskImage = mask;
    }

    unhost(row) {
        row.classList.remove("x4np-host");
        if (row._x4npEnter) row.removeEventListener("mouseenter", row._x4npEnter);
        if (row._x4npLeave) row.removeEventListener("mouseleave", row._x4npLeave);
        delete row._x4npEnter;
        delete row._x4npLeave;
        delete row.dataset.x4npHover;
    }
};
