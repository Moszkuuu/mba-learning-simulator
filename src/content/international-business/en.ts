import type { LessonText, QuestionText } from '../types';

export const lessons: Record<string, LessonText> = {
  'l41-exchange-rates': {
    title: 'Exchange Rates, Parity and Hedging',
    summary: 'How currencies are priced, how forward rates arise and what exposure means.',
    objectives: [
      'Read and convert exchange-rate quotes and identify appreciation and depreciation.',
      'Compute cross rates.',
      'Compute a forward rate from covered interest parity.',
      'Explain transaction exposure and the trade-offs of hedging.',
    ],
    explanation: [
      'An exchange rate is the price of one currency in terms of another. It must be read carefully: a quote of 36.00 THB per USD means that one US dollar costs 36 baht. If the quote falls to 34, the baht has appreciated (it buys more dollars) and the dollar has depreciated. Converting an amount multiplies by the quote when the amount is in the foreign currency, and divides when it is in the domestic one.',
      'A cross rate infers the rate between two currencies from their rates against a common third currency. If it takes 36 baht or 0.90 euros to buy one dollar, one euro costs 36 / 0.90 = 40 baht. Arbitrage keeps cross rates consistent.',
      'Covered interest parity links spot and forward rates to interest rates. A currency with the higher interest rate trades at a forward discount. The forward rate (domestic per foreign) = spot x (1 + domestic interest rate) / (1 + foreign interest rate). The forward rate is therefore set by arbitrage, not by a forecast of the future spot rate.',
      'A firm with a future foreign-currency payment or receipt has transaction exposure: the domestic value changes with the exchange rate. Hedging with a forward contract fixes the rate and removes the uncertainty, but also removes the chance of a favourable move and may cost something. Hedging reduces risk; it is not designed to make profit.',
    ],
    formulas: [
      { name: 'Conversion', expr: 'Domestic Amount = Foreign Amount x Rate (domestic per foreign)' },
      { name: 'Cross rate', expr: 'B per A = (B per USD) / (A per USD)' },
      { name: 'Covered interest parity', expr: 'Forward = Spot x (1 + Domestic Rate) / (1 + Foreign Rate)' },
      { name: 'Percentage change', expr: 'Change = New Rate / Old Rate - 1' },
    ],
    realWorld: 'Thai exporters invoicing in US dollars face a lower baht income when the baht strengthens, and many sell dollars forward to lock in a rate for expected receipts.',
    misconceptions: [
      'The forward rate is the market\'s prediction of the future spot rate. It is set by the interest differential.',
      'A strong currency is always good. It helps importers and hurts exporters.',
      'Hedging earns a profit. It removes uncertainty at the cost of forgoing gains.',
    ],
    workedExamples: [
      {
        title: 'Cross rate and conversion',
        given: ['36 THB per USD', '0.90 EUR per USD', 'Amount: USD 250,000'],
        steps: ['THB value of USD 250,000 = 250,000 x 36 = THB 9,000,000', 'THB per EUR = 36 / 0.90 = 40'],
        result: 'The amount is worth THB 9,000,000 and one euro costs 40 baht.',
      },
      {
        title: 'Forward rate and hedging',
        given: ['Spot 36.00 THB per USD', 'Thai 1-year interest rate 2%; US 1-year rate 4%', 'A Thai importer must pay USD 500,000 in one year'],
        steps: [
          'Forward = 36 x 1.02 / 1.04 = 35.31 THB per USD',
          'Cost at the forward rate = 500,000 x 35.31 = THB 17.65 million, against THB 18 million at today\'s spot',
        ],
        result: 'The forward rate is 35.31, a 1.92% discount of the dollar against the baht, reflecting the higher US interest rate.',
      },
    ],
  },
  'l42-trade-advantage': {
    title: 'Trade and Comparative Advantage',
    summary: 'Why countries and firms gain by specialising, even when one is better at everything.',
    objectives: [
      'Calculate opportunity costs and identify comparative advantage.',
      'Find the range of mutually beneficial terms of trade.',
      'Measure gains from specialisation and trade.',
      'Analyse the effects of a tariff.',
    ],
    explanation: [
      'A country has an absolute advantage when it can produce more of a good with the same resources. It has a comparative advantage when its opportunity cost of producing the good, the quantity of another good given up, is lower. Gains from trade depend on comparative, not absolute, advantage: even a country that is better at everything gains by specialising where its advantage is greatest.',
      'If country A can produce 10 cloth or 20 wine a day, one cloth costs it 2 wine. If country B can produce 6 cloth or 6 wine, one cloth costs it 1 wine. B has a comparative advantage in cloth and A in wine. Any price of cloth between 1 and 2 wine benefits both, so the midpoint 1.5 gives each a share of the gain.',
      'With specialisation and trade, each country can consume combinations beyond its own production possibilities. The gain can be measured by valuing the bundle consumed at the country\'s own opportunity cost.',
      'A tariff is a tax on imports. It raises the domestic price to the world price plus the tariff, protects domestic producers, raises government revenue and reduces consumer surplus. The loss to consumers exceeds the gains to producers and government, leaving a net deadweight loss, which is why economists generally prefer free trade except in special cases such as infant industries or national security.',
    ],
    formulas: [
      { name: 'Opportunity cost', expr: 'Cost of 1 unit of X = Max Y / Max X' },
      { name: 'Range of terms of trade', expr: 'Lower country\'s cost < price of X in Y < higher country\'s cost' },
      { name: 'Tariff revenue', expr: 'Revenue = Tariff Rate x Value of Imports' },
      { name: 'Domestic price with tariff', expr: 'Price = World Price x (1 + Tariff Rate)' },
    ],
    realWorld: 'Many countries specialise in goods where their relative costs are low, such as Thailand in rice, auto parts and tourism services, and import goods where their opportunity cost is high.',
    misconceptions: [
      'A country that is better at producing everything gains nothing from trade. It still gains by specialising where its advantage is greatest.',
      'Trade benefits every individual. Countries gain overall, but particular workers and firms can lose.',
      'Tariffs help the economy. They help protected producers at the expense of consumers.',
    ],
    workedExamples: [
      {
        title: 'Opportunity costs and terms of trade',
        given: ['Country A: 10 cloth or 20 wine a day', 'Country B: 6 cloth or 6 wine a day'],
        steps: ['A: 1 cloth = 20 / 10 = 2 wine', 'B: 1 cloth = 6 / 6 = 1 wine', 'Mutually beneficial price of cloth lies between 1 and 2 wine; midpoint = 1.5'],
        result: 'B should specialise in cloth and A in wine, trading at around 1.5 wine per cloth.',
      },
      {
        title: 'Gain from trade for country A',
        given: ['Without trade A makes 5 cloth and 10 wine', 'With trade A makes 20 wine and swaps 6 wine for 4 cloth, consuming 4 cloth and 14 wine'],
        steps: ['Value in wine at A\'s own rate (1 cloth = 2 wine): without trade 5 x 2 + 10 = 20', 'With trade: 4 x 2 + 14 = 22'],
        result: 'Country A gains the equivalent of 2 wine a day; country B gains the same amount in its own terms.',
      },
    ],
  },
  'l43-market-entry-risk': {
    title: 'Market Entry Modes and Country Risk',
    summary: 'How to enter a foreign market, and how to price the risk of doing so.',
    objectives: [
      'Compare entry modes by control, commitment, risk and return.',
      'Identify dimensions of country risk and distance.',
      'Value a foreign project with a risk-adjusted discount rate and with probabilities of loss.',
      'Recommend an entry mode under uncertainty.',
    ],
    explanation: [
      'Firms can enter a foreign market by exporting (low commitment, low control), licensing or franchising (partners use the firm\'s knowledge in return for fees or royalties), forming a joint venture (shared investment, risk and control) or setting up a wholly owned subsidiary (full control and full commitment, with the highest capital at risk). The choice reflects the trade-off between control and return on one side, and resource commitment and risk on the other.',
      'Country risk covers political risk (instability, expropriation), economic risk (inflation, currency crises), regulatory and legal risk, and cultural and institutional distance. The CAGE framework (cultural, administrative, geographic, economic distance) helps to identify where a market is more difficult than it looks.',
      'Risk should be priced in the valuation. One method adds a country risk premium to the discount rate, lowering present values. Another weights scenarios by probability, such as a chance that the project is expropriated and only part of its value is recovered. Staged entry and local partners can cut the amount at risk.',
      'Entry mode is rarely final: many firms start with exports or a partner to learn about the market, then increase commitment as knowledge and confidence grow.',
    ],
    formulas: [
      { name: 'Royalty income', expr: 'Royalty = Licensee Sales x Royalty Rate' },
      { name: 'Risk-adjusted NPV', expr: 'NPV = PV of cash flows at (base rate + country premium) - Investment' },
      { name: 'Expected PV with loss risk', expr: 'E[PV] = (1 - p) x PV(success) + p x Recovery' },
    ],
    realWorld: 'Retailers entering new Asian markets often begin with a local joint-venture partner to gain real-estate, regulatory and consumer knowledge before investing alone.',
    misconceptions: [
      'The highest-control entry mode is always best. It may carry more risk than the market justifies.',
      'Country risk only matters for unstable countries. All markets carry some regulatory, currency and cultural risk.',
      'Adding a risk premium handles all uncertainty. It cannot capture one-off events like expropriation.',
    ],
    workedExamples: [
      {
        title: 'Risk-adjusted discount rate',
        given: ['Investment $10 million', 'Cash inflow $3 million a year for 5 years', 'Base discount rate 10%; country risk premium 4%'],
        steps: [
          'At 10%: annuity factor 3.7908; PV = 11.372; NPV = $1.37 million',
          'At 14%: annuity factor 3.4331; PV = 10.299; NPV = $0.30 million',
        ],
        result: 'Adding the country risk premium cuts the NPV from $1.37 million to $0.30 million, so the project barely creates value.',
      },
      {
        title: 'Probability of loss',
        given: ['Same project: PV of inflows $11.372 million if all goes well', '10% chance of expropriation, recovering only $2 million'],
        steps: ['E[PV] = 0.9 x 11.372 + 0.1 x 2 = 10.235 + 0.2 = $10.435 million', 'Expected NPV = 10.435 - 10 = $0.44 million'],
        result: 'The expected NPV of $0.44 million is positive but small relative to the $10 million at risk.',
      },
    ],
  },
};

export const questions: Record<string, QuestionText> = {
  l41q1: {
    concept: 'Appreciation and depreciation',
    prompt: 'The exchange rate moves from 36 THB per USD to 34 THB per USD. What has happened?',
    options: [
      { text: 'The baht has appreciated against the dollar', why: 'Correct - fewer baht are needed to buy one dollar, so the baht is stronger.' },
      { text: 'The baht has depreciated against the dollar', why: 'Depreciation would mean more baht per dollar.' },
      { text: 'Neither currency has changed in value', why: 'The rate has changed, so relative values moved.' },
      { text: 'The dollar has appreciated against the baht', why: 'The dollar buys fewer baht, so it has depreciated.' },
    ],
    explanation: 'A lower number of baht per dollar means the baht is worth more: it has appreciated, and the dollar has depreciated.',
  },
  l41q2: { concept: 'Currency conversion', prompt: 'The rate is 36 THB per USD. How many baht is USD 250,000 worth?', explanation: '250,000 x 36 = THB 9,000,000.' },
  l41q3: { concept: 'Cross rate', prompt: 'One US dollar buys 36 baht or 0.90 euros. How many baht does one euro cost?', explanation: 'THB per EUR = 36 / 0.90 = 40.', commonMistake: 'Multiplying 36 by 0.90 (32.4) instead of dividing.' },
  l41q4: { concept: 'Forward rate', prompt: 'Spot is 36.00 THB per USD. The 1-year interest rate is 2% in Thailand and 4% in the US. What is the 1-year forward rate (THB per USD, two decimals)?', explanation: 'Forward = 36 x 1.02 / 1.04 = 35.31.' },
  l41q5: { concept: 'Forward premium and discount', prompt: 'By what percentage does the forward rate of 35.31 differ from the spot rate of 36.00 THB per USD?', explanation: '35.31 / 36.00 - 1 = -1.92%: the dollar trades at a forward discount.' },
  l41q6: {
    concept: 'Forward rates and forecasts',
    scenario: 'A Thai exporter will receive USD 1 million in six months and fears that the dollar will fall. The 6-month forward rate is lower than spot, reflecting the higher US interest rate.',
    prompt: 'Which statement is correct?',
    options: [
      { text: 'The forward rate shows that the market expects the dollar to fall by exactly that amount, so hedging is a bad idea', why: 'The forward rate is set by interest rate arbitrage, not by a forecast.' },
      { text: 'Hedging would guarantee extra profit', why: 'Hedging fixes the rate; it does not guarantee profit.' },
      { text: 'Selling dollars forward fixes the baht value of the receipt, removing the risk of a further fall and the chance of a rise', why: 'Correct - a forward contract locks in the rate and eliminates the uncertainty in both directions.' },
      { text: 'The exporter should wait because the forward rate always equals the future spot rate', why: 'There is no guarantee the future spot rate will equal the forward rate.' },
    ],
    explanation: 'The forward discount is the interest differential, so it does not predict the future spot rate. The hedge trades the chance of gain for certainty.',
  },
  l42q1: {
    concept: 'Comparative advantage',
    prompt: 'What does it mean to have a comparative advantage in producing a good?',
    options: [
      { text: 'Producing it with fewer resources than any other country', why: 'This is an absolute advantage.' },
      { text: 'Having the largest economy', why: 'Size does not define comparative advantage.' },
      { text: 'Selling it at the lowest price', why: 'Price depends on many things; the concept concerns opportunity cost.' },
      { text: 'Having a lower opportunity cost of producing it than other countries', why: 'Correct - comparative advantage is about the sacrifice of other goods.' },
    ],
    explanation: 'Comparative advantage rests on lower opportunity cost, which makes mutual gains possible even when one country has an absolute advantage in everything.',
  },
  l42q2: { concept: 'Opportunity cost', prompt: 'Country A can produce 10 cloth or 20 wine in a day. How many units of wine does one unit of cloth cost it?', explanation: '20 / 10 = 2 wine per cloth.' },
  l42q3: { concept: 'Terms of trade', prompt: 'One cloth costs country A 2 wine and country B 1 wine. At the midpoint of the mutually beneficial range, how many wine are exchanged for one cloth?', explanation: 'The price must lie between 1 and 2. The midpoint is (1 + 2) / 2 = 1.5 wine.' },
  l42q4: { concept: 'Gains from trade', prompt: 'Without trade, A consumes 5 cloth and 10 wine. With trade it consumes 4 cloth and 14 wine. Valuing cloth at 2 wine, by how many wine-equivalents does A gain?', explanation: 'Without trade: 5 x 2 + 10 = 20. With trade: 4 x 2 + 14 = 22. Gain = 2 wine-equivalents.' },
  l42q5: { concept: 'Tariff revenue', prompt: 'A country imposes a 10% tariff on imports worth $200 million. How much revenue does the government collect ($ million), assuming import values stay the same?', explanation: '0.10 x 200 = $20 million. In practice imports fall when the tariff raises prices, so actual revenue is lower.' },
  l42q6: {
    concept: 'Effects of a tariff',
    scenario: 'The world price of steel is $100 a tonne. A country introduces a 20% tariff on steel imports.',
    prompt: 'Which statement best describes the effects?',
    options: [
      { text: 'The domestic price stays at $100 and domestic producers lose', why: 'The tariff raises the domestic price.' },
      { text: 'The domestic price rises to $120; domestic producers and the government gain, consumers lose more than they gain, causing a net loss', why: 'Correct - price = 100 x 1.20 = $120, and the loss in consumer surplus exceeds the combined gains.' },
      { text: 'The domestic price rises to $120 and everybody gains', why: 'Consumers lose, and there is a deadweight loss.' },
      { text: 'The domestic price falls to $80', why: 'A tariff cannot lower the price.' },
    ],
    explanation: 'The tariff raises the domestic price to $120, which helps protected producers and raises revenue, but consumers lose more, leaving a net deadweight loss.',
  },
  l43q1: {
    concept: 'Entry modes',
    prompt: 'Which entry mode involves the greatest control and the greatest commitment of capital?',
    options: [
      { text: 'Exporting through a distributor', why: 'This has low commitment and little control.' },
      { text: 'A wholly owned subsidiary', why: 'Correct - full ownership gives full control but also the greatest capital at risk.' },
      { text: 'Licensing', why: 'Licensing needs little capital and gives limited control.' },
      { text: 'Franchising', why: 'Franchising is low in capital commitment.' },
    ],
    explanation: 'Entry modes lie on a spectrum from low commitment and control (exporting, licensing) to high commitment and control (wholly owned subsidiary).',
  },
  l43q2: { concept: 'Licensing income', prompt: 'A licensee sells $20 million of products a year and pays a 5% royalty. What is the royalty income ($ million)?', explanation: '20 x 0.05 = $1 million.' },
  l43q3: { concept: 'Risk-adjusted NPV', prompt: 'A project costs $10 million and returns $3 million a year for 5 years. The discount rate is 10% plus a 4% country risk premium. What is the NPV at 14% ($ million, two decimals)?', explanation: 'Annuity factor (14%, 5) = 3.4331. PV = 3 x 3.4331 = 10.299. NPV = $0.30 million.' },
  l43q4: { concept: 'Expected value with loss risk', prompt: 'The PV of inflows at 10% is $11.372 million if all goes well. There is a 10% chance of expropriation, in which case only $2 million is recovered. The investment is $10 million. What is the expected NPV ($ million, two decimals)?', explanation: 'E[PV] = 0.9 x 11.372 + 0.1 x 2 = 10.435. Expected NPV = 10.435 - 10 = $0.44 million.' },
  l43q5: {
    concept: 'Joint ventures',
    prompt: 'What is a main advantage of entering a foreign market through a joint venture with a local partner?',
    options: [
      { text: 'Shared investment and risk, and access to local knowledge and relationships', why: 'Correct - the partner contributes knowledge and capital; the downside is shared control and possible conflict.' },
      { text: 'Full control over decisions', why: 'A joint venture shares control.' },
      { text: 'No risk of the partner learning the firm\'s technology', why: 'Knowledge leakage is a known risk of joint ventures.' },
      { text: 'Guaranteed profit', why: 'No entry mode guarantees profit.' },
    ],
    explanation: 'Joint ventures trade some control and profit for lower capital commitment and better local knowledge.',
  },
  l43w1: {
    concept: 'Choosing an entry mode under risk',
    scenario: 'A retailer is entering a high-risk market. Option A: export through a distributor, costing $0.5 million up front and earning $2 million a year for sure. Option B: a joint venture costing $4 million, which earns $5 million a year with 70% probability and nothing otherwise. Option C: a wholly owned subsidiary costing $12 million, which earns $9 million a year with 50% probability and nothing otherwise. Ignore discounting and use a 5-year horizon.',
    prompt: 'Write a short recommendation (4-6 sentences). Compute the expected profit and worst-case loss of each option, and recommend an entry strategy with reasons.',
    explanation: 'Self-assess against the rubric after writing your own answer; compare with the model answer.',
    modelAnswer: 'Option A earns 2 x 5 - 0.5 = $9.5 million with a worst case of -$0.5 million. Option B has an expected profit of 0.7 x 5 x 5 - 4 = 17.5 - 4 = $13.5 million but a worst case of -$4 million. Option C has an expected profit of 0.5 x 9 x 5 - 12 = 22.5 - 12 = $10.5 million and a worst case of -$12 million. B has the highest expected value, C has a lower expected value than B while risking three times as much, and A is safe but earns less. I would start with the joint venture, or even export first to learn about the market and collect evidence on the 70% estimate, then commit more capital once the success probability is better known. A staged approach keeps the maximum loss low while retaining most of the upside.',
    rubric: [
      'Computes the expected profits: A $9.5 million, B $13.5 million, C $10.5 million.',
      'States the worst-case losses: $0.5 million, $4 million and $12 million.',
      'Compares risk and return across options rather than choosing on expected value alone.',
      'Recommends an entry strategy and justifies it.',
      'Suggests staging or learning, or questions the probability estimates.',
    ],
  },
};
