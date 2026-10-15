# 190x4 — Discord Theme

> A [BetterDiscord](https://betterdiscord.app/) theme — cyberpunk command-center, gunmetal PCB + red neon. The visual language of [190x4.pw](https://190x4.pw) ported to Discord.

[**English**](#english) · [**Русский**](#русский)

[![version](https://img.shields.io/badge/version-4.1.2-ff1a3a?style=flat-square)](#changelog)
[![BetterDiscord](https://img.shields.io/badge/BetterDiscord-%E2%89%A5%201.10-ff1a3a?style=flat-square)](https://betterdiscord.app/)
[![License](https://img.shields.io/badge/license-MIT-ff1a3a?style=flat-square)](LICENSE)

---

## English

### What it is

A red-neon cyberpunk theme. Palette comes straight from the 190x4 logo — gunmetal PCB body, red-neon "eyes". Same look as my [190x4.pw](https://190x4.pw) hub, just stretched over Discord's UI.

Highlights:

- **Layout (4.0, "Command Terminal")**: servers as a top tab bar with the 190x4 mark, the conversation full-width on the left, channels and members as HUD islands on the right, own chrome icons and cursors.
- **Palette**: deep gunmetal backgrounds (`#06060a`–`#181822`), accent reds (`#ff1a3a`, `#ff2d4d`, `#b3001f`), occasional orange highlights.
- **Type**: [Orbitron](https://fonts.google.com/specimen/Orbitron) for display, [Rajdhani](https://fonts.google.com/specimen/Rajdhani) for body. Loaded via `@font-face` from jsDelivr/fontsource (needs internet on first run to fetch the woff2 files).
- **Background**: a dark circuit-board scene with a red-eyed cyber-oni mask, kept almost black so it never fights the text.
- **Borders & glow**: red-neon outlines on focus / active states.

### Requirements

- [BetterDiscord](https://betterdiscord.app/) **≥ 1.10**
- Internet on first launch (fonts from jsDelivr).

### Install

1. Download [`190x4.theme.css`](190x4.theme.css) (raw, single file).
2. Drop it into your BetterDiscord **themes** folder:
   - **Windows**: `%AppData%\BetterDiscord\themes\`
   - **macOS**: `~/Library/Application Support/BetterDiscord/themes/`
   - **Linux**: `~/.config/BetterDiscord/themes/`
3. Discord → **Settings → BetterDiscord → Themes**, toggle **190x4** on.

To update: grab the newest `190x4.theme.css` from a release and overwrite. After replacing the file, **fully quit Discord through the system tray** (not Ctrl+R, not the window X — both leave the Electron process alive with cached CSS) and start it again.

### Telegram-style chat

In the **Cozy** message display every message is a bubble sized to its content; consecutive messages from one author are joined into a group, replies sit inside the bubble, date separators are centred pills.

### Companion plugin

[`plugins/190x4Companion.plugin.js`](plugins/190x4Companion.plugin.js):

- puts **your own messages on the right** in red bubbles (Discord's markup has no "own message" marker, so the theme can't do it alone — without the plugin all bubbles stay on the left);
- shows **nameplates for voice channel participants** (Discord shows them only in the member list and DMs), animated on hover.

Drop it into the BetterDiscord **plugins** folder (`%AppData%\BetterDiscord\plugins\` on Windows) and enable it in **Settings → BetterDiscord → Plugins**.

### Customising

The whole palette is defined as CSS custom properties on `:root` at the top of the file (`--x4-bg-deep`, `--x4-red`, `--x4-font-display`, …). To tweak the look without forking, you can use a separate small theme that re-declares those variables:

```css
:root {
    --x4-red: #ff3060;          /* swap the accent */
    --x4-bg-deep: #050308;       /* even darker */
    --x4-bg-image: none;         /* kill the logo background */
}
```

### Credits

Icons: [MingCute Icon](https://github.com/Richard9394/MingCute) (Apache 2.0), embedded as SVG masks.

### License

[MIT](LICENSE) © 2026 PathetiX

---

## Русский

### Что это

Cyberpunk-тема red-neon. Палитра выведена прямо из логотипа 190x4 — gunmetal-«железо» PCB и красные «глаза»-неон. Тот же визуал, что у моего хаба [190x4.pw](https://190x4.pw), просто натянутый на интерфейс Discord.

Главное:

- **Раскладка (4.0, «Command Terminal»)**: сервера — полосой сверху со знаком 190x4, разговор слева на всю ширину, каналы и участники — HUD-острова справа, свои хромированные иконки и курсоры.
- **Палитра**: глубокий gunmetal-фон (`#06060a`–`#181822`), акцентные красные (`#ff1a3a`, `#ff2d4d`, `#b3001f`), редкие оранжевые подсветки.
- **Шрифты**: [Orbitron](https://fonts.google.com/specimen/Orbitron) — для крупного текста, [Rajdhani](https://fonts.google.com/specimen/Rajdhani) — для основного. Подгружаются через `@font-face` с jsDelivr/fontsource (на первом запуске нужен интернет, чтобы скачать woff2-файлы).
- **Фон**: тёмная сцена с печатной платой и кибер-маской они с красным глазом — почти чёрная, чтобы не спорить с текстом.
- **Бордеры и glow**: красно-неоновые контуры на фокусе/активных элементах.

### Требования

- [BetterDiscord](https://betterdiscord.app/) **≥ 1.10**
- Интернет на первом запуске (шрифты с jsDelivr).

### Установка

1. Скачай [`190x4.theme.css`](190x4.theme.css) (один файл, raw).
2. Положи его в папку **themes** BetterDiscord:
   - **Windows**: `%AppData%\BetterDiscord\themes\`
   - **macOS**: `~/Library/Application Support/BetterDiscord/themes/`
   - **Linux**: `~/.config/BetterDiscord/themes/`
3. В Discord → **Настройки → BetterDiscord → Themes** включи **190x4**.

Чтобы обновиться: качаешь свежий `190x4.theme.css` из релиза и перезаписываешь. После замены файла **полностью закрой Discord через системный трей** (не Ctrl+R и не крестик в окне — оба оставляют Electron-процесс жить с закэшированным CSS) и запусти заново.

### Чат в стиле Telegram

В режиме отображения **«Уютный»** каждое сообщение — пузырь по размеру содержимого; сообщения одного автора подряд склеиваются в группу, ответ — плашка внутри пузыря, даты — пилюли по центру.

### Плагин-компаньон

[`plugins/190x4Companion.plugin.js`](plugins/190x4Companion.plugin.js):

- уводит **твои сообщения вправо** в красных пузырях (в разметке Discord нет признака «моё сообщение», одна тема этого не может — без плагина все пузыри слева);
- показывает **таблички с именем у участников голосового канала** (Discord рисует их только в списке участников и ЛС), с анимацией при наведении.

Положи файл в папку **plugins** BetterDiscord (`%AppData%\BetterDiscord\plugins\` на Windows) и включи в **Настройки → BetterDiscord → Plugins**.

### Кастомизация

Вся палитра — это CSS-переменные на `:root` в самом верху файла (`--x4-bg-deep`, `--x4-red`, `--x4-font-display`, …). Подкрутить вид без форка можно отдельной маленькой темой, которая просто переопределяет нужные переменные:

```css
:root {
    --x4-red: #ff3060;          /* сменить акцент */
    --x4-bg-deep: #050308;       /* ещё глубже */
    --x4-bg-image: none;         /* убрать фоновый логотип */
}
```

### Благодарности

Иконки: [MingCute Icon](https://github.com/Richard9394/MingCute) (Apache 2.0), встроены в тему как SVG-маски.

### Лицензия

[MIT](LICENSE) © 2026 PathetiX
