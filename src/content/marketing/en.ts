import type { LessonText, QuestionText } from '../types';

export const lessons: Record<string, LessonText> = {
  'l19-segmentation-positioning': {
    title: 'Segmentation, Targeting and Positioning',
    summary: 'Choosing who to serve, and what to stand for in their minds.',
    objectives: [
      'Segment a market using demographic, behavioural, psychographic and needs-based criteria.',
      'Test whether a segmentation is useful (measurable, substantial, accessible, differentiable, actionable).',
      'Evaluate the profitability of candidate target segments.',
      'Write a positioning statement built on points of difference.',
    ],
    explanation: [
      'Customers differ in what they value and what they will pay, so a single offer rarely serves all of them well. Segmentation divides a market into groups with similar needs or behaviour. Useful bases include demographics (age, income), behaviour (usage rate, loyalty), psychographics (values, lifestyle) and, most powerfully, the benefits sought.',
      'A segment is worth pursuing only if it is measurable, large enough to be profitable, reachable through channels you can use, different enough from others to respond differently, and actionable with your resources. Targeting then chooses the segment(s) by comparing attractiveness (size, growth, margin, competition) with your fit and capabilities.',
      'A simple profitability screen multiplies the number of customers in the segment by the share you can win and by the contribution per customer, then subtracts the cost of serving and reaching them. The share assumption is the most uncertain input, so it should be tested.',
      'Positioning is the place a brand occupies in the target customer\'s mind relative to competitors. A positioning statement names the target, the frame of reference, and the key point of difference that is both valued by customers and credible for the firm. Points of parity show you meet the basic expectations of the category.',
    ],
    formulas: [
      { name: 'Customers captured', expr: 'Customers Won = Segment Size x Penetration' },
      { name: 'Segment net contribution', expr: 'Net = Customers Won x Contribution per Customer - Cost of Targeting' },
      { name: 'Break-even penetration', expr: 'Penetration = Cost of Targeting / (Segment Size x Contribution per Customer)' },
    ],
    realWorld: 'Budget airlines target price-sensitive leisure travellers and strip out services they do not value; full-service carriers target business travellers who value flexibility and lounges.',
    misconceptions: [
      'The more segments served the better. Serving many segments dilutes focus and raises cost; some segments are not worth serving.',
      'Segments are defined by demographics. Behaviour and benefits sought usually predict response better.',
      'Positioning is what the firm says. It is what customers believe, shaped by experience as well as advertising.',
    ],
    workedExamples: [
      {
        title: 'Comparing three segments',
        given: ['A: 20,000 customers, 10% penetration, $120 contribution, $60,000 cost', 'B: 50,000 customers, 4% penetration, $90 contribution, $80,000 cost', 'C: 8,000 customers, 25% penetration, $200 contribution, $150,000 cost'],
        steps: [
          'A: 2,000 customers x 120 = 240,000; less 60,000 = $180,000',
          'B: 2,000 customers x 90 = 180,000; less 80,000 = $100,000',
          'C: 2,000 customers x 200 = 400,000; less 150,000 = $250,000',
        ],
        result: 'C is the most attractive on this screen even though it is the smallest segment, because contribution per customer is high.',
      },
      {
        title: 'Break-even penetration',
        given: ['Segment of 12,000 customers', '$80 contribution per customer', '$90,000 cost of targeting'],
        steps: ['Customers needed = 90,000 / 80 = 1,125', 'Penetration = 1,125 / 12,000 = 9.375%'],
        result: 'The campaign breaks even at 9.375% penetration; any higher share is profit.',
      },
    ],
  },
  'l20-value-pricing': {
    title: 'Value-Based Pricing',
    summary: 'Set prices from what customers gain, not only from what products cost.',
    objectives: [
      'Contrast cost-plus pricing with value-based pricing.',
      'Estimate economic value to the customer (EVC).',
      'Calculate the volume change needed to justify a price change.',
      'Judge whether a price cut that raises revenue also raises profit.',
    ],
    explanation: [
      'Cost-plus pricing adds a margin to cost; it is simple but ignores what customers are willing to pay and what competitors charge. Value-based pricing starts with the value delivered to the customer: price should lie between your cost (the floor) and the economic value to the customer (the ceiling).',
      'Economic value to the customer equals the price of the best alternative (reference value) plus the value of what makes your offer better, minus the value of what makes it worse. A price below that value leaves the customer a surplus and gives a reason to buy; the firm chooses how much of the surplus to keep.',
      'Price changes must be judged on contribution, not revenue. When the contribution margin is m (as a fraction of the current price), a price cut of x needs a volume gain of x/(m - x) just to keep total contribution unchanged. A price rise of x can lose volume of up to x/(m + x) before contribution falls.',
      'Because the thresholds rise sharply for low-margin products, firms with thin margins are especially exposed to discounting.',
    ],
    formulas: [
      { name: 'Economic value to the customer', expr: 'EVC = Reference Price + Positive Differentiation - Negative Differentiation' },
      { name: 'Break-even volume gain for a price cut', expr: 'Volume Gain = Cut / (Margin - Cut)' },
      { name: 'Break-even volume loss for a price rise', expr: 'Volume Loss = Rise / (Margin + Rise)' },
      { name: 'Contribution index', expr: '(Margin + Price Change) x (1 + Volume Change) / Margin' },
    ],
    realWorld: 'Industrial suppliers of a machine that cuts a customer\'s energy bill price against the savings delivered, not against their manufacturing cost.',
    misconceptions: [
      'Higher volume always justifies a lower price. It must be enough volume to cover the lost margin per unit.',
      'A price cut that raises revenue raises profit. Profit depends on contribution, which can fall even when revenue rises.',
      'Cost determines the right price. Cost only sets the floor.',
    ],
    workedExamples: [
      {
        title: 'Economic value to the customer',
        given: ['Best alternative costs the customer $100', 'Our product saves $30 of labour and costs $5 more to set up'],
        steps: ['EVC = 100 + 30 - 5 = $125', 'A price of $115 would share $10 of surplus with the customer and keep $15 of the value above the reference price'],
        result: 'The price ceiling is $125; pricing at $115 leaves the customer a $10 gain.',
      },
      {
        title: 'Volume needed after a price cut',
        given: ['Price $100, unit variable cost $60 (margin 40%)', 'Price cut of 10%'],
        steps: [
          'New contribution per unit = 90 - 60 = $30 instead of $40',
          'Volume must rise by 40/30 - 1 = 33.3%, or by the formula 10 / (40 - 10) = 33.3%',
        ],
        result: 'A 10% price cut needs a 33.3% volume increase to maintain total contribution.',
      },
    ],
  },
  'l21-customer-economics': {
    title: 'Customer Economics: CAC and Lifetime Value',
    summary: 'What a customer costs to win and is worth over time.',
    objectives: [
      'Calculate customer acquisition cost (CAC).',
      'Estimate customer lifetime and lifetime value (CLV) with a constant churn rate.',
      'Use the LTV/CAC ratio and payback period to compare acquisition channels.',
      'Recognise the limits of these metrics.',
    ],
    explanation: [
      'Marketing is an investment: money is spent to win customers who then generate margin over time. Customer acquisition cost is the total sales and marketing spend divided by the number of new customers it won.',
      'If a fraction of customers (the churn rate) leaves each period, the expected lifetime is 1 divided by the churn rate. Multiplying the margin per period by the lifetime gives a simple customer lifetime value. Halving churn doubles lifetime and value.',
      'The ratio of lifetime value to CAC shows the return on acquisition; a common benchmark is at least 3. The payback period, CAC divided by margin per period, shows how long cash is tied up before the customer repays the cost.',
      'These metrics are estimates. Churn is uncertain, especially for new products; lifetime values are undiscounted in this simple form; and averages hide differences between cohorts. A high ratio with a long payback can still starve a business of cash.',
    ],
    formulas: [
      { name: 'CAC', expr: 'CAC = Acquisition Spend / New Customers' },
      { name: 'Lifetime', expr: 'Lifetime = 1 / Churn Rate' },
      { name: 'Customer lifetime value', expr: 'CLV = Margin per Period x Lifetime' },
      { name: 'LTV/CAC', expr: 'Ratio = CLV / CAC' },
      { name: 'Payback', expr: 'Payback = CAC / Margin per Period' },
    ],
    realWorld: 'Subscription businesses such as streaming or software firms track CAC, churn and payback monthly, and cut channels where payback is too long for their cash position.',
    misconceptions: [
      'Lower CAC is always better. A cheaper channel can bring customers who leave quickly.',
      'LTV is a fact. It is a forecast based on assumed churn and margin.',
      'A ratio above 3 means the business is healthy. Payback and cash flow must also work.',
    ],
    workedExamples: [
      {
        title: 'CLV and payback',
        given: ['Revenue $50 per month, gross margin 60%', 'Monthly churn 5%', 'CAC $200'],
        steps: [
          'Margin per month = 50 x 0.60 = $30',
          'Lifetime = 1 / 0.05 = 20 months; CLV = 30 x 20 = $600',
          'LTV/CAC = 600 / 200 = 3.0; payback = 200 / 30 = 6.7 months',
        ],
        result: 'The customer is worth $600 against a $200 cost, recovered in about 6.7 months.',
      },
      {
        title: 'The value of retention',
        given: ['Same business; churn improves to 4% a month'],
        steps: ['Lifetime = 1 / 0.04 = 25 months', 'CLV = 30 x 25 = $750, up 25% from $600'],
        result: 'A one-point fall in churn raises customer value by 25% without changing price or margin.',
      },
    ],
  },
};

export const questions: Record<string, QuestionText> = {
  l19q1: {
    concept: 'Bases of segmentation',
    prompt: 'A telecom firm divides customers into heavy, medium and light users. Which basis of segmentation is this?',
    options: [
      { text: 'Demographic', why: 'Demographic segments are based on age, income, gender and similar attributes.' },
      { text: 'Psychographic', why: 'Psychographic segments rely on values, attitudes and lifestyle.' },
      { text: 'Behavioural', why: 'Correct - usage rate is a pattern of behaviour toward the product.' },
      { text: 'Geographic', why: 'Geographic segments are based on location.' },
    ],
    explanation: 'Grouping customers by how much they use a product is behavioural segmentation, often highly actionable because usage links directly to revenue.',
  },
  l19q2: { concept: 'Customers captured', prompt: 'A segment contains 40,000 potential customers and the firm expects to win a 15% share. How many customers will it win?', explanation: '40,000 x 0.15 = 6,000 customers.' },
  l19q3: { concept: 'Segment net contribution', prompt: 'A segment has 12,000 customers. The firm expects 25% penetration, a contribution of $80 per customer and $90,000 of targeting cost. What is the net contribution ($)?', explanation: 'Customers won = 12,000 x 0.25 = 3,000. Contribution = 3,000 x 80 = 240,000. Net = 240,000 - 90,000 = $150,000.', commonMistake: 'Forgetting to subtract the cost of targeting.' },
  l19q4: { concept: 'Break-even penetration', prompt: 'Using the same segment (12,000 customers, $80 contribution, $90,000 cost), what penetration (%) is needed to break even?', explanation: 'Customers needed = 90,000 / 80 = 1,125. Penetration = 1,125 / 12,000 = 9.375%.' },
  l19q5: {
    concept: 'Positioning',
    prompt: 'Which statement is the strongest positioning for a new electric-bike brand aimed at urban commuters?',
    options: [
      { text: 'We make high-quality bikes at fair prices for everyone', why: 'Too generic: no target, no point of difference.' },
      { text: 'For city commuters who want to arrive unsweaty, our bike is the only one with a 100 km range that folds to fit under a desk', why: 'Correct - it names the target, the frame of reference and a specific, credible point of difference.' },
      { text: 'We are the best bike company in the world', why: 'An unsupported claim with no target or proof.' },
      { text: 'Our bikes come in many colours', why: 'A feature that is easy to copy and unrelated to a customer need.' },
    ],
    explanation: 'Good positioning names the target, the category and a point of difference that customers value and the firm can prove.',
  },
  l19w1: {
    concept: 'Choosing between target segments',
    scenario: 'A fitness-app company must choose one segment to launch in. Students: 30,000 potential users, 20% expected penetration, $40 contribution per user, $120,000 targeting cost. Professionals: 8,000 potential users, 30% expected penetration, $150 contribution per user, $150,000 targeting cost. The brand is positioned as premium.',
    prompt: 'Write a short recommendation (4-6 sentences). Compute the net contribution for each segment, test how sensitive the answer is to the penetration estimate, consider strategic fit, and recommend one segment.',
    explanation: 'Self-assess against the rubric after writing your own answer; compare with the model answer.',
    modelAnswer: 'Students would win 30,000 x 20% = 6,000 users and a net contribution of 6,000 x 40 - 120,000 = $120,000. Professionals would win 8,000 x 30% = 2,400 users and a net contribution of 2,400 x 150 - 150,000 = $210,000, so professionals look better. The penetration estimates are uncertain: if professionals reach only 15% (1,200 users) the net falls to $30,000, and if students reach only 10% (3,000 users) the net is $0, so professionals remain ahead in the downside case. The professional segment also fits a premium positioning, whereas price-sensitive students may erode it. I would launch to professionals, validate the 30% assumption with a small pilot, and consider students later with a cheaper offer.',
    rubric: [
      'Computes both net contributions correctly ($120,000 and $210,000).',
      'Tests sensitivity to penetration (professionals $30,000 at 15%; students $0 at 10%).',
      'Considers strategic fit with the premium positioning.',
      'Recommends one segment clearly.',
      'Notes the uncertainty in the penetration estimate and suggests validating it.',
    ],
  },
  l20q1: {
    concept: 'Value-based versus cost-plus pricing',
    prompt: 'What is the main difference between cost-plus and value-based pricing?',
    options: [
      { text: 'Value-based pricing starts from the value the customer receives; cost-plus starts from the firm\'s cost', why: 'Correct - the price anchor differs, and value-based pricing sets cost as a floor only.' },
      { text: 'Cost-plus pricing always gives higher prices', why: 'Either method can give higher or lower prices.' },
      { text: 'Value-based pricing ignores costs entirely', why: 'Cost still sets the minimum acceptable price.' },
      { text: 'Cost-plus pricing considers competitors; value-based does not', why: 'Value-based pricing explicitly uses the competitor reference price.' },
    ],
    explanation: 'Value-based pricing anchors on customer value (with cost as the floor); cost-plus anchors on cost and may leave profit on the table or overshoot what customers will pay.',
  },
  l20q2: { concept: 'Economic value to the customer', prompt: 'The best alternative costs the customer $80. Our product adds $25 of value through better performance and subtracts $10 because installation is harder. What is the economic value to the customer ($)?', explanation: 'EVC = 80 + 25 - 10 = $95.' },
  l20q3: { concept: 'Break-even volume for a price cut', prompt: 'A product has a 40% contribution margin on its current price. By what percentage must volume rise to keep total contribution unchanged after a 10% price cut?', explanation: 'Volume gain = 10 / (40 - 10) = 33.3%. Check: contribution per unit falls from 40 to 30, so volume must rise by 40/30 - 1 = 33.3%.' },
  l20q4: { concept: 'Break-even volume for a price rise', prompt: 'A product has a 25% contribution margin on its current price. A 5% price rise is proposed. What is the largest volume loss (%) that can be tolerated before total contribution falls?', explanation: 'Maximum loss = 5 / (25 + 5) = 16.7%. Check: contribution per unit rises from 25 to 30, so volume can fall to 25/30 = 83.3%, a loss of 16.7%.' },
  l20q5: { concept: 'Sharing value with the customer', prompt: 'A product costs $70 and its economic value to the customer is $125. The firm wants to keep half of the surplus between cost and value. What price should it set ($)?', explanation: 'Surplus = 125 - 70 = 55. Price = 70 + 0.5 x 55 = $97.50.' },
  l20q6: {
    concept: 'Revenue versus contribution',
    scenario: 'A product sells at $100 with a unit variable cost of $60. A 10% price cut raises volume by 20%.',
    prompt: 'What happens?',
    options: [
      { text: 'Revenue and profit both rise by 8%', why: 'Revenue rises 8% (0.90 x 1.20), but profit depends on contribution.' },
      { text: 'Revenue and contribution both fall', why: 'Revenue rises; only contribution falls.' },
      { text: 'Contribution is unchanged', why: 'Contribution per unit fell from $40 to $30, and 1.2 x 30 = 36 is not 40.' },
      { text: 'Revenue rises 8% but total contribution falls 10%', why: 'Correct - contribution per unit drops from 40 to 30, and 30 x 1.2 = 36 versus 40, a 10% fall.' },
    ],
    explanation: 'Revenue index: 0.90 x 1.20 = 1.08 (+8%). Contribution index: (90 - 60) x 1.20 / 40 = 0.90 (-10%). Growth in revenue is not growth in profit.',
  },
  l21q1: {
    concept: 'Customer acquisition cost',
    prompt: 'What does customer acquisition cost (CAC) measure?',
    options: [
      { text: 'The total revenue per customer over their lifetime', why: 'That is closer to lifetime revenue or value, not cost.' },
      { text: 'The sales and marketing spend needed to win one new customer', why: 'Correct - CAC = acquisition spend divided by the number of new customers won.' },
      { text: 'The cost of producing one unit of the product', why: 'That is unit cost, not an acquisition cost.' },
      { text: 'The discount offered to existing customers', why: 'Discounts to existing customers are retention costs.' },
    ],
    explanation: 'CAC = total acquisition spend / new customers acquired in the period.',
  },
  l21q2: { concept: 'Computing CAC', prompt: 'A firm spends $150,000 on sales and marketing in a quarter and wins 500 new customers. What is the CAC ($)?', explanation: '150,000 / 500 = $300.' },
  l21q3: { concept: 'Customer lifetime', prompt: 'Monthly churn is 4%. What is the expected customer lifetime (months)?', explanation: '1 / 0.04 = 25 months.' },
  l21q4: { concept: 'Customer lifetime value', prompt: 'Each customer generates $25 of margin a month and monthly churn is 5%. What is the customer lifetime value ($)?', explanation: 'Lifetime = 1 / 0.05 = 20 months. CLV = 25 x 20 = $500.' },
  l21q5: { concept: 'LTV/CAC ratio', prompt: 'CLV is $500 and CAC is $250. What is the LTV/CAC ratio?', explanation: '500 / 250 = 2.0, below the common benchmark of 3.' },
  l21w1: {
    concept: 'Comparing acquisition channels',
    scenario: 'A start-up with limited cash can invest in one channel. Channel A: CAC $100, margin $20 a month per customer, monthly churn 10%. Channel B: CAC $300, margin $20 a month per customer, monthly churn 2%. The churn for B is based on only three months of data.',
    prompt: 'Write a short recommendation (4-6 sentences). Compute CLV, LTV/CAC and payback for both channels and say which you would choose and why.',
    explanation: 'Self-assess against the rubric after writing your own answer; compare with the model answer.',
    modelAnswer: 'For Channel A the lifetime is 1/0.10 = 10 months, so CLV is 20 x 10 = $200, LTV/CAC is 2.0 and payback is 100/20 = 5 months. For Channel B the lifetime is 1/0.02 = 50 months, so CLV is 20 x 50 = $1,000, LTV/CAC is 3.33 and payback is 300/20 = 15 months. B creates far more value per customer, but it ties up three times as much cash per customer for much longer, and its 2% churn rests on only three months of data and may be optimistic. Because cash is limited, I would start with A to fund growth, test B in a small pilot to see whether the low churn holds, and shift spending to B if it does. If the real churn of B were 5%, its lifetime would be 20 months and CLV $400, a ratio of only 1.33.',
    rubric: [
      'Computes CLV for both channels ($200 and $1,000).',
      'Computes LTV/CAC (2.0 and 3.33) and payback (5 and 15 months).',
      'Recognises the cash constraint and the long payback of B.',
      'Questions the reliability of B\'s churn estimate.',
      'Makes a clear recommendation, ideally a staged or pilot approach.',
    ],
  },
};
