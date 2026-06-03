# Day 24: Full-Stack AI + Real-Time Orders
## Gamma Presentation Content

---

## Slide 1: Title Slide
**Headline:** Give Your App a Voice: AI Chatbot + Live Orders
**Subheading:** Day 24 — Wire Supabase, add Gemini, display real-time orders

**Talking Points:**
- By end of today: Order Now button works, AI chatbot responds, orders appear live
- Three components. One app. Full-stack architecture.

---

## Slide 2: The Problem We're Solving
**Headline:** Your App Still Doesn't Talk Back

**Left Column - Before:**
- Static website
- No database
- No AI
- Orders nowhere

**Right Column - After (Today):**
- Live order tracking
- AI customer support
- Real-time updates
- Full-stack product

**Talking Point:** Yesterday you built a database. Today, we make it useful AND add a brain.

---

## Slide 3: Architecture Overview
**Headline:** How It All Connects

```
User clicks Order Now
        ↓
Form submits to Next.js API
        ↓
Supabase stores the order
        ↓
Orders Dashboard displays it LIVE
        ↓
Customer asks chatbot a question
        ↓
Gemini API responds
```

**Key Insight:** Three separate flows, one unified app.

---

## Slide 4: Part 1 - Order Now (Recap from Day 23)
**Headline:** The Order Form That Actually Works

**What's happening:**
- User clicks Order Now button
- Modal opens: asks for name, item, delivery address
- Form validates & submits
- Data goes to Supabase `orders` table
- Success message appears

**Environment Variables Needed:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Status:** ✅ Should already be working from Day 23

---

## Slide 5: Part 2 - Real-Time Orders Dashboard
**Headline:** Watch Orders Appear Instantly

**What you're building:**
1. **API Route** (`/app/api/orders/route.ts`)
   - Fetches all orders from Supabase
   - Returns JSON

2. **Orders Component** (`/app/components/OrdersList.tsx`)
   - Displays orders in a table
   - Subscribes to real-time changes
   - New orders appear without page refresh

3. **Orders Page** (`/app/orders/page.tsx` or embed on homepage)
   - Shows customer name, item, address, status, time

**The Magic:** When you add a row in Supabase Table Editor → it appears on your website immediately

---

## Slide 6: Real-Time Subscription Demo
**Headline:** How Real-Time Works

**Code Pattern:**
```
supabase
  .from('orders')
  .on('*', (payload) => {
    setOrders(prev => [payload.new, ...prev])
  })
  .subscribe()
```

**Translation:** Listen for ANY change (insert/update/delete) on the orders table, and when it happens, update the component state instantly.

**Result:** No page refresh needed. Orders appear live while you watch.

---

## Slide 7: Part 3 - AI Chatbot Setup
**Headline:** Give Your App a Brain

**What's a chatbot in 4 steps:**

1. **User types question** in floating chat widget
2. **Next.js API route** collects message + history
3. **Google Gemini API** reads system prompt + message
4. **Chatbot responds** with answer (appears in chat window)

**Key:** The system prompt tells Gemini who it is (AirDosa assistant, knows menu, delivery times, pricing)

---

## Slide 8: Gemini API Integration
**Headline:** Connecting to Google's Latest AI

**What you need:**
- Free API key from aistudio.google.com
- `GEMINI_API_KEY` in .env.local (and Vercel)

**API route flow:**
```
Request: { message: "What dosas do you have?", history: [...] }
         ↓
Google Gemini API (with your system prompt)
         ↓
Response: { reply: "We have Classic Masala, Cheese Burst..." }
```

**Models to use:**
- `gemini-2.0-flash-exp` (latest, fastest)
- `gemini-1.5-pro` (fallback)

---

## Slide 9: System Prompt = Personality
**Headline:** Teaching the Chatbot to Be AirDosa

**Example system prompt:**
```
"You are the AirDosa customer support assistant. 
We deliver hot dosas by drone in 15-20 minutes.

Menu: Classic Masala (₹99), Cheese Burst (₹129), Gunpowder Ghee Roast (₹149)

Pricing plans:
- Standard: Free delivery
- Express: ₹29
- Dosa Enthusiast: ₹199/month, unlimited delivery

Answer questions about menu, delivery, pricing, and how drone delivery works.
Be friendly, concise, and stay in character."
```

**Without this:** Chatbot becomes generic. With it: Chatbot becomes your brand.

---

## Slide 10: Building the Chat Widget
**Headline:** Floating Bubble → Chat Window

**User experience:**
1. They see chat bubble icon at bottom-right (fixed position)
2. Click it → chat window opens
3. Type a question → gets answer
4. Messages stay until page refresh

**Technical:**
- Client component with useState for messages
- Input field + send button
- Calls `/api/chat` endpoint
- Displays loading state while waiting for Gemini

---

## Slide 11: Deployment Checklist
**Headline:** Getting It Live on Vercel

**Before you push:**
- ✅ Order Now form works locally
- ✅ Orders dashboard shows live updates
- ✅ Chatbot responds to 3+ test questions

**On Vercel dashboard:**
- Add env vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `GEMINI_API_KEY`

**Test on live URL:**
- Click Order Now → order appears in dashboard instantly
- Ask chatbot a question → gets response

---

## Slide 12: Today's Mindmap
**Headline:** What You're Actually Learning

**3 Concepts:**
1. **Real-time databases** — Supabase subscriptions = instant updates
2. **Generative AI** — Gemini = natural language responses
3. **Full-stack thinking** — frontend (UI) + backend (API) + database (Supabase) + AI (Gemini) = product

**All three working together = a real product that users can interact with**

---

## Slide 13: Common Gotchas
**Headline:** What Breaks and Why

**Problem 1: Chatbot returns generic answers**
→ Your system prompt isn't being sent. Check API route.

**Problem 2: Orders don't appear in real-time**
→ Subscription not active. Check Supabase client initialization.

**Problem 3: "GEMINI_API_KEY is undefined"**
→ Env var not set in .env.local or Vercel. Check both.

**Problem 4: Orders show but are outdated**
→ Component isn't re-fetching. Check useEffect dependency array.

---

## Slide 14: Day 24 Assignment Preview
**Headline:** Your Deliverable

**Build a full-stack delivery app with:**
- ✅ Order placement (Order Now button)
- ✅ Live orders dashboard (real-time)
- ✅ AI chatbot (custom system prompt)

**Submit:**
- Live Vercel URL
- GitHub repo
- 200-word explanation of full-stack flow

**Graded on:**
- All 3 components working (6 points)
- Deployment without errors (1 point)
- Architecture explanation (3 points)

---

## Slide 15: What's Next (Day 25)
**Headline:** After Today

**Day 25: GEO, Leaderboards, and Staying Relevant**
- How do models cite your product?
- Which benchmarks actually matter?
- 2-feed system to keep up with AI without burning out

**Prep:**
- Keep your AirDosa app live
- Ask your chatbot a tricky question (see where it makes things up)
- We'll revisit guardrails on Day 28

---

## Slide 16: Closing Thought
**Headline:** You Just Built AI into Production

**The magic moment:**
- Day 22: Static HTML
- Day 23: Database
- Day 24: AI + Real-time + Chatbot
- Today: You have a full-stack product with an AI brain

**Next step:** Keep shipping. Your portfolio chatbot is due by Day 27.

---

## Speaker Notes for Each Slide

### Slide 1
- Set the energy: "By lunchtime, you'll have a chatbot talking on your website."
- Emphasize three independent things coming together.

### Slide 2
- Show contrast: "Yesterday we built a database. It sat there. Silent."
- "Today we talk to it, and it talks back."

### Slide 3
- Walk through the diagram slowly. Let it sink.
- "Three separate systems, one user experience."

### Slide 4
- Quick recap for anyone who skipped Day 23.
- "If Order Now isn't working, fix it first. Everything else depends on this."

### Slide 5
- This is the centerpiece. Real-time is the "wow" moment.
- Emphasize: "No page refresh. No waiting. Live."

### Slide 6
- Live demo here if possible. Supabase Table Editor + website side-by-side.
- Add an order row → watch it appear on the website.

### Slide 7
- Simple 4-step flow. Not about the code yet, about the concept.
- "The chatbot doesn't know anything except what you tell it in the system prompt."

### Slide 8
- Show that Gemini is a service, not magic.
- "You call their API, you get back an answer."
- Emphasize env vars: "Don't commit your API key. That's a security hole."

### Slide 9
- This is where students customize. Give them permission to be creative.
- "Your system prompt is your chatbot's personality. Make it good."

### Slide 10
- Show the UX. Click bubble → window. Type → response.
- Technical implementation is straightforward once they understand the flow.

### Slide 11
- This is the "make it real" moment.
- "You're deploying AI to production. Not a toy. Real app."
- Check that env vars are set on Vercel (most common mistake).

### Slide 12
- Step back. Meta moment.
- "What you learned today is architecture. These three things can be combined a thousand ways."

### Slide 13
- Troubleshooting. These are real problems students will hit.
- Give them a framework to debug.

### Slide 14
- Preview the assignment. No surprises.
- "You already built this. Now you submit it with a write-up."

### Slide 15
- Signal: "We're not done. Day 25 is about making your product findable."
- Tease the guardrails discussion for Day 28.

### Slide 16
- Closing circle moment.
- Reinforce: "You shipped AI. Keep going."

---

## Gamma-Specific Tips

**For Slides 3, 5, 6:**
- Use Gamma's flowchart / diagram features
- Make the architecture visual, not text-heavy

**For Slides 4, 7, 10:**
- Use code snippets with syntax highlighting
- Keep code to one visible block per slide (don't scroll)

**For Slide 13:**
- Use Gamma's card / comparison layout
- Problem on left, solution on right

**For Slides 14, 16:**
- Use emoji and bold text (Gamma renders well)
- Keep energy high in closing

**Transitions:**
- Slide 1-2: Motivation
- Slide 3-7: Concept
- Slide 8-11: Implementation
- Slide 12-16: Meta + Assignment + Next

**Total:** ~45 minutes for delivery + live demo
