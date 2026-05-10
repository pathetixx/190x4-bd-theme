# 190x4 — Discord Theme

> A [BetterDiscord](https://betterdiscord.app/) theme — cyberpunk command-center, gunmetal PCB + red neon. The visual language of [190x4.pw](https://190x4.pw) ported to Discord.

[**English**](#english) · [**Русский**](#русский)

[![version](https://img.shields.io/badge/version-3.6.0-ff1a3a?style=flat-square)](#changelog)
[![BetterDiscord](https://img.shields.io/badge/BetterDiscord-%E2%89%A5%201.10-ff1a3a?style=flat-square)](https://betterdiscord.app/)
[![License](https://img.shields.io/badge/license-MIT-ff1a3a?style=flat-square)](../../LICENSE)

---

## English

### What it is

A red-neon cyberpunk theme. Palette comes straight from the 190x4 logo — gunmetal PCB body, red-neon "eyes". Same look as my [190x4.pw](https://190x4.pw) hub, just stretched over Discord's UI.

Highlights:

- **Palette**: deep gunmetal backgrounds (`#06060a`–`#181822`), accent reds (`#ff1a3a`, `#ff2d4d`, `#b3001f`), occasional orange highlights.
- **Type**: [Orbitron](https://fonts.google.com/specimen/Orbitron) for display, [Rajdhani](https://fonts.google.com/specimen/Rajdhani) for body. Loaded from Google Fonts via `@import` (so the theme needs internet to fetch fonts on first run).
- **Background**: a dimmed 190x4 logo behind the chat, with a near-opaque overlay so it doesn't fight the text.
- **Borders & glow**: red-neon outlines on focus / active states.

### Requirements

- [BetterDiscord](https://betterdiscord.app/) **≥ 1.10**
- Internet on first launch (Google Fonts).

### Install

You have two options — pick one (don't enable both at the same time).

#### Option A — static (recommended for offline / no surprise changes)

1. Download [`190x4.theme.css`](190x4.theme.css) (raw, single file).
2. Drop it into your BetterDiscord **themes** folder:
   - **Windows**: `%AppData%\BetterDiscord\themes\`
   - **macOS**: `~/Library/Application Support/BetterDiscord/themes/`
   - **Linux**: `~/.config/BetterDiscord/themes/`
3. Discord → **Settings → BetterDiscord → Themes**, toggle **190x4** on.

You stay on whatever version you downloaded. To update, replace the file with a new one from this repo.

#### Option B — live loader (auto-updates from GitHub)

1. Download [`190x4-live.theme.css`](190x4-live.theme.css) (a small wrapper, ~25 lines).
2. Drop it into the same `themes/` folder.
3. Enable **190x4 (live)** in BetterDiscord.

The wrapper is a thin stub that does `@import url(...)` of the real CSS, served via **jsDelivr** (`cdn.jsdelivr.net/gh/pathetixx/190x4@main/...`). Every time you launch Discord (or hit Ctrl+R) it pulls the freshest version. jsDelivr caches branch HEAD for ~7 minutes, so a push to `main` rolls out within that window. Trade-off: needs internet on launch (same as the Google Fonts `@import` already does), and you can't pin to a specific version.

> Why jsDelivr and not raw.githubusercontent.com? GitHub serves `raw.*` files as `Content-Type: text/plain` with `X-Content-Type-Options: nosniff`. Browsers (and Discord's Electron) refuse to apply such files via `@import`. jsDelivr serves them as `text/css`, which is what we need.

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
- **Шрифты**: [Orbitron](https://fonts.google.com/specimen/Orbitron) — для крупного текста, [Rajdhani](https://fonts.google.com/specimen/Rajdhani) — для основного. Подгружаются из Google Fonts через `@import` (значит, при первом запуске нужен интернет).
- **Фон**: затемнённый логотип 190x4 за чатом, поверх плотный оверлей — чтобы не перетягивал внимание с текста.
- **Бордеры и glow**: красно-неоновые контуры на фокусе/активных элементах.

### Требования

- [BetterDiscord](https://betterdiscord.app/) **≥ 1.10**
- Интернет на первом запуске (Google Fonts).

### Установка

Два варианта на выбор — не включай оба одновременно.

#### Вариант A — статический (для офлайна / стабильности)

1. Скачай [`190x4.theme.css`](190x4.theme.css) (один файл, raw).
2. Положи его в папку **themes** BetterDiscord:
   - **Windows**: `%AppData%\BetterDiscord\themes\`
   - **macOS**: `~/Library/Application Support/BetterDiscord/themes/`
   - **Linux**: `~/.config/BetterDiscord/themes/`
3. В Discord → **Настройки → BetterDiscord → Themes** включи **190x4**.

Ты сидишь на той версии, которую скачал. Чтобы обновиться — перезаписываешь файл свежим из репо.

#### Вариант B — live-loader (авто-обновления из GitHub)

1. Скачай [`190x4-live.theme.css`](190x4-live.theme.css) — это тонкая обёртка (~25 строк).
2. Положи в ту же папку `themes/`.
3. Включи в BetterDiscord **190x4 (live)**.

Обёртка просто делает `@import url(...)` основного CSS через **jsDelivr** (`cdn.jsdelivr.net/gh/pathetixx/190x4@main/...`). На каждом старте Discord (или Ctrl+R) подтягивается свежая версия. jsDelivr кэширует HEAD ветки ~7 минут, поэтому push в `main` доезжает до клиентов в течение этого окна. Минус: нужен интернет при старте (так же, как для `@import` Google Fonts), и нельзя зафиксироваться на конкретной версии.

> Почему jsDelivr, а не raw.githubusercontent.com? GitHub отдаёт `raw.*` файлы с `Content-Type: text/plain` и `X-Content-Type-Options: nosniff`. Браузер (и Electron в Discord) отказывается применять такие файлы через `@import`. jsDelivr отдаёт их как `text/css` — что и нужно.

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
