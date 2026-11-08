# CarPicker Ireland: UI & UX Revamp Plan

**Goal:** make CarPicker feel calm, friendly and trustworthy for someone who knows nothing about cars. They should reach a confident shortlist faster, understand *why* each car suits them, and know exactly what to do next, especially when buying from Northern Ireland.

The plan borrows from ten designers (Don Norman, Julie Zhuo, Steve Schoger, Ioana Teleanu, Tobias van Schneider, Pablo Stanley, Elizabeth Alli, Luke Wroblewski, Gleb Kuznetsov and Jared Spool). Each idea is tied to a specific change in the app.

> **Sources:** the designer profiles were checked against the andacademy.com article *"Best UI UX Designers to Follow"* (read 8 November 2026). The article's main point for each designer is listed below, alongside their wider published work (books, talks, products).

## Status (November 2026)

**Built:** phases B (design system), D (quiz), E (results, car page, compare) and F (polish) are in the app:
- **Design system:** colour tokens with a light theme and a separate bold dark theme, Inter font, lucide icons instead of emoji, our own car illustrations, cards, chips, plate badge, star rating, match bar, bottom-sheet dialog.
- **Quiz:** 5 chapters with intro cards; 24 questions in total (about 21 for a typical user, down from 31); progress by chapter; live "N of 51 cars still fit" counter with a one-tap fix when nothing fits; conflicting options disabled with a reason; smart default for the priority order; Back/Next bar at the bottom of the screen; number keys and Enter; "Save and finish later"; edit a single answer from results.
- **Results:** shortlist reveal (skipped if you've turned on "reduce motion"), one large top pick with a one-line summary, smaller cards for the alternatives, filters that re-sort cards with motion, "What we know about you" panel, "Why isn't my car here?", compare tray, a clear finish line with 3 next steps and "Share with someone you trust".
- **Car page:** yearly cost bar; Northern Ireland answer first ("You save about €X") with a waterfall chart; steps timeline with 7-day and 30-day deadline badges; reviews; safety; inside (boot shown as suitcases).
- **Compare:** up to 3 cars, grouped rows, best value marked, "show only differences", first column stays visible when scrolling sideways.
- **Northern Ireland guide:** 3-step story (Is it worth it? / What you'll need / What to do and when) and a printable checklist.
- **Accessibility:** automated axe-core checks (WCAG 2.2 A/AA) pass with no serious or critical issues on every page in light and dark themes, at phone and desktop widths. Tap targets ≥ 44–48 px. Answers announced live.

**Not done (needs people or decisions):**
- Phases A, C and G (usability tests with real users in Ireland, before/after metrics).
- A manual screen-reader pass.
- Illustrated people for quiz chapters (needs an illustration source such as Open Peeps, or an illustrator). Chapters use icons for now.
- Open questions in §11.

---

## 1. What's wrong today (audit of the current MVP)

Found by walking through the app and reviewing screenshots of the results, quiz and Northern Ireland pages:

| # | Problem | Where | Why it hurts a beginner |
|---|---|---|---|
| 1 | **Every result card looks equally important.** Five cards, each with four stat tiles, three reasons, a heads-up and five accordions | Results | No clear "this is the one". The page is ~6,700 px long on desktop |
| 2 | **Accordions inside cards** (NI option, steps, experts, running costs, safety) | Results | Important info is hidden, and closed sections aren't explored. Too many decisions on one screen |
| 3 | **No way to compare cars side by side** | Results | Beginners compare by scrolling up and down and remembering numbers |
| 4 | **Full quiz is 31 questions**; the progress text ("Question 7 of 24") changes as questions are skipped | Quiz | Feels long; the total jumping around breaks trust |
| 5 | **No summary of answers**; editing means going back through the quiz | Quiz → Results | Users can't see *what the app thinks it knows* about them |
| 6 | **Emoji used as icons everywhere** | All | Inconsistent across devices, read aloud by screen readers, looks less trustworthy for money decisions |
| 7 | **Visual hierarchy relies on borders and size**: many grey boxes, similar weights | All | Hard to scan; nothing leads the eye |
| 8 | **Car images are flat silhouettes in random colours** | Results, quiz | Don't help recognition. A beginner can't picture the actual car |
| 9 | **Northern Ireland cost breakdown is a dense table** | Results, NI page | The key answer ("do I save money?") is at the bottom of the table |
| 10 | **No feedback on how answers change results** | Quiz | Users can't tell that their answers matter |
| 11 | **Navigation buttons are at the top/bottom of long content on mobile** | Quiz | The Next button can sit far from the thumb zone |
| 12 | **No dark mode, small tap targets in places, colour-only cues** (green/red savings) | All | Accessibility gaps |

---

## 2. Ideas from each designer → what changes in CarPicker

| Designer | Idea we're using | Change in CarPicker |
|---|---|---|
| **Don Norman** (coined "user experience"; *The Design of Everyday Things*, *Emotional Design*) | Usability first ("can a normal person use this without a manual?"); use psychology: clear signifiers, immediate feedback, constraints that prevent errors, a correct mental model; emotional design (visceral, behavioural, reflective) | Every answer gives instant visible feedback ("38 cars still fit"). The app explains its model up front: *"You tell us about your life → we filter → we score → you get a shortlist."* Impossible combinations are prevented, not flagged later (e.g. greying out "Manual" when the licence is automatic-only). Visual polish handles the visceral level, smooth flow the behavioural level, and an "I'm confident about this" moment at the end the reflective level |
| **Julie Zhuo** (*The Making of a Manager*; intern to VP of design at Facebook) | Product thinking (understand *why* a button is needed before designing it); communicate design clearly to the team; define what "great" looks like | Each screen gets a one-line "job" (e.g. Results: *"Help me pick one car to go and see"*). Success metrics are set before designing (§8). Weekly critique against those jobs |
| **Steve Schoger** (*Refactoring UI*) | Hierarchy through weight and colour, not size; emphasise by de-emphasising; a spacing and type scale; fewer borders, more spacing and shadows; a 9-shade palette; don't put grey text on coloured backgrounds; labels are a last resort | New design system (§5). Results stats become "€19,400 · typical price" (value bold, label quiet) instead of label-above-value boxes. Borders are replaced with spacing and subtle shadows. One accent colour |
| **Ioana Teleanu** ("UX Goodies"; ex-UiPath; making UX easy to understand, AI in the design process) | Explain UX simply so everyone gets it; use AI tools to speed up design work, keeping people at the centre | Quiz split into short chapters with one idea each, plus a plain-language content guide (§6). **In the design process only** (the app stays AI-free): use AI tools to generate wireframe variations, draft microcopy options and run quick accessibility checks, with every output reviewed by a person |
| **Tobias van Schneider** (ex-lead designer at Spotify, Semplice; bold, dark, moody style; strong brand "vibe") | Give the product a strong, recognisable personality; find your own voice instead of looking like every other app | A distinctive brand rather than a generic template (§5): a confident deep-teal palette, a **bold dark theme** that feels premium (not just an inverted light theme), and recognisable signature details such as an Irish-plate-style year badge (e.g. `221`) on every car |
| **Pablo Stanley** (Humaaans, Open Peeps, Blush; open-source design, humour, accessibility) | Tell the story with illustration; add personality and humour; care about accessibility so everyone can use it; share work generously | Illustrated people for each quiz chapter (families, dog owners, commuters, older drivers, wheelchair users) and for empty states ("No cars fit… yet"). Light humour in microcopy, never at the user's expense. Accessibility as a launch requirement, not an extra (§7). Publish our car illustrations under an open licence too |
| **Elizabeth Alli** (founder of DesignerUp; "Mindful Product Design") | Design products that are good for people's wellbeing, not addictive; design responsibly and ethically | Buying a car is stressful and expensive, so the app should **lower anxiety**. No urgency, countdowns or "only 2 left". A clear finish line: "You're done. Here's your shortlist and your next 3 steps". "Save and come back later" at any point. A calm results page that encourages taking time, test drives and a second opinion ("Share with someone you trust"). See §6a |
| **Luke Wroblewski** (*Mobile First*, *Web Form Design*; Google) | Mobile first; data on how people actually hold and tap phones; forms: fewer questions, one column, smart defaults; "obvious always wins" | Mobile layouts designed first. Sticky bottom action bar in the thumb zone. Cut the full quiz from 31 to ~20 questions (§4.2). Smart defaults (e.g. pre-fill priorities from earlier answers). Big tap targets (≥ 48 px) |
| **Gleb Kuznetsov** (Milkinside; interfaces for cars, voice and AI; 3D motion) | Motion that makes an interface feel alive; next-generation, automotive-grade polish | Fitting for a car app: subtle motion such as cards that re-sort smoothly when you change the budget, a satisfying "shortlist reveal", and a soft 3D-style hero car that rotates slightly on the car page. Kept restrained, always respecting "reduce motion" (Norman, Spool and Alli keep this in check) |
| **Jared Spool** (UIE / Center Centre; "the $300 million button"; usability research; proving design's business value) | Don't guess, test: watch real people use it; remove barriers (no forced registration); show the value of design with evidence | Keep "no account" as a core promise. Close the knowledge gap with in-context explanations rather than a separate glossary page. Run 5-user tests every phase (§9) |

---

## 3. Research first (week 1)

*Spool, Alli, Norman, Teleanu.*

1. **Usability test the current MVP** with 5–6 people in Ireland who know little about cars. Recruit a mix: a young first-time buyer, a parent, a rural commuter, someone over 65, and someone considering Northern Ireland.
2. **Tasks:**
   - (a) find a car that suits you
   - (b) explain why the top car was picked
   - (c) find out whether buying in NI would save money and what you'd need to do
   - (d) change your budget and see what changes
   - (e) share the results with a partner
3. **Measure** task success, time on task, number of errors or wrong turns, and a 1–5 confidence score ("How confident are you about what to do next?").
4. **Write a short findings report**, then update this plan's priorities to match.

Hypotheses to test (from §1): results are too dense (#1, #2), the quiz feels long (#4), and the NI breakdown is hard to read (#9).

---

## 4. New flows and screens

### 4.1 Overall flow

```
Home ──► Quiz (5 chapters) ──► Shortlist reveal ──► Results ──► Car page ──► Next steps
                                                       │            │
                                                       └─ Compare ◄─┘
NI guide (standalone) ◄──── linked from any NI car
```

New pieces: **chapter intros**, **shortlist reveal**, a **car detail page** (replacing accordions), a **compare view**, and an **"About you" summary panel**.

### 4.2 Quiz

*Wroblewski, Norman, Teleanu, Stanley.*

- **5 chapters instead of 7 sections:** Money · You & your driving · Your everyday life · What you love · What matters most. Each opens with a small illustrated intro card (Stanley) and a one-line "why we ask".
- **Cut to ~20 questions** (Wroblewski: every question must earn its place):
  - Merge "fuel cost importance" into the priority ranking.
  - Merge "deal-breakers" and "must-haves" into one "Yes please / No thanks" screen.
  - Drop "trade-in" from the quiz and show it as a tip on results.
  - Drop "age group" and fold the insurance warning into the licence question.
  - Move "brands" to the results filters.
- **Progress by chapter, not question count:** five labelled dots, so the total never jumps.
- **Live feedback** (Norman): a small counter under the progress bar, *"42 cars fit so far"*, that animates down as answers filter. If it hits 0, say so straight away and offer the fix ("Raise budget to €14k → 6 cars").
- **Sticky bottom bar** with Back / Next in the thumb zone (Wroblewski). Single-choice answers still auto-advance, with a visible 300 ms "selected" state first (Norman feedback).
- **Constraints, not errors:** options that conflict with earlier answers are disabled with a reason ("You said automatic only").
- **Smart defaults:** the priority ranking is pre-ordered from earlier answers (e.g. a new driver gets Price and Insurance near the top). The user just confirms.
- **Plain explanations right where they're needed:** "What's PCP?" opens a bottom sheet on mobile, not a block of text that pushes the page down.
- **Keyboard support:** number keys pick options, Enter goes to the next question.

### 4.3 "About you" summary

*Norman: conceptual model. Spool: close the knowledge gap.*

A panel on results (a drawer on mobile) shows the app's understanding in plain sentences:
> *Up to €20,000 cash · Family of 4 · Mostly mixed driving in Donegal · Open to Northern Ireland · Loves: practical, eco · Must have: automatic*

Each line is tappable to edit in place. No need to go back through the quiz.

### 4.4 Shortlist reveal

*Kuznetsov: motion. Norman: emotional design.*

A 1–2 second transition after the last question: cars that were filtered out fall away and the top picks rise in. It shows the model at work ("52 cars → 31 fit your needs → your top 5") and creates a small moment of delight. It is skipped under reduced motion.

### 4.5 Results

*Schoger, Zhuo, Spool.*

- **One hero pick.** The best match gets a large card: car image, name, Irish-plate year badge, the price, and **one sentence** on why ("A reliable, cheap-to-run hybrid with room for the family"). There's a single main button: **"See why it fits"** → car page.
- **Alternatives as compact cards** in a row on desktop and a swipeable carousel on mobile:
  - Each shows its role (Best value / Closest to your dream / Wildcard / NI deal), name, price, a match bar, and one reason.
- **Every card has an "Add to compare" checkbox.** A compare tray appears at the bottom once 2+ cars are selected.
- **Filters panel** (replaces the "Tweak" box): budget slider, new/used, NI on/off, favourite and avoided brands. Cards re-sort with animation (Kuznetsov) so users *see* the effect of each change (Norman).
- **"Why isn't my car here?"** search: type a model and get a plain answer ("The Golf GTI is over your budget by about €3,000").
- **Remove all accordions from cards.** The detail moves to the car page.

### 4.6 Car detail page (new)

Sections stacked in order of importance, with a sticky section menu:

1. **Summary:** image, price, monthly cost, match %, the 3 reasons, the 1 heads-up.
2. **Total cost picture:** a stacked bar of yearly cost (repayments, fuel/charging, motor tax, servicing, with insurance shown as "get a quote"), replacing the table.
3. **Northern Ireland option** (if relevant): a **"You save €1,074"** headline answer first. Below it, a waterfall chart: NI price → + fees → + travel → + VRT → + plates = total, compared with the Republic price. The table stays as "See the detail". The verdict uses an icon and words, not just colour.
4. **Steps** (for NI): a vertical timeline (Before / When / After you buy) with checkboxes and deadline badges ("Within 7 days", "Within 30 days").
5. **What the experts say:** pros and cons as two short lists, a review score, and source chips.
6. **Safety:** Euro NCAP stars as a proper star component with test year, plus the feature list.
7. **Inside the car:** features, boot size shown visually (e.g. "fits 2 large suitcases + a buggy" icons).

### 4.7 Compare view (new)

Up to 3 cars side by side. Rows are grouped (Cost, Space, Running costs, Safety, Reviews). The best value in each row is highlighted, and "Show only differences" is an option. On mobile, the first column is sticky with horizontal swipe.

### 4.8 Northern Ireland guide

The standalone guide is reorganised as a **3-step story**:
1. Is it worth it? (calculator, with the answer first)
2. What do I need? (document checklist: NI Import Declaration or V5C + NI service and MOT history, CoC, invoice…)
3. What do I do, and when? (timeline with the 7-day and 30-day deadlines)

Add a printable / save-as-PDF checklist to bring to the seller and to NCTS.

### 4.9 Home page

- A clear promise: **"Find a car that fits your life, in about 3 minutes. No car knowledge needed."**
- Three trust badges: *Free · No account · Your answers stay on your phone* (Spool, Alli).
- An illustrated hero with diverse people and cars (Stanley), not stock photos.
- One main button (Start). Quick mode is a secondary text link.

---

## 5. Visual design system

*Schoger, van Schneider, Kuznetsov, Stanley.*

Built as Tailwind design tokens plus a small component library (Button, Card, Chip, Stat, MatchBar, StarRating, Timeline, BottomSheet, CompareTable, CostWaterfall).

| Token | Plan |
|---|---|
| **Colour** | One brand colour (deep teal-green, a nod to Ireland without shamrock clichés) in 9 shades; a warm accent (amber) only for "heads-up"; semantic colours for success/warning/danger; neutrals with a slight warm tint (Schoger). **Dark theme designed as its own bold, moody look** (van Schneider), not an afterthought |
| **Type** | One readable sans-serif (e.g. Inter or Atkinson Hyperlegible for accessibility). Type scale 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48. Body 16–18 px. Hierarchy through weight and colour (Schoger) |
| **Spacing** | 4 px base scale (4, 8, 12, 16, 24, 32, 48, 64, 96). Start with too much whitespace, then reduce (Schoger) |
| **Depth** | 3 shadow levels instead of borders; cards lift slightly on hover/focus |
| **Shape** | 12–16 px radius on cards, full-round on chips and buttons |
| **Icons** | Replace emoji with one consistent line-icon set (e.g. Lucide, MIT licence), always with text labels or `aria-label` |
| **Illustration** | People: an open-licence library such as Open Peeps by Pablo Stanley (CC0; check the licence for anything else used) for chapter intros and empty states. Cars: commission or draw a consistent set of body-style illustrations in a 3/4 view with a light 3D feel (Kuznetsov), same angle and lighting, coloured from the brand palette |
| **Motion** | 150–250 ms ease-out for UI feedback; 400–600 ms for the shortlist reveal and re-sorting. Everything honours `prefers-reduced-motion` |
| **Personality** | A confident, recognisable brand (van Schneider) that stays calm and reassuring where money is involved (Alli), with small delights: the Irish plate badge, a friendly illustrated "no results" state, a celebratory but subtle moment when the NI checklist is complete (Stanley) |

---

## 6. Content and UX writing

*Teleanu, Zhuo, Norman.*

- **Voice:** a knowledgeable friend, not a salesperson. Short sentences, second person, no jargon without an explanation.
- **Numbers:** always "about €19,400", never false precision. Show the time period on every cost ("/ year", "/ month").
- **Every result answers three questions:** *Why this car? What's the catch? What do I do next?*
- **Jargon:** the first use on each screen is a tappable term with a one-line explanation (bottom sheet on mobile). The glossary page stays for browsing.
- **Errors and empty states** say what happened and how to fix it ("No automatics under €8,000. Try €10,000 or consider manual").
- **Honesty labels:** estimates are always marked "about" or "estimate". Official, checked figures show a small "Checked with Revenue, Nov 2026" tag (builds trust).
- **Write a 1-page content style guide** and check every screen against it.

### 6a. Mindful design: lowering stress (Elizabeth Alli)

- **No pressure tactics:** no timers, "deal ends soon", stock counts, or "people are looking at this car".
- **A clear end:** after the shortlist, the app says you're done and lists 3 next steps. No endless feed of more cars.
- **Pause and resume:** answers save automatically. A visible "Save and come back later" makes it clear there's no rush.
- **Encourage a second opinion:** "Share with someone you trust" sits next to every shortlist, and the car page suggests a test drive and an independent inspection before deciding.
- **Reassuring tone around money:** costs are framed with what they include and what to check, never with alarming red warnings unless something really is a problem (e.g. no proof of NI import).
- **No notifications or re-engagement emails:** there are no accounts, so there's nothing to nag with.

---

## 7. Accessibility and inclusion

*Stanley, Norman, Wroblewski, Teleanu.*

- Target **WCAG 2.2 AA**: contrast ≥ 4.5:1, visible focus states, full keyboard use, correct headings and landmarks, form labels, `aria-live` for the "cars fit" counter.
- **Tap targets ≥ 48 × 48 px**. Body text ≥ 16 px, and the layout works at 200% zoom.
- **Never colour alone:** savings verdicts use icons and words.
- Emoji removed from meaningful UI (screen readers read them out).
- **Older users and low digital confidence:** larger text option, no time limits, every action reversible (undo).
- **Plain English at reading age ~9–11.** An Irish-language version is planned for later (open question in PLAN.md).
- **Reduced motion and dark mode** respected automatically.

---

## 8. What success looks like (measured before and after)

*Zhuo: define the outcome. Spool: measure experience.*

| Metric | Today (baseline from §3) | Target |
|---|---|---|
| Task success: "find a car that suits you" | measure | ≥ 90% |
| Can explain why the top car was picked | measure | ≥ 80% |
| NI task: correctly says whether it saves money + 2 required documents | measure | ≥ 80% |
| Quiz completion rate | measure | ≥ 80% |
| Median time to shortlist (full quiz) | measure | ≤ 4 min (quick mode ≤ 90 s) |
| Confidence score "I know what to do next" (1–5) | measure | ≥ 4.2 |
| System Usability Scale (SUS) | measure | ≥ 80 |
| Accessibility: automated checks (axe) + manual keyboard and screen-reader pass | — | 0 serious issues |

No accounts and no tracking cookies. If live metrics are wanted, use a cookie-free, privacy-friendly analytics tool that only counts anonymous events (quiz started / finished, compare used). That's a decision for the team (see §11).

---

## 9. Roadmap

| Phase | Weeks | What | Output |
|---|---|---|---|
| **A. Research & audit** | 1 | Usability test the current app (§3); accessibility audit | Findings report, baseline metrics |
| **B. Design system & wireframes** | 2–3 | Tokens, components, icon set, illustration direction, light and dark themes; low-fi wireframes of all new screens (mobile first); content style guide. Use AI design tools to explore layout and copy variations quickly (Teleanu), with the team choosing and refining | Design system in code (Tailwind tokens + components), clickable wireframe prototype |
| **C. Test wireframes** | 3 | 5-user test of the prototype (esp. results hero + car page + NI waterfall) | Changes list |
| **D. Build: quiz** | 4–5 | Chapters, ~20 questions, live "cars fit" counter, sticky bar, constraints, smart defaults, bottom-sheet explanations | New quiz in production |
| **E. Build: results, car page, compare** | 5–7 | Hero + compact cards, filters with animated re-sort, "Why isn't my car here?", car page with cost bar + NI waterfall + timeline, compare view, About-you panel | New results experience |
| **F. Polish** | 8 | Illustrations, shortlist reveal, motion, dark mode, printable NI checklist, home page | Finished visual layer |
| **G. Validate** | 9 | Repeat the §3 tests with new users; accessibility re-audit; compare against §8 | Before/after report; fix list |

Each phase ends with a design critique (Zhuo) and keeps the existing engine and test suite unchanged unless research shows a logic problem.

---

## 10. What we will *not* do

- **Style over substance** (Norman, Spool): motion and 3D only where they explain something or reward progress. Never slow down a task.
- **Add accounts, sign-ups or email gates** (Spool's "$300 million button" lesson).
- **Use dark patterns:** no fake urgency, no pre-ticked boxes, no hidden "sponsored" cars.
- **Use stock photos of smiling people with car keys.**
- **Copy another app's look.** The visual language is our own.

---

## 11. Open questions

1. Do we have budget for custom car illustrations, or start with a consistent set from an open-licence library and replace them later?
2. Live usage metrics (cookie-free, anonymous) or rely only on usability tests?
3. Font choice: Inter (neutral, familiar) or Atkinson Hyperlegible (designed for low-vision readability)?
4. Should the car page be shareable on its own (e.g. send "this car + NI breakdown" to a partner)?
5. Who will recruit test participants in Ireland, and can we offer a small thank-you (e.g. a €20 voucher)?
