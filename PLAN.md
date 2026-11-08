# CarPicker: Plan

**Goal:** Help someone who knows nothing about cars find a car that fits their life, budget, and dreams. They answer simple, everyday questions. The app turns those answers into a short list of cars, with plain-English reasons for each one.

---

## 1. Product principles

1. **No car jargon in the questions.** Ask about the person's life, not about specs. Don't ask "AWD or FWD?". Ask "Do you deal with snow or icy roads?"
2. **Explain everything.** Every recommendation says *why* in one or two plain sentences ("Fits 5 people plus a stroller, very cheap to run, and has a strong reliability record").
3. **Dreams count, but so does reality.** Let people say what excites them, then balance it against budget and practical needs. Show "dream" picks next to "smart" picks.
4. **Short and friendly.** About 3–5 minutes, one question per screen, with a progress bar. Users can skip questions or say "I don't know".
5. **The full cost, not just the price.** Show the estimated monthly cost (payment + fuel or charging + insurance band + upkeep), not only the sticker price.
6. **Trust experts, and show where it came from.** Back every pick with reviews from well-known, trusted sources. Always name the source and link to the full review, so users don't have to take our word for it.

---

## 2. The questionnaire

Questions are grouped into 6 short sections. Each has picture-style answer cards. The **"Why we ask"** column is shown as a small hint. The **"Maps to"** column is internal: it shows how the answer affects scoring.

### Section A: Budget (the reality check)

| # | Question (as the user sees it) | Answer style | Why we ask / Maps to |
|---|---|---|---|
| A1 | How would you like to pay? | Cash all at once · Monthly payments (loan) · Lease (rent long-term) · Not sure, help me | Changes the budget input from total price to monthly payment. "Not sure" opens a 3-line explainer. |
| A2 | What's the most you'd be comfortable spending? | Slider, total **or** per month (based on A1), plus "I have no idea" | Hard price filter. "No idea" → ask A3 and suggest a range. |
| A3 | *(if no idea)* Roughly what's your take-home pay per month? | Range buckets, optional | Suggests a budget using the "transport ≤ 10–15% of take-home pay" rule of thumb. Never stored beyond the session. |
| A4 | New, used, or either? | New · Used / pre-owned · Either, show me the best value | Filters by model year and condition. Explain that a 2–4-year-old used car is often the best value. |
| A5 | Do you have a car to trade in? | Yes / No | Adds a note: "Your trade-in may lower the price." Phase 2: value estimate. |

### Section B: Your everyday life (practical needs)

| # | Question | Answer style | Maps to |
|---|---|---|---|
| B1 | Who usually rides with you? | Just me · Me + 1 · Small family (3–4) · Big family / carpool (5–7+) | Seat count → body type (hatchback, sedan, SUV, minivan, 3-row SUV) |
| B2 | Any little ones in car seats? | None · 1 · 2 · 3+ | Rear door size, number of child-seat anchor points, 3-row needs |
| B3 | What do you carry most often? | Groceries only · Sports gear / strollers · Big dogs · DIY / furniture / tools · Towing a boat or trailer | Cargo volume, hatch vs. trunk, truck/SUV, towing capacity |
| B4 | What does a normal week of driving look like? | Mostly short city trips · Mixed · Lots of highway / long commute · Long road trips often | Fuel efficiency weight, EV/hybrid suitability, highway comfort |
| B5 | Roughly how far do you drive in a day? | < 20 mi · 20–50 · 50–100 · 100+ | EV range check, hybrid vs. gas recommendation |
| B6 | Where do you park at night? | Private garage/driveway · Street parking · Apartment lot · Tight city spaces | Home EV charging possible? Small-car preference |
| B7 | What's the weather/terrain like where you live? | Mild · Lots of rain · Snow & ice · Hills/mountains · Dirt roads / off-road | AWD/4WD need, ground clearance |
| B8 | Your zip/postcode *(optional)* | Text | Local pricing, fuel/electricity costs, EV incentives, availability |

### Section C: Running costs & peace of mind

| # | Question | Answer style | Maps to |
|---|---|---|---|
| C1 | How important is keeping fuel costs low? | Very · Somewhat · Not really | Weight on MPG / efficiency |
| C2 | Would you consider an electric or hybrid car? | Yes, electric! · Hybrid sounds good · Open, but explain it · No, gas only | Powertrain filter. "Explain" shows a short, honest EV/hybrid explainer. |
| C3 | How do you feel about repairs and maintenance? | I want it to "just work" · I'm OK with some upkeep · I can fix things myself | Weight on reliability ratings and maintenance cost |
| C4 | How long do you plan to keep it? | 1–3 years · 4–7 years · Until it dies | Weight on resale value vs. long-term reliability |
| C5 | Which safety features matter to you? | Multi-select: automatic emergency braking · blind-spot warning · adaptive cruise · 360° camera · "Just make it safe" | Safety ratings (IIHS/NHTSA/Euro NCAP) and feature filters |

### Section D: Dreams & personality (the fun part)

| # | Question | Answer style | Maps to |
|---|---|---|---|
| D1 | Pick the words that describe your dream car. (Choose up to 3) | Cards: Sporty · Rugged/adventurous · Luxurious · Practical · Eco-friendly · Cute/quirky · Classic · Techy/futuristic · Sleek/stylish | Style tags on each vehicle |
| D2 | Tap the cars that catch your eye. | Swipe/tap 8–12 photos of different body styles (no brand names shown) | Learns body-style and look preferences without jargon. Strong signal. |
| D3 | How should driving *feel*? | Calm & comfy · Zippy & fun · Powerful · Easy, I just want to get there | Ride comfort vs. performance weight |
| D4 | What tech do you want inside? | Multi-select: Apple CarPlay/Android Auto · big touchscreen · heated seats · sunroof · premium sound · "Keep it simple" | Feature filters and trim-level suggestion |
| D5 | Do you have a favorite color or a brand you love or hate? | Optional text/chips | Brand include/exclude; color shown in results |
| D6 | **Dream question:** If money were no object, what would you drive? | Free text / "No idea" | Shown as a separate "Dream pick" card, plus "the closest thing in your budget" |

### Section E: Must-haves & deal-breakers

| # | Question | Answer style | Maps to |
|---|---|---|---|
| E1 | Anything you absolutely need? | Multi-select: automatic transmission · seats 7 · fits a tall driver · easy to get in and out (mobility) · towing · manual transmission | Hard filters |
| E2 | Anything that's a deal-breaker? | Multi-select: too big to park · bad gas mileage · expensive insurance · looks boring · hard to see out of | Hard or heavy-penalty filters |

### Section F: Priorities wrap-up

| # | Question | Answer style | Maps to |
|---|---|---|---|
| F1 | Rank what matters most (drag to order) | Price · Reliability · Safety · Fuel cost · Space · Fun/Style · Comfort · Tech | Final scoring weights |

**Adaptive logic (skip what doesn't apply):**
- B2 is skipped if B1 = "Just me".
- B5 and B6 are shown in detail only if C2 is open to electric.
- A3 is shown only if A2 = "I have no idea".
- A "Quick mode" (A1, A2, B1, B4, B7, C2, D1, F1) gives results in under 90 seconds; users can refine later.

---

## 3. Recommendation engine

**Step 1: Hard filters.** Remove vehicles that break the budget (with ~10% stretch shown separately), the seating/towing/transmission must-haves, the powertrain choice, or a deal-breaker.

**Step 2: Weighted scoring (0–100).** Each remaining vehicle is scored on these factors:

| Factor | Data source (vehicle) | Weight driven by |
|---|---|---|
| Affordability | Price, est. monthly total cost | A2, F1 |
| Reliability | Reliability ratings, maintenance cost | C3, C4, F1 |
| Safety | Crash-test ratings, driver-aid features | C5, B2, F1 |
| Efficiency | MPG / MPGe / range | C1, B4, B5, F1 |
| Space & practicality | Seats, cargo volume, door size | B1–B3, F1 |
| Capability | AWD/4WD, clearance, towing | B7, B3 |
| Style & fun | Style tags, performance, D2 swipe results | D1–D3, F1 |
| Comfort & tech | Ride quality, feature list | D3, D4, F1 |
| Expert & owner opinion | Trusted review scores (see §5) | C3, C5, F1 |

`score = Σ (factor_score × user_weight)`, then normalized.

**Step 3: Build a varied shortlist.** Return **3–5 cars** that are not near-duplicates:
- 🏆 **Best overall match**
- 💰 **Best value** (lowest cost of ownership among strong matches)
- ✨ **Dream-ish pick** (highest style/fun score within budget + 10%)
- 🔁 *(optional)* **Wildcard**: a body type they didn't pick that suits them anyway (e.g. "Have you considered a wagon?")

**Step 4: Explain.** Build a plain-English "Why this car" from the top 3 contributing factors, plus one honest "Heads-up" (a downside such as "smaller trunk than others on your list"). Back these with what trusted reviewers say where possible (§5).

*Later:* an LLM layer (Claude API) could read free-text answers (D5, D6), write friendlier explanations, and answer follow-up questions in chat. Hard filtering and scoring stay rule-based so results are predictable.

---

## 4. Results & learning screens

- **Match cards:** photo, name, price range, est. monthly cost, match %, 3 "why" bullets, 1 heads-up, and the recommended trim ("Get the *SE* trim: it has the heated seats you wanted").
- **Compare view:** 2–3 cars side by side in plain language ("Fits 5 · Big trunk · ~$120/mo fuel").
- **"What does this mean?" glossary:** tap any term (AWD, hybrid, MPG, trim, CPO, depreciation) for a one-line explanation.
- **Tweak & re-run:** sliders on the results page (budget, priorities) update the list live.
- **Next-steps checklist for beginners:** how to test drive, questions to ask the dealer, getting pre-approved for a loan, checking a used car's history report, getting an independent inspection, insurance quotes.
- **Save / share:** save the shortlist, or share a link with a partner or friend who knows cars.

---

## 5. Reviews from trusted websites

Beginners can't judge a car themselves, so they need to hear from people who can. Each recommended car gets a **"What the experts say"** panel.

### Which sources count as "trusted"

| Type | Sources (US) | Sources (UK/EU, if we launch there) | What they add |
|---|---|---|---|
| **Expert road tests** | Car and Driver, MotorTrend, Edmunds, Kelley Blue Book (KBB) | What Car?, Autocar, Auto Express, Top Gear | How it drives, comfort, interior, value |
| **Independent testing & reliability** | Consumer Reports, J.D. Power | Which?, What Car? Reliability Survey | Reliability, owner satisfaction (CR takes no ads) |
| **Official safety** | NHTSA (crash tests and recalls), IIHS (Top Safety Pick) | Euro NCAP, DVSA recalls | Crash-test stars, recalls |
| **Real owner reviews** | Edmunds owner reviews, Cars.com, KBB consumer reviews | Parkers / What Car? owner reviews | Real-life problems and praise after months of ownership |

Rules for a source to be "trusted": an established publication or official body, clear testing methods, and named authors. No anonymous blogs, and no dealer or manufacturer marketing presented as reviews.

### What the user sees on each car card

- **Expert score summary:** each source's rating in its original form (e.g. "Car and Driver 9/10 · Edmunds 7.9/10 · IIHS Top Safety Pick+"), with logo and link.
- **"What reviewers agree on":** 2–3 plain-English pros and 1–2 cons that appear across several reviews (e.g. "Most reviewers praise the roomy back seat; several say it's loud on the highway"). Each point cites the sources behind it.
- **Short quotes:** one or two brief quotes with attribution and a "Read full review" link (fair-use length only, or as the licence allows).
- **Owners say:** the average owner rating, the number of reviews, and the most common praise and complaint.
- **Safety & recalls:** crash-test ratings and any open recalls for that model year, from official sources.
- **Glossary in context:** reviewer jargon ("torque steer", "body roll") gets tap-to-explain, like the rest of the app.
- **Review date & model year shown:** reviews older than the current generation are labelled or hidden.

### How reviews feed the recommendations

- Add an **"Expert & owner opinion"** factor to the scoring in §3. It is a normalized average of review scores, weighted toward reliability and safety sources for users who chose "I want it to just work" (C3) or ranked safety highly (F1).
- The **"Heads-up"** in each explanation can come from a common reviewer complaint, so the downside is backed by real reviews.
- Cars with very few reviews are flagged "limited reviews" rather than scored as average.

### How we get the reviews (legally)

We **do not scrape** review sites. Copying their text breaks their terms and copyright, and it hurts trust.
1. **Official/free data first:** NHTSA and IIHS ratings and recalls (public data, NHTSA has a free API), and fueleconomy.gov.
2. **Licensed data:** partner APIs or data licences (e.g. Edmunds, J.D. Power, KBB), or content and affiliate partnerships with publications.
3. **Link-out fallback:** without a licence, show only the source name, its headline rating where allowed, and a link to the review. Our own team writes the "what reviewers agree on" summary and cites the sources.
4. **AI summaries (Phase 2):** Claude summarizes only licensed or permitted review text into pros and cons. Every point keeps its citation, and summaries are spot-checked by a person.
5. **Freshness:** refresh reviews monthly. Store the source, URL, date, model year and rating for each one.

### Data model addition

`Review { vehicleId, modelYears, source, sourceType (expert | owner | safety), rating, ratingScale, url, author, publishedAt, pros[], cons[], quote?, licence }`

---

## 6. Data

| Need | Options |
|---|---|
| Vehicle specs, prices, trims | MVP: a curated JSON/DB of ~100–150 popular current models across all segments. Later: a licensed API (e.g. Edmunds, CarQuery, NHTSA vPIC for basics) |
| Safety ratings | NHTSA (free API), IIHS |
| Fuel economy | fueleconomy.gov (free data/API) |
| Reliability | Curated scores at first (licensing needed for third-party data) |
| Expert & owner reviews | See §5: official data, licensed partner APIs, or link-outs. No scraping |
| Used listings & local prices | Phase 3: listing-partner APIs |
| Images | Manufacturer press kits / licensed stock. Generic body-style illustrations for the D2 swipe quiz |

Each vehicle record has: make, model, year range, body type, seats, cargo, drivetrain options, powertrain, MPG/range, price range (new/used), reliability score, safety score, insurance band, towing, ground clearance, features by trim, style tags, pros/cons text.

---

## 7. Tech stack (proposed)

- **Frontend:** Next.js (React) + TypeScript + Tailwind CSS. Mobile-first and responsive; can become a PWA (installable app).
- **State:** Quiz answers kept in client state and localStorage, so results can be resumed without an account.
- **Backend:** Next.js API routes for the recommendation engine. Pure TypeScript functions, easy to unit test.
- **Database:** Start with a versioned JSON vehicle dataset in the repo. Move to Postgres (Supabase) when listings/accounts arrive.
- **Optional AI:** Claude API for free-text understanding and a "Ask about this car" chat.
- **Testing:** Vitest for scoring logic (persona-based tests), Playwright for the quiz flow.
- **Hosting:** Vercel.

---

## 8. Roadmap

**Phase 0: Foundations (week 1)**
- Finalize the question list and copy. Run a quick test with 3–5 non-car people.
- Define the vehicle data schema; curate the first 100+ vehicles.
- Create test personas (see §9).

**Phase 1: MVP (weeks 2–5)**
- Quiz flow (sections A–F, adaptive skips, Quick mode, progress bar).
- Rule-based filter + scoring engine with unit tests.
- Results page: 3–5 match cards with "why" and "heads-up".
- Glossary tooltips and beginner next-steps checklist.
- "What the experts say" panel: official safety ratings and recalls (NHTSA/IIHS), links to trusted reviews, and team-written pros and cons with sources.

**Phase 2: Better decisions (weeks 6–9)**
- Compare view and live tweak sliders.
- Total cost of ownership calculator (loan/lease, fuel, insurance band, maintenance).
- Zip-code based fuel/electricity costs and EV incentives.
- Save/share shortlist; optional account.
- Claude-powered explanations and free-text "dream car" interpretation.
- Licensed review data: expert scores, owner ratings, AI-summarized "what reviewers agree on" with citations. Review scores added to ranking.

**Phase 3: From pick to purchase**
- Local new/used listings for the shortlisted models.
- Trade-in estimate, loan pre-approval links.
- Used-car buying checklist and history-report integration.

---

## 9. Test personas (for testing the logic)

| Persona | Key answers | Sensible result |
|---|---|---|
| **First-job grad**: $15k, used, city, street parking, wants "cute" and cheap | A2=$15k, A4=used, B6=street, D1=cute | Used small hatchback with strong reliability (e.g. compact hybrid hatch) |
| **Growing family**: $40k, 2 car seats + dog, snow | B1=family, B2=2, B3=dogs, B7=snow | AWD 3-row SUV or minivan |
| **Eco commuter**: 60 mi/day, home garage, "techy" | B5=50–100, B6=garage, C2=electric | Mid-range EV with 250+ mi range |
| **Weekend adventurer**: towing a small boat, dirt roads | B3=towing, B7=dirt roads, D1=rugged | Midsize pickup or body-on-frame SUV |
| **Dreamer**: "If money were no object: a sports car," budget $30k | D6=sports car, D3=zippy | Affordable sports coupe/hot hatch as "closest dream"; practical pick as "best overall" |
| **Retiree**: mobility needs, wants comfort and simplicity | E1=easy entry, D3=comfy, D4=keep simple | Compact SUV with high seating position, top reliability |

---

## 10. Success metrics

- Quiz completion rate ≥ 70%.
- ≥ 60% of users rate their top 3 as "this makes sense for me".
- Glossary/explainer use (shows the learning value).
- Save/share rate; click-through to "next steps".
- "Read full review" click-through rate, and how many users say the reviews helped them trust the picks.

---

## 11. Open questions

1. Launch market: US only, or US + UK/EU? This affects units, data sources, and models sold.
2. Is the business model affiliate leads, a free tool, or premium advice? This affects data licensing.
3. Do we need accounts in the MVP, or is a share link enough?
4. How much should the app lean on AI chat vs. a structured quiz?
5. Which review partners should we approach first (e.g. Edmunds, Consumer Reports, J.D. Power), and do we have budget for review data licences?
