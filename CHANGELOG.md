# Changelog — 190x4 Theme

All notable changes to the theme are listed here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the version line matches `@version` inside `190x4.theme.css`.

## [3.6.14] — 2026-05-15

### Fixed
- Radio: по реальной структуре `radioGroupOption__64e61` + `data-selected="true"` + 3 круга (`outerRadioBase` / `outerRadioFill` / `innerDotRadio`). Outer заливка red, центр-точка `#fff` (классический radio look).
- Soundboard panel: ловим точный root `picker__09f65` через `:has(input[placeholder*="звук"])` — стилизация как у voice popup (border + drop-shadow + red glow).
- Search wrapper: индивидуальные `border-top/bottom-left/right-radius: 8px` вместо shorthand — Discord перебивал shorthand per-corner правилом, правый угол оставался острый.

## [3.6.13] — 2026-05-15

### Fixed
- Search bar `wrapper__72c38` / `container__0f084`: явный `border-radius: 8px` в default и focus-within (правый угол был острый).
- Radio outer-ring: структурный селектор `svg circle:not([class*="innerDot"])` внутри `[role="radio"][aria-checked="true"]` / `:checked` ancestor'ов — раньше класс `outerCircleRadio_*` не всегда был на DOM, теперь ловим любую SVG-окружность кроме innerDot.

### Added
- Soundboard panel: неоновая красная обводка как у voice info popup'а. Ловим через `[class*="popout_"]:has(input[placeholder*="звук"])` и аналоги — border `var(--x4-red)`, тройной box-shadow с red-glow.

## [3.6.12] — 2026-05-15

### Fixed
- Soundboard search border: точечно по реальным классам `wrapper__72c38` / `container__0f084`. Убран универсальный `*:has(input[data-mana-component="text-input"])` — он резал border у любого предка с фокус-input'ом, включая popover самого soundboard'а.
- Soundboard panel border восстановлен (popover не теряет border на focus search).
- Radio outer-ring у выбранной кнопки: список ancestor'ов = как у innerDot, fill + stroke красные → solid-red disk вместо двутонной (красная точка / синяя обводка).
- DM home logo: точечно через `[class*="childWrapper__6e9f8"]:has(svg path[d^="M19.73 4.87"])` (Discord clyde path). Background gradient + SVG path fill в `#fff`.

### Changed
- В override-блок добавлены `--icon-strong`, `--icon-tertiary`, `--icon-staff-badge-foreground`, `--icon-foreground-brand` → красные. SVG-иконки с `fill="var(--icon-strong)"` (search-magnifier и т.п.) больше не блюрпурпурные.

## [3.6.11] — 2026-05-15

### Fixed
- DM home: убран `:first-child` в селекторе — он красил первый сервер КАЖДОЙ папки (отсюда красный квадрат поверх чужого сервера). Скоуп строго `[class*="guilds_"]` + `a[href^="/channels/@me"]` / `[aria-label="Личные сообщения"]` / `[class*="dmsListItem_"]`.
- Radio: расширили "selected ancestor" — добавлены `input[type="radio"]:checked ~/+ *`, `label:has(input:checked)`, `[class*="radioOption_"][class*="checked|selected"]`.
- Soundboard search: добавлен `border-left/right-color: transparent` на focus-within родителей — отрезает синий кусок обводки слева/справа.
- Volume slider: `grabber_` без постоянного glow (glow только на hover/active), `barFill_` в `--x4-red-deep` вместо `--x4-red` — слайдер перестал выглядеть как сплошная красная заливка popup'а.

### Added
- Soundboard panel: красный border + soft red box-shadow на popover'е, hover-ring на `soundButton_`.

## [3.6.10] — 2026-05-15

### Fixed
- `popover_*` теперь точно opaque: было побиение специфичности линией `#app-mount [class*="container__"]:not(...)` (1,3,0) → поднят до того же уровня через `#app-mount` префикс.
- Radio в Settings: `[class*="innerDotRadio"]` ограничен через `[role="radio"][aria-checked="true"]` parent — раньше красил дот ВСЕМ радио, включая невыбранные.
- `+` (Add Server) / compass (Discover): селекторы `circleIconButton_` / `circleIcon_` возвращены — выпали при правке 3.6.9.
- DM home («Личные сообщения»): красим `[class*="wrapper_"]` внутри `:first-child` listItem + `:has(a[href="/channels/@me"])` listItem'а; раньше aria-label не хватало.
- Soundboard search: убрана двойная обводка — на родительских обёртках с `*:has(> input[data-mana-component="text-input"])` глушится `box-shadow`/`outline`.

## [3.6.9] — 2026-05-15

### Fixed
- `popover_*` (voice info, RTC debug, прочее) opaque dark; внутренний `container__` / `tabPanel__` / `tabs__` оставлен прозрачным. Border-radius Discord'а не трогаем.
- DM home («Личные сообщения»): через `a[aria-label*="ичные сообщения"]` / `[aria-label*="Direct Messages"]` / `[href="/channels/@me"]`. `homeIcon_*` устарел в текущей сборке.
- Radio (Settings): `[class*="innerDotRadio"]` + `[class*="outerCircleRadio"]` — fill/stroke в `--x4-red` напрямую.
- Mana text-input (`input[data-mana-component="text-input"]` / `input__0f084`): focus border + box-shadow красные.
- Mana brand-link button (`button_a22cb0 brand_a22cb0` без `lookFilled`/`secondary`) — color `--x4-red-bright`. Покрывает «Показать», «Подробнее» и аналоги.
- RTC debug popup: классы обновлены на `_effb26` / `_66f0f` (старые `_56e31` устарели).

### Changed
- `repliedMessage_*`: убран жёсткий `display:flex / nowrap / max-width` — ломал внутренний display-name с loop-градиентом. Оставлен только `overflow:ellipsis` на `repliedTextPreview_` / `repliedTextContent_`, плюс `max-width:35%` на кастомном display-name.
- `--text-link`, `--text-link-low-saturation`, `--text-brand`, `--text-link-foreground`, `--text-link-foreground-hover` пробрасываются с `!important` во второй override-блок.

## [3.6.8] — 2026-05-15

### Fixed
- Reply preview в чужом сообщении (DM) уезжал из flex'а — `repliedMessage_*` теперь `display:flex / nowrap / min-width:0`, цитата с `text-overflow:ellipsis`.
- Voice info popout: чёрный фон вылезал за скруглённые края — `[class*="layerContainer_"] [class*="layer_"]` прозрачный целиком, не только для `modal`.
- Server rail: `homeIcon_` (DMs), `circleIconButton_` / `circleIcon_` (`+` / compass) красный hover/selected, квадратно→скруглённая анимация.
- Soundboard search bar (`searchBar_` / `searchBarComponent_` / `searchBarHeader_`): красная рамка + glow на focus.
- Radio в Settings: `[role="radio"][aria-checked="true"]` + SVG `[fill]` / `[stroke]` + inner `[class*="dot_"]` + инлайновый `#5865F2`.
- Account Settings: `lookLink_` / `revealButton_` / `anchor_` красные; `divider_` / `dividerDefault_` / row-bottom-border в `--x4-border-soft`.

### Changed
- `--background-modifier-accent/hover/active/selected` с `!important` во втором override-блоке (раньше `.theme-dark` перетирал `:root`).

## [3.6.0] — 2026-05-10 — first public release

First version published as part of the [`pathetixx/190x4`](https://github.com/pathetixx/190x4) repo. Earlier iterations lived only in my local BetterDiscord folder.

### Style at this version

- Brand palette pulled from the 190x4 logo: gunmetal PCB + red neon, plus orange highlights.
- Display type **Orbitron**, body **Rajdhani** (Google Fonts via `@import`).
- 190x4 logo as background image, with a near-opaque overlay for readability.
- Red-neon borders/glow on focus and active states.
- All knobs exposed as `--x4-*` CSS custom properties on `:root` for easy theming-on-top.
