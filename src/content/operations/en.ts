import type { LessonText, QuestionText } from '../types';

export const lessons: Record<string, LessonText> = {
  'l22-process-analysis': {
    title: 'Process Analysis and Bottlenecks',
    summary: 'Find what limits output, and what improving it is really worth.',
    objectives: [
      'Compute the capacity of each step and of a whole process.',
      'Identify the bottleneck and compute utilisation.',
      'Apply Little\'s Law to relate inventory, throughput and flow time.',
      'Explain why improving a non-bottleneck step does not raise output.',
    ],
    explanation: [
      'A process turns inputs into outputs through a series of steps. The capacity of a step is the maximum rate it can sustain; for a step that takes t minutes per unit with w workers in parallel it is 60/t x w units per hour. The capacity of the process is the capacity of its slowest step, the bottleneck.',
      'Throughput can never exceed the bottleneck capacity. Utilisation of a step is the flow rate divided by its capacity, so non-bottleneck steps are less than fully used when the process runs at the bottleneck rate. Idle time at non-bottlenecks is normal and not necessarily waste.',
      'Little\'s Law connects three measures in a stable process: average inventory (work in process) equals throughput times average flow time. It lets a manager compute any one from the other two, and shows that cutting inventory shortens the time a unit spends in the system.',
      'Because only the bottleneck limits output, adding capacity at any other step gives no extra output until the bottleneck is relieved. Once it is relieved the bottleneck simply moves to the next slowest step, so improvement should be targeted and re-evaluated.',
    ],
    formulas: [
      { name: 'Step capacity', expr: 'Capacity = (60 / Minutes per Unit) x Workers, in units per hour' },
      { name: 'Process capacity', expr: 'Process Capacity = Minimum of Step Capacities' },
      { name: 'Utilisation', expr: 'Utilisation = Flow Rate / Capacity' },
      { name: 'Little\'s Law', expr: 'Average Inventory = Throughput x Average Flow Time' },
    ],
    realWorld: 'A restaurant kitchen may be limited by its grill rather than by the number of waiters; hiring more waiters does not increase the number of meals served.',
    misconceptions: [
      'Every resource should be 100% utilised. Fully loading non-bottlenecks only builds inventory and lengthens flow time.',
      'Improving any step improves output. Only improvement at the bottleneck does.',
      'Flow time equals the sum of processing times. It also includes waiting, which usually dominates.',
    ],
    workedExamples: [
      {
        title: 'Finding the bottleneck',
        given: ['Three steps in series with one worker each: 4, 6 and 5 minutes per unit'],
        steps: [
          'Capacities: 60/4 = 15, 60/6 = 10, 60/5 = 12 units per hour',
          'Process capacity = 10 units per hour; the bottleneck is step 2',
          'At 10 units per hour, utilisation is 10/15 = 66.7%, 100% and 10/12 = 83.3%',
        ],
        result: 'The process produces at most 10 units per hour, limited by step 2.',
      },
      {
        title: 'Relieving the bottleneck',
        given: ['Add a second worker at step 2 in the same process'],
        steps: [
          'Step 2 capacity becomes 60/6 x 2 = 20 units per hour',
          'New process capacity = minimum(15, 20, 12) = 12 units per hour, now limited by step 3',
        ],
        result: 'Output rises 20%, from 10 to 12 units per hour, and the bottleneck moves to step 3.',
      },
    ],
  },
  'l23-inventory-models': {
    title: 'Inventory Models: EOQ and Reorder Points',
    summary: 'How much to order and when, to balance cost and service.',
    objectives: [
      'Explain the trade-off between ordering cost and holding cost.',
      'Compute the economic order quantity and the annual cost at that quantity.',
      'Compute a reorder point with and without safety stock.',
      'Predict how the order quantity responds to changes in cost parameters.',
    ],
    explanation: [
      'Holding inventory costs money (capital, storage, insurance, obsolescence), but ordering also costs money (processing, setup, transport). Large, infrequent orders save ordering cost but raise average inventory; small, frequent orders do the opposite. The economic order quantity (EOQ) minimises their sum under constant, known demand.',
      'EOQ = square root of (2 x annual demand x cost per order / holding cost per unit per year). At the EOQ the annual ordering cost equals the annual holding cost, and the total is flat near the optimum, so small errors in the estimate are not costly.',
      'The reorder point is the stock level at which a new order is placed. With constant demand it equals demand during the lead time. When demand varies, safety stock is added to protect against stock-outs: safety stock = z x standard deviation of demand during lead time, where z reflects the desired service level (about 1.65 for 95%).',
      'The EOQ moves with the square root of demand and order cost, and inversely with the square root of holding cost. Lowering the cost of placing an order (for example through electronic ordering) therefore leads to smaller, more frequent orders.',
    ],
    formulas: [
      { name: 'EOQ', expr: 'Q* = square root of (2 x D x S / H)' },
      { name: 'Annual cost', expr: 'Cost = (D / Q) x S + (Q / 2) x H' },
      { name: 'Reorder point', expr: 'ROP = Demand per Period x Lead Time + Safety Stock' },
      { name: 'Safety stock', expr: 'SS = z x (Std Dev per Period x square root of Lead Time)' },
    ],
    realWorld: 'Retailers use reorder points per product at each store; fast-moving, low-value items get high service levels, while slow, expensive items are ordered in small lots.',
    misconceptions: [
      'Minimise the number of orders to cut cost. Fewer orders raise holding cost; the optimum balances both.',
      'Safety stock eliminates stock-outs. It reduces their probability to a chosen level.',
      'EOQ must be exact. The cost curve is flat near the optimum.',
    ],
    workedExamples: [
      {
        title: 'Economic order quantity',
        given: ['Annual demand 12,000 units', 'Cost per order $100', 'Holding cost $6 per unit per year'],
        steps: [
          'EOQ = square root of (2 x 12,000 x 100 / 6) = square root of 400,000 = 632.5 units',
          'Orders per year = 12,000 / 632.5 = 19.0',
          'Ordering cost = 1,897.37; holding cost = 632.5/2 x 6 = 1,897.37; total = $3,794.73',
        ],
        result: 'Order about 633 units about 19 times a year at a total cost of $3,794.73.',
      },
      {
        title: 'Reorder point with safety stock',
        given: ['Demand 40 units a day, standard deviation 8 units a day', 'Lead time 5 days', 'Service level 95% (z = 1.65)'],
        steps: [
          'Demand during lead time = 40 x 5 = 200 units',
          'Std dev during lead time = 8 x square root of 5 = 17.9',
          'Safety stock = 1.65 x 17.9 = 29.5; reorder point = 200 + 29.5 = 229.5',
        ],
        result: 'Place a new order when stock falls to about 230 units.',
      },
    ],
  },
  'l24-capacity-queues': {
    title: 'Capacity and Queues',
    summary: 'Why waiting lines grow so fast as utilisation approaches 100%.',
    objectives: [
      'Explain why queues form even when average capacity exceeds average demand.',
      'Compute utilisation and the main measures of a single-server (M/M/1) queue.',
      'Show how waiting time rises with utilisation.',
      'Decide how much spare capacity a service needs.',
    ],
    explanation: [
      'Queues form because arrivals and service times are variable. Even if the server can handle more than the average demand, a burst of arrivals or a long service creates a wait that cannot be recovered immediately. Waiting is therefore a consequence of variability and high utilisation, not just of insufficient capacity.',
      'For a single server with random arrivals at rate lambda and random service at rate mu (an M/M/1 queue), utilisation is rho = lambda / mu. The average number of customers in the system is L = rho / (1 - rho), the average number waiting is Lq = rho squared / (1 - rho), the average time in the system is W = 1 / (mu - lambda) and the average wait is Wq = Lq / lambda. The system is stable only if rho is less than 1.',
      'The relationship is highly non-linear. At 50% utilisation there is one customer in the system on average; at 80% there are four; at 95% there are nineteen. A small increase in load near capacity causes a very large increase in waiting.',
      'Managers therefore deliberately plan spare capacity, trading idle cost against waiting cost. Services with high costs of delay (emergency rooms, call centres) run at lower utilisation than assembly lines with buffer inventory.',
    ],
    formulas: [
      { name: 'Utilisation', expr: 'rho = lambda / mu' },
      { name: 'Customers in system (M/M/1)', expr: 'L = rho / (1 - rho)' },
      { name: 'Customers waiting', expr: 'Lq = rho^2 / (1 - rho)' },
      { name: 'Time in system', expr: 'W = 1 / (mu - lambda)' },
      { name: 'Wait before service', expr: 'Wq = Lq / lambda' },
    ],
    realWorld: 'Call centres staff to keep utilisation around 80-85%, because waits rise explosively beyond that, even though agents then spend time idle.',
    misconceptions: [
      'If capacity is greater than average demand there will be no queue. Variability still creates queues.',
      'Waiting time rises in proportion to load. It rises faster and faster as utilisation approaches 100%.',
      'Idle time is waste. In services, some idle capacity is the price of fast response.',
    ],
    workedExamples: [
      {
        title: 'An M/M/1 queue',
        given: ['Arrivals 8 per hour', 'Service rate 10 per hour'],
        steps: [
          'rho = 8/10 = 0.80',
          'L = 0.8/0.2 = 4 customers; Lq = 0.64/0.2 = 3.2',
          'W = 1/(10 - 8) = 0.5 hour = 30 minutes; Wq = 3.2/8 = 0.4 hour = 24 minutes',
        ],
        result: 'On average a customer spends 30 minutes in the system, of which 24 are spent waiting.',
      },
      {
        title: 'Adding capacity',
        given: ['Service rate raised to 12 per hour; arrivals still 8 per hour'],
        steps: [
          'rho = 8/12 = 0.667; L = 0.667/0.333 = 2 customers',
          'W = 1/(12 - 8) = 0.25 hour = 15 minutes',
        ],
        result: 'A 20% increase in capacity halves the average time in the system from 30 to 15 minutes.',
      },
    ],
  },
  'l25-quality': {
    title: 'Quality Management and Statistical Process Control',
    summary: 'Measure variation, tell signal from noise, and judge process capability.',
    objectives: [
      'Distinguish common-cause from special-cause variation.',
      'Compute defects per million opportunities (DPMO).',
      'Compute process capability indices Cp and Cpk and interpret them.',
      'Set control limits for a mean chart and interpret signals.',
    ],
    explanation: [
      'All processes vary. Common-cause variation is the natural, stable noise of the process; special-cause variation comes from identifiable events (a worn tool, a bad batch). Managers should not react to common-cause variation as if it were a problem, and should investigate special causes promptly. Mixing the two up (tampering) increases variation.',
      'A control chart plots a statistic over time with a centre line and limits at three standard errors either side. For the mean of samples of size n, the limits are mean plus or minus 3 x sigma / square root of n. A point outside the limits, or a systematic pattern, signals a special cause.',
      'Capability compares the process spread with the specification limits. Cp = (USL - LSL) / (6 sigma) shows potential capability if the process were centred. Cpk = minimum of (USL - mean, mean - LSL) / (3 sigma) takes centring into account; a Cpk well below Cp means the process is off-centre. Values of 1.33 or above are commonly required.',
      'Defect measures such as DPMO = defects / (units x opportunities per unit) x 1,000,000 let different processes be compared. Quality costs include prevention and appraisal costs and the much larger internal and external failure costs, so spending on prevention usually pays.',
    ],
    formulas: [
      { name: 'DPMO', expr: 'DPMO = Defects / (Units x Opportunities per Unit) x 1,000,000' },
      { name: 'Cp', expr: 'Cp = (USL - LSL) / (6 x sigma)' },
      { name: 'Cpk', expr: 'Cpk = min(USL - mean, mean - LSL) / (3 x sigma)' },
      { name: 'Control limits for the mean', expr: 'Limits = mean +/- 3 x sigma / square root of n' },
    ],
    realWorld: 'A bottling plant charts fill volume every hour; a run of points drifting upward prompts a check on the filling head before bottles go out of specification.',
    misconceptions: [
      'Any point away from the centre line needs action. Variation within the limits is normal.',
      'Control limits and specification limits are the same. Control limits describe what the process does; specification limits describe what the customer needs.',
      'A high Cp means the product is good. If the process is off-centre, Cpk can still be low.',
    ],
    workedExamples: [
      {
        title: 'Capability',
        given: ['Specification 10.0 plus or minus 0.3 (LSL 9.7, USL 10.3)', 'Process sigma 0.05, mean 10.05'],
        steps: [
          'Cp = (10.3 - 9.7) / (6 x 0.05) = 0.6/0.3 = 2.0',
          'Cpk = min(10.3 - 10.05, 10.05 - 9.7) / (3 x 0.05) = min(0.25, 0.35)/0.15 = 1.67',
        ],
        result: 'The process is highly capable (Cp 2.0), and still capable after allowing for being slightly off-centre (Cpk 1.67).',
      },
      {
        title: 'Control limits and DPMO',
        given: ['Mean 50, sigma 2, samples of 4', '25 defects found in 5,000 units, each with 4 opportunities for a defect'],
        steps: [
          'Standard error = 2 / square root of 4 = 1; limits = 50 +/- 3 = 47 to 53',
          'DPMO = 25 / (5,000 x 4) x 1,000,000 = 1,250',
        ],
        result: 'Sample means outside 47-53 signal a special cause; the process runs at 1,250 defects per million opportunities.',
      },
    ],
  },
};

export const questions: Record<string, QuestionText> = {
  l22q1: {
    concept: 'Bottleneck',
    prompt: 'What is the bottleneck of a process?',
    options: [
      { text: 'The step with the most workers', why: 'Number of workers alone does not determine capacity.' },
      { text: 'The step that costs the most', why: 'Cost does not determine the output rate.' },
      { text: 'The step with the lowest capacity, which limits the output of the whole process', why: 'Correct - process capacity equals the capacity of its slowest step.' },
      { text: 'The first step in the process', why: 'Position in the sequence does not matter; capacity does.' },
    ],
    explanation: 'The bottleneck is the resource with the smallest capacity; output of the whole process cannot exceed it.',
  },
  l22q2: { concept: 'Step capacity', prompt: 'A step takes 8 minutes per unit and has one worker. What is its capacity (units per hour)?', explanation: '60 / 8 = 7.5 units per hour.' },
  l22q3: { concept: 'Process capacity', prompt: 'Three steps in series take 4, 6 and 5 minutes per unit, each with one worker. What is the process capacity (units per hour)?', explanation: 'Step capacities are 15, 10 and 12 units per hour. The process capacity is the minimum: 10 units per hour.', commonMistake: 'Adding the capacities or averaging them.' },
  l22q4: { concept: 'Little\'s Law', prompt: 'A process has a throughput of 30 units per day and an average of 90 units in process. What is the average flow time (days)?', explanation: 'Flow time = inventory / throughput = 90 / 30 = 3 days.' },
  l22q5: { concept: 'Utilisation', prompt: 'A process runs at 10 units per hour. One step has a capacity of 12 units per hour. What is its utilisation (%)?', explanation: '10 / 12 = 83.3%.' },
  l22q6: {
    concept: 'Investing away from the bottleneck',
    scenario: 'In a process whose steps have capacities of 15, 10 and 12 units per hour, management considers spending $200,000 on a second machine that would double the capacity of step 1.',
    prompt: 'What is the effect on output?',
    options: [
      { text: 'None: step 2 remains the bottleneck at 10 units per hour', why: 'Correct - improving a non-bottleneck step cannot raise output.' },
      { text: 'Output doubles to 30 units per hour', why: 'Output cannot exceed the slowest step.' },
      { text: 'Output rises to 15 units per hour', why: 'The step 1 capacity was already 15; step 2 still limits at 10.' },
      { text: 'Output rises to 12 units per hour', why: 'Step 2 would have to be improved first before step 3 became the limit.' },
    ],
    explanation: 'Output stays at 10 units per hour; the money would be better spent at step 2, where it would raise output to 12 before step 3 became the limit.',
  },
  l23q1: {
    concept: 'Inventory cost trade-off',
    prompt: 'What does the economic order quantity balance?',
    options: [
      { text: 'Purchase price against selling price', why: 'EOQ does not involve selling prices.' },
      { text: 'Ordering cost against holding cost', why: 'Correct - larger orders cut ordering cost but raise holding cost, and EOQ minimises the sum.' },
      { text: 'Demand against supply', why: 'EOQ assumes demand is known and supply is available.' },
      { text: 'Labour cost against materials cost', why: 'These are not the costs balanced in EOQ.' },
    ],
    explanation: 'EOQ finds the order size that minimises the sum of annual ordering and holding costs.',
  },
  l23q2: { concept: 'EOQ', prompt: 'Annual demand is 4,000 units, each order costs $50 and holding costs $2.50 per unit per year. What is the EOQ (units)?', explanation: 'EOQ = square root of (2 x 4,000 x 50 / 2.5) = square root of 160,000 = 400 units.' },
  l23q3: { concept: 'Cost at the EOQ', prompt: 'With the same data (D = 4,000, S = $50, H = $2.50) and an order quantity of 400, what is the total annual ordering and holding cost ($)?', explanation: 'Ordering: 4,000/400 = 10 orders x 50 = 500. Holding: 400/2 x 2.5 = 500. Total = $1,000. The two components are equal at the EOQ.' },
  l23q4: { concept: 'Reorder point', prompt: 'Demand is 40 units a day and the lead time is 5 days. With no safety stock, what is the reorder point (units)?', explanation: '40 x 5 = 200 units.' },
  l23q5: { concept: 'Safety stock', prompt: 'The standard deviation of demand during lead time is 20 units and the firm wants a service level corresponding to z = 1.65. What is the safety stock (units, rounded to the nearest unit)?', explanation: '1.65 x 20 = 33 units.' },
  l23q6: {
    concept: 'Sensitivity of EOQ',
    scenario: 'A firm\'s order cost falls from $50 to $12.50 per order after it moves to electronic ordering. Demand (4,000 a year) and holding cost ($2.50) are unchanged. The old EOQ was 400 units.',
    prompt: 'What is the effect on the optimal order size and order frequency?',
    options: [
      { text: 'EOQ rises, with fewer orders', why: 'Cheaper orders make small orders more attractive, not less.' },
      { text: 'EOQ is unchanged, because demand and holding cost are unchanged', why: 'EOQ also depends on the order cost.' },
      { text: 'EOQ halves to 200 units and the number of orders doubles from 10 to 20 a year', why: 'Correct - EOQ varies with the square root of order cost; a quarter of the cost halves the EOQ.' },
      { text: 'EOQ falls to a quarter, 100 units', why: 'The EOQ falls with the square root of the cost, not in proportion to it.' },
    ],
    explanation: 'EOQ = square root of (2 x 4,000 x 12.50 / 2.5) = square root of 40,000 = 200 units. Orders per year = 4,000 / 200 = 20.',
  },
  l24q1: {
    concept: 'Why queues form',
    prompt: 'Why do queues form in a service even when its average capacity exceeds average demand?',
    options: [
      { text: 'Customers are impatient', why: 'Impatience affects abandonment, not why queues form.' },
      { text: 'The firm has too few managers', why: 'Management numbers are unrelated.' },
      { text: 'Service is always slower than arrivals', why: 'If this were true the queue would grow without limit.' },
      { text: 'Arrivals and service times vary, so temporary overloads occur', why: 'Correct - variability creates waiting that cannot be stored or recovered immediately.' },
    ],
    explanation: 'Variability in arrivals and service creates queues even when average capacity is sufficient; the effect worsens as utilisation approaches 100%.',
  },
  l24q2: { concept: 'Utilisation', prompt: 'Customers arrive at 6 per hour and the server can serve 8 per hour. What is the utilisation (%)?', explanation: '6 / 8 = 75%.' },
  l24q3: { concept: 'Customers in an M/M/1 system', prompt: 'Arrivals are 8 per hour and the service rate is 10 per hour. What is the average number of customers in the system?', explanation: 'rho = 0.8, so L = 0.8 / (1 - 0.8) = 4 customers.' },
  l24q4: { concept: 'Time in the system', prompt: 'With arrivals of 8 per hour and a service rate of 10 per hour, what is the average time a customer spends in the system (minutes)?', explanation: 'W = 1 / (10 - 8) = 0.5 hour = 30 minutes.' },
  l24q5: { concept: 'Effect of adding capacity', prompt: 'The service rate is raised to 12 per hour with arrivals unchanged at 8 per hour. What is the average number of customers in the system now?', explanation: 'rho = 8/12 = 0.667, so L = 0.667 / 0.333 = 2 customers.' },
  l24q6: {
    concept: 'Non-linear effect of utilisation',
    scenario: 'A service centre runs at 80% utilisation with, on average, 4 customers in the system. After a new marketing campaign, arrivals rise so that utilisation reaches 95%.',
    prompt: 'What is the best description of the effect on waiting?',
    options: [
      { text: 'The number in the system rises by about 19%, in line with the load', why: 'The relationship is not proportional.' },
      { text: 'The average number in the system rises from 4 to 19, nearly five times, from a 15-point rise in utilisation', why: 'Correct - L = 0.95/0.05 = 19 compared with 0.8/0.2 = 4.' },
      { text: 'The number in the system doubles', why: 'It rises far more than double.' },
      { text: 'Waiting is unchanged, since capacity has not changed', why: 'Waiting depends on utilisation, which has changed.' },
    ],
    explanation: 'In an M/M/1 queue L = rho/(1 - rho): 4 at 80% and 19 at 95%. Near capacity, small increases in load cause very large increases in waiting.',
  },
  l25q1: {
    concept: 'Common versus special cause variation',
    prompt: 'A control chart shows one sample mean far outside the control limits. What does this indicate?',
    options: [
      { text: 'A likely special cause that should be investigated', why: 'Correct - a point beyond the limits is unlikely under common-cause variation alone.' },
      { text: 'Normal common-cause variation', why: 'Common-cause variation stays within the limits almost all the time.' },
      { text: 'That the specification limits are too wide', why: 'Control limits and specification limits measure different things.' },
      { text: 'That the sample size was too large', why: 'Sample size does not explain a point outside the limits.' },
    ],
    explanation: 'Points beyond the control limits signal an assignable (special) cause such as a tool failure or a bad batch.',
  },
  l25q2: { concept: 'DPMO', prompt: '25 defects are found in 5,000 units, and each unit has 4 opportunities for a defect. What is the DPMO?', explanation: '25 / (5,000 x 4) x 1,000,000 = 1,250.' },
  l25q3: { concept: 'Process capability Cp', prompt: 'The specification is 9.7 to 10.3 and the process standard deviation is 0.05. What is Cp?', explanation: 'Cp = (10.3 - 9.7) / (6 x 0.05) = 0.6 / 0.3 = 2.0.' },
  l25q4: { concept: 'Process capability Cpk', prompt: 'The specification is 9.7 to 10.3, the process standard deviation is 0.05 and the mean is 10.05. What is Cpk?', explanation: 'Cpk = min(10.3 - 10.05, 10.05 - 9.7) / (3 x 0.05) = min(0.25, 0.35) / 0.15 = 1.67.' },
  l25q5: { concept: 'Upper control limit', prompt: 'A process has a mean of 50 and a standard deviation of 2. Samples of 4 are taken. What is the upper control limit for the sample mean?', explanation: 'Standard error = 2 / square root of 4 = 1. UCL = 50 + 3 x 1 = 53.' },
  l25q6: {
    concept: 'Interpreting Cp and Cpk',
    scenario: 'A process has Cp = 1.5 but Cpk = 0.8.',
    prompt: 'What is the most useful interpretation?',
    options: [
      { text: 'The process variation is too large and the machine should be replaced', why: 'A Cp of 1.5 shows that the spread is small relative to the tolerance.' },
      { text: 'The process is capable and perfectly centred', why: 'Perfect centring would give Cpk equal to Cp.' },
      { text: 'The process spread is small enough, but its mean is off-centre; re-centring should greatly improve capability', why: 'Correct - the gap between Cp and Cpk reveals the centring problem.' },
      { text: 'Both indices are low, so the process is hopeless', why: 'Cp is high, so the spread is not the problem.' },
    ],
    explanation: 'Cp measures spread against tolerance; Cpk also penalises being off-centre. A large gap means adjusting the mean is a cheap fix.',
  },
};
