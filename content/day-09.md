---
reading_time: 15 min
tags: ["web", "fundamentals", "hands-on"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Build a campus events page with vanilla HTML/CSS/JS", "url": "https://example.com/labs/day-09"}
resources: [{"title": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/"}, {"title": "MDN: HTML basics", "url": "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics"}, {"title": "MDN: JavaScript first steps", "url": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps"}]
---

## Intro

Before React, before Next.js, before any framework you'll use later — the web is three languages glued together by a browser. If you understand that glue, every framework stops being magic. Today is HTML for structure, CSS for appearance, JavaScript for behavior, and how they meet in the DOM.

## Read: The three-language stack

### HTML is a tree, not a page

A browser doesn't see your HTML as lines of text. It parses it into a **DOM tree** — a nested structure of nodes. Everything else (CSS selectors, JS queries) hangs off that tree.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Campus Events</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <header><h1>This week on campus</h1></header>
    <main>
      <ul id="events"></ul>
    </main>
    <script src="app.js" defer></script>
  </body>
</html>
```

Use **semantic** tags (`<header>`, `<main>`, `<article>`, `<nav>`) instead of `<div>` soup. Screen readers, search engines, and your teammates will thank you.

### CSS: the cascade, the box, and layout

Three things to internalize:

1. **The box model.** Every element is a box with content, padding, border, margin. `box-sizing: border-box` is the setting you want (the default is surprising).
2. **The cascade.** More specific selectors win. `#hero h1` beats `h1`. Inline styles beat everything except `!important` (don't).
3. **Modern layout.** Flexbox for one-dimensional rows/columns. Grid for two-dimensional layouts. Forget `float` for layout.

```css
:root {
  --accent: #ff5a1f;
  --bg: #0b0b0f;
  --fg: #f4f4f5;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font: 16px/1.5 system-ui, sans-serif;
  background: var(--bg);
  color: var(--fg);
}
#events {
  list-style: none; padding: 0;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}
.event {
  padding: 1rem; border: 1px solid #333; border-radius: 8px;
}
.event h3 { margin: 0 0 .25rem; color: var(--accent); }
```

### JavaScript: events and the DOM

JS runs in the browser, sees the DOM, and reacts to events. The three moves you'll do constantly:

```js
// 1. query the DOM
const list = document.querySelector("#events");

// 2. fetch data
const res = await fetch("events.json");
const events = await res.json();

// 3. render
list.innerHTML = events
  .map(e => `<li class="event"><h3>${e.title}</h3><p>${e.when}</p></li>`)
  .join("");
```

`async/await` with `fetch` is the modern way. Avoid jQuery and avoid raw XMLHttpRequest.

### How browsers actually load a page

| Step | What happens |
|------|--------------|
| 1 | DNS resolves domain to IP |
| 2 | Browser opens TCP + TLS to the server |
| 3 | Sends `GET /` — server returns HTML |
| 4 | Browser parses HTML, discovers CSS/JS/images, requests them |
| 5 | CSS blocks render; JS (without `defer`) blocks parsing |
| 6 | DOM + CSSOM combine into render tree, layout, paint |

Open DevTools → Network tab on any site. Watch the waterfall. This view will save you hours of "why is my site slow" confusion later.

> If you only learn one devtool this week, learn Chrome/Firefox DevTools cold.

## Watch: Anatomy of a web page

A walkthrough of a single static page — inspecting the DOM, tweaking CSS live, adding a JS event listener, and watching requests in the Network tab.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Watch which requests block rendering vs. happen after.
- Notice how editing CSS in DevTools updates the page with no reload.
- See how `console.log` + breakpoints beat scattering `alert()`.

## Lab: Campus events, no framework

Build a single static page that reads `events.json` and renders this week's campus events. No React, no build step, no npm — just three files.

1. Create `campus-events/` with `index.html`, `style.css`, `app.js`, `events.json`.
2. Seed `events.json` with 6 events: `{"title": "...", "when": "...", "where": "...", "club": "..."}`.
3. Write `index.html` with semantic tags (`<header>`, `<main>`, `<footer>`) and an empty `<ul id="events">`. Link CSS in `<head>` and JS with `defer`.
4. Style with CSS Grid so cards reflow from 1 column on mobile to 3 on desktop. Use CSS variables for colors.
5. In `app.js`, `fetch("events.json")`, parse, and render cards. Escape user content (don't just `innerHTML` a raw string — use `textContent` for fields).
6. Add a search box that filters events as you type. Use `input` event + `Array.filter`.
7. Add a "sort by date" toggle button.
8. Serve locally with `python3 -m http.server 8000`. Visit `http://localhost:8000`. You can't `fetch` from a `file://` URL — this is why we need a server.
9. Open DevTools → Lighthouse. Run a report. Fix any red accessibility issues (usually: missing `alt`, low contrast, missing `<label>`).
10. Commit to a new repo `campus-events`. You'll deploy this on Day 14.

Stretch: add a "RSVP" button that stores a count in `localStorage` so it survives refresh.

## Quiz

Four questions covering the DOM vs. HTML distinction, what `defer` does, the difference between Flexbox and Grid, and why `fetch` fails on `file://`. One short answer on the cascade.

## Assignment

Submit the `campus-events` GitHub repo link. It must render correctly when served via `python3 -m http.server` and include your Lighthouse report screenshot in `docs/lighthouse.png`. Accessibility score must be 90+.

## Discuss: Framework tax

- A senior tells you "just use Next.js from day one." What do you gain and what do you lose by starting with a framework before vanilla JS?
- When would a static HTML+CSS page beat a React SPA for a campus event site?
- You see a 2 MB JS bundle on a college fest website that shows 10 events. What went wrong upstream?
- Should CSS live in a separate file, in `<style>`, or inline? Argue for each in different contexts.
