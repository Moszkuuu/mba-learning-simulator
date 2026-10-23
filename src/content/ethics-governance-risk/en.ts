import type { LessonText, QuestionText } from '../types';

export const lessons: Record<string, LessonText> = {
  'l44-ethics-stakeholders': {
    title: 'Business Ethics and Stakeholders',
    summary: 'Reasoning about right and wrong when decisions affect many parties.',
    objectives: [
      'Contrast the shareholder and stakeholder views of the firm.',
      'Apply utilitarian, rights-based, justice and virtue reasoning to a decision.',
      'Use expected-cost analysis without letting it replace ethical judgement.',
      'Recognise conflicts of interest and pressures that lead to unethical behaviour.',
    ],
    explanation: [
      'Business decisions affect shareholders, employees, customers, suppliers, communities and the environment. The shareholder view says managers should maximise shareholder value within the law; the stakeholder view says they must balance the legitimate interests of all affected groups. In practice, long-term value usually depends on trust from customers, employees and regulators.',
      'Ethical frameworks give different lenses. Utilitarianism judges actions by total net benefit. Rights-based (deontological) ethics asks whether the action respects duties and rights, such as honesty, even if the outcome is beneficial. Justice asks whether benefits and burdens are distributed fairly. Virtue ethics asks what a person of good character would do. A good analysis uses several lenses and notes where they conflict.',
      'Quantitative analysis can inform ethical decisions: a recall may be justified by expected harm, and the break-even probability shows how small the chance of harm can be before it is worth acting. But numbers do not settle questions of rights and fairness, and a decision that is cheap in expectation can still be wrong.',
      'Unethical behaviour often arises from pressure (targets, bonuses), rationalisation ("everyone does it"), conflicts of interest and weak controls. Organisations reduce it through clear codes, tone from the top, safe channels for speaking up and incentives that do not reward cutting corners.',
    ],
    formulas: [
      { name: 'Utilitarian net benefit', expr: 'Net = (Gainers x Gain each) - (Losers x Loss each)' },
      { name: 'Expected cost of harm', expr: 'Expected Cost = Probability x (Direct Cost + Reputational Cost)' },
      { name: 'Break-even probability for action', expr: 'p* = Cost of Action / Cost of Harm' },
    ],
    realWorld: 'Product recalls are classic stakeholder decisions: companies that recalled quickly often preserved trust, while those that delayed faced larger penalties and lasting brand damage.',
    misconceptions: [
      'If it is legal it is ethical. Law sets a minimum; ethics may require more.',
      'Ethics and profit always conflict. Ethical conduct often protects long-term value, though not always in the short run.',
      'A cost-benefit calculation settles an ethical question. It informs it, but does not replace judgements about rights and fairness.',
    ],
    workedExamples: [
      {
        title: 'Utilitarian and expected-cost analysis',
        given: ['Option A: 100 people each gain 5 and 20 people each lose 15', 'A possible product defect: recall costs $4 million; if not recalled there is a 30% chance of harm costing $20 million plus $10 million of reputational damage'],
        steps: [
          'Net benefit of A = 100 x 5 - 20 x 15 = 500 - 300 = 200',
          'Expected cost of not recalling = 0.30 x (20 + 10) = $9 million, against $4 million to recall',
          'Break-even probability = 4 / 30 = 13.33%',
        ],
        result: 'The recall is justified even on a financial basis, since the probability of harm (30%) is well above the 13.33% break-even; rights-based reasoning also favours protecting customers.',
      },
      {
        title: 'Using several lenses',
        given: ['A manager can meet a target by hiding a known safety defect from regulators'],
        steps: [
          'Utilitarian: foreseeable harm to customers outweighs the benefit to the firm',
          'Rights-based: it breaches a duty of honesty and customers\' right to safety',
          'Virtue: honest professionals would not conceal it',
        ],
        result: 'All three lenses point the same way, which gives high confidence that concealment is wrong.',
      },
    ],
  },
  'l45-corporate-governance': {
    title: 'Corporate Governance and the Agency Problem',
    summary: 'How owners make sure managers act in their interest.',
    objectives: [
      'Explain the agency problem between owners and managers.',
      'Calculate who bears the cost of managerial perks given ownership.',
      'Value stock options and judge incentive designs.',
      'Describe the roles of the board, audit committee and internal controls.',
    ],
    explanation: [
      'In a large company the owners (shareholders) delegate control to managers, who act as their agents. Because managers bear only a fraction of the consequences of their decisions, they may pursue their own interests, such as perks, empire building or avoiding risk. These agency costs are reduced through monitoring, incentives and legal protections.',
      'If a manager owns 5% of a firm, a perk costing the firm $2 million costs the manager only $0.1 million, while the other shareholders bear $1.9 million. Greater managerial ownership aligns interests, but it may also entrench the manager.',
      'Boards of directors appoint and monitor management, approve strategy and set pay. Independent directors and an audit committee, supported by external auditors and internal controls, provide oversight over financial reporting and risk. Shareholder voting rights, disclosure rules and active investors add external discipline.',
      'Executive pay aims to align interests: stock and options reward share price growth. A stock option gives the right to buy at a strike price; its intrinsic value is the number of options times the excess of the stock price over the strike. Poorly designed pay can encourage short-termism or excessive risk, so multi-year performance measures, deferral and clawback provisions are common remedies.',
    ],
    formulas: [
      { name: 'Cost borne by the manager', expr: 'Manager\'s Share = Perk Cost x Ownership %' },
      { name: 'Cost borne by outsiders', expr: 'Outsiders\' Share = Perk Cost x (1 - Ownership %)' },
      { name: 'Option intrinsic value', expr: 'Value = Number of Options x max(0, Stock Price - Strike)' },
    ],
    realWorld: 'After major accounting scandals, many countries strengthened audit committee independence and required executives to certify financial statements personally.',
    misconceptions: [
      'The board runs the company day to day. It oversees management.',
      'Stock options always align managers with shareholders. They can also encourage excessive risk-taking, since options have no downside.',
      'Governance rules guarantee honest behaviour. They reduce, not eliminate, the risk.',
    ],
    workedExamples: [
      {
        title: 'Who pays for perks?',
        given: ['Manager owns 5% of the firm', 'Perks consumed cost the firm $2 million'],
        steps: ['Manager bears 0.05 x 2 = $0.1 million', 'Other shareholders bear 2 - 0.1 = $1.9 million'],
        result: 'The manager captures $2 million of benefit while bearing only $0.1 million of the cost: a strong incentive to over-consume perks.',
      },
      {
        title: 'Option value',
        given: ['100,000 options with a strike price of $20', 'Stock price $30'],
        steps: ['Intrinsic value = 100,000 x (30 - 20) = $1,000,000'],
        result: 'The options are worth at least $1 million; at a stock price of $20 or lower they would be worth nothing.',
      },
    ],
  },
  'l46-risk-management': {
    title: 'Enterprise Risk Management',
    summary: 'Identify, measure and respond to risks in proportion to what the firm can bear.',
    objectives: [
      'Classify risks and choose among avoid, reduce, transfer and accept responses.',
      'Compute expected loss and compare it with the cost of mitigation.',
      'Compute and interpret value at risk (VaR).',
      'Decide when a risk should be insured despite a premium above expected loss.',
    ],
    explanation: [
      'Enterprise risk management identifies the events that could prevent the firm from achieving its objectives, assesses their likelihood and impact, decides on a response and monitors results. Risks include strategic, financial, operational, compliance and reputational risk. A risk matrix ranks them by likelihood and impact, and the firm\'s risk appetite sets how much it will accept.',
      'Responses are: avoid (do not take the risk), reduce (controls, diversification), transfer (insurance, hedging, contracts) and accept (and plan for it). The expected loss of a risk is the probability times the impact. Insurance premiums usually exceed expected loss because insurers need to cover costs and profit, so insurance is mainly worth buying to protect against rare losses large enough to threaten the firm\'s survival.',
      'Value at risk (VaR) estimates the loss that will not be exceeded with a given confidence over a period. For normally distributed profit and loss with standard deviation sigma and zero mean, 95% VaR = 1.645 x sigma. Under the square-root-of-time rule, an n-day VaR is the one-day VaR times the square root of n. VaR says nothing about how bad losses can be beyond the threshold, so it is complemented by stress tests and scenario analysis.',
      'Risk management is a governance matter: boards set the appetite, management owns risks, an independent function monitors and internal audit assures. A good culture encourages people to raise problems early.',
    ],
    formulas: [
      { name: 'Expected loss', expr: 'Expected Loss = Probability x Impact' },
      { name: '95% one-period VaR (normal, zero mean)', expr: 'VaR = 1.645 x sigma' },
      { name: 'Multi-day VaR', expr: 'VaR(n days) = VaR(1 day) x square root of n' },
      { name: 'Risk responses', expr: 'Avoid, Reduce, Transfer, Accept' },
    ],
    realWorld: 'Airlines hedge fuel prices and insure aircraft because a few extreme events could threaten solvency, even though the expected cost of the insurance exceeds the expected loss.',
    misconceptions: [
      'Insurance is worthwhile only if the premium is below expected loss. It can be right when the loss would threaten survival.',
      'VaR gives the worst possible loss. It is the loss that will be exceeded with only a small probability.',
      'Risk should always be eliminated. Taking calculated risks is how firms create value.',
    ],
    workedExamples: [
      {
        title: 'Expected loss and ranking',
        given: ['Risk A: 10% chance of a $2 million loss', 'Risk B: 2% chance of a $20 million loss'],
        steps: ['A: 0.10 x 2 = $0.2 million', 'B: 0.02 x 20 = $0.4 million'],
        result: 'B has twice the expected loss, and its single-event impact is ten times larger, so it deserves more attention.',
      },
      {
        title: 'Value at risk',
        given: ['Daily profit and loss: mean 0, standard deviation $1.0 million'],
        steps: ['95% one-day VaR = 1.645 x 1.0 = $1.645 million', '10-day VaR = 1.645 x square root of 10 = $5.20 million'],
        result: 'On 95% of days the loss should not exceed $1.645 million; over 10 days the threshold is $5.20 million.',
      },
    ],
  },
};

export const questions: Record<string, QuestionText> = {
  l44q1: {
    concept: 'Stakeholders',
    prompt: 'Which of the following best defines a stakeholder?',
    options: [
      { text: 'Only a person who owns shares in the company', why: 'That is a shareholder, a subset of stakeholders.' },
      { text: 'Only the company\'s employees', why: 'Employees are stakeholders, but so are others.' },
      { text: 'Any group or individual that can affect or be affected by the firm\'s actions', why: 'Correct - this includes customers, employees, suppliers, communities, owners and regulators.' },
      { text: 'Only a lender to the company', why: 'Lenders are one of many stakeholder groups.' },
    ],
    explanation: 'Stakeholders are all parties with a legitimate interest in, or influence over, the firm.',
  },
  l44q2: { concept: 'Utilitarian net benefit', prompt: 'An action gives 100 people a benefit of 5 each and imposes a harm of 15 each on 20 people. What is the total net benefit?', explanation: '100 x 5 - 20 x 15 = 500 - 300 = 200.' },
  l44q3: { concept: 'Expected cost of harm', prompt: 'If a defective product is not recalled there is a 30% chance of harm costing $20 million plus $10 million in reputational damage. What is the expected cost of not recalling ($ million)?', explanation: '0.30 x (20 + 10) = $9 million.' },
  l44q4: { concept: 'Break-even probability', prompt: 'A recall costs $4 million; the total cost of the harm if the defect is not addressed would be $30 million. At what probability of harm (%) is the recall break-even in expected-cost terms?', explanation: '4 / 30 = 13.33%.' },
  l44q5: {
    concept: 'Ethical frameworks',
    prompt: 'A manager reasons that lying to a customer is wrong even though it would increase profit and cause no visible harm. Which framework is being applied?',
    options: [
      { text: 'Utilitarianism, because the focus is on outcomes', why: 'Utilitarianism judges by consequences; this reasoning does not.' },
      { text: 'Rights-based (deontological) ethics, because the act itself breaches a duty of honesty', why: 'Correct - the act is judged wrong regardless of its outcome.' },
      { text: 'Pure profit maximisation', why: 'Profit maximisation would favour the lie.' },
      { text: 'Cost-benefit analysis', why: 'Cost-benefit analysis is outcome-based.' },
    ],
    explanation: 'Deontological reasoning evaluates the nature of the act and the duties involved, not only its consequences.',
  },
  l44w1: {
    concept: 'Pressure to manipulate results',
    scenario: 'A sales manager is $2 million short of the quarterly revenue target. The finance team suggests booking next quarter\'s confirmed orders now. The manager\'s bonus of $100,000 depends on hitting the target. Internal audit has a 20% chance of detecting the practice, and the estimated cost if detected (regulatory penalty, legal fees, dismissal and loss of reputation) is $5 million.',
    prompt: 'Write a short analysis (4-6 sentences). Compute the expected penalty versus the bonus, apply at least two ethical lenses, and recommend what the manager should do.',
    explanation: 'Self-assess against the rubric after writing your own answer; compare with the model answer.',
    modelAnswer: 'The expected penalty is 0.20 x 5,000,000 = $1.0 million, ten times the $100,000 bonus, so even a narrow self-interest calculation advises against the practice. Ethically, the plan is also wrong: it misleads investors and breaches a duty of honesty (a rights-based view), harms stakeholders who rely on accurate numbers (utilitarian), and is not what a person of integrity would do (virtue). The pressure from the target and the bonus is exactly the kind of situation in which rationalisation arises, so the manager should resist it. The manager should decline to book the revenue early, report the shortfall honestly, explain the real timing of the orders, and escalate the request to compliance or the audit committee if pressured, using any whistleblowing channel if necessary. The company should also review whether its targets and bonuses encourage such behaviour.',
    rubric: [
      'Computes the expected penalty ($1.0 million) and compares it with the $100,000 bonus.',
      'Applies at least two ethical lenses (rights, utilitarian, justice or virtue).',
      'Identifies pressure and rationalisation as drivers of the problem.',
      'Recommends not booking the revenue early and reporting accurately.',
      'Mentions escalation or speaking up, or a fix to incentives.',
    ],
  },
  l45q1: {
    concept: 'The agency problem',
    prompt: 'What is the agency problem in corporate governance?',
    options: [
      { text: 'Managers (agents) may act in their own interests rather than those of the owners (principals)', why: 'Correct - the separation of ownership and control creates conflicts of interest.' },
      { text: 'Shareholders cannot find enough managers', why: 'This is not what the agency problem describes.' },
      { text: 'Companies cannot raise capital from banks', why: 'This concerns financing, not agency.' },
      { text: 'Employees are paid too little', why: 'Pay level is unrelated to agency conflicts.' },
    ],
    explanation: 'The agency problem arises from delegation: agents have their own objectives and information that principals cannot easily monitor.',
  },
  l45q2: { concept: 'Share of cost borne by a manager', prompt: 'A manager owns 5% of the firm and consumes perks costing the firm $2 million. How much of the cost does the manager bear ($ million)?', explanation: '0.05 x 2 = $0.1 million.' },
  l45q3: { concept: 'Share of cost borne by outsiders', prompt: 'In the same situation, how much of the $2 million cost is borne by the other shareholders ($ million)?', explanation: '2 - 0.1 = $1.9 million.' },
  l45q4: { concept: 'Option intrinsic value', prompt: 'An executive holds 100,000 options with a strike price of $20. The stock price is $30. What is the intrinsic value of the options ($)?', explanation: '100,000 x (30 - 20) = $1,000,000.' },
  l45q5: {
    concept: 'Role of the audit committee',
    prompt: 'What is the main role of an independent audit committee?',
    options: [
      { text: 'To set the company\'s product strategy', why: 'Strategy is set by the board and management.' },
      { text: 'To manage the company\'s day-to-day finances', why: 'This is management\'s role.' },
      { text: 'To guarantee that the company makes a profit', why: 'No committee can guarantee profit.' },
      { text: 'To oversee financial reporting, internal controls and the relationship with external auditors', why: 'Correct - it provides independent oversight over the integrity of the numbers.' },
    ],
    explanation: 'The audit committee protects shareholders by overseeing reporting quality, controls and audit independence.',
  },
  l45q6: {
    concept: 'Short-termism in pay design',
    scenario: 'A CEO\'s bonus depends only on this year\'s earnings per share. The CEO cuts research spending and uses cash for share buybacks, lifting EPS by 8% this year, though the product pipeline weakens.',
    prompt: 'What is the best remedy?',
    options: [
      { text: 'Give the CEO more options', why: 'More options with short horizons could intensify the problem.' },
      { text: 'Pay the CEO a fixed salary only', why: 'This removes performance incentives altogether.' },
      { text: 'Use multi-year performance measures and deferred pay with clawback, so that long-term damage affects rewards', why: 'Correct - it aligns the CEO\'s rewards with sustained value.' },
      { text: 'Ban share buybacks', why: 'Buybacks are not the root cause; the incentive design is.' },
    ],
    explanation: 'Incentives drive behaviour. Longer measurement horizons, deferral and clawback reduce the reward for actions that boost short-term results at the expense of long-term value.',
  },
  l46q1: {
    concept: 'Risk responses',
    prompt: 'A company buys insurance against fire damage to its warehouse. Which risk response is this?',
    options: [
      { text: 'Avoid', why: 'Avoidance means not taking the risk at all.' },
      { text: 'Transfer', why: 'Correct - insurance transfers the financial consequence to an insurer.' },
      { text: 'Accept', why: 'Acceptance would mean bearing the loss itself.' },
      { text: 'Reduce', why: 'Reduction would mean sprinklers or fire barriers that lower likelihood or impact.' },
    ],
    explanation: 'The four responses are avoid, reduce, transfer and accept. Insurance and hedging are forms of transfer.',
  },
  l46q2: { concept: 'Expected loss', prompt: 'Risk A has a 10% chance of a $2 million loss. What is its expected loss ($ million)?', explanation: '0.10 x 2 = $0.2 million.' },
  l46q3: { concept: 'Expected loss', prompt: 'Risk B has a 2% chance of a $20 million loss. What is its expected loss ($ million)?', explanation: '0.02 x 20 = $0.4 million.' },
  l46q4: { concept: 'Value at risk', prompt: 'Daily profit and loss is normally distributed with a mean of zero and a standard deviation of $1.0 million. What is the 95% one-day VaR ($ million, use 1.645)?', explanation: '1.645 x 1.0 = $1.645 million (about 1.65).' },
  l46q5: { concept: 'Scaling VaR over time', prompt: 'Using the square-root-of-time rule and the one-day VaR of $1.645 million, what is the 10-day 95% VaR ($ million)?', explanation: '1.645 x square root of 10 = 1.645 x 3.162 = $5.20 million.' },
  l46w1: {
    concept: 'When to insure',
    scenario: 'A company faces a 2% annual chance of a $20 million loss from a supplier failure. An insurer offers cover for an annual premium of $0.6 million. The company has equity of $15 million and its risk appetite statement says that it will not accept any single event that could threaten solvency.',
    prompt: 'Write a short recommendation (4-6 sentences). Compute the expected loss, compare it with the premium, explain whether to insure, and mention one alternative or complement.',
    explanation: 'Self-assess against the rubric after writing your own answer; compare with the model answer.',
    modelAnswer: 'The expected annual loss is 0.02 x $20 million = $0.4 million, so the $0.6 million premium is $0.2 million more than the expected loss, a 50% loading. On expected value alone, insurance looks poor. However, the loss of $20 million exceeds the company\'s equity of $15 million, so the event would threaten solvency, which the risk appetite statement does not permit. Insurance is therefore justified: the extra $0.2 million is the price of removing a potentially fatal tail risk. I would buy the cover, check the terms for exclusions and deductibles, and reduce the underlying risk by qualifying a second supplier, which might also allow a lower premium over time.',
    rubric: [
      'Computes the expected loss ($0.4 million) and the premium loading ($0.2 million or 50%).',
      'Notes that expected value alone does not favour insurance.',
      'Recognises that the loss exceeds equity ($20 million versus $15 million) and threatens survival.',
      'Recommends insurance with reference to risk appetite.',
      'Suggests a complementary risk-reduction measure or checks the policy terms.',
    ],
  },
};
