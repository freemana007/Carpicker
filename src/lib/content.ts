// Written content: glossary, Northern Ireland steps, review sources and links.
// All text is written by the CarPicker team. Official pages must be re-checked
// after every Budget.

export const LINKS = {
  revenue: { label: "Revenue: VRT", url: "https://www.revenue.ie/en/vrt/index.aspx" },
  vrtCalculator: { label: "Revenue's VRT calculator", url: "https://www.ros.ie/evrt-enquiry/vrtenquiry.html" },
  revenueNi: {
    label: "Revenue: registering a car bought in Northern Ireland",
    url: "https://www.revenue.ie/en/vrt/registration-of-imported-used-vehicles/registering-vehicles-from-ni.aspx",
  },
  revenueRegistration: {
    label: "Revenue: VRT and registration",
    url: "https://www.revenue.ie/en/vrt/vehicle-registration-tax/vrt-and-registration.aspx",
  },
  revenueNctsVisit: {
    label: "Revenue: what to bring to the NCTS centre",
    url: "https://www.revenue.ie/en/vrt/vehicle-registration-tax/procedure-at-ncts-centre.aspx",
  },
  revenueNox: {
    label: "Revenue: NOx charge",
    url: "https://www.revenue.ie/en/vrt/calculating-vrt/calculating-nox-charge.aspx",
  },
  revenueVatNew: {
    label: "Revenue: VAT on new cars from NI",
    url: "https://www.revenue.ie/en/vrt/registration-of-imported-used-vehicles/vat-implications-importing-vehicles-gb-ni.aspx",
  },
  revenuePlates: {
    label: "Revenue: number plate standards",
    url: "https://www.revenue.ie/en/vrt/vehicle-registration-tax/registration-plates-and-format-standards.aspx",
  },
  ncts: { label: "NCTS (VRT appointments and NCT)", url: "https://www.ncts.ie" },
  motorTax: { label: "motortax.ie", url: "https://www.motortax.ie" },
  seai: { label: "SEAI (electric car grants)", url: "https://www.seai.ie" },
  dvla: { label: "DVLA (UK logbook / V5C)", url: "https://www.gov.uk/government/organisations/driver-and-vehicle-licensing-agency" },
  euroNcap: { label: "Euro NCAP", url: "https://www.euroncap.com" },
  nsai: { label: "NSAI (recalls in Ireland)", url: "https://www.nsai.ie" },
  ukRecall: { label: "UK vehicle recall check", url: "https://www.gov.uk/check-vehicle-recall" },
  ccpc: { label: "CCPC: your consumer rights", url: "https://www.ccpc.ie" },
};

export const GLOSSARY: { term: string; meaning: string }[] = [
  { term: "VRT", meaning: "Vehicle Registration Tax. A one-off tax paid when a car is first registered in Ireland. It's based on the car's value and CO₂ emissions. Irish car prices already include it; cars from Northern Ireland don't." },
  { term: "OMSP", meaning: "Open Market Selling Price. Revenue's estimate of what the car would sell for in Ireland. VRT is a percentage of it." },
  { term: "NOx levy", meaning: "An extra part of VRT based on how much nitrogen oxide (NOx) a car produces. Highest for older diesels." },
  { term: "NCT", meaning: "National Car Test. A safety check for cars 4 years and older, every 2 years (every year after 10 years). Like the MOT in the UK." },
  { term: "NCTS", meaning: "National Car Testing Service. Runs the NCT and the VRT inspection appointments for imported cars." },
  { term: "Motor tax", meaning: "A yearly road tax. For newer cars it's based on CO₂ emissions, so cleaner cars pay less." },
  { term: "CO₂ band", meaning: "A group of cars with similar CO₂ emissions (in grams per km). The band sets your motor tax and VRT rate." },
  { term: "WLTP", meaning: "The official lab test for fuel use and emissions since 2018–2021. Its CO₂ figures are higher (more realistic) than the older NEDC test." },
  { term: "PCP", meaning: "Personal Contract Plan. Dealer finance with low monthly payments and a big 'balloon payment' at the end if you want to keep the car." },
  { term: "0% finance", meaning: "A deal where the car brand pays the interest, so you only pay back the price of the car. New cars only, usually with a big deposit. See our 0% finance page for current offers." },
  { term: "APR", meaning: "Annual Percentage Rate: the yearly cost of borrowing, including fees. Lower is cheaper. 0% APR means no interest at all." },
  { term: "Hire purchase", meaning: "Dealer finance where you pay monthly and own the car once the last payment is made." },
  { term: "Hybrid", meaning: "A petrol engine plus a small electric motor and battery that charges itself. Saves fuel in town. No plugging in." },
  { term: "Plug-in hybrid (PHEV)", meaning: "A hybrid with a bigger battery you charge from a socket, giving 40–80 km of electric driving before the petrol engine takes over." },
  { term: "EV", meaning: "Electric vehicle. Runs only on a battery you charge. No petrol, no tailpipe." },
  { term: "kWh", meaning: "Kilowatt-hour. A unit of electricity, like a litre is for petrol. An EV uses about 15–20 kWh per 100 km." },
  { term: "4x4 / AWD", meaning: "Four-wheel drive / all-wheel drive. The engine drives all four wheels, giving more grip on mud, snow and steep lanes." },
  { term: "Ground clearance", meaning: "The gap between the road and the bottom of the car. More is better for rough lanes and fields." },
  { term: "ISOFIX", meaning: "Standard metal fixing points for child seats. Safer and easier than using seat belts." },
  { term: "Trim", meaning: "The version of a model. Higher trims have more equipment and cost more." },
  { term: "Insurance group", meaning: "A rating from 1 to 50 that hints at how expensive a car is to insure. Lower is cheaper. Irish insurers use their own ratings, so always get a quote." },
  { term: "Euro NCAP", meaning: "The independent European crash-test programme. Cars get 0–5 stars; 5 is best. Tests got tougher over the years, so compare cars tested around the same year." },
  { term: "Certificate of Conformity", meaning: "A document from the car's manufacturer confirming it meets EU standards, with figures such as CO₂ and NOx emissions. Often called a CoC. You may need it to prove a car's NOx figure when registering an import." },
  { term: "NI Import Declaration", meaning: "Customs paperwork showing a car was properly brought into Northern Ireland under the Windsor Framework. Revenue asks for it (or other proof) before registering a car bought in NI." },
  { term: "Windsor Framework", meaning: "The UK–EU agreement on trade with Northern Ireland after Brexit. Cars properly imported into NI under it can come into the Republic without customs duty or import VAT." },
  { term: "V5C", meaning: "The UK registration document (logbook) for a car, including cars registered in Northern Ireland." },
  { term: "Clocked", meaning: "A car whose mileage reading has been illegally wound back to make it look less used. A history check helps catch it." },
  { term: "History check", meaning: "A paid report (e.g. Cartell or Motorcheck in Ireland) showing outstanding finance, crash damage, write-offs and mileage records." },
  { term: "Depreciation", meaning: "How much value a car loses over time. Most cars lose the most in their first 2–3 years." },
  { term: "Code 78", meaning: "A code on your driving licence meaning you can only drive automatic cars, because you passed your test in one." },
  { term: "Diesel particulate filter (DPF)", meaning: "A filter in diesel exhausts. It needs regular long drives to clean itself; lots of short trips can block it." },
];

export interface ChecklistStep {
  id: string;
  stage: "Before you buy" | "When you buy" | "After you bring it into the Republic";
  title: string;
  detail: string;
  link?: { label: string; url: string };
}

export const NI_STEPS: ChecklistStep[] = [
  { id: "cost", stage: "Before you buy", title: "Check the real total cost", detail: "Use our breakdown, then confirm the exact VRT for that car on Revenue's VRT calculator.", link: LINKS.vrtCalculator },
  { id: "proof", stage: "Before you buy", title: "Make sure you can prove the car was legally imported into NI", detail: "Revenue will only register the car if you can show it was properly brought into Northern Ireland. Ask the seller for the NI Import Declaration. If there isn't one, Revenue may accept the original V5C showing the last keeper lived in NI, plus the car's NI service history and NI MOT test history. Without this proof you can't register the car, and customs duty and import VAT may also apply.", link: LINKS.revenueNi },
  { id: "papers", stage: "Before you buy", title: "Check the seller has the logbook (V5C)", detail: "You must have the V5C. Without it, registration will be refused. Also ask for the purchase invoice and the service history." },
  { id: "coc", stage: "Before you buy", title: "Get proof of the car's NOx emissions", detail: "UK logbooks issued after April 2019 don't show NOx. Get a Certificate of Conformity (CoC) from the seller or manufacturer. Without NOx proof, Revenue charges a flat €4,850 for a diesel or €600 for other cars, instead of the normal NOx levy.", link: LINKS.revenueNox },
  { id: "insure", stage: "Before you buy", title: "Get an Irish insurance quote", detail: "Tell the insurer it's a UK-registered import. Arrange cover for driving it home." },
  { id: "history", stage: "Before you buy", title: "Run history checks", detail: "Get a UK check (outstanding finance, write-off, stolen) and an Irish check. Compare the mileage with the service and MOT records. UK cars show miles, not km." },
  { id: "inspect", stage: "Before you buy", title: "Inspect and test drive", detail: "Bring someone who knows cars, or pay for an independent inspection." },
  { id: "invoice", stage: "When you buy", title: "Get a dated invoice or receipt", detail: "It must show the price, the car's VIN (chassis number), and the seller's and buyer's names and addresses." },
  { id: "v5c", stage: "When you buy", title: "Send only the 'permanent export' section of the V5C to the DVLA", detail: "Keep the rest of the V5C: you must bring it to your NCTS appointment, where they keep it, so make a copy first.", link: LINKS.revenueRegistration },
  { id: "pay", stage: "When you buy", title: "Pay safely", detail: "Use a traceable method such as a bank transfer. Never carry a large amount of cash." },
  { id: "entry", stage: "When you buy", title: "Keep proof of the day you bring it home", detail: "Revenue needs evidence of the date the car entered the State, such as a dated receipt from that day. If your invoice is over 30 days old, you may need proof the car was kept outside the State." },
  { id: "book", stage: "After you bring it into the Republic", title: "Book an NCTS appointment within 7 days", detail: "Book within 7 days of the car arriving in the State. Revenue pays for one appointment; a second one is at your own cost.", link: LINKS.revenueRegistration },
  { id: "inspection", stage: "After you bring it into the Republic", title: "Bring the car and your documents", detail: "Bring the V5C, the invoice, the CoC (or upload the e-CoC on myAccount beforehand), proof of the date the car entered the State, official proof of your PPS number, and proof of name and address (a paper utility bill or bank statement, or two online statements from different providers, one a bank statement).", link: LINKS.revenueNctsVisit },
  { id: "vrt", stage: "After you bring it into the Republic", title: "Register and pay the VRT within 30 days", detail: "The car must be registered within 30 days of arriving. If you're late, you pay extra VRT. You get an Irish registration number.", link: LINKS.revenueRegistration },
  { id: "plates", stage: "After you bring it into the Republic", title: "Get Irish number plates", detail: "Buy plates from any supplier, as long as they meet the legal standards (there's a fine of up to €5,000 if they don't). Electric cars can have the optional green-stripe plates.", link: LINKS.revenuePlates },
  { id: "tax", stage: "After you bring it into the Republic", title: "Tax the car", detail: "Pay motor tax online once the Irish registration certificate arrives by post.", link: LINKS.motorTax },
  { id: "nct", stage: "After you bring it into the Republic", title: "Book an NCT if needed", detail: "If the car is 4 years old or more, book an NCT.", link: LINKS.ncts },
  { id: "update", stage: "After you bring it into the Republic", title: "Update your insurance", detail: "Give your insurer the new Irish registration number." },
];

export const NI_WARNINGS: string[] = [
  "No proof the car was legally imported into Northern Ireland means no Irish registration. Check the paperwork before you pay.",
  "Electric cars get up to €5,000 VRT relief only if registered before 31 December 2026. After that, VRT on an imported EV could be much higher.",
  "SEAI grants for new electric cars only apply to cars bought new from an SEAI-registered dealer in the Republic. Not to cars from Northern Ireland.",
  "Northern Ireland dealers usually can't offer PCP or hire purchase to people living in the Republic. Cash or a credit union/bank loan works best.",
  "Warranties and consumer rights can be harder to use across the border. Prefer well-known dealers.",
  "Prices change with the exchange rate. Our saving is an estimate for today.",
];

export interface ReviewSource {
  name: string;
  type: "Irish expert" | "UK expert" | "Reliability" | "Safety" | "Owner reviews";
  domain: string;
}

export const REVIEW_SOURCES: ReviewSource[] = [
  { name: "The Irish Times (Motors)", type: "Irish expert", domain: "irishtimes.com" },
  { name: "Irish Independent (Motoring)", type: "Irish expert", domain: "independent.ie" },
  { name: "CompleteCar.ie", type: "Irish expert", domain: "completecar.ie" },
  { name: "Carzone reviews", type: "Irish expert", domain: "carzone.ie" },
  { name: "What Car?", type: "UK expert", domain: "whatcar.com" },
  { name: "Autocar", type: "UK expert", domain: "autocar.co.uk" },
  { name: "Auto Express", type: "UK expert", domain: "autoexpress.co.uk" },
  { name: "Top Gear", type: "UK expert", domain: "topgear.com" },
  { name: "Honest John (owner reviews)", type: "Owner reviews", domain: "honestjohn.co.uk" },
];

/**
 * Link to find a model's review on a trusted site. We link out instead of
 * copying reviews (no scraping, no paid licences in the free version).
 */
export function reviewSearchUrl(source: ReviewSource, query: string): string {
  const q = encodeURIComponent(`site:${source.domain} ${query} review`);
  return `https://duckduckgo.com/?q=${q}`;
}

export function euroNcapSearchUrl(query: string): string {
  return `https://duckduckgo.com/?q=${encodeURIComponent(`site:euroncap.com ${query}`)}`;
}

export const BEGINNER_STEPS: { title: string; detail: string }[] = [
  { title: "Get insurance quotes first", detail: "Before you fall for a car, get 2–3 quotes. Insurance can cost more than the car's fuel for new drivers." },
  { title: "Get a loan quote", detail: "If you're borrowing, ask your credit union and bank for a quote so you can compare with dealer finance." },
  { title: "Run a history check", detail: "Use Cartell.ie or Motorcheck.ie for any used car. It shows outstanding finance, crash damage, write-offs and wound-back mileage." },
  { title: "Check the NCT cert and service history", detail: "Look for a current NCT (cars 4+ years old) and stamped service records." },
  { title: "Test drive properly", detail: "Drive for at least 20 minutes on town roads and a faster road. Listen for knocks, check the brakes pull straight, and try every button." },
  { title: "Get an independent inspection", detail: "For a few euro, a mechanic or the AA can check a used car before you pay." },
  { title: "Ask the seller", detail: "How many owners? Any accidents? Why are you selling? Is the timing belt done? Can I see the logbook?" },
  { title: "Know your rights", detail: "Buying from a dealer gives you more consumer protection than a private sale.", },
];
