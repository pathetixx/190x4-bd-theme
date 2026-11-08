#!/usr/bin/env python3
"""Собирает тему «190x4 Eclipse»: база 190x4.theme.css (раскладка, карта классов
Discord, карта иконок) + переводы цветов и шрифтов + eclipse/skin.css.

Правки классов делаем в базе — они сами доезжают в обе темы. Арт встраивается
в CSS: весь файл проверяется одной контрольной суммой Kit и не зависит от CDN.
"""
import base64, pathlib, re

VERSION = "1.0.0"
HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
ART = ROOT / "assets" / "eclipse"
ICONS = HERE / "icons"

HEADER = f"""/**
 * @name 190x4 Eclipse
 * @author 190x4
 * @version {VERSION}
 * @description Чёрная бумага, тушь и багровый серп: истинный банкай из финала Bleach.
 * @source https://github.com/pathetixx/190x4-bd-theme
 */
"""

FONT = "https://cdn.jsdelivr.net/npm/@fontsource/oswald/files/oswald-{sub}-{w}-normal.woff2"
RANGES = {"cyrillic": "U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116", "latin": "U+0000-00FF,U+2000-206F,U+20AC,U+2122"}
FONT_FACES = "".join(
    f"@font-face {{ font-family: 'Oswald'; font-style: normal; font-weight: {w}; font-display: swap; "
    f"src: url('{FONT.format(sub=sub, w=w)}') format('woff2'); unicode-range: {rng}; }}\n"
    for w in (400, 500, 700) for sub, rng in RANGES.items()
)

COLORS = {
    "255, 26, 58": "179, 18, 46",
    "255,26,58": "179,18,46",
    "#ff1a3a": "#b3122e",
    "#ff2d4d": "#d21a3c",
    "#b3001f": "#8f0e25",
    "#06060a": "#050405",
    "#08080e": "#0b090a",
    "6, 6, 10": "5, 4, 5",
    "10, 10, 15": "11, 9, 10",
    "17, 17, 26": "20, 16, 18",
    "60, 6, 14": "20, 16, 18",
}

# какой рисованной иконке соответствует правило базы (по её aria-label)
ICON_RULES = {
    "mic": 'button[role="switch"]:is([aria-label="Заглушить"]',
    "headphones": 'button[role="switch"]:is([aria-label="Откл. звук"]',
    "hash": '[aria-label^="Текст"],[aria-label^="Text"]',
    "speaker": '[aria-label^="Голос"],[aria-label^="Voice"]',
    "plus": 'aria-label="Создать канал"',
    "gear": 'aria-label="Настроить канал"',
    "bell": 'aria-label="Параметры уведомлений"',
    "pin": 'aria-label="Закреплённые сообщения"',
    "search": 'aria-label="Поиск"',
    "gift": 'aria-label="Отправить подарок"',
    "emoji": 'aria-label="Добавить реакцию"',
    "hangup": 'aria-label="Отключиться"',
    "thread": 'aria-label="Ветки"',
    "megaphone": '[aria-label^="Объявлен"]',
    "lockhash": '[aria-label^="Текст ("]',
    "mic-off": 'button[role="switch"][aria-checked="true"]:is([aria-label="Заглушить"]',
    "head-off": 'button[role="switch"][aria-checked="true"]:is([aria-label="Откл. звук"]',
    "people": 'aria-label="Скрыть список участников"',
    "reply": 'aria-label="Ответить"',
    "dots": 'aria-label="Ещё"',
    "video": '[class*="actionButtons_"] > button:nth-of-type(1) svg',
    "monitor": '[class*="actionButtons_"] > button:nth-of-type(2) svg',
    "controller": '[class*="actionButtons_"] > button:nth-of-type(3) svg',
}

ICON_RULE_RE = re.compile(
    r'(?ms)^(?P<sel>[^{}\n/][^{}]*?)\{\s*background: var\(--x4-ico-fill\) !important;'
    r'\s*-webkit-mask: url\("[^"]+"\) center / contain no-repeat !important;'
    r'\s*mask: url\("[^"]+"\) center / contain no-repeat !important;\s*\}'
)


def data_uri(path: pathlib.Path) -> str:
    mime = {"webp": "image/webp", "png": "image/png"}[path.suffix[1:]]
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"


def cut(s: str, start: str, end: str) -> str:
    a = s.index(start)
    a = s.rindex("/* ===", 0, a)
    b = s.index(end, a)
    b = s.rindex("/* ===", 0, b)
    return s[:a] + s[b:]


def swap_icons(s: str) -> str:
    def repl(m):
        sel = m.group("sel")
        for name, key in ICON_RULES.items():
            if key in sel:
                v = f"var(--e-ico-{name})"
                return (f"{sel}{{\n    background: var(--x4-ico-fill) !important;\n"
                        f"    -webkit-mask: {v} center / contain no-repeat !important;\n"
                        f"    mask: {v} center / contain no-repeat !important;\n}}")
        return m.group(0)
    return ICON_RULE_RE.sub(repl, s)


def build() -> str:
    s = (ROOT / "190x4.theme.css").read_text(encoding="utf-8")
    s = s[s.index("/* ============================================================\n   190x4 — Cyberpunk"):]
    s = cut(s, "3.9.0 — ЧАТ В СТИЛЕ TELEGRAM", "4.0 — COMMAND TERMINAL")
    s = cut(s, "КУРСОР — хромированные", "ИКОНКИ 190x4 — свой набор")
    s = re.sub(r'(?m)^main\[class\*="chatContent_"\] li(\[data-x4-self\])? ?> ?\[class\*="cozyMessage_"\] \{.*?\}\n', "", s, flags=re.S)
    for a, b in COLORS.items():
        s = s.replace(a, b)
    s = re.sub(r"'(Orbitron|Rajdhani|JetBrains Mono|Cascadia Code)'", "'Oswald'", s)
    s = swap_icons(s)

    skin = (HERE / "skin.css").read_text(encoding="utf-8")
    # каждая картинка лежит в файле один раз, как переменная, и не дублируется в правилах
    names = sorted(set(re.findall(r"\{\{art:([\w-]+)\}\}", skin)))
    skin = re.sub(r"\{\{art:([\w-]+)\}\}", r"var(--e-art-\1)", skin)
    art = "".join(f"    --e-art-{n}: url('{data_uri(next(ART.glob(n + '.*')))}');\n" for n in names)
    ico = "".join(f"    --e-ico-{p.stem}: url('{data_uri(p)}');\n" for p in sorted(ICONS.glob("*.png")))
    return HEADER + FONT_FACES + s + "\n:root {\n" + art + ico + "}\n" + skin


if __name__ == "__main__":
    out = HERE / "190x4-Eclipse.theme.css"
    out.write_text(build(), encoding="utf-8")
    print(out.name, out.stat().st_size)
