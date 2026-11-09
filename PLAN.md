# CarPicker Ireland: Plan

**Goal:** Help someone in Ireland who knows nothing about cars find a car that fits their life, budget, and dreams. They answer simple, everyday questions. The app turns those answers into a short list of cars, with plain-English reasons for each one.

It covers cars bought in the **Republic of Ireland** and also cars bought in **Northern Ireland**. For any Northern Ireland car, the app shows the **total cost of getting it on the road in the Republic** (VRT, checks, travel and so on) and the **steps the buyer has to take**.

**Key decisions (agreed):**

| Decision | Choice |
|---|---|
| Market | Ireland: buyers living in the Republic, with cars from the Republic **and** Northern Ireland |
| Business model | **Free tool** to start. No ads, no paid placements, no affiliate links in the first version |
| Accounts | **None.** No sign-up, no login, no personal data stored on a server |
| Quiz style | **Fixed quiz, no AI.** Same questions, same rules, same results for the same answers. All text is written by our team |

---

## Status

**Phase 1 (MVP) is built.** See `README.md` for how to run it.
- Built: the full quiz (sections A–G, skip rules, quick mode), the rule-based engine, results cards, the Northern Ireland calculator, checklist and guide page, the "What the experts say" panel, the glossary, the beginner checklist, saving in the browser and share links. 52 unit tests and a browser smoke test.
- Tax rates and the Northern Ireland steps were checked against revenue.ie and motortax.ie on 8 November 2026 (see `DATA.md`).
- November 2026: the car list grew to **193 cars from 30 brands**, plus a "Coming soon" page. Irish prices are checked for 9 brands; the rest, and all specs, are estimates (see `DATA.md`).
- Not done yet: checking the estimated car data, the NCT fee, SEAI grants and other cost assumptions. They must be checked using `DATA.md` before launch. Phase 0 user testing with 3–5 people in Ireland has not happened yet.

---

## 1. Product principles

1. **No car jargon in the questions.** Ask about the person's life, not about specs. Don't ask "4x4 or front-wheel drive?". Ask "Do you drive on icy back roads or farm lanes?"
2. **Explain everything.** Every recommendation says *why* in one or two plain sentences ("Fits 5 with a buggy in the boot, cheap to tax, and has a strong reliability record").
3. **Dreams count, but so does reality.** Let people say what excites them, then balance it against budget and practical needs. Show "dream" picks next to "smart" picks.
4. **Short and friendly.** About 3–5 minutes, one question per screen, with a progress bar. Users can skip questions or say "I don't know".
5. **The full Irish cost, not just the price.** Show the estimated yearly and monthly cost: repayments + fuel or charging + **motor tax** + insurance level + NCT and servicing. For Northern Ireland cars, also include **VRT and all import costs**.
6. **Trust experts, and show where it came from.** Back every pick with reviews from well-known, trusted sources. Always name the source and link to the full review.
7. **Honest about Northern Ireland.** Only show a Northern Ireland car as a good deal if it is still cheaper *after* every extra cost. Always show the steps and the risks.
8. **Predictable and private.** A fixed set of rules, no AI, no accounts. Answers stay on the user's own device.

---

## 2. The questionnaire

Questions are grouped into 7 short sections. Each has picture-style answer cards. The **"Why we ask"** text is shown as a small hint. The **"Maps to"** column is internal: it shows how the answer affects scoring.

There is **no free-text input**. Every answer is a fixed choice, slider or ranking, so the rules always behave the same way.

### Section A: Budget (the reality check)

| # | Question (as the user sees it) | Answer style | Why we ask / Maps to |
|---|---|---|---|
| A1 | How would you like to pay? | Cash / savings · Credit union or bank loan · Dealer finance (PCP or hire purchase) · Not sure, explain these | Changes the budget input from total price to monthly payment. "Explain" opens a short guide to loans, PCP and hire purchase, including the PCP "balloon payment" at the end. |
| A2 | What's the most you'd be comfortable spending? | Slider in €, total **or** per month (based on A1), plus "I have no idea" | Hard price filter. "No idea" → ask A3 and suggest a range. |
| A3 | *(if no idea)* Roughly what's your take-home pay per month? | Range buckets in €, optional | Suggests a budget using the "car costs ≤ 10–15% of take-home pay" rule of thumb. Stays on the device. |
| A4 | New, used, or either? | New · Used · Either, show me the best value | Filters by age. Explain that a 2–4-year-old used car is often the best value, and what "151" or "221" on a reg plate means. |
| A5 | Would you consider buying a car in **Northern Ireland**? | Yes, show me · Only if it saves a lot · No, Republic only · What does that involve? | Turns on Northern Ireland options (§5). "What does that involve?" shows a 4-line explainer: often cheaper, but you pay VRT, need paperwork, and must travel to collect it. |
| A6 | Do you have a car to trade in? | Yes / No | Adds a note: "Your trade-in may lower the price. Trade-ins usually only work with dealers in the Republic." |

### Section B: About you as a driver

| # | Question | Answer style | Maps to |
|---|---|---|---|
| B1 | What licence do you have? | Learner permit · Full licence, under 2 years · Full licence, 2+ years | Insurance warning level. New and learner drivers see a strong note: get insurance quotes **before** choosing; small engines and low insurance groups are favoured. |
| B2 | Is your licence for automatic cars only? | Yes (code 78) · No · Not sure | "Yes" makes automatic a hard filter. "Not sure" explains: if you passed your test in an automatic, you can only drive automatics. |
| B3 | What's your age group? *(optional)* | Under 25 · 25–34 · 35–64 · 65+ | Insurance warning only (under 25 pays a lot more in Ireland). Never used to filter cars. |

### Section C: Your everyday life (practical needs)

| # | Question | Answer style | Maps to |
|---|---|---|---|
| C1 | Who usually travels with you? | Just me · Me + 1 · Small family (3–4) · Big family / lifts for others (5–7) | Seat count → body type (hatchback, saloon, estate, crossover/SUV, people carrier, 7-seater) |
| C2 | Any little ones in car seats? | None · 1 · 2 · 3+ | Rear door size, ISOFIX points, 7-seat needs |
| C3 | What do you carry most often? | Shopping only · Buggy / sports gear · Dogs · DIY, furniture, tools · Towing a trailer, horsebox or caravan | Boot size, estate vs. hatch, towing limit |
| C4 | What does a normal week of driving look like? | Short town trips · Mixed · Lots of motorway / long commute · Rural roads and long distances | Fuel efficiency weight, electric/hybrid/diesel suitability, motorway comfort |
| C5 | Roughly how far do you drive in a day? | Under 30 km · 30–80 km · 80–150 km · 150 km+ | EV range check; petrol vs. diesel vs. hybrid advice |
| C6 | Where do you park at night? | Own driveway · On the street · Apartment car park · Tight city spaces | Can they charge an EV at home? Small-car preference |
| C7 | What are the roads like where you live? | Town / city · Country roads · Hills and mountain roads · Farm lanes, gravel, fields | 4x4 need, ground clearance |
| C8 | Which county do you live in? | Dropdown of the 26 counties | Distance to Northern Ireland (travel cost and time for §5); charging point density note |

### Section D: Running costs & peace of mind

| # | Question | Answer style | Maps to |
|---|---|---|---|
| D1 | How important is keeping fuel costs low? | Very · Somewhat · Not really | Weight on fuel use (L/100 km) and electricity use (kWh/100 km) |
| D2 | What kind of engine are you open to? | Electric · Hybrid · Petrol · Diesel · No idea, explain them | Powertrain filter. "Explain" shows a short, honest guide, including that diesel suits long distances and electric suits people who can charge at home. |
| D3 | How do you feel about repairs and maintenance? | I want it to "just work" · I'm OK with some upkeep · I can fix things myself | Weight on reliability and running costs |
| D4 | How long do you plan to keep it? | 1–3 years · 4–7 years · Until it dies | Weight on resale value vs. long-term reliability |
| D5 | Which safety features matter to you? | Multi-select: automatic emergency braking · blind-spot warning · adaptive cruise control · reversing camera · "Just make it safe" | Euro NCAP rating and feature filters |

### Section E: Dreams & personality (the fun part)

| # | Question | Answer style | Maps to |
|---|---|---|---|
| E1 | Pick the words that describe your dream car. (Choose up to 3) | Cards: Sporty · Rugged/outdoorsy · Luxurious · Practical · Eco-friendly · Cute/quirky · Classic · Techy/futuristic · Sleek/stylish | Style tags on each car |
| E2 | Tap the cars that catch your eye. | Tap 8–12 photos of different body styles (no brand names shown) | Learns body-style and look preferences without jargon |
| E3 | How should driving *feel*? | Calm & comfy · Zippy & fun · Powerful · Easy, I just want to get there | Ride comfort vs. performance weight |
| E4 | What do you want inside? | Multi-select: Apple CarPlay/Android Auto · big touchscreen · heated seats · sunroof · good stereo · "Keep it simple" | Feature filters and trim suggestion |
| E5 | Any brands you love or want to avoid? | Brand chips: tap once to favour, twice to avoid | Brand include/exclude |
| E6 | **Dream question:** If money were no object, which would you pick? | Picture cards: Sports car · Big 4x4 · Luxury saloon · Electric supercar-style · Classic car · Camper van · Something quirky | Shown as a separate "Dream pick" card: "the closest thing in your budget" |

### Section F: Must-haves & deal-breakers

| # | Question | Answer style | Maps to |
|---|---|---|---|
| F1 | Anything you absolutely need? | Multi-select: automatic gearbox · 7 seats · room for a tall driver · easy to get in and out (mobility) · towing · manual gearbox | Hard filters |
| F2 | Anything that's a deal-breaker? | Multi-select: too big to park · high motor tax · uses a lot of fuel · expensive insurance · looks boring · hard to see out of | Hard filters or heavy penalties |

### Section G: Priorities wrap-up

| # | Question | Answer style | Maps to |
|---|---|---|---|
| G1 | Rank what matters most (drag to order) | Price · Reliability · Safety · Fuel & tax costs · Space · Fun/Style · Comfort · Tech | Final scoring weights |

**Adaptive logic (skip what doesn't apply):**
- C2 is skipped if C1 = "Just me".
- B2 is skipped if B1 = "Learner permit".
- C5 and C6 are shown in detail only if D2 includes Electric or Hybrid.
- A3 is shown only if A2 = "I have no idea".
- C8 is always asked if A5 = Yes or "Only if it saves a lot" (needed for travel costs).
- **Quick mode** (A1, A2, A5, B2, C1, C4, D2, E1, G1) gives results in under 90 seconds; users can refine later.

---

## 3. Recommendation engine (fixed rules, no AI)

The engine is a set of plain TypeScript functions running in the browser. The same answers always give the same results, and every rule is covered by tests.

**Step 1: Hard filters.** Remove cars that break the budget (cars up to ~10% over are shown separately as a "stretch"), the seating/towing/gearbox must-haves, the engine type choice, the automatic-only licence, or a deal-breaker.

For Northern Ireland cars, the budget check uses the **total landed cost in the Republic** (§5), never the sticker price.

**Step 2: Weighted scoring (0–100).** Each remaining car is scored on these factors:

| Factor | Data source (car) | Weight driven by |
|---|---|---|
| Affordability | Price (or NI landed cost), est. monthly total cost | A2, G1 |
| Running costs | Fuel/electricity use, **motor tax band**, servicing | D1, C4, C5, G1 |
| Insurance-friendliness | Engine size/power, insurance group | B1, B3, F2 |
| Reliability | Reliability surveys, known issues | D3, D4, G1 |
| Safety | Euro NCAP rating, driver-aid features | D5, C2, G1 |
| Space & practicality | Seats, boot size (litres), door size | C1–C3, G1 |
| Capability | 4x4, ground clearance, towing limit | C7, C3 |
| Style & fun | Style tags, performance, E2 photo picks | E1–E3, G1 |
| Comfort & tech | Ride quality, feature list | E3, E4, G1 |
| Expert & owner opinion | Trusted review scores (§6) | D3, D5, G1 |

`score = Σ (factor_score × user_weight)`, then normalized.

**Step 3: Build a varied shortlist.** Return **3–5 cars** that are not near-duplicates:
- 🏆 **Best overall match**
- 💰 **Best value** (lowest total yearly cost among strong matches)
- ✨ **Dream-ish pick** (highest style/fun score within budget + 10%)
- 🔁 *(optional)* **Wildcard**: a body type they didn't pick that suits them anyway (e.g. "Have you considered an estate?")
- 🚗 *(if A5 allows)* **Northern Ireland deal**: shown only when the same or a similar car is cheaper in Northern Ireland **after** all costs (see §5). If A5 = "Only if it saves a lot", the saving must be at least €1,500 (a setting we can change).

**Step 4: Explain.** Each card gets a "Why this car" built from **pre-written sentence templates** for the top 3 factors, plus one honest "Heads-up" (e.g. "Smaller boot than others on your list" or "Insurance can be high for new drivers"). Our team writes and reviews every template.

---

## 4. Results & learning screens

- **Match cards:** photo, name, price range in €, est. monthly cost, motor tax per year, match %, 3 "why" bullets, 1 heads-up, and the recommended trim level.
- **Compare view:** 2–3 cars side by side in plain language ("Fits 5 · Big boot · ~€140/month fuel · €190 motor tax").
- **"What does this mean?" glossary:** tap any term (VRT, NCT, motor tax, CO₂ band, PCP, hybrid, 4x4, trim, ISOFIX, "clocked") for a one-line explanation.
- **Tweak & re-run:** sliders on the results page (budget, priorities, "include Northern Ireland") update the list live.
- **Next-steps checklist for beginners (Republic):** test drive tips, questions to ask the seller, getting a credit union loan quote, getting **insurance quotes before buying**, running a history check (Cartell.ie or Motorcheck.ie) for crash damage, outstanding finance and wound-back mileage, checking the NCT cert and service history, and getting an independent mechanic's inspection.
- **Save / share without an account:** answers are saved in the browser so users can come back later. "Share" creates a link with the answers built into the URL. No server stores anything.

---

## 5. Buying from Northern Ireland

Cars in Northern Ireland are often cheaper, especially used cars. But buyers living in the Republic must register the car here and pay **VRT (Vehicle Registration Tax)**, which can wipe out the saving. The app does the maths and shows the steps.

> ⚠️ All rates, fees and rules below must be checked against Revenue, NCTS, SEAI and gov.ie before launch, and again **after every Budget** (usually October). They are stored in one config file (`config/ireland-costs.json`) with the date checked and a source link for each value. The app shows a "Rates last checked: <date>" label.

### 5.1 Total cost for a buyer in the Republic

For every Northern Ireland car shown, the app shows a **"Total cost to get this car on the road in the Republic"** breakdown next to the price of a similar car bought in the Republic.

| Cost line | How we work it out | Notes |
|---|---|---|
| **Car price** | Price in £ × exchange rate | Rate stored in config and updated regularly; shown as "about". |
| **Currency fees** | ~0.5–3% of price depending on payment method | Explain cheaper ways to pay in sterling. |
| **Travel to collect it** | Distance from the user's county (C8) to a central NI point × cost per km + a fixed amount for time/train fare | Rough estimate. Border counties pay less. |
| **History checks** | Fixed fee: a UK check (outstanding finance, write-off, stolen) + an Irish check | Strongly recommended for every import. |
| **VRT** | Estimated: Revenue's **Open Market Selling Price (OMSP)** × the VRT rate for the car's **CO₂ band** (7%–41%, with a minimum per band), plus the **NOx levy** | We estimate OMSP from the car's typical used price in the Republic. Always shown as an estimate with a link to **Revenue's official VRT calculator** for the exact figure. EV relief applied where it exists. |
| **VAT** | Only for **new** cars (under 6 months old **or** under 6,000 km): 23% VAT is paid in the Republic | Usually €0 for used cars from Northern Ireland. |
| **Possible extra customs/VAT** | Flag only, not calculated | ⚠️ If the car was brought into Northern Ireland **from Great Britain after 1 January 2021**, customs duty and VAT may be due. We show a warning and tell the user to ask the seller and check with Revenue. |
| **Irish number plates** | Fixed estimate | Fitted after registration. |
| **NCT** | NCT fee, only if the car is 4 years old or more | Needed soon after registration. Budget for repairs if it fails. |
| **Motor tax (first year)** | From the car's CO₂ band | Same as any Irish car; shown separately as a running cost. |
| **Insurance** | Not calculated | Reminder: get a quote from an Irish insurer before buying, and tell them it's an import. |

**Summary shown to the user (example layout; figures are illustrative):**

```
2021 Toyota Corolla Hybrid, 60,000 km

Bought in Northern Ireland
  Price (£13,500 at about €1.17)      €15,795
  Currency fees                          €160
  Travel to collect (from Cork)          €150
  History checks (UK + Irish)             €50
  VRT (estimate*)                      €2,300
  Number plates                           €50
  NCT                                      €0  (under 4 years)
  ------------------------------------------
  Total on the road in the Republic   €18,505

Similar car in the Republic           €20,500
You could save about                   €1,995 ✅

* Check the exact VRT on Revenue's VRT calculator before you buy.
```

**Verdict badge:**
- ✅ **Worth a look**: saves more than the user's threshold (default €1,000; €1,500 if "Only if it saves a lot").
- 🟡 **Small saving**: saves less than the threshold. "Probably not worth the trip and paperwork."
- ❌ **Costs more**: shown only in the details view, never as a recommendation.

### 5.2 Steps to buy a car in Northern Ireland and register it in the Republic

Shown as a tick-off checklist on each Northern Ireland car (progress saved on the device only). Checked against revenue.ie on 8 November 2026. The full wording is in `src/lib/content.ts` (`NI_STEPS`).

**Before you buy**
1. **Check the real total cost** with our breakdown and Revenue's VRT calculator.
2. **Make sure you can prove the car was legally imported into NI.** You need the NI Import Declaration, or else the original V5C showing an NI-resident last keeper plus NI service history and NI MOT history. Without this, the car can't be registered.
3. **Check the seller has the V5C logbook.** Registration is refused without it.
4. **Get proof of NOx emissions** (a Certificate of Conformity). V5Cs issued after April 2019 don't show NOx. Without proof, Revenue charges a flat €4,850 (diesel) or €600 (other cars).
5. **Get an Irish insurance quote.**
6. **Run UK and Irish history checks.**
7. **Inspect and test drive.**

**When you buy**
8. **Get a dated invoice** with the VIN and both names and addresses.
9. **Send only the "permanent export" section of the V5C to the DVLA.** Keep the rest for NCTS.
10. **Pay safely** by traceable transfer.
11. **Keep proof of the day the car entered the State.**

**After you bring it into the Republic**
12. **Book an NCTS appointment within 7 days.**
13. **Bring the car and documents:** V5C, invoice, CoC, proof of entry date, PPSN proof, proof of name and address.
14. **Register and pay VRT within 30 days.** Late means extra VRT.
15. **Get Irish number plates** that meet the legal standard.
16. **Tax the car** online.
17. **Book an NCT** if the car is 4+ years old.
18. **Update your insurance.**

### 5.3 Other Northern Ireland warnings

- **SEAI grants for new EVs** apply only to cars bought new from an SEAI-registered dealer in the Republic. They are not available on Northern Ireland purchases.
- **Dealer finance and PCP** from Northern Ireland dealers usually aren't available to Republic residents. The Northern Ireland option works best with cash or a credit union/bank loan.
- **Warranty and consumer rights** may be harder to use across the border. Prefer reputable dealers.
- **Prices change with the exchange rate.** The saving is an estimate on the day.

---

## 6. Reviews from trusted websites

Beginners can't judge a car themselves, so they need to hear from people who can. Each recommended car gets a **"What the experts say"** panel.

### Which sources count as "trusted"

| Type | Sources | What they add |
|---|---|---|
| **Irish expert reviews** | The Irish Times (Motors), Irish Independent (Motoring), CompleteCar.ie, Carzone reviews, Irish Car of the Year awards | Irish prices, Irish specs, Irish roads |
| **UK expert reviews** (same right-hand-drive models) | What Car?, Autocar, Auto Express, Top Gear, Parkers | How it drives, comfort, interior, value |
| **Reliability** | What Car? Reliability Survey, Which? | Long-term reliability, owner satisfaction |
| **Official safety** | **Euro NCAP** (crash tests), NSAI recall notices (Republic), DVSA recalls (UK/NI cars) | Crash-test stars, recalls |
| **Real owner reviews** | What Car? and Parkers owner reviews, Honest John | Real-life problems and praise after months of ownership |

Rules for a source to be "trusted": an established publication or official body, clear testing methods, and named authors. No anonymous blogs, and no dealer or manufacturer marketing presented as reviews.

### What the user sees on each car card

- **Expert score summary:** each source's headline rating in its original form (e.g. "What Car? 4/5 · Euro NCAP 5★"), with a link.
- **"What reviewers agree on":** 2–3 plain-English pros and 1–2 cons that appear across several reviews (e.g. "Most reviewers praise the roomy back seat; several say it's noisy on the motorway"). **Written by our team**, with each point citing its sources.
- **Owners say:** average owner rating where available, with the most common praise and complaint.
- **Safety & recalls:** Euro NCAP rating and any recalls for that model year.
- **Glossary in context:** reviewer jargon ("body roll", "turbo lag") gets tap-to-explain.
- **Review date & model year shown:** reviews of an older version of the car are labelled or hidden.

### How reviews feed the recommendations

- The **"Expert & owner opinion"** factor in §3 is a normalized average of review scores. It gets more weight for users who chose "I want it to just work" (D3) or ranked safety highly (G1).
- The **"Heads-up"** in each explanation can come from a common reviewer complaint.
- Cars with very few reviews are flagged "limited reviews" rather than scored as average.

### How we get the reviews (free and legal)

Because this is a free tool, the first version uses **no paid review licences**.
1. **No scraping.** Copying review text breaks the sites' terms and copyright.
2. **Official/free data first:** Euro NCAP ratings and recall notices.
3. **Link-out approach:** show the source name, its headline rating (where allowed) and a link to the full review. Our team reads the reviews and writes the "what reviewers agree on" summary in our own words, with citations.
4. **Freshness:** check reviews for each car every 3 months, and when a new version of a model comes out. Store the source, URL, date, model year and rating.

### Data model addition

`Review { vehicleId, modelYears, source, sourceType (expert | owner | safety), rating, ratingScale, url, author, publishedAt, pros[], cons[], checkedAt }`

---

## 7. Data

| Need | Source (free / curated for the first version) |
|---|---|
| Car specs and trims sold in Ireland | Curated JSON of ~100–150 popular models sold in Ireland (SIMI best-seller lists are a good starting point), from manufacturer Irish brochures and price lists |
| Prices (Republic) | Curated new list prices (manufacturer Irish sites) and typical used price ranges by age, checked by hand against Irish listings |
| Prices (Northern Ireland) | Curated typical used price ranges in £ by age, checked by hand against Northern Ireland listings |
| VRT rates, NOx levy, motor tax bands | Revenue and gov.ie / motortax.ie, entered into `config/ireland-costs.json` |
| NCT fee and rules | NCTS |
| EV grants and reliefs | SEAI and Revenue |
| Fuel and electricity prices | Config values updated monthly (average Irish pump prices and a typical home electricity rate) |
| Fuel/energy use, CO₂, NOx | Manufacturer WLTP figures |
| Safety | Euro NCAP |
| Reliability | Curated scores from published surveys (§6) |
| Images | Manufacturer press images (allowed for editorial use) and our own body-style illustrations for E2 |

Each car record has: make, model, year range, body type, seats, boot (litres), gearbox options, engine type, fuel/energy use (L/100 km or kWh/100 km), EV range (km), **CO₂ (g/km) and motor tax band**, NOx, VRT band, price ranges (Republic in €, Northern Ireland in £), insurance group, reliability score, Euro NCAP rating, towing limit, ground clearance, features by trim, style tags, pros/cons text, review links.

---

## 8. Tech stack (proposed)

- **Frontend:** Next.js (React) + TypeScript + Tailwind CSS, built as a **static site**. Mobile-first and responsive; can become a PWA (installable app).
- **Recommendation engine:** pure TypeScript functions that run **in the browser**. No server needed, nothing sent anywhere.
- **Data:** versioned JSON files in the repo (cars, reviews, Irish costs config). Updating a price or tax rate is a simple change + redeploy.
- **State:** answers kept in the browser (localStorage) and in the share link URL. **No accounts, no database, no AI.**
- **Testing:** Vitest for scoring rules, the VRT/landed-cost calculator and personas; Playwright for the quiz flow.
- **Hosting:** a free static host (Vercel, Netlify or GitHub Pages), so running costs stay close to zero.
- **Privacy:** no personal data collected. Analytics (if any) are cookie-free and anonymous, so no cookie banner is needed.

---

## 9. Roadmap

**Phase 0: Foundations (week 1–2)**
- Finalize the question list and copy. Test with 3–5 non-car people in Ireland.
- Define the car data schema; curate the first 100+ cars sold in Ireland.
- Build `ireland-costs.json` (VRT bands, NOx levy, motor tax, NCT fee, fuel prices, exchange rate) with sources.
- Write the Northern Ireland steps checklist and check it against Revenue and NCTS guidance.
- Create test personas (§10).

**Phase 1: MVP (weeks 3–6)**
- Quiz flow (sections A–G, adaptive skips, Quick mode, progress bar).
- Rule-based filter + scoring engine with unit tests.
- Results page: 3–5 match cards with "why", "heads-up" and Irish running costs (motor tax, fuel).
- Northern Ireland option: landed-cost calculator, verdict badge and step-by-step checklist.
- "What the experts say" panel: Euro NCAP, recalls, links to trusted reviews, team-written pros and cons.
- Glossary and beginner next-steps checklist. Save in browser and share link.

**Phase 2: Better decisions (weeks 7–10)**
- Compare view and live tweak sliders.
- Full yearly cost calculator: loan/PCP repayments, fuel, motor tax, NCT, servicing.
- More cars (up to ~250) and older used models.
- Expanded review coverage, plus review scores added to the ranking.

**Phase 3: Later (to be decided)**
- Links to search live listings for a shortlisted model on Irish and Northern Ireland sites.
- Optional ways to keep the tool free (only if needed and only if they don't bias the results).

---

## 10. Test personas (for testing the logic)

| Persona | Key answers | Sensible result |
|---|---|---|
| **First job in Dublin:** €8,000 cash, used, on-street parking, wants "cute" and cheap | A2=€8k, A4=used, C6=street, E1=cute, B3=under 25 | Small used petrol or hybrid hatchback in a low insurance group; strong insurance warning |
| **New driver, automatic-only licence:** €12,000, learner just passed | B1=under 2 years, B2=code 78 | Automatics only; small engine; insurance warning |
| **Growing family in Cork:** €30,000, 2 car seats + dog | C1=family, C2=2, C3=dogs | Estate, crossover or 7-seater with big boot and ISOFIX |
| **Rural commuter in Mayo:** 120 km a day, country roads | C4=rural, C5=80–150 km, D1=very | Diesel or efficient hybrid; low motor tax; comfortable on long drives |
| **Border buyer in Donegal:** €20,000, open to Northern Ireland | A5=Yes, C8=Donegal | Shortlist includes a Northern Ireland car only where the total landed cost beats the Republic price; checklist shown |
| **EV commuter in Kildare:** own driveway, 60 km a day, "techy" | C6=driveway, D2=electric, E1=techy | Used or new EV with 300+ km range; note SEAI grant only on new cars bought in the Republic |
| **Dreamer:** dream card = sports car, budget €25,000 | E6=sports car, E3=zippy | Affordable sporty hatch as "closest dream"; practical pick as "best overall" |
| **Retiree in Galway:** mobility needs, wants comfort and simplicity | F1=easy entry, E3=comfy, E4=keep simple | Compact SUV with high seating position, automatic, top reliability |

The **Northern Ireland calculator** also gets its own tests: new car (VAT applies), car over 4 years (NCT added), car under 4 years, EV (VRT relief), and a car where VRT makes the Northern Ireland option more expensive (must not be recommended).

---

## 11. Success metrics

- Quiz completion rate ≥ 70%.
- ≥ 60% of users rate their top 3 as "this makes sense for me" (a simple anonymous thumbs up/down).
- Glossary/explainer use (shows the learning value).
- Share link use; click-through to "next steps" and to the Revenue VRT calculator.
- "Read full review" click-through rate.

---

## 12. Open questions

1. How often can someone on the team update prices, exchange rate and tax rates (monthly suggested, plus after every Budget)?
2. Should we include imports from Great Britain later? (They usually cost much more because of customs duty and VAT, so they are left out for now.)
3. Do we want an Irish-language (Gaeilge) version?
4. If the tool ever needs money to stay free, which options are acceptable without biasing results (e.g. donations, a clearly labelled sponsor)?
