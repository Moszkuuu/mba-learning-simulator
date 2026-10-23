import type { LessonText, QuestionText } from '../types';

export const lessons: Record<string, LessonText> = {
  'l15-demand-elasticity': {
    title: 'Demand and Price Elasticity',
    summary: 'How strongly customers react when you change the price.',
    objectives: [
      'Interpret a demand curve and the factors that shift it.',
      'Calculate price elasticity of demand (arc, midpoint and point).',
      'Predict the effect of a price change on revenue.',
      'Explain why a profit-maximising firm avoids the inelastic part of its demand curve.',
    ],
    explanation: [
      'Demand describes how much customers will buy at each price, holding other factors constant. A change in price moves you along the curve; a change in income, tastes, the price of related goods or the number of buyers shifts the whole curve.',
      'Price elasticity of demand is the percentage change in quantity divided by the percentage change in price. It is negative for normal goods. Demand is elastic when its size (ignoring the sign) exceeds 1, unit elastic at 1 and inelastic below 1. Elasticity is higher when good substitutes exist, when the good is a large share of budget and when buyers have time to adjust.',
      'Elasticity tells you what a price change does to revenue. If demand is elastic, a price cut raises revenue; if inelastic, a price rise raises revenue. For a linear demand curve elasticity changes along the curve, so it must be computed at the price you care about (point elasticity) or between two prices using the midpoint formula.',
      'Because a rational monopolist sets marginal revenue equal to marginal cost, and marginal revenue is negative when demand is inelastic, a profit-maximising firm never chooses a price on the inelastic part of demand; it can always raise price, sell less, and save cost.',
    ],
    formulas: [
      { name: 'Price elasticity', expr: 'E = % Change in Quantity / % Change in Price' },
      { name: 'Midpoint elasticity', expr: 'E = [(Q2 - Q1) / ((Q1 + Q2)/2)] / [(P2 - P1) / ((P1 + P2)/2)]' },
      { name: 'Point elasticity (linear demand Q = a - bP)', expr: 'E = -b x P / Q' },
      { name: 'Revenue effect', expr: 'New Revenue / Old Revenue = (1 + % Change in Price) x (1 + % Change in Quantity)' },
    ],
    realWorld: 'Petrol demand is inelastic in the short run (few substitutes), so fuel taxes raise revenue; airline leisure travel is elastic, which is why discount fares fill empty seats.',
    misconceptions: [
      'Elasticity is the slope of the demand curve. Slope depends on units; elasticity is a unit-free ratio of percentage changes.',
      'Inelastic demand means no reaction to price. It means a smaller percentage reaction than the percentage price change.',
      'A price rise always increases revenue. It only does so when demand is inelastic.',
    ],
    workedExamples: [
      {
        title: 'Elasticity and revenue',
        given: ['Price rises from $10 to $12 (+20%)', 'Quantity falls from 1,000 to 850 units (-15%)'],
        steps: [
          'E = -15% / 20% = -0.75, so demand is inelastic',
          'Revenue before = 10 x 1,000 = $10,000; after = 12 x 850 = $10,200',
        ],
        result: 'With inelastic demand the price rise increased revenue by $200.',
      },
      {
        title: 'Price cut with elastic demand',
        given: ['E = -2', 'Price cut of 5%'],
        steps: [
          'Quantity change = -2 x (-5%) = +10%',
          'New revenue / old revenue = 0.95 x 1.10 = 1.045, a rise of 4.5%',
        ],
        result: 'When demand is elastic, cutting price by 5% raises revenue by 4.5%.',
      },
    ],
  },
  'l16-costs-marginal': {
    title: 'Costs and Marginal Analysis',
    summary: 'Find the output and price that maximise profit.',
    objectives: [
      'Distinguish marginal, average, fixed and variable cost.',
      'Apply the rule marginal revenue equals marginal cost.',
      'Compute profit-maximising output, price and profit for a linear demand curve.',
      'Decide whether to continue operating in the short run when price falls.',
    ],
    explanation: [
      'Marginal cost is the extra cost of producing one more unit; marginal revenue is the extra revenue it brings. A firm increases profit by expanding output as long as marginal revenue exceeds marginal cost, and stops where they are equal. Past that point each extra unit costs more than it earns.',
      'For a firm with market power, marginal revenue falls faster than price because selling more requires a lower price on all units. With linear demand P = a - bQ, marginal revenue is MR = a - 2bQ. Setting MR = MC gives the optimal quantity, and the price is then read from the demand curve.',
      'Fixed costs do not affect the marginal decision. They determine whether total profit is positive, but not the best output. Sunk fixed costs should be ignored when deciding what to produce.',
      'In the short run a firm should keep producing as long as price covers average variable cost: each unit then contributes something toward fixed costs that are owed anyway. It should shut down only if price is below average variable cost.',
    ],
    formulas: [
      { name: 'Marginal cost', expr: 'MC = Change in Total Cost / Change in Quantity' },
      { name: 'Profit-maximising rule', expr: 'Produce where MR = MC' },
      { name: 'Linear demand P = a - bQ', expr: 'MR = a - 2bQ, so Q* = (a - MC) / (2b)' },
      { name: 'Profit', expr: 'Profit = (P - MC) x Q - Fixed Cost, for constant MC' },
    ],
    realWorld: 'A hotel with high fixed costs and low marginal cost per occupied room cuts its price for last-minute bookings: any price above the small marginal cost of cleaning and utilities adds profit.',
    misconceptions: [
      'Maximise profit by minimising average cost. Profit depends on the gap between marginal revenue and marginal cost.',
      'Fixed costs should be recovered in every price decision. Once incurred they do not change the optimal output.',
      'A firm making a loss should shut down immediately. In the short run it should continue if price exceeds average variable cost.',
    ],
    workedExamples: [
      {
        title: 'Profit maximisation with linear demand',
        given: ['Inverse demand P = 100 - 2Q', 'Total cost TC = 200 + 20Q (fixed cost $200, marginal cost $20)'],
        steps: [
          'MR = 100 - 4Q; set MR = MC: 100 - 4Q = 20, so Q = 20',
          'Price = 100 - 2 x 20 = $60',
          'Revenue = 60 x 20 = $1,200; cost = 200 + 20 x 20 = $600; profit = $600',
        ],
        result: 'Produce 20 units at $60 for a profit of $600.',
      },
      {
        title: 'Checking neighbouring outputs',
        given: ['Same demand and cost as above'],
        steps: [
          'At Q = 22: price = 56, revenue = 1,232, cost = 640, profit = $592',
          'At Q = 18: price = 64, revenue = 1,152, cost = 560, profit = $592',
        ],
        result: 'Both neighbouring outputs earn less than $600, confirming that Q = 20 is the maximum.',
      },
    ],
  },
  'l17-market-structure': {
    title: 'Market Structure and Pricing Power',
    summary: 'How much control a firm has over price, and why.',
    objectives: [
      'Contrast perfect competition, monopoly, monopolistic competition and oligopoly.',
      'Compute the Lerner index of market power.',
      'Apply the inverse-elasticity markup rule.',
      'Predict how more substitutes or entry change price and markup.',
    ],
    explanation: [
      'Market structure describes the number and size of sellers, product differentiation and barriers to entry. In perfect competition many sellers offer identical products and each is a price taker: it can sell any quantity at the market price, so price equals marginal cost and long-run profit is zero.',
      'A monopolist faces the whole demand curve and sets price above marginal cost. In monopolistic competition many firms sell differentiated products and have some pricing power, but entry erodes profit. In oligopoly a few firms dominate and each firm\'s best price depends on its rivals\' behaviour.',
      'The Lerner index (P - MC)/P measures market power: zero under perfect competition, higher when demand is less elastic. A firm with constant marginal cost maximises profit by pricing so that (P - MC)/P = -1/E, which gives P = MC / (1 + 1/E) for elastic demand (E below -1).',
      'The more close substitutes buyers have, the more elastic demand and the lower the markup. Entry barriers (patents, scale economies, switching costs, brands) sustain pricing power; their erosion pushes price toward marginal cost.',
    ],
    formulas: [
      { name: 'Lerner index', expr: 'L = (P - MC) / P' },
      { name: 'Markup rule', expr: '(P - MC) / P = -1 / E' },
      { name: 'Optimal price', expr: 'P = MC / (1 + 1/E), for E < -1' },
    ],
    realWorld: 'Generic drug entry after a patent expires sharply raises the elasticity of demand for the original brand, and prices fall toward marginal cost.',
    misconceptions: [
      'A monopolist can charge any price. It is constrained by the demand curve: a higher price reduces quantity.',
      'Zero economic profit means a firm is failing. It means the firm earns a normal return, which is what competition delivers.',
      'Oligopolists set prices independently. Their payoffs depend on rivals\' choices.',
    ],
    workedExamples: [
      {
        title: 'Markup pricing',
        given: ['Marginal cost $20', 'Price elasticity of demand -4'],
        steps: [
          'Lerner index = -1/E = 0.25',
          'P = MC / (1 + 1/E) = 20 / (1 - 0.25) = $26.67',
        ],
        result: 'The profit-maximising price is $26.67, a 33% markup on marginal cost.',
      },
      {
        title: 'Entry makes demand more elastic',
        given: ['Marginal cost $20', 'Before entry E = -2; after rivals enter E = -5'],
        steps: [
          'Before: P = 20 / (1 - 0.5) = $40',
          'After: P = 20 / (1 - 0.2) = $25',
        ],
        result: 'Entry lowers the optimal price from $40 to $25 as pricing power erodes.',
      },
    ],
  },
  'l18-game-theory': {
    title: 'Strategic Interaction and Game Theory',
    summary: 'Decisions when your best move depends on what rivals do.',
    objectives: [
      'Represent a strategic situation as a payoff matrix.',
      'Identify dominant strategies and Nash equilibria.',
      'Explain why rational firms can end up worse off (prisoner\'s dilemma).',
      'Assess whether a threat is credible and how commitment changes outcomes.',
    ],
    explanation: [
      'When a few firms interact, each firm\'s profit depends on its rivals\' choices. Game theory models this with players, strategies and payoffs. A payoff matrix lists each player\'s payoff for every combination of choices.',
      'A dominant strategy is best whatever the rival does. A Nash equilibrium is a set of strategies where no player can gain by changing its own choice alone. In the prisoner\'s dilemma each firm has a dominant strategy to cut price, so both cut and both earn less than if they had cooperated.',
      'Games may have several equilibria (coordination games) or none in pure strategies. If a player randomises, expected payoffs are probability-weighted averages.',
      'In sequential games, use backward induction: work out what each player would do at the last decision, then step back. A threat is credible only if carrying it out is in the threatener\'s interest when the time comes. Credibility can be created by commitment, such as irreversible capacity investment.',
    ],
    formulas: [
      { name: 'Nash equilibrium test', expr: 'No player can raise own payoff by changing only own strategy' },
      { name: 'Expected payoff', expr: 'E[Payoff] = Sum of Probability x Payoff' },
      { name: 'Backward induction', expr: 'Solve the last move first, then each earlier move given that behaviour' },
    ],
    realWorld: 'Airlines on a route often face a price-cutting dilemma; fare matching by competitors makes undercutting unprofitable unless a firm can commit to lower costs.',
    misconceptions: [
      'The Nash equilibrium is the best outcome for the players. It is only stable; it can leave everyone worse off.',
      'Threats always deter. Only credible threats do.',
      'Game theory predicts what irrational players do. It assumes players pursue their payoffs given what they expect rivals to do.',
    ],
    workedExamples: [
      {
        title: 'Pricing dilemma',
        given: ['Two airlines choose High or Low fares; payoffs in $ million (Airline A, Airline B)', 'High/High = (10, 10); High/Low = (2, 14); Low/High = (14, 2); Low/Low = (6, 6)'],
        steps: [
          'If B plays High, A earns 10 with High and 14 with Low, so Low is better',
          'If B plays Low, A earns 2 with High and 6 with Low, so Low is better: Low is dominant (the same for B)',
          'Nash equilibrium: Low/Low with payoffs (6, 6), total 12, against 20 if both kept High',
        ],
        result: 'Both choose Low and earn $6 million each, $8 million less in total than the cooperative outcome.',
      },
      {
        title: 'Entry deterrence',
        given: ['Entrant: stay out 0; enter and incumbent fights -2; enter and incumbent accommodates 4', 'Incumbent: entrant stays out 10; fights 3; accommodates 6'],
        steps: [
          'If the entrant enters, the incumbent compares fighting (3) with accommodating (6) and accommodates',
          'Anticipating this, the entrant compares staying out (0) with entering and being accommodated (4) and enters',
        ],
        result: 'The threat to fight is not credible; the outcome is entry and accommodation with payoffs (4, 6).',
      },
    ],
  },
};

export const questions: Record<string, QuestionText> = {
  l15q1: {
    concept: 'Meaning of elastic demand',
    prompt: 'Demand for a product is elastic at the current price. What happens to total revenue if the firm cuts its price?',
    options: [
      { text: 'Revenue falls, because each unit sells for less', why: 'This ignores the quantity response; with elastic demand quantity rises proportionally more.' },
      { text: 'Revenue is unchanged', why: 'That occurs only when demand is unit elastic.' },
      { text: 'Revenue rises, because the percentage rise in quantity exceeds the percentage fall in price', why: 'Correct - elastic means the quantity response is proportionally larger than the price change.' },
      { text: 'Revenue cannot be predicted without costs', why: 'Revenue depends on price and quantity; costs affect profit, not revenue.' },
    ],
    explanation: 'When the absolute value of elasticity exceeds 1, quantity changes by a larger percentage than price, so cutting price increases revenue.',
  },
  l15q2: { concept: 'Computing elasticity', prompt: 'An 8% rise in price causes quantity demanded to fall by 12%. What is the price elasticity of demand?', explanation: 'E = -12% / 8% = -1.5, so demand is elastic.', commonMistake: 'Dividing price change by quantity change (the inverse), which gives -0.67.' },
  l15q3: { concept: 'Midpoint elasticity', prompt: 'When price rises from $20 to $30, quantity falls from 600 to 450 units. Using the midpoint method, what is the price elasticity of demand?', explanation: 'Quantity change = -150 / 525 = -28.57%. Price change = 10 / 25 = 40%. E = -28.57% / 40% = -0.714, which rounds to -0.71.', commonMistake: 'Using the starting values instead of the averages gives a different answer for each direction of the change.' },
  l15q4: { concept: 'Revenue effect of a price cut', prompt: 'Demand has an elasticity of -2. If the firm cuts its price by 5%, by what percentage does revenue change?', explanation: 'Quantity rises 10%. New revenue is 0.95 x 1.10 = 1.045 times the old, a rise of 4.5%.' },
  l15q5: { concept: 'Point elasticity of linear demand', prompt: 'Demand is Q = 1,000 - 40P. What is the point elasticity at a price of $10?', explanation: 'At P = 10, Q = 1,000 - 400 = 600. E = -40 x 10 / 600 = -0.667, which rounds to -0.67.' },
  l15q6: {
    concept: 'Why profit maximisers avoid inelastic demand',
    scenario: 'A firm\'s market research shows that demand at its current price has an elasticity of -0.6. Its marginal cost is positive.',
    prompt: 'What does this imply about its pricing?',
    options: [
      { text: 'The price is optimal, since low elasticity shows customers are loyal', why: 'Loyalty does not make the price optimal; marginal revenue is negative at this price.' },
      { text: 'The price is too low: a 10% rise would cut quantity about 6% yet raise revenue about 3.4% and reduce costs, so profit would rise', why: 'Correct - with inelastic demand, raising price raises revenue and lowers cost, so profit increases.' },
      { text: 'The price is too high: it should be cut to raise revenue', why: 'Cutting price when demand is inelastic lowers revenue.' },
      { text: 'Elasticity has no bearing on profit', why: 'Elasticity determines marginal revenue and therefore the profit-maximising price.' },
    ],
    explanation: 'With E = -0.6, a 10% price rise reduces quantity about 6%: revenue factor 1.10 x 0.94 = 1.034 (+3.4%) while fewer units are produced, so costs fall. A profit-maximising firm prices where demand is elastic.',
  },
  l16q1: {
    concept: 'Profit-maximising rule',
    prompt: 'At what output does a firm with market power maximise profit?',
    options: [
      { text: 'Where marginal revenue equals marginal cost', why: 'Correct - below this output an extra unit adds more revenue than cost; above it, the reverse.' },
      { text: 'Where average cost is lowest', why: 'Minimum average cost is efficient scale, not necessarily the profit maximum.' },
      { text: 'Where price equals average cost', why: 'This is the zero-profit point, not the maximum.' },
      { text: 'Where total revenue is highest', why: 'Revenue maximisation ignores cost.' },
    ],
    explanation: 'Profit rises while MR > MC and falls when MR < MC, so it is maximised where they are equal.',
  },
  l16q2: { concept: 'Marginal cost', prompt: 'Total cost is $5,000 at 100 units and $5,030 at 101 units. What is the marginal cost of the 101st unit ($)?', explanation: '(5,030 - 5,000) / (101 - 100) = $30.' },
  l16q3: { concept: 'Profit-maximising output', prompt: 'Inverse demand is P = 100 - 2Q and marginal cost is a constant $20. What output maximises profit (units)?', explanation: 'MR = 100 - 4Q. Setting MR = MC: 100 - 4Q = 20, so Q = 20.', commonMistake: 'Setting price rather than marginal revenue equal to marginal cost (which would give Q = 40).' },
  l16q4: { concept: 'Profit-maximising price', prompt: 'With inverse demand P = 100 - 2Q and the optimal output of 20 units, what price should the firm charge ($)?', explanation: 'Read the price from the demand curve: P = 100 - 2 x 20 = $60.' },
  l16q5: { concept: 'Maximum profit', prompt: 'Demand is P = 100 - 2Q, marginal cost is $20 per unit and fixed cost is $200. What is the maximum profit ($)?', explanation: 'Q = 20, P = $60. Profit = (60 - 20) x 20 - 200 = 800 - 200 = $600.' },
  l16q6: {
    concept: 'Short-run shutdown decision',
    scenario: 'A factory has already paid for a lease with a fixed cost of $50,000 a month. Market price has fallen to $18 per unit. Average variable cost is $15 and average total cost is $22.',
    prompt: 'What should it do in the short run?',
    options: [
      { text: 'Shut down immediately, because price is below average total cost', why: 'Shutting down still leaves the fixed cost to be paid, so losses would be larger.' },
      { text: 'Raise output until price equals average total cost', why: 'Output cannot be chosen to change the market price in this situation.' },
      { text: 'Shut down, because it is making a loss', why: 'A loss alone does not justify shutting down if price exceeds variable cost.' },
      { text: 'Continue producing: each unit contributes $3 toward fixed costs that must be paid anyway', why: 'Correct - price $18 exceeds average variable cost $15, so operating loses less than shutting down.' },
    ],
    explanation: 'Fixed cost is sunk in the short run. Producing earns $3 per unit above variable cost, reducing the loss. The firm should shut down only if price falls below average variable cost.',
  },
  l17q1: {
    concept: 'Price takers in perfect competition',
    prompt: 'Which statement describes a firm in perfect competition?',
    options: [
      { text: 'It sets its own price because its product is unique', why: 'This describes a monopolist or a differentiated seller.' },
      { text: 'It takes the market price as given and can sell any quantity at that price', why: 'Correct - with many identical sellers, each firm is a price taker.' },
      { text: 'It earns large positive profit in the long run', why: 'Entry drives long-run economic profit to zero.' },
      { text: 'It faces no rivals', why: 'Perfect competition has very many rivals.' },
    ],
    explanation: 'In perfect competition each firm is too small to affect price, so it faces a horizontal demand curve at the market price.',
  },
  l17q2: { concept: 'Lerner index', prompt: 'A firm sells at $50 with a marginal cost of $30. What is its Lerner index, expressed as a percentage?', explanation: '(50 - 30) / 50 = 0.40 = 40%.', commonMistake: 'Dividing by marginal cost (66.7%), which is the markup on cost rather than the Lerner index.' },
  l17q3: { concept: 'Markup pricing rule', prompt: 'Marginal cost is $30 and the price elasticity of demand is -3. What is the profit-maximising price ($)?', explanation: 'P = 30 / (1 + 1/(-3)) = 30 / (1 - 0.3333) = 30 / 0.6667 = $45.' },
  l17q4: { concept: 'Markup pricing rule', prompt: 'Marginal cost is $40 and the price elasticity of demand is -5. What is the profit-maximising price ($)?', explanation: 'P = 40 / (1 - 0.2) = 40 / 0.8 = $50.' },
  l17q5: {
    concept: 'Oligopoly',
    prompt: 'Which market structure has a small number of large firms whose pricing decisions depend on each other?',
    options: [
      { text: 'Perfect competition', why: 'There are very many firms and none can influence price.' },
      { text: 'Monopoly', why: 'There is only one firm, so there are no rivals to react to.' },
      { text: 'Oligopoly', why: 'Correct - a few interdependent firms, where each firm\'s best choice depends on rivals.' },
      { text: 'Monopsony', why: 'This describes a single buyer, not a few sellers.' },
    ],
    explanation: 'Interdependence among a few large firms is the defining feature of oligopoly, and is analysed with game theory.',
  },
  l17q6: {
    concept: 'Effect of entry on pricing power',
    scenario: 'A firm with a marginal cost of $20 has demand with elasticity -2. A new rival product appears and demand elasticity becomes -5.',
    prompt: 'What happens to the profit-maximising price?',
    options: [
      { text: 'It falls from $40 to $25, because demand has become more elastic', why: 'Correct - P = 20/(1 - 1/2) = $40 before; P = 20/(1 - 1/5) = $25 after.' },
      { text: 'It rises, because the firm now faces competition', why: 'More competition makes demand more elastic and lowers the optimal markup.' },
      { text: 'It is unchanged, because marginal cost is unchanged', why: 'The optimal markup depends on elasticity as well as marginal cost.' },
      { text: 'It falls to $20, equal to marginal cost', why: 'The price falls toward marginal cost but stays above it unless demand is perfectly elastic.' },
    ],
    explanation: 'The markup rule P = MC/(1 + 1/E) gives $40 at E = -2 and $25 at E = -5: greater substitutability reduces pricing power.',
  },
  l18q1: {
    concept: 'Dominant strategy',
    prompt: 'What is a dominant strategy?',
    options: [
      { text: 'The strategy that gives the highest total payoff to all players', why: 'That describes a cooperative optimum, which may not be stable.' },
      { text: 'A strategy chosen by the larger firm', why: 'Firm size does not define dominance.' },
      { text: 'A strategy that is best only if rivals cooperate', why: 'A dominant strategy does not depend on rivals\' choices.' },
      { text: 'A strategy that gives the best payoff whatever the rival does', why: 'Correct - it is optimal against every possible action of the rival.' },
    ],
    explanation: 'A dominant strategy is the best reply to every rival action, so a rational player will use it without needing to predict the rival.',
  },
  l18q2: { concept: 'Equilibrium payoffs', prompt: 'In the pricing game High/High = (10, 10), High/Low = (2, 14), Low/High = (14, 2), Low/Low = (6, 6) (payoffs in $ million for A and B), the Nash equilibrium is Low/Low. What is the combined profit of the two firms in equilibrium ($ million)?', explanation: 'Low/Low gives 6 + 6 = $12 million.' },
  l18q3: { concept: 'Cost of non-cooperation', prompt: 'In the same game, the combined profit if both firms charged High would be $20 million. By how much is the combined profit lower at the Nash equilibrium ($ million)?', explanation: '20 - 12 = $8 million.' },
  l18q4: {
    concept: 'Counting Nash equilibria',
    scenario: 'In a coordination game the payoffs (A, B) are: A1/B1 = (5, 5); A1/B2 = (0, 0); A2/B1 = (0, 0); A2/B2 = (3, 3).',
    prompt: 'How many pure-strategy Nash equilibria does this game have?',
    options: [
      { text: 'None', why: 'At A1/B1 neither player gains by switching, so at least one exists.' },
      { text: 'Two: A1/B1 and A2/B2', why: 'Correct - at each of these, switching alone drops a player\'s payoff to 0.' },
      { text: 'One: A1/B1 only', why: 'A2/B2 is also stable: switching alone gives 0 instead of 3.' },
      { text: 'Four', why: 'The off-diagonal cells give each player a payoff of 0 and they would switch to improve.' },
    ],
    explanation: 'Both coordinated outcomes are Nash equilibria; the game illustrates that equilibrium need not be unique, nor the best equilibrium guaranteed.',
  },
  l18q5: { concept: 'Expected payoff', prompt: 'Firm A plays Up and earns $3 million if B plays Left and $1 million if B plays Right. B plays Left with probability 0.6. What is A\'s expected payoff ($ million)?', explanation: '0.6 x 3 + 0.4 x 1 = 1.8 + 0.4 = $2.2 million.' },
  l18w1: {
    concept: 'Credibility and commitment in entry deterrence',
    scenario: 'An incumbent earns $10 million if no one enters. If a rival enters, the incumbent earns $3 million if it fights (price war) or $6 million if it accommodates. The entrant earns $0 if it stays out, -$2 million if it enters and the incumbent fights, and $4 million if it enters and the incumbent accommodates. The incumbent can build extra capacity first. It costs $1 million in every outcome but raises the incumbent\'s profit from fighting by $4 million.',
    prompt: 'Write a short analysis (4-6 sentences). Say what happens without the capacity investment, explain why, and evaluate whether the investment is worthwhile.',
    explanation: 'Self-assess against the rubric after writing your own answer; compare with the model answer.',
    modelAnswer: 'Using backward induction, once the rival has entered the incumbent compares fighting (3) with accommodating (6) and accommodates, so its threat to fight is not credible. Knowing that, the entrant compares staying out (0) with entering and being accommodated (4) and enters; the outcome is entry with payoffs of 4 for the entrant and 6 for the incumbent. With the capacity investment, the incumbent\'s payoffs become: stay-out 10 - 1 = 9, fight 3 + 4 - 1 = 6 and accommodate 6 - 1 = 5. Now fighting (6) beats accommodating (5), so the threat is credible and the entrant, expecting -2, stays out. The incumbent then earns 9 instead of 6, so the investment is worthwhile because it commits the firm to fight, although it only works if the capacity is visible and irreversible.',
    rubric: [
      'Uses backward induction and shows the threat to fight is not credible (3 versus 6).',
      'States the no-investment outcome: entry and accommodation, payoffs (4, 6).',
      'Recalculates the incumbent\'s payoffs after the investment (9, 6 and 5).',
      'Concludes that fighting becomes credible, the entrant stays out and the incumbent earns 9 rather than 6.',
      'Notes that commitment must be visible and irreversible, or another sensible caveat.',
    ],
  },
};
