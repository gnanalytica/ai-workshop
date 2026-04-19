---
reading_time: 14 min
tldr: "A click is a 50ms trip across DNS, TCP, HTTPS, servers, DBs, and back. Understand the trip, own the debugging."
tags: ["concepts", "web", "mental-model"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Anatomy of a web page", "url": "https://developer.mozilla.org/en-US/docs/Web"}
resources: [{"title": "MDN: HTTP overview", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview"}, {"title": "MDN: DOM introduction", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction"}]
---

## Intro

Yesterday you saw that software is boxes exchanging notes. Today we zoom into the web — the world's biggest note-passing system. By the end you should be able to trace a single click from a fingertip to a pixel on the other side of the planet, and back.

## Read: The trip a click makes

A click looks instant. It is not. In the ~200 milliseconds between tap and render, ten separate systems cooperate.

```
  tap --> browser --> DNS --> TCP --> TLS --> HTTP request --> server
                                                                  |
     render <-- parse <-- HTTP response <-- database <-- logic <---+
```

We'll walk it in English. No code.

### Step 1 — DNS: the internet's contact book

You type `instagram.com`. Your computer doesn't know where that is. It asks a **DNS resolver** (usually your ISP's or Cloudflare's `1.1.1.1`) to translate the name into an IP address like `157.240.23.174`. Think of DNS as the phone directory. Names are for humans; IP addresses are for machines.

> DNS is cached aggressively. That's why a new domain takes a few minutes to "propagate".

### Step 2 — TCP + TLS: dialing and securing the line

Your browser opens a **TCP** connection to that IP. TCP is the reliability layer — it guarantees the bytes arrive in order, none dropped. Then **TLS** wraps the whole conversation in encryption (that's what the padlock icon means). Without TLS, the Wi-Fi router at your café could read everything.

### Step 3 — HTTP: the message format

Once connected, your browser sends an **HTTP request**. It looks like this:

```
Example — you're reading, not typing.

GET /accounts/login/ HTTP/1.1
Host: instagram.com
User-Agent: Mozilla/5.0 (...)
Accept: text/html
Cookie: sessionid=abc123
```

Four things matter:

- **Method** (`GET`, `POST`, `PUT`, `DELETE`) — the verb.
- **Path** (`/accounts/login/`) — the noun.
- **Headers** — metadata (who you are, what you accept, your session cookie).
- **Body** (for POST/PUT) — the payload.

The server replies with a **status code** and a body:

```
Example — you're reading, not typing.

HTTP/1.1 200 OK
Content-Type: text/html
Set-Cookie: sessionid=xyz789

<!doctype html>
<html>...
```

| Status | Meaning | You'll see it when |
|---|---|---|
| 200 | OK | Things work |
| 301 / 302 | Redirect | URL changed |
| 400 | Bad request | You sent garbage |
| 401 / 403 | Not authorized | You're not logged in / not allowed |
| 404 | Not found | Typo in URL or deleted resource |
| 500 | Server exploded | Their bug, not yours |
| 503 | Service unavailable | Their server overloaded |

Memorize the families (2xx ok, 3xx redirect, 4xx your fault, 5xx their fault). Everything else you can Google.

### Step 4 — The server does work

The server reads the request, checks your cookie, fetches rows from a database, maybe calls two other APIs, assembles a response, sends it back. This is the part we'll unpack on Days 10 and 11.

### Step 5 — The browser parses and renders

The browser receives HTML, parses it into a **DOM** (Document Object Model — a tree of elements), applies **CSS** (styling), and runs **JavaScript** (interactivity). The DOM is the live, in-memory representation of the page.

```
         html
          |
    +-----+------+
   head         body
    |            |
  title     +----+----+
           nav  main  footer
                 |
               article
                 |
              paragraph
```

When you click a "Like" button, JavaScript often updates the DOM **and** fires a new HTTP request in the background to tell the server. The page doesn't fully reload. This is the SPA / modern-web pattern.

### Frontend vs backend, now concretely

| Runs on | Languages typically seen | Artifact |
|---|---|---|
| Frontend (client) | HTML, CSS, JavaScript/TypeScript | DOM in a tab |
| Backend (server) | Python, Node, Go, Java, Ruby | Running process |

You will not write any of these this month. You will direct an AI that does. But you must recognize them when you see them.

### A real example: liking a post on Insta

1. Tap the heart — event fires in the client.
2. JavaScript updates the heart to red **optimistically** (state lives in the DOM).
3. Parallel fetch goes out: `POST /api/like` with the post ID + your session cookie.
4. Server checks auth, writes a row to a `likes` table, notifies the poster's phone via a push service.
5. Server replies `200 OK`.
6. If the server replied `500`, the client quietly rolls back the heart.

That's the whole web in one screen.

## Watch: The browser is a rendering engine

Watch one visual explainer of how a browser turns HTML into pixels. Pay more attention to the pictures than the words.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Watch for the moment HTML becomes a tree.
- Notice when CSS and JS block rendering.
- See how images and fonts arrive late and cause **layout shift**.

## Lab: Anatomy of a web page (40 min)

No code. Browser devtools only.

1. Open three sites of different styles: a news site (ndtv.com), a SaaS product (linear.app), a social network you use.
2. On each, open devtools → **Elements** tab. This is the live DOM.
3. Hover over elements in the Elements panel — watch them highlight on the page. Pick 3 elements per site (a button, a heading, an image) and note their tag (`button`, `h1`, `img`).
4. Switch to the **Network** tab, filter by `Doc`. Look at the request and response headers for the main document on each site. Spot the `Content-Type`, `Set-Cookie`, and any `Cache-Control` headers.
5. In the Network tab, filter by `Fetch/XHR`. Count how many API calls each site makes in the first 5 seconds.
6. Pick one API call and look at its **Response** preview — it will usually be JSON. Note one field name you understand.
7. On the Excalidraw canvas (or paper), draw the 5-step trip-a-click diagram from the reading, filled in with **real values** from the news site: the domain, the IP (devtools shows it under `Remote Address`), one header, one status code, one DOM element.
8. Export the diagram.

Submit the diagram + a screenshot of the Network tab.

## Quiz

Short-answer on: DNS's job, what a status code family means, what the DOM is, the difference between a page load and an API call, and what "optimistic UI" means.

## Assignment

Pick one app or site you love. Write a 300-word "trip report" tracing a single user action (send a DM, add to cart, mark as done) through all five boxes from Day 8. Include one diagram. No code.

## Discuss: Seeing the invisible

- Why does the first load of a site feel slower than subsequent loads, even on the same Wi-Fi?
- A friend says "the internet is down". What three things would you actually check?
- Your college portal shows a 502 error during result time. Whose fault is it, and what does the status code family tell you?
- If TLS didn't exist, what would be different about using Wi-Fi at a café?
- Modern apps update the page without a full reload. What tradeoff does that introduce?
