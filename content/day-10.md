---
reading_time: 14 min
tldr: "APIs are contracts between systems. Learn to read them; AI writes the calls."
tags: ["concepts", "apis", "systems"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Three public APIs in Hoppscotch", "url": "https://hoppscotch.io/"}
resources: [{"title": "Postman", "url": "https://www.postman.com/"}, {"title": "JSONPlaceholder", "url": "https://jsonplaceholder.typicode.com/"}, {"title": "httpbin", "url": "https://httpbin.org/"}]
---

## Intro

If the web is a country, APIs are its common language. Every non-trivial app you've ever touched is a front-end talking to one or more APIs. Today we build the mental model without writing a single line of code.

## Read: APIs as menus, contracts, and pipes

### What an API actually is

**API** = Application Programming Interface. Strip the jargon: it is a **menu** a server publishes so other programs know what to order.

```
    [ Your app ]  --- GET /users/42 --->  [ Their API ]
                                                 |
                   <---  JSON response  ---------+
```

Three metaphors, pick the one that sticks:

- **Menu at a restaurant** — defined dishes, defined ingredients, defined prices. You order, kitchen produces.
- **Contract** — if you send X with shape Y, I promise to return Z.
- **Pipe** — structured data flows in, structured data flows out. No human involved.

### Anatomy of an API call

| Part | Example | What it controls |
|---|---|---|
| Base URL | `https://api.github.com` | Which server |
| Endpoint | `/users/torvalds` | Which resource |
| Method | `GET` | What to do with it |
| Headers | `Authorization: Bearer <token>` | Who you are, what format |
| Query params | `?per_page=5&sort=created` | Filters |
| Body | `{ "title": "Hello" }` | Payload for POST/PUT/PATCH |
| Response | JSON (usually) | What you get back |

### REST, the dominant dialect

**REST** is a style, not a technology. Core idea: treat everything as a **resource** with a URL, act on it with HTTP verbs.

| Verb | Intent | Example |
|---|---|---|
| GET | Read | `GET /orders/42` |
| POST | Create | `POST /orders` |
| PUT / PATCH | Update | `PATCH /orders/42` |
| DELETE | Delete | `DELETE /orders/42` |

A campus placement portal, restful:

```
GET    /students            list students
GET    /students/CS22B007   get one
POST   /students            register a new one
PATCH  /students/CS22B007   update CGPA
DELETE /students/CS22B007   withdraw
GET    /companies/Zoho/applicants   nested resource
```

Readable. Predictable. Learnable.

### What a JSON response looks like

```
Example — you're reading, not typing.

{
  "id": "CS22B007",
  "name": "Priya Menon",
  "cgpa": 8.9,
  "skills": ["python", "ml", "react"],
  "placed": false,
  "applications": [
    { "company": "Zoho",   "status": "shortlisted" },
    { "company": "Swiggy", "status": "rejected" }
  ]
}
```

JSON is just key–value pairs, arrays, and nesting. If you can read a WhatsApp contact card, you can read JSON.

### REST vs GraphQL vs RPC — one-line mental model

| Style | Mental model | When you'll meet it |
|---|---|---|
| REST | "GET a resource by URL" | Most public APIs (GitHub, Stripe) |
| GraphQL | "Send a shopping list, get exactly that" | Apps with deep nested UIs (Shopify, GitHub v4) |
| gRPC / RPC | "Call a function on another machine" | Internal microservices |
| WebSockets | "Keep the line open, talk both ways" | Chat, live scores, collaborative editing |

You don't need to pick today. You need to recognize them when an AI suggests one.

### Auth: the part everyone gets wrong

Most APIs need to know who's calling. Four common patterns:

- **API key** — a long string in a header. Simple, for server-to-server.
- **OAuth / login tokens** — user logs in, app gets a token on their behalf. "Sign in with Google" is this.
- **JWT** — a self-describing token the server can verify without a database lookup.
- **Session cookie** — the browser default; works because browsers auto-send cookies.

> A leaked API key is the single most common security incident among student projects. Treat them like your password — never commit them to GitHub.

### Rate limits, idempotency, versioning

Three words that separate toy APIs from real ones:

- **Rate limit** — "You can call me 60 times per minute. After that, 429." Twitter, GitHub, OpenAI all rate-limit.
- **Idempotent** — calling it twice is the same as calling it once. `GET` is idempotent; naive `POST /pay` is not. Payment APIs invent an idempotency key so you don't double-charge.
- **Versioning** — `/v1/users` vs `/v2/users`. APIs change; versions let old clients keep working.

### A concrete story: the Dunzo clone

Your dummy Dunzo clone needs four APIs:

1. **Your own backend** — user accounts, orders.
2. **Maps API** — distance, ETA, directions.
3. **Payments API** — Razorpay/Stripe to charge the card.
4. **SMS API** — Twilio/MSG91 to text the OTP.

Your server is a conductor. Each box plays one instrument. Your code is the score. Tomorrow we'll see where the data itself lives.

## Watch: APIs in 100 seconds, then deeper

Watch a short "APIs in 100 seconds" explainer, then a longer REST walkthrough.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Spot the difference between an API and a website.
- Notice how the same backend can serve a web app, an Android app, and a smartwatch.
- Pay attention to the word **endpoint**.

## Lab: Three APIs in Hoppscotch (40 min)

Browser-based, no install, no code.

1. Open `https://hoppscotch.io/`. Leave the method as `GET`.
2. **API 1 — GitHub user**. Enter `https://api.github.com/users/torvalds`. Send. Look at the JSON response. On a worksheet, write: 3 fields you understand, the status code, the `content-type` response header.
3. **API 2 — JSONPlaceholder (fake blog)**. `GET https://jsonplaceholder.typicode.com/posts/1`. Send. Change the ID to `2`, `10`, `999`. Note when you get a 404 and why.
4. **API 3 — OpenLibrary**. `GET https://openlibrary.org/search.json?q=the+alchemist`. Send. Count how many results. Try a different query param.
5. On httpbin, `GET https://httpbin.org/headers`. Look at what headers **your browser** sent without you realising.
6. Try one `POST` on `https://jsonplaceholder.typicode.com/posts` with a JSON body of your choice. The API will pretend to save it and echo back an `id`.
7. On paper, design a mini-menu for a *hostel laundry tracker* API: list 4 endpoints with method + path + one-line purpose each. Do not write code. Design only.
8. Export the worksheet + a screenshot of one Hoppscotch response.

Submit the worksheet + screenshots.

## Quiz

4 questions: identify a method from a scenario, read a JSON response and extract a field, explain what a 429 means, describe one difference between REST and GraphQL in your own words.

## Assignment

Pick an app you use (Ola, Swiggy, LinkedIn, whatever). Sketch its likely **public API** as a list of 6–10 endpoints (method + path + purpose). Bonus: mark which third-party APIs it probably calls. Submission: one-page PDF or markdown doc. No code.

## Discuss: Thinking in contracts

- Why is `GET` idempotent but `POST` usually isn't? Give a scenario where that matters.
- Razorpay vs UPI vs Paytm — if you were building a checkout, how would you decide which API to integrate first?
- What's the difference between an API going down and an API returning a 500?
- An API changes its response shape without a new version. What breaks in every app using it, and whose responsibility is the fix?
- Could a restaurant's paper menu become "RESTful"? What would be the resource, what would be the verbs?
