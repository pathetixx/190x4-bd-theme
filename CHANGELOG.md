# Changelog — 190x4 Theme

All notable changes to the theme are listed here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the version line matches `@version` inside `190x4.theme.css`.

## [3.6.8] — 2026-05-15 — 6 точечных фиксов по UI

### Fixed
- **Reply preview в чужом сообщении (DM)** уезжал из flex'а — добавлен жёсткий `display:flex / nowrap / min-width:0 / overflow:ellipsis` на `repliedMessage_*` и его текст-контент.
- **Voice info popout: чёрный фон вылезал за скруглённые края** — `[class*="layerContainer_"] [class*="layer_"]` теперь прозрачный целиком, не только для `modal`.
- **Server rail кнопки**: home (DMs), `+` (Add Server) и compass (Discover) больше не получают дефолтный blurple на hover — покрыты `homeIcon_` / `circleIconButton_` / `circleIcon_` с красным фоном и квадратно→скруглённой анимацией.
- **Soundboard search bar**: синяя/розовая дефолтная обводка → красная рамка с focus-glow, через явный `searchBar_` / `searchBarComponent_` / `searchBarHeader_`.
- **Radio в Settings → Конфиденциальность** (и других местах) был синим — теперь покрыт через `[role="radio"][aria-checked="true"]` + SVG `[fill]` / `[stroke]` + inner `[class*="dot_"]` + инлайновый blurple-hex (`#5865F2`).
- **Account Settings**: кнопка "Показать" под email и дефолтные серые разделители между секциями — `lookLink_` / `revealButton_` / `anchor_` теперь красные, `divider_` / `dividerDefault_` / row-bottom-border перекрашены в `--x4-border-soft`.
- Добавлены `!important` на `--background-modifier-accent/hover/active/selected` во второй override-блок (раньше теряли priority под `.theme-dark`).

## [3.6.0] — 2026-05-10 — first public release

First version published as part of the [`pathetixx/190x4`](https://github.com/pathetixx/190x4) repo. Earlier iterations lived only in my local BetterDiscord folder.

### Style at this version

- Brand palette pulled from the 190x4 logo: gunmetal PCB + red neon, plus orange highlights.
- Display type **Orbitron**, body **Rajdhani** (Google Fonts via `@import`).
- 190x4 logo as background image, with a near-opaque overlay for readability.
- Red-neon borders/glow on focus and active states.
- All knobs exposed as `--x4-*` CSS custom properties on `:root` for easy theming-on-top.
