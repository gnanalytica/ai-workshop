---
reading_time: 14 min
tldr: "Software is just layered systems. Hold the mental model, skip the syntax — you're the director, not the typist."
tags: ["concepts", "systems", "mental-model"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Trace a click: devtools scavenger hunt", "url": "https://developer.mozilla.org/en-US/docs/Tools"}
resources: [{"title": "MDN: How the web works", "url": "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works"}, {"title": "httpbin", "url": "https://httpbin.org/"}]
---

## Intro

Week 1 was about you and the AI. Week 2 is about the thing the AI will build for you. Before we direct an AI to ship software, we need a mental model of what software actually is. No Python. No typing. Just the map.

## Read: Software is boxes passing notes

Every piece of software you have ever used — Instagram, your hostel mess-app, Zerodha, WhatsApp — is a small set of **boxes** exchanging **messages**. That's it. The rest is decoration.

The five boxes you should be able to draw on a napkin:

```
 [ Client ]  <-- request -->  [ Server ]  <-- query -->  [ Database ]
     |                             |
     |                             +-- talks to --> [ 3rd-party APIs ]
     |
 [ You, the human ]
```

- **Client**: the thing in front of the user — a browser tab, an Android app, a smartwatch face. It renders and captures intent.
- **Server**: a program running on someone else's computer that receives requests, makes decisions, and sends responses.
- **Database**: organized memory. When you close the app and reopen it, whatever is still there lives here.
- **Third-party APIs**: other people's servers your server calls. Payment (Razorpay), maps (Mapbox), auth (Google login), SMS (Twilio).
- **You**: the only box with taste, intent, and deadlines.

> Everything a developer does is: decide which box gets which job, and design the notes they pass.

### Frontend vs backend vs "full-stack" — the real distinction

| Term | What it means in one line | College analogy |
|---|---|---|
| Frontend | Code that runs on the client (usually browser) | The poster on the notice board |
| Backend | Code that runs on the server | The clerk inside the admin office |
| Database | Durable storage | The filing cabinet in the admin office |
| Full-stack | A person who can touch all three | The senior who knows how the whole society works |
| DevOps / infra | Keeping the servers alive | The electricity and plumbing of the building |

When someone says "my app is slow", they almost always mean one of five things: slow network, slow client rendering, slow server logic, slow database query, or slow third-party API. A good mental model lets you ask **which one**.

### Synchronous vs asynchronous, in plain English

- **Synchronous**: you ask, you wait, you get the answer, you move on. Like calling a classmate.
- **Asynchronous**: you ask, you go do something else, the answer arrives later. Like a WhatsApp message.

Modern apps are mostly async because users hate waiting. When your Swiggy order says "Placed", the restaurant hasn't yet confirmed — the server said "got it, I'll update you". That update comes async.

### State: the hardest word in software

**State** = "what is currently true". Your cart has 3 items. You are logged in. The match score is 142/6. State lives somewhere — in the browser's memory, on the server, in the database, in a cache. Most bugs are really one question: *who owns this piece of state, and is it up to date everywhere it appears?*

Example — WhatsApp's blue ticks. The state "message seen" lives on the receiver's phone, gets sent to the server, gets pushed to the sender's phone. Three copies. If any one is stale, the UI lies.

### Code, runtime, deployment — three different things

Students mash these together. Keep them separate:

| Layer | What it is | Analogy |
|---|---|---|
| Source code | Text files a human (or AI) writes | A recipe |
| Runtime | The program running right now | The dish being cooked |
| Deployment | The running program hosted somewhere public | The dish served at a restaurant |

When you "ship" on Day 14, all three happen: AI writes the recipe, a server cooks it, the internet serves it.

## Watch: What happens when you type a URL

Watch a clear walkthrough of the journey from keystroke to rendered page. You do not need to memorize any acronym. Just let the picture settle.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Notice the handoffs: browser → DNS → server → database → back.
- Count how many separate network calls one "page load" actually is.
- Listen for the word **render** — it means "turn data into pixels".

## Lab: Devtools scavenger hunt (35 min)

You will not write a line of code. You will look.

1. Open Chrome or Firefox. Go to any content-heavy site you know well (Wikipedia article, your college site, Cricbuzz live score).
2. Right-click anywhere → **Inspect** → switch to the **Network** tab. Reload the page.
3. Count the rows. Write down the total. Most students guess 5. Reality is often 80+.
4. Find **one** request whose "Type" is `document` — this is the HTML itself. Click it. Look at the Response tab. That text is what the server sent.
5. Find **one** request of type `xhr` or `fetch`. This is JavaScript on the page calling a backend API after load. Note its URL.
6. Find **one** image and **one** font request. Note their sizes in KB.
7. Switch to the **Performance** or **Lighthouse** tab. Run an audit. Screenshot the score.
8. On paper or in Excalidraw, draw the five-box diagram from the reading and label which boxes were involved in loading this page.

Submit the screenshot + the diagram.

## Quiz

Four questions on the five-box model, the difference between client and server, what "state" means, and what a deployment is. No code. If you can explain each term to a non-technical friend, you'll pass.

## Assignment

Pick any app on your phone you used today. Write a 250-word note answering: *where does its state live, what does its client do, what does its server probably do, and which third-party APIs does it likely call?* Attach a hand-drawn or Excalidraw diagram. No code. Submission: PDF or image.

## Discuss: Mental models that matter

- Which box do you think most bugs live in, and why?
- When Instagram feels "laggy", how would you figure out whether the phone, the network, or the server is to blame — without opening any code?
- Your college placement portal crashes every year on results day. What does the five-box model predict is happening?
- Where does state live in a Google Doc when two people are typing at once? Who owns the truth?
- If an AI could only touch one box for you, which would you pick first and why?
