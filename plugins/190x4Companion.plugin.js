/**
 * @name 190x4Companion
 * @description Компаньон темы 190x4: таблички с именем у участников голосового канала, пометка своих сообщений для чата в стиле Telegram (свои — справа) и анимации рамок, табличек и аватарок всегда — без наведения мыши; единая раскладка панели голосового подключения; окно мини-стрима можно скрыть крестиком и вернуть кнопкой «Стрим»; ускорение темы — меньше подтормаживаний при наведении, вводе и в звуковой панели.
 * @version 2.5.0
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
// Окно мини-стрима, которое Discord держит поверх всего приложения.
const PIP = '[class*="pictureInPictureWindow_"]';
// Правая часть шапки окна: «Почта», «Помощь», кнопки окна. Скрытую
// системную шапку (systemBar_) с тем же классом пропускаем.
const TITLE_TRAILING = '[class*="bar_"]:not([class*="systemBar_"]) > [class*="trailing_"]';
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

// Ускорение темы. Тема цепляется за классы Discord подстрокой ([class*="panels__"]),
// потому что хэши в именах классов меняются с обновлениями. Chromium такие селекторы
// не умеет индексировать: [class*=] в позиции предка заставляет пересчитывать стили
// всего поддерева при любой смене класса (наведение, ввод, открытие панелей), а
// справа — проверять правило на каждом элементе. Здесь подстроки подменяются
// точными классами Discord прямо в CSSOM таблицы темы: текст темы не меняется,
// при обновлении Discord или темы всё собирается заново.
const THEME_STYLE = "190x4-theme-container";
// токен сейчас не совпадает ни с одним классом — заглушка, которая ничего не ловит;
// появится нужный CSS-чанк Discord — таблица пересоберётся
const NONE = ".x4c-none";
const RE_HASHED = /^\S+_[0-9a-f]{5,6}$/;
const ATTR = /^\[class([*^$])="((?:[^"\\]|\\.)*)"\]/;
// пределы: KA — классов в предке при «широкой» правой части, KB — при узкой,
// KR — развёртка правой части по классам, EXP — копий селектора, LIMIT — его длина
const KA = 128, KB = 600, KR = 200, EXP = 64, LIMIT = 6000;

function splitTop(s) {
    const out = []; let d = 0, q = null, cur = "";
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (q) { cur += ch; if (ch === "\\") cur += s[++i] ?? ""; else if (ch === q) q = null; continue; }
        if (ch === '"' || ch === "'") q = ch;
        else if (ch === "(" || ch === "[") d++;
        else if (ch === ")" || ch === "]") d--;
        if (ch === "," && d === 0) { out.push(cur.trim()); cur = ""; } else cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
}

// сложный селектор -> [{c: компаунд, j: комбинатор перед ним}]
function complexParts(s) {
    const out = []; let d = 0, q = null, cur = "", j = "";
    const flush = () => { if (cur) { out.push({ c: cur, j }); cur = ""; j = ""; } };
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (q) { cur += ch; if (ch === "\\") cur += s[++i] ?? ""; else if (ch === q) q = null; continue; }
        if (ch === "\\") { cur += ch + (s[++i] ?? ""); continue; }
        if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
        if (ch === "(" || ch === "[") d++;
        else if (ch === ")" || ch === "]") d--;
        if (d === 0 && (ch === " " || ch === ">" || ch === "+" || ch === "~")) {
            flush();
            if (ch !== " ") j = ch; else if (!j) j = " ";
            continue;
        }
        cur += ch;
    }
    flush();
    return out;
}

// компаунд -> части: {t:"attr",op,v,raw} | {t:"fn",name,arg,raw} | {t:"x",raw}
function compoundParts(c) {
    const out = []; let i = 0;
    const close = (k, open, shut) => {
        let d = 0, q = null;
        for (; k < c.length; k++) {
            const x = c[k];
            if (q) { if (x === "\\") k++; else if (x === q) q = null; continue; }
            if (x === '"' || x === "'") q = x; else if (x === open) d++; else if (x === shut && !--d) break;
        }
        return k;
    };
    while (i < c.length) {
        if (c[i] === "[") {
            const k = close(i, "[", "]"), raw = c.slice(i, k + 1), m = raw.match(ATTR);
            out.push(m ? { t: "attr", op: m[1], v: m[2].replace(/\\(.)/g, "$1"), raw } : { t: "x", raw });
            i = k + 1; continue;
        }
        const fm = c.slice(i).match(/^:(is|where|not|has)\(/);
        if (fm) {
            const k = close(i + fm[0].length - 1, "(", ")");
            out.push({ t: "fn", name: fm[1], arg: c.slice(i + fm[0].length, k), raw: c.slice(i, k + 1) });
            i = k + 1; continue;
        }
        let k = i + 1;
        const pm = c[i] === ":" && c.slice(i).match(/^::?[\w-]+\(/);
        if (pm) k = close(i + pm[0].length - 1, "(", ")") + 1;
        else while (k < c.length && c[k] !== "[" && c[k] !== ":") k += c[k] === "\\" ? 2 : 1;
        out.push({ t: "x", raw: c.slice(i, k) });
        i = k;
    }
    return out;
}

function makeCompiler(classes) {
    const cache = new Map();
    const stat = { rules: 0, exact: 0, none: 0, kept: [], budget: 0 };
    const esc = s => CSS.escape(s);
    const big = "\n" + classes.join("\n") + "\n";
    // классы, где встречается подстрока (*=), с которых начинается (^=) или которыми кончается ($=)
    const hits = (op, v) => {
        const key = op + v;
        let h = cache.get(key);
        if (h) return h;
        const needle = op === "^" ? "\n" + v : op === "$" ? v + "\n" : v;
        h = [];
        for (let i = big.indexOf(needle); i >= 0;) {
            const s0 = op === "^" ? i + 1 : big.lastIndexOf("\n", i) + 1;
            const e0 = big.indexOf("\n", op === "^" ? i + 1 : i);
            h.push(big.slice(s0, e0));
            i = big.indexOf(needle, e0);
        }
        cache.set(key, h);
        return h;
    };
    const asIs = h => h.length === 1 ? "." + esc(h[0]) : ":is(" + h.map(c => "." + esc(c)).join(", ") + ")";
    const join = p => p.j && p.j !== " " ? " " + p.j + " " : p.j;
    const product = lists => lists.reduce((acc, l) => acc.flatMap(a => l.map(x => a.concat([x]))), [[]]);

    // предок и аргументы :has(): все class-подстроки -> точные классы
    const ancList = (list, ka) => splitTop(list).map(s => complexParts(s).map(p => join(p) + ancCompound(p.c, ka)).join("").trim()).join(", ");
    function ancToken(p, ka) {
        if (/\s/.test(p.v)) { stat.kept.push(p.v); return null; }
        const h = hits(p.op, p.v);
        if (!h.length) { stat.none++; return [NONE]; }
        if (h.length <= ka) { stat.exact++; return h; }
        stat.kept.push(p.v + " (" + h.length + ")");
        return null;
    }
    function ancCompound(c, ka) {
        return compoundParts(c).map(p => {
            if (p.t === "attr") { const h = ancToken(p, ka); return !h ? p.raw : h[0] === NONE ? NONE : asIs(h); }
            if (p.t === "fn") return ":" + p.name + "(" + ancList(p.arg, ka) + ")";
            return p.raw;
        }).join("");
    }
    // компаунд предка -> варианты: по одному классу на токен, чтобы работал
    // фильтр Блума по предкам (у :is() из многих классов его нет)
    function ancAlts(c, ka) {
        const lists = compoundParts(c).map(p => {
            if (p.t === "attr") { const h = ancToken(p, ka); return !h ? [p.raw] : h[0] === NONE ? [NONE] : h.map(x => "." + esc(x)); }
            if (p.t === "fn") return [":" + p.name + "(" + ancList(p.arg, ka) + ")"];
            return [p.raw];
        });
        return { lists, n: lists.reduce((m, l) => m * l.length, 1) };
    }
    // аргумент :is()/:where() справа: простой оставляем (меняется только сам элемент),
    // у сложного переводим предков
    function rightArg(sel, ka) {
        const ps = complexParts(sel);
        if (ps.length < 2) return sel;
        return ps.map((p, i) => join(p) + (i < ps.length - 1 ? ancCompound(p.c, ka) : p.c)).join("").trim();
    }
    // правый компаунд: один токен с наименьшим числом классов -> развёртка
    // (правило попадает в корзину класса); :not() не трогаем
    function rightAlts(c, ka, expand) {
        const parts = compoundParts(c);
        let best = -1, bh = null, none = -1;
        parts.forEach((p, i) => {
            if (p.t !== "attr" || p.op !== "*" || /\s/.test(p.v)) return;
            const h = hits(p.op, p.v);
            if (!h.length) none = i;
            else if (h.length <= KR && (!bh || h.length < bh.length)) { best = i; bh = h; }
        });
        const use = none < 0 && bh && (expand || bh.length === 1);
        const lists = parts.map((p, i) => {
            if (p.t === "fn" && p.name === "has") return [":has(" + ancList(p.arg, KA) + ")"];
            if (p.t === "fn" && p.name !== "not") return [":" + p.name + "(" + splitTop(p.arg).map(a => rightArg(a, ka)).join(", ") + ")"];
            if (i === none) { stat.none++; return [NONE]; }
            if (use && i === best) { stat.exact++; return bh.map(x => "." + esc(x)); }
            return [p.raw];
        });
        return { lists, n: use ? bh.length : 1 };
    }
    // узкая правая часть: есть тег, id, класс или развёртываемый токен
    function narrow(c) {
        const parts = compoundParts(c);
        const plain = parts.filter(p => p.t === "x").map(p => p.raw).join("");
        return /(^|[^\\])[#.][\w-]|^[a-z]/i.test(plain) ||
            parts.some(p => p.t === "attr" && p.op === "*" && hits(p.op, p.v).length && hits(p.op, p.v).length <= KR);
    }
    function build(sel, expandRight) {
        const ps = complexParts(sel);
        if (!ps.length) return [sel];
        const last = ps[ps.length - 1];
        const nr = narrow(last.c), ka = nr ? KB : KA;
        const comps = ps.map((p, i) => i < ps.length - 1 ? ancAlts(p.c, ka) : rightAlts(p.c, ka, expandRight));
        // у широкой правой части (*, svg > * …) копии множили бы проверки
        // на каждом элементе — там предки всегда одним :is()
        const cap = nr && expandRight ? EXP : 1;
        const total = () => comps.reduce((m, x) => m * x.n, 1);
        while (total() > cap) {
            let wi = -1, wn = 1;
            comps.forEach((x, i) => { if (i < comps.length - 1 && x.n > wn) { wi = i; wn = x.n; } });
            if (wi < 0) break;
            const x = comps[wi];
            x.lists = x.lists.map(l => l.length > 1 ? [":is(" + l.join(", ") + ")"] : l);
            x.n = 1;
        }
        const per = comps.map(x => product(x.lists).map(a => a.join("")));
        return product(per).map(seq => seq.map((s, i) => (i ? (ps[i].j && ps[i].j !== " " ? " " + ps[i].j + " " : " ") : "") + s).join("").trim());
    }
    function compileSelector(sel) {
        const out = build(sel, true);
        if (out.reduce((n, x) => n + x.length, 0) <= LIMIT) return out;
        // длинные списки предков в каждой копии правой части раздувают таблицу
        stat.budget++;
        return build(sel, false);
    }
    const compileText = text => splitTop(text).flatMap(compileSelector).join(", ");
    return { compileText, stat };
}

class ThemeBooster {
    constructor(name) {
        this.name = name;
        this.applied = [];
        this.onThemeChange = () => this.schedule(300);
        this.onHead = muts => {
            if (muts.some(m => [...m.addedNodes].some(n => n.nodeName === "LINK" || n.nodeName === "STYLE"))) this.schedule(1500);
        };
    }

    themeStyle() {
        return document.getElementById(THEME_STYLE) ||
            [...document.querySelectorAll("bd-themes style")].find(s => /@name\s+190x4\s/.test(s.textContent.slice(0, 300)));
    }

    // все классы Discord: карты классов из модулей webpack, селекторы его таблиц и DOM
    buildIndex(skip) {
        const set = new Set();
        BdApi.Webpack.getModules(m => {
            if (!m || typeof m !== "object" || Array.isArray(m)) return false;
            let n = 0, ok = 0;
            for (const k in m) { const v = m[k]; n++; if (typeof v === "string" && v.split(" ").every(p => RE_HASHED.test(p))) ok++; }
            if (n && ok / n > 0.8) for (const k in m) { const v = m[k]; if (typeof v === "string") for (const p of v.split(" ")) set.add(p); }
            return false;
        }, { searchExports: false });
        const walk = list => {
            for (const r of list) {
                if (r.cssRules && !r.selectorText) walk(r.cssRules);
                const t = r.selectorText;
                if (t) for (const m of t.matchAll(/\.((?:[\w-]|\\.)+)/g)) set.add(m[1].replace(/\\(.)/g, "$1"));
            }
        };
        for (const sh of document.styleSheets) {
            if (sh.ownerNode === skip) continue;
            try { walk(sh.cssRules); } catch { /* чужой origin */ }
        }
        for (const e of document.querySelectorAll("[class]")) for (const c of e.classList) set.add(c);
        set.delete(NONE.slice(1));
        return [...set];
    }

    start() {
        this.headObserver = new MutationObserver(this.onHead);
        this.headObserver.observe(document.head, { childList: true });
        this.schedule(0);
    }

    schedule(ms) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.timer = null;
            try { this.run(); } catch (e) { console.error(`[${this.name}] ускорение темы`, e); }
        }, ms);
    }

    // следим за <bd-themes>: BD пересоздаёт таблицу при обновлении темы
    watchTheme(style) {
        const host = style.parentNode;
        if (this.host === host) return;
        this.themeObserver?.disconnect();
        this.host = host;
        this.themeObserver = new MutationObserver(this.onThemeChange);
        this.themeObserver.observe(host, { childList: true, subtree: true, characterData: true });
    }

    run() {
        const style = this.themeStyle();
        if (!style?.sheet) { if ((this.tries = (this.tries || 0) + 1) < 20) this.schedule(1000); return; }
        this.watchTheme(style);
        const t0 = performance.now();
        const C = makeCompiler(this.buildIndex(style));
        const sheet = style.sheet;
        const fresh = this.sheet !== sheet;
        if (fresh) { this.sheet = sheet; this.applied = []; }
        const orig = new Map(this.applied);
        const applied = [];
        let changed = 0;
        const walk = list => {
            for (const r of list) {
                if (r instanceof CSSStyleRule) {
                    const src = orig.get(r) ?? r.selectorText;
                    if (!src.includes("[class")) continue;
                    const out = C.compileText(src);
                    if (out === src) continue;
                    if (r.selectorText !== out) {
                        r.selectorText = out;
                        if (r.selectorText === src) { console.warn(`[${this.name}] селектор не принят:`, src); continue; }
                        changed++;
                    }
                    C.stat.rules++;
                    applied.push([r, src]);
                } else if (r.cssRules) walk(r.cssRules);
            }
        };
        walk(sheet.cssRules);
        // правила, которые теперь не меняются, — вернуть как в теме
        const keep = new Set(applied.map(a => a[0]));
        for (const [r, src] of this.applied) if (!keep.has(r)) { r.selectorText = src; changed++; }
        this.applied = applied;
        if (changed) {
            const s = C.stat;
            console.log(`[${this.name}] ускорение темы: ${s.rules} правил, ${s.exact} подстрок -> точные классы, ` +
                `${s.none} без совпадений, ${Math.round(performance.now() - t0)} мс`,
                s.kept.length ? { оставлены: s.kept } : "");
        }
    }

    stop() {
        clearTimeout(this.timer);
        this.headObserver?.disconnect();
        this.themeObserver?.disconnect();
        this.host = null;
        if (this.sheet && this.themeStyle()?.sheet === this.sheet) for (const [r, src] of this.applied) r.selectorText = src;
        this.applied = [];
        this.sheet = null;
    }
}

module.exports = class Companion {
    constructor(meta) { this.meta = meta; }

    start() {
        this.UserStore = Webpack.getStore("UserStore");
        this.GuildMemberStore = Webpack.getStore("GuildMemberStore");
        this.AccessibilityStore = Webpack.getStore("AccessibilityStore");
        this.MessageStore = Webpack.getStore("MessageStore");
        this.settings = {
            alwaysAnimate: Data.load(this.meta.name, "alwaysAnimate") ?? true,
            fastTheme: Data.load(this.meta.name, "fastTheme") ?? true
        };
        if (this.settings.fastTheme) this.startBooster();
        this.pipHidden = Data.load(this.meta.name, "pipHidden") ?? false;
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

            html[data-x4-pip-hidden] ${PIP} { visibility: hidden !important; pointer-events: none !important; }
            .x4pip-close, .x4pip-show {
                display: flex; align-items: center; justify-content: center;
                border: 1px solid rgba(255, 26, 58, 0.55); color: #fff; cursor: pointer;
                background: rgba(10, 10, 15, 0.82); font: 600 12px/1 var(--font-primary, sans-serif);
            }
            .x4pip-close:hover, .x4pip-show:hover { background: #ff1a3a; border-color: #ff2d4d; }
            .x4pip-close {
                position: absolute; top: 8px; right: 8px; z-index: 10;
                width: 24px; height: 24px; padding: 0; border-radius: 4px;
                opacity: 0; transition: opacity 0.15s;
            }
            ${PIP}:hover .x4pip-close { opacity: 1; }
            .x4pip-show {
                gap: 6px; height: 24px; padding: 0 10px; margin-inline-end: 12px;
                border-radius: 4px; box-shadow: 0 0 12px rgba(255, 26, 58, 0.3);
                -webkit-app-region: no-drag; flex-shrink: 0;
            }
            .x4pip-close svg, .x4pip-show svg { width: 14px; height: 14px; }
        `);

        // Сообщения ленты помечаем сразу, в колбэке: он срабатывает до
        // отрисовки кадра, и новое сообщение ни разу не мелькнёт по старой
        // разметке. Остальное пересканируем не чаще раза в 250 мс:
        // MutationObserver на body ловит сотни мутаций в секунду.
        this.scan = this.scan.bind(this);
        this.observer = new MutationObserver(muts => {
            try { this.markMutated(muts); } catch (e) { console.error(`[${this.meta.name}]`, e); }
            if (this.timer) return;
            this.timer = setTimeout(() => { this.timer = null; this.scan(); }, 250);
        });
        // id — у отправленного сообщения временный id меняется на настоящий.
        this.observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["id"] });

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
            }, {
                type: "switch",
                id: "fastTheme",
                name: "Ускорение темы",
                note: "Тема 190x4 подстраивается под текущую версию Discord, и наведение, ввод текста и звуковая панель меньше подтормаживают. Внешний вид не меняется.",
                value: this.settings.fastTheme
            }],
            onChange: (_, id, value) => {
                this.settings[id] = value;
                Data.save(this.meta.name, id, value);
                if (id === "fastTheme") { if (value) this.startBooster(); else this.stopBooster(); return; }
                if (value) this.animateAll(); else this.restoreStatic();
            }
        });
    }

    startBooster() {
        this.stopBooster();
        this.booster = new ThemeBooster(this.meta.name);
        this.booster.start();
    }

    stopBooster() {
        this.booster?.stop();
        this.booster = null;
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
        this.stopBooster();
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
        document.querySelectorAll(".x4pip-close, .x4pip-show").forEach(n => n.remove());
        delete document.documentElement.dataset.x4PipHidden;
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
        try { this.syncPip(); } catch (e) { console.error(`[${this.meta.name}]`, e); }
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
        for (const li of document.querySelectorAll(MSG)) this.markMessage(li, me);
    }

    markMessage(li, me) {
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

    // Только то, что затронули мутации: новые <li>, сменившие id, и соседи
    // сверху — у них мог переехать конец группы. При подгрузке истории
    // Discord пересоздаёт всю ленту, поэтому без задержки здесь мигала бы
    // вся переписка.
    markMutated(muts) {
        const touched = new Set();
        for (const m of muts) {
            if (m.type === "attributes") {
                if (m.target.matches?.(MSG)) touched.add(m.target);
                continue;
            }
            if (m.target.tagName === "OL" && m.previousSibling?.nodeType === 1 && m.previousSibling.matches(MSG)) {
                touched.add(m.previousSibling);
            }
            for (const n of m.addedNodes) {
                if (n.nodeType !== 1) continue;
                if (n.matches(MSG)) touched.add(n);
                else if (n.parentElement?.matches(MSG)) touched.add(n.parentElement);
                else if (n.firstElementChild) for (const li of n.querySelectorAll(MSG)) touched.add(li);
            }
        }
        if (!touched.size) return;
        const me = this.UserStore?.getCurrentUser()?.id;
        if (!me) return;
        for (const li of [...touched]) {
            const prev = li.previousElementSibling;
            if (prev?.matches(MSG)) touched.add(prev);
        }
        for (const li of touched) if (li.isConnected) this.markMessage(li, me);
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

    // Окно мини-стрима: крестик прячет его, кнопка «Стрим» в шапке окна
    // слева от «Почты» возвращает. Окно остаётся в DOM (visibility),
    // Discord его не теряет.
    setPipHidden(hidden) {
        this.pipHidden = hidden;
        Data.save(this.meta.name, "pipHidden", hidden);
        this.syncPip();
    }

    syncPip() {
        const win = document.querySelector(PIP);
        const root = document.documentElement;
        if (this.pipHidden) root.dataset.x4PipHidden = "1"; else delete root.dataset.x4PipHidden;

        if (win && !win.querySelector(":scope > .x4pip-close")) {
            win.appendChild(this.pipButton("x4pip-close", "Скрыть окно стрима",
                '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
                null, () => this.setPipHidden(true)));
        }

        let show = document.querySelector(".x4pip-show");
        const bar = document.querySelector(TITLE_TRAILING);
        if (!win || !this.pipHidden || !bar) { show?.remove(); return; }
        if (!show) {
            show = this.pipButton("x4pip-show", "Показать окно стрима",
                '<rect x="3" y="5" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 21h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
                "Стрим", () => this.setPipHidden(false));
        }
        // Первым в ряду шапки: flex сам двигает кнопку при любой ширине окна.
        if (bar.firstElementChild !== show) bar.prepend(show);
    }

    pipButton(cls, title, icon, label, onClick) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = cls;
        b.title = title;
        b.setAttribute("aria-label", title);
        b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg>`;
        if (label) b.append(label);
        // Окно перетаскивается за любую точку — не отдаём ему нажатие.
        for (const type of ["pointerdown", "mousedown"]) b.addEventListener(type, e => e.stopPropagation());
        b.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); onClick(); });
        return b;
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
