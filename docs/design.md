# Design

## What the site is

`santoriello.ch` is Rémy Santoriello's personal portfolio site: a single
scrolling page introducing him, listing skills, showcasing a handful of
projects, and offering a way to get in touch. It carries no application
logic beyond presentation — there is no backend, no accounts, no persisted
data other than the two visitor preferences described below.

## The four sections

The page is four `<section>` elements, in the order `App` renders them:

- **Home** (`#home`) — the hero: an inline SVG wordmark, a tag line, two
  call-to-action links, and an animated `CodeRain` background.
- **About Me** (`#about-me`) — an introduction plus a list of skills, each
  rendered with a numeric `level` out of 100 (`front/src/components/AboutMe.js`).
- **My Work** (`#my-work`) — a filterable project grid. Ten filter buttons
  (`All` plus nine technology tags) narrow four hard-coded projects by
  matching against each project's `front` and `back` tech arrays
  (`front/src/components/MyWork.js:6-52`).
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

Project data (`front/src/components/MyWork.js:6-47`) and skill data
(`front/src/components/AboutMe.js:6-16`) are plain JS arrays defined inline
in their components rather than translated or externalised — names,
technologies and links are the same in every language.

## Theme model

Two independent visitor preferences persist across visits, each in its own
`localStorage` key: `theme` (`"light"` / `"dark"`, written by `ThemeToggle`)
and `language` (`"en"` / `"fr"` / `"de"`, written by `LanguageContext`).
Theme is expressed purely through CSS custom properties switched by a
`data-theme` attribute on `<html>` (`front/src/App.css:5-28`); no component
holds theme state itself. The two preferences are unrelated — changing one
never affects the other's stored value.
