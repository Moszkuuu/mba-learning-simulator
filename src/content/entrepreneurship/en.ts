import type { LessonText, QuestionText } from '../types';

export const lessons: Record<string, LessonText> = {
  'l38-validating-ideas': {
    title: 'Validating Ideas: The Lean Start-up Approach',
    summary: 'Test the riskiest assumptions cheaply before building the whole business.',
    objectives: [
      'Explain build-measure-learn, the minimum viable product (MVP) and the pivot.',
      'Identify the riskiest assumption behind a business idea.',
      'Compute a conversion funnel from experiment data.',
      'Judge whether an experiment result is conclusive using a confidence interval.',
    ],
    explanation: [
      'A start-up operates under extreme uncertainty: it is searching for a repeatable and scalable business model rather than executing a known one. The lean approach treats the business plan as a set of hypotheses about customers, problem, solution, price and channels, and tests them quickly with real customers through build-measure-learn loops.',
      'A minimum viable product is the smallest thing that can test a hypothesis, such as a landing page, a manual service or a prototype. Its purpose is learning, not polish. Before building, identify the riskiest assumption (the one that, if false, kills the idea) and design an experiment with a clear success criterion stated in advance.',
      'Measure what matters: actionable metrics such as the percentage of visitors who sign up and the share of sign-ups who pay, arranged as a funnel. Vanity metrics, such as total page views, can rise without showing real demand. Multiply the stage conversion rates to find the overall conversion.',
      'Experiments give noisy results from small samples. A confidence interval for a proportion (p plus or minus 1.96 x the square root of p(1 - p)/n) shows how much the result could be due to chance. If the target lies inside the interval, the result is inconclusive. Depending on the evidence, the team should persevere, refine, or pivot: change a major element of the strategy while keeping what has been learned.',
    ],
    formulas: [
      { name: 'Funnel', expr: 'Customers = Visitors x Sign-up Rate x Payment Rate' },
      { name: 'Standard error of a proportion', expr: 'SE = square root of (p x (1 - p) / n)' },
      { name: '95% interval for a proportion', expr: 'p +/- 1.96 x SE' },
      { name: 'Sample size for a half-width h', expr: 'n = 1.96^2 x p x (1 - p) / h^2' },
    ],
    realWorld: 'Dropbox is often cited for validating demand with an explanatory video before the product was complete, which produced a large wait-list and confirmed interest.',
    misconceptions: [
      'An MVP is a low-quality product. It is the smallest experiment that tests the key hypothesis.',
      'Positive feedback from friends validates the idea. Real validation means customers take costly actions, such as paying.',
      'A result above target proves the hypothesis. Small samples can mislead; check the interval.',
    ],
    workedExamples: [
      {
        title: 'A conversion funnel',
        given: ['10,000 visitors', '4% sign up', '10% of sign-ups pay'],
        steps: ['Sign-ups = 10,000 x 0.04 = 400', 'Paying customers = 400 x 0.10 = 40', 'Overall conversion = 40 / 10,000 = 0.4%'],
        result: 'The funnel turns 10,000 visitors into 40 customers; improving the weakest stage has the largest effect.',
      },
      {
        title: 'Is the result conclusive?',
        given: ['Hypothesis: at least 5% of visitors will sign up', 'Result: 24 sign-ups from 400 visitors (6%)'],
        steps: [
          'SE = square root of (0.06 x 0.94 / 400) = 0.0119, or 1.19 percentage points',
          'Margin = 1.96 x 1.19 = 2.33 points, giving an interval of 3.67% to 8.33%',
        ],
        result: 'The 5% target lies inside the interval, so the experiment neither confirms nor refutes the hypothesis.',
      },
    ],
  },
  'l39-unit-economics-runway': {
    title: 'Unit Economics, Burn and Runway',
    summary: 'Will the business make money per customer, and how long can it survive until it does?',
    objectives: [
      'Compute contribution per order or per customer.',
      'Compute net burn and runway.',
      'Find the break-even volume.',
      'Evaluate options to extend runway or reach profitability.',
    ],
    explanation: [
      'Unit economics asks whether each unit of sale (an order, a subscriber) is profitable on its own. The contribution per unit is the price minus the costs that vary with each unit, such as product cost, delivery and payment fees. Fixed costs are covered only if enough units are sold.',
      'Burn rate is the cash a company spends in excess of the cash it receives, each month. Net burn = expenses - revenue (when positive). Runway is the number of months until cash runs out at the current burn: runway = cash / net burn. Investors and founders watch runway because raising money takes months and takes longer in a downturn.',
      'The break-even volume is fixed costs divided by contribution per unit. If contribution per unit is negative, growth makes losses worse and no volume will ever break even; the unit economics must first be fixed (price, cost to serve, mix).',
      'To extend runway the founders can raise prices, cut variable or fixed costs, or raise money. Each has trade-offs: price rises can reduce volume, cuts can damage growth, and funding dilutes ownership.',
    ],
    formulas: [
      { name: 'Contribution per order', expr: 'Contribution = Price - Variable Costs per Order' },
      { name: 'Net burn', expr: 'Net Burn = Monthly Expenses - Monthly Revenue' },
      { name: 'Runway', expr: 'Runway (months) = Cash / Net Burn' },
      { name: 'Break-even orders', expr: 'Orders = Fixed Costs / Contribution per Order' },
    ],
    realWorld: 'Many food-delivery and quick-commerce companies struggled because the contribution per order after delivery and discounts was too small to cover fixed costs at any realistic volume.',
    misconceptions: [
      'Growth fixes unit economics. If each unit loses money, more units mean larger losses.',
      'Runway is how long until profitability. It is how long until the cash runs out.',
      'Revenue is the same as cash flow. Burn is measured on cash.',
    ],
    workedExamples: [
      {
        title: 'Burn and runway',
        given: ['Cash $600,000', 'Monthly revenue $40,000', 'Monthly expenses $100,000'],
        steps: ['Net burn = 100,000 - 40,000 = $60,000 a month', 'Runway = 600,000 / 60,000 = 10 months'],
        result: 'The company must raise money or reach break-even within 10 months, and in practice start raising sooner.',
      },
      {
        title: 'Break-even orders',
        given: ['Order price $40; product cost $22; delivery $8; payment fees $2', 'Fixed costs $48,000 a month'],
        steps: ['Contribution = 40 - 22 - 8 - 2 = $8 per order', 'Break-even = 48,000 / 8 = 6,000 orders a month'],
        result: 'The business needs 6,000 orders a month to cover its fixed costs.',
      },
    ],
  },
  'l40-funding-dilution': {
    title: 'Funding, Valuation and Dilution',
    summary: 'What founders give up when they raise money, and how to compare offers.',
    objectives: [
      'Compute post-money valuation and investor ownership.',
      'Calculate founder ownership after multiple rounds.',
      'Explain how convertible instruments with discounts work.',
      'Compare funding offers on ownership, value and runway.',
    ],
    explanation: [
      'When investors fund a start-up they receive shares. The pre-money valuation is the value of the company before the investment; post-money = pre-money + investment. The investor\'s ownership is the investment divided by the post-money valuation. Existing shareholders are diluted: their stake is multiplied by (1 - new investors\' share).',
      'Dilution is not necessarily bad. A smaller share of a larger, better-funded company can be worth more than a larger share of a smaller one. What matters is the value of the stake and the probability of success. Option pools for employees also dilute founders and are usually created before the round.',
      'Early money is often raised with convertible instruments (convertible notes or SAFEs) that convert into shares at the next priced round, usually at a discount to the new price. A 20% discount means the early investor pays 80% of the round price per share, rewarding them for the added risk.',
      'Terms matter as well as price: liquidation preferences, board seats, anti-dilution protection and vesting affect who gets what at exit. A higher headline valuation with harsh terms can be worse than a lower valuation with clean terms.',
    ],
    formulas: [
      { name: 'Post-money', expr: 'Post-money = Pre-money + Investment' },
      { name: 'Investor ownership', expr: 'Ownership = Investment / Post-money' },
      { name: 'Founder stake after a round', expr: 'New Stake = Old Stake x (1 - New Investors\' Share)' },
      { name: 'Convertible discount', expr: 'Conversion Price = Round Price x (1 - Discount)' },
    ],
    realWorld: 'Founders who raised several rounds often hold well under half the company at exit, yet the value of their stake can far exceed what they would have had without the funding.',
    misconceptions: [
      'Founders should avoid dilution at all costs. Funding that raises the chance of success can increase the value of a smaller stake.',
      'Valuation is the only term that matters. Preferences and control rights can shift outcomes at exit.',
      'Pre-money and post-money valuation are the same. They differ by the amount raised.',
    ],
    workedExamples: [
      {
        title: 'Ownership after two rounds',
        given: ['Seed round: $2 million at a $8 million pre-money valuation', 'Series A: investors buy 20% of the company'],
        steps: [
          'Seed post-money = 8 + 2 = $10 million; investors own 2 / 10 = 20%; founders hold 80%',
          'After the Series A, founders hold 80% x (1 - 0.20) = 64%',
        ],
        result: 'After two rounds the founders own 64%. At a $50 million exit that stake would be worth $32 million (before preferences).',
      },
      {
        title: 'Discount on a convertible',
        given: ['Next round price $2.50 per share', 'The early investor\'s note carries a 20% discount'],
        steps: ['Conversion price = 2.50 x (1 - 0.20) = $2.00 per share'],
        result: 'The early investor receives shares at $2.00, a 20% saving on the price that new investors pay.',
      },
    ],
  },
};

export const questions: Record<string, QuestionText> = {
  l38q1: {
    concept: 'Minimum viable product',
    prompt: 'What is the main purpose of a minimum viable product (MVP)?',
    options: [
      { text: 'To launch a polished product that competitors cannot match', why: 'Polish is not the aim of an MVP.' },
      { text: 'To test the key assumptions with real customers as cheaply and quickly as possible', why: 'Correct - the MVP is an experiment designed for learning.' },
      { text: 'To maximise early revenue', why: 'Revenue may help signal demand but is not the purpose.' },
      { text: 'To impress investors with features', why: 'Feature count is not evidence of demand.' },
    ],
    explanation: 'An MVP is the smallest product or experiment that can test a hypothesis; the objective is validated learning.',
  },
  l38q2: { concept: 'Conversion funnel', prompt: '5,000 visitors reach a landing page. 6% sign up and 20% of sign-ups become paying customers. How many customers result?', explanation: 'Sign-ups = 5,000 x 0.06 = 300. Customers = 300 x 0.20 = 60.' },
  l38q3: { concept: 'Standard error of a proportion', prompt: 'A landing-page test gives 24 sign-ups from 400 visitors (p = 0.06). What is the standard error of the proportion, in percentage points?', explanation: 'SE = square root of (0.06 x 0.94 / 400) = 0.0119, which is 1.19 percentage points.' },
  l38q4: { concept: 'Margin of error', prompt: 'With a standard error of 1.19 percentage points, what is the 95% margin of error (use 1.96), in percentage points?', explanation: '1.96 x 1.19 = 2.33 percentage points.' },
  l38q5: {
    concept: 'When to pivot',
    prompt: 'A team has run several well-designed experiments over six months and every key metric has stayed flat while customers say the problem is not important to them. What does the lean approach suggest?',
    options: [
      { text: 'Spend more on marketing to raise the numbers', why: 'Pushing a product that lacks demand wastes money.' },
      { text: 'Add more features to the product', why: 'Features do not solve a lack of problem-solution fit.' },
      { text: 'Pivot: change a fundamental part of the strategy, such as the customer, problem or solution, using what has been learned', why: 'Correct - repeated evidence of no traction suggests changing direction.' },
      { text: 'Ignore the data and persevere', why: 'Perseverance without evidence is a costly risk.' },
    ],
    explanation: 'A pivot is a structured change of direction that keeps validated learning but changes a key hypothesis when evidence shows the current path is not working.',
  },
  l38w1: {
    concept: 'Judging an experiment',
    scenario: 'A team tests a subscription-box idea with a landing page. The success criterion, set in advance, was that at least 5% of visitors would sign up. Of 400 visitors, 24 signed up (6%). The founders want to start buying inventory.',
    prompt: 'Write a short assessment (4-6 sentences). Compute the 95% interval, say whether the result is conclusive, find the sample size needed for a half-width of 1 percentage point, and recommend the next step.',
    explanation: 'Self-assess against the rubric after writing your own answer; compare with the model answer.',
    modelAnswer: 'The standard error is the square root of 0.06 x 0.94 / 400, or 1.19 percentage points, so the 95% interval is 6% plus or minus 2.33 points, or 3.67% to 8.33%. Because the 5% target lies inside this interval, the test neither confirms nor refutes the hypothesis: the true sign-up rate could plausibly be below or above 5%. Narrowing the interval to plus or minus 1 point would need about 1.96 squared x 0.06 x 0.94 / 0.01 squared, which is 2,167 visitors. Sign-ups are also a weak signal because they cost the visitor nothing, so I would not buy inventory yet. I would run a larger test of about 2,200 visitors, add a stronger commitment such as a paid pre-order, and decide on inventory only if the lower end of the interval is acceptable.',
    rubric: [
      'Computes the standard error (1.19 points) and the interval (3.67% to 8.33%).',
      'Concludes that the result is inconclusive because the target lies within the interval.',
      'Computes the required sample size (about 2,167).',
      'Notes that email sign-ups are a weak signal compared with paying.',
      'Recommends a sensible next step and does not commit inventory yet.',
    ],
  },
  l39q1: {
    concept: 'Runway',
    prompt: 'What does "runway" measure for a start-up?',
    options: [
      { text: 'The number of months until cash runs out at the current net burn rate', why: 'Correct - runway = cash divided by net monthly burn.' },
      { text: 'The time until the company is profitable', why: 'Runway ends when cash runs out, whether or not the company is profitable.' },
      { text: 'The time to launch the product', why: 'This is a development timeline, not runway.' },
      { text: 'The number of months of revenue the company has booked', why: 'Booked revenue is different from available cash.' },
    ],
    explanation: 'Runway is a survival measure: cash divided by monthly net burn.',
  },
  l39q2: { concept: 'Net burn', prompt: 'A start-up spends $100,000 a month and earns $40,000 a month in revenue. What is its net burn ($ per month)?', explanation: '100,000 - 40,000 = $60,000 a month.' },
  l39q3: { concept: 'Runway', prompt: 'The start-up has $600,000 of cash and a net burn of $60,000 a month. What is its runway (months)?', explanation: '600,000 / 60,000 = 10 months.' },
  l39q4: { concept: 'Contribution per order', prompt: 'An order sells for $40. The product costs $22, delivery $8 and payment fees $2. What is the contribution per order ($)?', explanation: '40 - 22 - 8 - 2 = $8.' },
  l39q5: { concept: 'Break-even volume', prompt: 'Fixed costs are $48,000 a month and the contribution per order is $8. How many orders a month are needed to break even?', explanation: '48,000 / 8 = 6,000 orders.' },
  l39w1: {
    concept: 'Extending runway',
    scenario: 'A delivery start-up has $160,000 of cash. It sells 4,000 orders a month with a contribution of $8 per order and fixed costs of $48,000 a month. Founders consider (A) raising the order price by $2, which they estimate will reduce orders by 10%; (B) cutting fixed costs by $6,000 a month; or (C) both.',
    prompt: 'Write a short recommendation (4-6 sentences). Compute the current monthly loss and runway, then the runway under each option, and recommend one with reasons and risks.',
    explanation: 'Self-assess against the rubric after writing your own answer; compare with the model answer.',
    modelAnswer: 'Currently the contribution is 4,000 x 8 = $32,000 against fixed costs of $48,000, so the monthly loss is $16,000 and the runway is 160,000 / 16,000 = 10 months. Option A gives a contribution of $10 on 3,600 orders, or $36,000, so the loss is $12,000 and the runway is 13.3 months. Option B cuts the loss to $10,000 and the runway to 16 months. Combining them, the contribution is $36,000 against fixed costs of $42,000, a loss of $6,000, and the runway extends to 26.7 months. I recommend doing both, since neither alone brings the company close to break-even; at 4,200 orders a month with contribution of $10 the company would break even on fixed costs of $42,000. The risks are that the price rise cuts orders by more than 10% and that cost cuts hurt service quality, so I would test the price in one city first and protect the cuts that affect delivery speed.',
    rubric: [
      'Computes the current loss ($16,000) and runway (10 months).',
      'Computes option A (loss $12,000; runway about 13.3 months).',
      'Computes option B (loss $10,000; runway 16 months) and option C (loss $6,000; runway about 26.7 months).',
      'Recommends an option and links it to the numbers.',
      'Identifies risks such as a larger fall in orders or damage from cost cuts, and a way to test.',
    ],
  },
  l40q1: {
    concept: 'Post-money valuation',
    prompt: 'An investor puts $2 million into a company with a pre-money valuation of $8 million. What is the post-money valuation?',
    options: [
      { text: '$6 million', why: 'Subtracting the investment is incorrect.' },
      { text: '$8 million', why: 'This is the pre-money valuation.' },
      { text: '$16 million', why: 'This multiplies instead of adding.' },
      { text: '$10 million', why: 'Correct - post-money = pre-money + investment = 8 + 2.' },
    ],
    explanation: 'Post-money valuation is the value of the company immediately after the new money has been added.',
  },
  l40q2: { concept: 'Investor ownership', prompt: 'An investor invests $2 million at a pre-money valuation of $8 million. What percentage of the company does the investor own?', explanation: 'Post-money = $10 million. Ownership = 2 / 10 = 20%.' },
  l40q3: { concept: 'Founder dilution across rounds', prompt: 'Founders hold 80% after the seed round. A Series A investor then buys 20% of the company. What percentage do the founders hold after the Series A?', explanation: '80% x (1 - 0.20) = 64%.' },
  l40q4: { concept: 'Convertible discount', prompt: 'The next funding round prices shares at $2.50. An early investor holds a note with a 20% discount. At what price per share does the note convert ($)?', explanation: '2.50 x (1 - 0.20) = $2.00.' },
  l40q5: { concept: 'Value of a stake at exit', prompt: 'Founders own 64% of a company that is sold for $50 million. Ignoring preferences, what are the founders\' proceeds ($ million)?', explanation: '0.64 x 50 = $32 million.' },
  l40w1: {
    concept: 'Comparing funding offers',
    scenario: 'A founder (100% owner) has two offers. Offer A: $3 million at a $9 million pre-money valuation. Offer B: $2 million at a $10 million pre-money valuation. The company burns about $100,000 a month and has no other cash.',
    prompt: 'Write a short recommendation (4-6 sentences). Compute the post-money valuations, ownership, value of the founder\'s stake and runway for each offer, then recommend one and say what other terms you would check.',
    explanation: 'Self-assess against the rubric after writing your own answer; compare with the model answer.',
    modelAnswer: 'Both offers give a post-money valuation of $12 million. Offer A gives the investor 3/12 = 25%, leaving the founder 75%, a stake worth 0.75 x 12 = $9.0 million, and the $3 million funds 30 months at a $100,000 burn. Offer B gives the investor 2/12 = 16.7%, leaving the founder 83.3%, worth 0.833 x 12 = $10.0 million, with the $2 million funding 20 months. B preserves more ownership and value on paper, but A provides 10 extra months of runway, which raises the chance of reaching milestones for the next round at a better valuation. If the business can reach a major milestone within 20 months, I would take B; if the path is uncertain and fundraising is likely to be slow, I would take A. I would also compare liquidation preferences, board control, option pool requirements and anti-dilution terms, since these can matter more than a small difference in headline valuation.',
    rubric: [
      'Computes the post-money valuation ($12 million) for both offers.',
      'Computes ownership (25% versus 16.7%) and founder stake values ($9.0 million versus $10.0 million).',
      'Computes runway (30 versus 20 months).',
      'Makes a recommendation that weighs ownership against runway and risk.',
      'Names other terms to check, such as liquidation preference, control or option pool.',
    ],
  },
};
