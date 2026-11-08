# Checking and updating the data

The first version uses **draft data** entered from general knowledge. Nothing has been checked against the official sources yet. Before launch, someone needs to go through the list below. After that, repeat the "every month" and "after every Budget" checks.

When a section is checked, update `checkedAt` in `src/config/ireland-costs.json`. When everything is checked, set `"verified": true` to remove the "early version" warning in the app.

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
