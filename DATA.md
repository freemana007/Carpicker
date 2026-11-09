# Checking and updating the data

## What's been checked so far

**Checked on 8 November 2026** against the official websites (links are in `sources` in `src/config/ireland-costs.json`):

| Item | Source | Result |
|---|---|---|
| VRT rate bands | revenue.ie: Applying the tax | Corrected: top band is **41%** (was 37%). Each band has its own minimum (e.g. 7% or €140); there is no flat €200 minimum. |
| NOx levy | revenue.ie: NOx charge | Tiers confirmed (€5 / €15 / €25 per mg). Corrected: **no cap**. €600 / €4,850 are flat charges when you **can't prove** the NOx figure. |
| NEDC → WLTP conversion | revenue.ie | Added Revenue's formula (also used, reversed, for motor tax on 2008–2020 cars). |
| EV VRT relief | revenue.ie: Electric vehicles | Up to €5,000; full relief up to €40,000 OMSP, reduced up to €50,000; **ends 31 Dec 2026**. The exact reduction between €40k and €50k isn't stated, so it's a straight-line estimate. |
| VAT on new cars from NI | revenue.ie | Confirmed: 6 months old or less, **or** 6,000 km or less, counts as new. |
| Cars from NI: proof of import | revenue.ie: Registering vehicles from NI | **New requirement added:** NI Import Declaration, or the original V5C (last keeper NI resident) + NI service history + NI MOT history. No proof = can't register. |
| 7-day NCTS booking / 30-day registration, documents to bring, V5C export section, CoC for NOx, plates | revenue.ie | Confirmed and added to the steps. |
| Motor tax bands (WLTP and NEDC) | motortax.ie: Motor Tax Rates | Corrected: several bands were wrong (e.g. WLTP 161–170 g/km is €420, 171–190 is €600). |

**Not yet checked** (the sites block automated access, so check by hand): NCT fee (ncts.ie), SEAI grants (seai.ie). Everything else in the config (exchange rate, fuel prices, loan APR, NI price factor, depreciation, servicing) and **all car data** are still estimates.

## Car list: `src/data/cars.ts` + `src/data/cars-more.ts`

**193 cars from 30 brands** (52 original + 141 added on 9 November 2026), plus 9 "coming soon" cars in `src/data/upcoming.ts`.

- **Irish prices checked** on the brand's own Irish website (9 November 2026) for Toyota, Kia, Nissan, Renault, Dacia, Volkswagen, Skoda, Mercedes-Benz and the Mazda 6e (field `priceChecked`). The car page says whether a price was checked or is our estimate. EV prices on brand sites usually already include the SEAI grant and VRT relief.
- **Estimated** (not checked): prices for Hyundai, MG, Ford, BMW, MINI, Suzuki, Honda, Land Rover, Lexus, Volvo, Polestar and the brands whose sites aren't on the network allow-list (Audi, BYD, Cupra, SEAT, Opel, Peugeot, Citroën, Fiat, Jeep, Subaru). All specs (CO₂, NOx, boot, power, range, insurance group) are estimates.
- **Euro NCAP**: stars are only given where we're confident of the result; otherwise the car shows "not yet tested" (`ncapStars: null`), which scores as neutral.
- Commercial vans and pickups (Hilux, Proace, Trafic, Ranger) are left out: they're taxed differently.
- **Photos**: 188 of 193 cars have a checked, freely licensed photo. 5 show the illustration because no suitable free photo was found (MG3, Ford Capri, new Nissan Micra, VW ID.7 Tourer, Mercedes GLC Electric); they're marked `skip` in `scripts/car-photo-sources.json`. Every photo was looked at by eye; one automatic pick (for "MG3") was a machine gun, so always review new photos.
- **Coming soon**: VW ID. Cross and ID. Tiguan, and the new Mercedes GLA and AMG GT SUV are confirmed on the brands' Irish sites. Renault Twingo E-Tech, Cupra Raval, Hyundai Ioniq 3, BMW iX3 (new) and Volvo EX60 are in production in Europe (per Wikipedia) but not confirmed for Ireland. Move a car into the main list once it has an Irish price.

## 0% finance offers: `src/data/financeOffers.ts`

Checked on 9 November 2026 from each brand's own Irish website: **Volkswagen** (0% HP on Golf, ID.4, ID.7, Passat, T-Cross, T-Roc, Tiguan, Tayron; 0% PCP on most; orders until 20 November 2026), **Skoda** (0% PCP over 36 months on Kamiq, Kodiaq, Octavia, Scala; registered by 28 February 2027) and **Nissan** (0% HP over 60 months on the new Micra). MG's page still advertised 0% but its terms say it ended on 18 September 2026, so it's left out.

- **Check monthly**, and at the start of each registration period (January and July). Offers end on their `validUntil` date automatically, but new ones must be added by hand.
- Only add an offer you can see on the brand's own Irish site, and record the models, rate, term, deposit, dates and source link.

## Car photos: `src/data/carPhotos.json`, `public/cars/`

All 52 cars have a freely licensed photo from Wikimedia Commons (CC BY / CC BY-SA), imported with `npm run fetch-photos` and checked by eye for the right model and generation. Credits show on each car page and on `/credits`. To change a photo, set `"file"` for that car in `scripts/car-photo-sources.json` and run `npm run fetch-photos <car-id>`.

## Car website links: `src/data/carLinks.ts`

Check with `npm run check-links` every few months. Results of the last check are in the comment at the top of that file.

## Tax rates and fees: `src/config/ireland-costs.json`

| What | Where to check | How often |
|---|---|---|
| VRT rate bands (by WLTP CO₂) | Revenue: revenue.ie, VRT section | After every Budget |
| NOx levy tiers and caps | Revenue | After every Budget |
| VRT minimum, EV VRT relief (amount, price cap, whether it still applies to used imports) | Revenue | After every Budget |
| Motor tax bands (WLTP 2021+, NEDC 2008–2020) | motortax.ie / gov.ie | After every Budget |
| VAT on new cars from NI ("new means of transport": under 6 months or 6,000 km) | Revenue | Yearly |
| Customs/VAT on cars brought from Great Britain into NI after 1 Jan 2021 | Revenue | Yearly |
| VRT deadlines: book with NCTS within 7 days, pay within 30 days | Revenue / NCTS | Yearly |
| NCT fee | ncts.ie | Yearly |
| Exchange rate (€ per £) | Any bank | Monthly |
| Petrol, diesel, electricity prices | AA Ireland fuel survey / energy suppliers | Monthly |
| Loan APR | Credit union / bank average | Every 6 months |
| NI price factor (NI price as a share of the Republic price) | Compare listings for 10–20 popular models on both sides of the border | Every 3 months |
| Depreciation curves | Compare used prices by age for popular models | Every 6 months |

## Cars: `src/data/cars.ts`

For each car, check:

- **Irish list price** from the manufacturer's Irish website or price list.
- **WLTP CO₂ (g/km), NOx (mg/km), fuel use (L/100 km) or electricity use (kWh/100 km), and EV range**, from the manufacturer's WLTP data or the SEAI vehicle data.
- **Euro NCAP stars and test year** from euroncap.com.
- **Boot size, seats, length, towing limit, AWD availability, gearbox options** from the Irish brochure.
- **Insurance group:** UK groups are a guide only. Consider replacing them with a simple Low/Medium/High banding agreed with an insurance broker.
- **Reliability score** from published surveys (What Car? Reliability Survey, Which?).
- **Review score, pros and cons:** read at least 3 trusted reviews (Irish + UK sources in `src/lib/content.ts`), then write the pros and cons **in our own words**. Never copy text.
- **Recommended trims** (not in v1): add once prices and equipment are checked.

The plan aims for 100–150 models. The first version has about 50 records covering every body type, engine type and price level.

## Northern Ireland guide text: `src/lib/content.ts`

Check `NI_STEPS` and `NI_WARNINGS` against Revenue, NCTS and DVLA guidance once a year and after any rule change. Each step with a link should point to the most specific official page available.

## Review links

The app links to search results on each trusted site, not to specific articles, because we can't keep hundreds of deep links up to date by hand. To link to exact reviews later, add a `reviews` array to each car with checked URLs and the date checked.
