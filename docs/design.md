# Design

## What the site is

`santoriello.ch` is Rémy Santoriello's personal portfolio site: a single
scrolling page introducing him, listing skills, showcasing a handful of
projects, and offering a way to get in touch. It carries no application
logic beyond presentation — there is no backend, no accounts, no persisted
data other than the two visitor preferences described below.

## The four sections

The page is four `<section>` elements, in the order `App` renders them:

- **Home** (`#home`) — the hero: an inline SVG wordmark (`NameLogo`, see
  `docs/decisions/0002-inline-wordmark-svg.md`), a tag line, two
  call-to-action links, and an animated `CodeRain` background.
- **About Me** (`#about-me`) — an introduction plus a list of skills, each
  rendered with a numeric `level` out of 100
  (`front/src/data/skills.js`, consumed by `front/src/components/AboutMe.js`).
- **My Work** (`#my-work`) — a filterable project grid. Ten filter buttons
  (`All` plus nine technology tags, `front/src/data/projects.js:52-63`)
  narrow four hard-coded projects (`front/src/data/projects.js`) by matching
  against each project's `front` and `back` tech arrays
  (`front/src/components/MyWork.js:65-71`).
- **Contact** (`#contact`) — a short blurb and a form that posts directly to
  a third-party relay (see `docs/technical.md`), followed by `Footer` with
  social links and a copyright line.

## Content model

All user-visible copy goes through `translate(key)`
(`front/src/contexts/LanguageContext.js`) against the three dictionaries in
`front/src/assets/translations.js`: `en`, `fr`, `de`. `translate` falls back
to returning the key itself when a key is missing from the active
dictionary's object (`translations[language][key] || key`) — so a missing
translation shows up on the page as the literal key string rather than
throwing or rendering blank. After Task 6 there are no missing keys.

`homeTagLine` is identical in all three dictionaries — `"Full-Stack Developer
| Turning Ideas into Reality"` appears verbatim in `en`, `fr` and `de`. That
is intentional: the tag line is treated as a proper noun / brand line that
is not translated, not a translation someone forgot to write.

Project data (`front/src/data/projects.js`) and skill data
(`front/src/data/skills.js`) are plain JS arrays, moved out of their
components and into `front/src/data/` by Task 7 alongside the decorative
`codeSnippets` (`front/src/data/codeSnippets.js`, rained down by `CodeRain`)
and the `LANGUAGES` map (`front/src/data/languages.js`, consumed by
`LanguageToggle`). None of the four are translated or externalised beyond
that move — names, technologies and links are the same in every language.

## Theme model

Two independent visitor preferences persist across visits, each in its own
`localStorage` key: `theme` (`"light"` / `"dark"`, written by `ThemeToggle`)
and `language` (`"en"` / `"fr"` / `"de"`, written by `LanguageContext`).
Theme is expressed purely through CSS custom properties switched by a
`data-theme` attribute on `<html>` (`front/src/styles/tokens.css:13-37`); no
component holds theme state itself. The two preferences are unrelated — changing one
never affects the other's stored value.
