# 190x4 — Discord Theme

> A [BetterDiscord](https://betterdiscord.app/) theme — cyberpunk command-center, gunmetal PCB + red neon. The visual language of [190x4.pw](https://190x4.pw) ported to Discord.

[**English**](#english) · [**Русский**](#русский)

[![version](https://img.shields.io/badge/version-3.6.3-ff1a3a?style=flat-square)](#changelog)
[![BetterDiscord](https://img.shields.io/badge/BetterDiscord-%E2%89%A5%201.10-ff1a3a?style=flat-square)](https://betterdiscord.app/)
[![License](https://img.shields.io/badge/license-MIT-ff1a3a?style=flat-square)](../../LICENSE)

---

## English

### What it is

A red-neon cyberpunk theme. Palette comes straight from the 190x4 logo — gunmetal PCB body, red-neon "eyes". Same look as my [190x4.pw](https://190x4.pw) hub, just stretched over Discord's UI.

Highlights:

- **Palette**: deep gunmetal backgrounds (`#06060a`–`#181822`), accent reds (`#ff1a3a`, `#ff2d4d`, `#b3001f`), occasional orange highlights.
- **Type**: [Orbitron](https://fonts.google.com/specimen/Orbitron) for display, [Rajdhani](https://fonts.google.com/specimen/Rajdhani) for body. Loaded via `@font-face` from jsDelivr/fontsource (needs internet on first run to fetch the woff2 files).
- **Background**: a dimmed 190x4 logo behind the chat, with a near-opaque overlay so it doesn't fight the text.
- **Borders & glow**: red-neon outlines on focus / active states.

### Requirements

- [BetterDiscord](https://betterdiscord.app/) **≥ 1.10**
- Internet on first launch (Google Fonts).

### Install

1. Download [`190x4.theme.css`](190x4.theme.css) (raw, single file).
2. Drop it into your BetterDiscord **themes** folder:
   - **Windows**: `%AppData%\BetterDiscord\themes\`
   - **macOS**: `~/Library/Application Support/BetterDiscord/themes/`
   - **Linux**: `~/.config/BetterDiscord/themes/`
3. Discord → **Settings → BetterDiscord → Themes**, toggle **190x4** on.

To update: grab the newest `190x4.theme.css` from a release and overwrite. After replacing the file, **fully quit Discord through the system tray** (not Ctrl+R, not the window X — both leave the Electron process alive with cached CSS) and start it again.

### Customising

The whole palette is defined as CSS custom properties on `:root` at the top of the file (`--x4-bg-deep`, `--x4-red`, `--x4-font-display`, …). To tweak the look without forking, you can use a separate small theme that re-declares those variables:

```css
:root {
    --x4-red: #ff3060;          /* swap the accent */
    --x4-bg-deep: #050308;       /* even darker */
    --x4-bg-image: none;         /* kill the logo background */
}
```

### License

[MIT](../../LICENSE) © 2026 PathetiX

---

## Русский

### Что это

Cyberpunk-тема red-neon. Палитра выведена прямо из логотипа 190x4 — gunmetal-«железо» PCB и красные «глаза»-неон. Тот же визуал, что у моего хаба [190x4.pw](https://190x4.pw), просто натянутый на интерфейс Discord.

Главное:

- **Палитра**: глубокий gunmetal-фон (`#06060a`–`#181822`), акцентные красные (`#ff1a3a`, `#ff2d4d`, `#b3001f`), редкие оранжевые подсветки.
- **Шрифты**: [Orbitron](https://fonts.google.com/specimen/Orbitron) — для крупного текста, [Rajdhani](https://fonts.google.com/specimen/Rajdhani) — для основного. Подгружаются через `@font-face` с jsDelivr/fontsource (на первом запуске нужен интернет, чтобы скачать woff2-файлы).
- **Фон**: затемнённый логотип 190x4 за чатом, поверх плотный оверлей — чтобы не перетягивал внимание с текста.
- **Бордеры и glow**: красно-неоновые контуры на фокусе/активных элементах.

### Требования

- [BetterDiscord](https://betterdiscord.app/) **≥ 1.10**
- Интернет на первом запуске (Google Fonts).

### Установка

1. Скачай [`190x4.theme.css`](190x4.theme.css) (один файл, raw).
2. Положи его в папку **themes** BetterDiscord:
   - **Windows**: `%AppData%\BetterDiscord\themes\`
   - **macOS**: `~/Library/Application Support/BetterDiscord/themes/`
   - **Linux**: `~/.config/BetterDiscord/themes/`
3. В Discord → **Настройки → BetterDiscord → Themes** включи **190x4**.

Чтобы обновиться: качаешь свежий `190x4.theme.css` из релиза и перезаписываешь. После замены файла **полностью закрой Discord через системный трей** (не Ctrl+R и не крестик в окне — оба оставляют Electron-процесс жить с закэшированным CSS) и запусти заново.

### Кастомизация

Вся палитра — это CSS-переменные на `:root` в самом верху файла (`--x4-bg-deep`, `--x4-red`, `--x4-font-display`, …). Подкрутить вид без форка можно отдельной маленькой темой, которая просто переопределяет нужные переменные:

```css
:root {
    --x4-red: #ff3060;          /* сменить акцент */
    --x4-bg-deep: #050308;       /* ещё глубже */
    --x4-bg-image: none;         /* убрать фоновый логотип */
}
```

### Лицензия

[MIT](../../LICENSE) © 2026 PathetiX
