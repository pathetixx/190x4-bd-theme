/**
 * @name 190x4Companion
 * @description Компаньон темы 190x4: таблички с именем у участников голосового канала и пометка своих сообщений для чата в стиле Telegram (свои — справа).
 * @version 2.0.0
 * @author 190x4
 * @source https://github.com/pathetixx/190x4-bd-theme/tree/main/plugins
 * @updateUrl https://raw.githubusercontent.com/pathetixx/190x4-bd-theme/main/plugins/190x4Companion.plugin.js
 */

const { DOM, ReactUtils, Webpack } = BdApi;

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

module.exports = class Companion {
    constructor(meta) { this.meta = meta; }

    start() {
        this.UserStore = Webpack.getStore("UserStore");
        this.GuildMemberStore = Webpack.getStore("GuildMemberStore");
        this.AccessibilityStore = Webpack.getStore("AccessibilityStore");
        this.MessageStore = Webpack.getStore("MessageStore");

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
        this.scan();
    }

    stop() {
        this.observer?.disconnect();
        this.observer = null;
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
            row._x4npLeave = () => row.querySelector(":scope > .x4np video")?.pause();
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
