---
reading_time: 14 min
tldr: "APIs, HTTP, JSON, requests — the concepts that let you direct AI to connect anything to anything."
tags: ["web", "apis", "concepts"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Hit three real APIs with Hoppscotch — no code", "url": "https://hoppscotch.io/"}
prompt_of_the_day: "I want my app to call the {{api}} API. Explain the endpoint, what I need to send, what I'll get back, and rewrite it as a plain-English sentence I could say to Lovable/bolt.new."
resources: [{"title": "Hoppscotch", "url": "https://hoppscotch.io/"}, {"title": "MDN Web Docs: HTTP", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP"}, {"title": "PokeAPI", "url": "https://pokeapi.co/"}, {"title": "GitHub REST API", "url": "https://docs.github.com/en/rest"}, {"title": "OpenWeather", "url": "https://openweathermap.org/api"}]
---

## Intro

Tomorrow you direct an AI to build your app. To direct it well, you need four small concepts: what an API is, what HTTP is, what JSON looks like, and what "request / response" means. Not to write code — but to speak the language your AI builder speaks. Today's a concept-and-click day.

## Read: The plumbing under every app

Every app you've ever used is mostly glue between APIs. Instagram's home feed? An API call. Uber's map? Two API calls. ChatGPT? An API call to OpenAI. When you describe an app to bolt.new tomorrow, you'll say things like "when the user submits, fetch X from Y and display Z." That sentence is built out of the concepts below.

### API: a menu for machines

An API — Application Programming Interface — is a menu of things a service lets outside software do. OpenWeather's menu: "I'll give you weather for any city, here's the exact request format." GitHub's menu: "I'll give you a user's repos, their README, their profile." The API is the contract; following the contract gets you the data.

```
Read this, don't type it

You  -->  "Give me weather for Bengaluru"  -->  OpenWeather API
  <--  "27 C, humid, chance of rain 40%"  <--
```

That exchange is a request and a response. That's essentially the whole web.

### HTTP: the verbs of the web

HTTP (HyperText Transfer Protocol) is the language of those exchanges. Every request uses one of a handful of verbs:

| Verb | Means | Example |
|---|---|---|
| GET | "Give me this thing" | GET the Pokémon named "pikachu" |
| POST | "Make a new thing" | POST a new tweet |
| PUT | "Replace this thing" | PUT an updated profile |
| DELETE | "Remove this thing" | DELETE my account |

When you browse a website, your browser is firing GETs nonstop. When you hit "submit" on a form, it's usually POSTing. You already live inside HTTP; you just didn't name it.

### URL: the address

Every API request goes to a URL. The URL has structure:

```
Read this, don't type it

https://pokeapi.co/api/v2/pokemon/pikachu
|_____|  |________| |_______________|
scheme   domain     path
```

The path is usually where the "what" lives. `/api/v2/pokemon/pikachu` reads almost like English — "give me version 2 of the pokemon named pikachu."

### JSON: the shape of data

APIs usually talk back in JSON — JavaScript Object Notation. It's just key-value pairs in a specific syntax. If you can read a Python dict or a YAML file, you can read JSON.

```
Read this, don't type it

{
  "name": "pikachu",
  "height": 4,
  "weight": 60,
  "abilities": [
    { "name": "static" },
    { "name": "lightning-rod" }
  ]
}
```

Three rules:
- Curly braces `{}` hold key-value pairs (an object).
- Square brackets `[]` hold lists.
- Strings are in double quotes.

When you tell an AI builder "use this field from the response," you point at a JSON key. That's the whole conversation.

### Headers and keys

Most real APIs require an API key — a password that identifies you — sent in a special spot called a header. Your header might look like `Authorization: Bearer sk-abc123…`. Don't memorize it; just know that keys live in headers, and headers are metadata you attach to the request. Think of headers as the envelope; the body is the letter.

### Rate limits and status codes

The response also comes with a status code:

| Code | Meaning |
|---|---|
| 200 | OK, here's your data |
| 201 | Created, your new thing exists |
| 401 | Not authenticated (bad or missing key) |
| 404 | Not found (wrong URL or missing resource) |
| 429 | Too many requests — slow down |
| 500 | Server broke, not your fault |

When bolt.new or Lovable throws an error tomorrow, 9 times out of 10 it'll reference a status code. You'll know exactly what happened.

### Why this matters for AI apps

Every AI app you build is made of these pieces: user sends a request to your app, your app calls an LLM API, maybe calls a weather or database API, stitches the JSON together, sends a response back. You're the conductor. The orchestra speaks HTTP and JSON.

## Watch: APIs in plain English

A short, no-code explainer on what APIs are, how HTTP works, and why JSON became the universal data shape. Watch until you could explain an API to a friend at dinner.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Notice how every app they show reduces to request/response.
- Watch for the headers/body distinction in the demo.
- Observe how JSON mirrors real-world nesting.

## Lab: Hit three real APIs in your browser

Hoppscotch is a free browser-based API client — think Postman without the install. You'll use it to make three real API calls, no code, no login.

1. Open https://hoppscotch.io/. You'll see a Method dropdown (defaulted to GET) and a URL bar. That's a full API client in one screen.
2. **PokeAPI (no auth).** Set method to GET. Paste URL: `https://pokeapi.co/api/v2/pokemon/pikachu`. Click Send. Scroll the JSON response. Find the `height`, `weight`, and `abilities` fields. Note the status code — it should be 200.
3. Change the URL to `https://pokeapi.co/api/v2/pokemon/charizard`. Send. Compare the JSON shape — same keys, different values. That consistency is what makes APIs programmable.
4. **GitHub API (no auth for public data).** GET `https://api.github.com/users/torvalds`. You'll see Linus Torvalds' public profile as JSON. Try `https://api.github.com/users/torvalds/repos` for his repos.
5. **OpenWeather (requires free key).** Go to https://openweathermap.org/api, sign up free, grab an API key from your account page. In Hoppscotch, GET `https://api.openweathermap.org/data/2.5/weather?q=Bengaluru&appid=YOUR_KEY`. Replace YOUR_KEY. Send. Look at the `main.temp` field — that's Bengaluru's temperature in Kelvin (subtract 273 for Celsius).
6. Deliberately break the OpenWeather call. Change the key to `wrong`. Send. You'll see a 401 status. That's authentication failing. Fix the key. Send. 200 again.
7. Deliberately break the URL — GET `https://api.github.com/users/thisuserdoesnotexist99999`. You'll see 404. That's "not found."
8. Paste today's prompt-of-the-day into any chat LLM with `{{api}}` set to one of the three above. Get a plain-English sentence you could paste into Lovable tomorrow. Save it.

Time permitting, look at Hoppscotch's "Generate code" button — it converts your request into a copy-paste code snippet in any language. That's what AI builders do under the hood, and you just saw it happen.

## Quiz

Expect questions on the four HTTP verbs, reading a JSON object, picking the right status code for a scenario, and one "explain this URL structure" item. Trust the request/response mental model.

## Assignment

Find a real API you'd use in your capstone. Candidates: NewsAPI, a free sports-stats API, a translation API, Google Books, a LeetCode-problems API. Hit one endpoint in Hoppscotch and screenshot the JSON. Write a 3-sentence "what I'd use this for" note. Submit.

## Discuss: Seeing the web for what it is

- Which of the three APIs felt most "magical"? Which felt most boring (in a good way)?
- An API key is a password — what goes wrong if you paste yours into a public GitHub repo?
- Why is JSON everywhere? What's the alternative (XML, CSV) and why did JSON win?
- Which API would make your capstone app dramatically better if you connected it?
- When you describe tomorrow's build to an AI, which concepts from today will you actually name out loud?
