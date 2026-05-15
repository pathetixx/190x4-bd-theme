# Changelog — 190x4 Theme

All notable changes to the theme are listed here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the version line matches `@version` inside `190x4.theme.css`.

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
