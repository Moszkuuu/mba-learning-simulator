import type { LessonText } from '../types';

/**
 * Phase 3.1 pilot: three Financial Accounting lessons rewritten to the lesson standard
 * (simple idea -> why it matters -> how it works -> worked example -> what it means -> decisions -> check -> takeaways).
 * One running company, Sunrise Bakery (fictional), so the same numbers appear in all three lessons:
 * revenue 1,200,000; net profit 75,000; operating cash flow 45,000; cash up 5,000; total assets 655,000.
 * Assumptions used throughout: one year, 25% tax, tax and interest paid in cash in the year, no dividends, 365-day year.
 */
export const pilotLessons: Record<string, LessonText> = {
  'l2-operating-profit': {
    title: 'Operating Profit and Profit Margins: Reading the Income Statement',
    summary: 'Follow a bakery\'s sales down the profit ladder, read each margin, and see how profit connects to the other two statements.',
    objectives: [
      'Say what the income statement, the balance sheet and the cash flow statement each tell you.',
      'Build the profit ladder: gross profit, operating profit, profit before tax and net profit.',
      'Calculate and interpret gross, operating and net margins.',
      'Explain why a profitable year can still leave little extra cash.',
    ],
    explanation: [
      'Imagine you want to understand a friend\'s business, Sunrise Bakery. You would ask three questions. Did it make money this year? That is the income statement. What does it own and owe on one particular day? That is the balance sheet. Where did the cash come from and where did it go? That is the cash flow statement. They are three pictures of one business. Looking at only one of them can fool you.',
      'The income statement is a ladder. Start with revenue and take off one group of costs at each step. Revenue minus cost of goods sold (COGS) is gross profit: did the products earn more than they cost? Gross profit minus operating expenses (salaries, rent, marketing, utilities and depreciation) is operating profit: can the business also pay for running itself? Operating profit minus interest is profit before tax, and after tax is net profit. Interest comes below operating profit because it depends on how the business is financed, not on how good the business is.',
      'Each step has a margin, which is that profit divided by revenue. A high gross margin with a thin operating margin means overheads are eating the gain. A margin on its own says little; compare it with the same business last year and with similar businesses.',
      'The three statements are linked. If no dividends are paid, net profit is added to equity on the balance sheet, and the cash flow statement ends with the change in the cash line of the balance sheet. Profit counts a sale when it is made, but cash counts it only when the customer pays. That timing gap is why Sunrise earned 75,000 of profit but its cash rose by only 5,000. The next two lessons explain the gap.',
      'This course uses accrual accounting: revenue and costs are recorded when they are earned or incurred, not when cash moves. Unless a question says otherwise, assume one year, a 25% tax rate, and interest and tax paid in cash in the same year.',
    ],
    formulas: [
      { name: 'Gross profit', expr: 'Gross Profit = Revenue - COGS' },
      { name: 'Operating profit', expr: 'Operating Profit = Gross Profit - Operating Expenses' },
      { name: 'Net profit', expr: 'Net Profit = Operating Profit - Interest - Tax' },
      { name: 'Margin %', expr: 'Gross, Operating or Net Margin % = that profit / Revenue x 100' },
      { name: 'Markup vs margin', expr: 'Markup % = Profit / Cost x 100, while Margin % = Profit / Price x 100' },
      { name: 'Accounting equation', expr: 'Assets = Liabilities + Equity' },
    ],
    realWorld: 'Business models differ in structure: a supermarket usually earns a low margin on very high volume, while a luxury brand usually earns a high margin on lower volume. Neither is automatically better. Before quoting a real company\'s margins, read its latest annual report; this lesson uses a fictional bakery so that every number can be checked.',
    misconceptions: [
      'A high gross margin means a profitable business. Sunrise has a 40% gross margin but a 10% operating margin: running costs take 30 points of it.',
      'Profit is cash. Sunrise earned 75,000 of net profit but its cash rose by only 5,000.',
      'Interest is an operating expense. It is a financing cost below operating profit, so two firms with identical operations but different debt have the same operating profit.',
      'Margin and markup are the same thing. A product that costs 65 and sells for 100 has a 35% margin but a 53.8% markup.',
    ],
    workedExamples: [
      {
        title: 'Sunrise Bakery: the profit ladder',
        given: ['Revenue $1,200,000', 'COGS $720,000', 'Salaries $230,000, rent $60,000, marketing and utilities $40,000, depreciation $30,000', 'Interest $20,000', 'Tax rate 25%'],
        steps: [
          'Gross profit = 1,200,000 - 720,000 = $480,000 (gross margin 40%)',
          'Operating expenses = 230,000 + 60,000 + 40,000 + 30,000 = $360,000',
          'Operating profit = 480,000 - 360,000 = $120,000 (operating margin 10%)',
          'Profit before tax = 120,000 - 20,000 = $100,000',
          'Tax = 25% x 100,000 = $25,000, so net profit = $75,000 (net margin 6.25%)',
        ],
        result: 'Of every sales dollar, Sunrise keeps 40 cents after the products, 10 cents after running costs, and 6.25 cents after interest and tax.',
      },
      {
        title: 'Sunrise Bakery: how the statements connect',
        given: ['Net profit $75,000 and no dividends', 'Equity at the start of the year $310,000', 'Equipment at the start $300,000; $40,000 of new equipment bought; depreciation $30,000', 'Cash at the start $100,000 and at the end $105,000', 'At the end: receivables $150,000, inventory $90,000, payables $70,000, bank loan $200,000'],
        steps: [
          'Equity at the end = 310,000 + 75,000 = $385,000',
          'Equipment at the end = 300,000 + 40,000 - 30,000 = $310,000',
          'Cash change = 105,000 - 100,000 = $5,000',
          'Assets at the end = 105,000 + 150,000 + 90,000 + 310,000 = $655,000',
          'Liabilities plus equity = 70,000 + 200,000 + 385,000 = $655,000, so the balance sheet balances',
        ],
        result: 'The 75,000 of profit became equity, but only 5,000 became extra cash. The rest is tied up in customers\' unpaid bills and in stock, which the next two lessons explain.',
      },
    ],
    teaching: {
      why: 'A bank asks whether a loan can be repaid, which depends on profit and on cash. An owner asks why 75,000 of profit left the bank balance almost unchanged. A manager who reads only the income statement may celebrate record sales while the business quietly runs out of cash. Reading the three statements together is what makes the numbers useful.',
      terms: [
        { term: 'Revenue', meaning: 'What customers agreed to pay for what you delivered, counted when it is delivered.' },
        { term: 'COGS (cost of goods sold)', meaning: 'What the products you actually sold cost you to buy or make.' },
        { term: 'Gross profit', meaning: 'What is left after paying for the goods: revenue minus COGS.' },
        { term: 'Operating profit (EBIT)', meaning: 'Profit from running the business, before interest and tax.' },
        { term: 'Net profit', meaning: 'What belongs to the owners after everything, including interest and tax. Many books call it net income.' },
        { term: 'Accrual basis', meaning: 'Record a sale or a cost when it happens, not when cash moves.' },
      ],
      interpretation: [
        'A 40% gross margin says the bakery prices its products well above ingredient cost. The 10% operating margin says that running the shop uses three quarters of that gain.',
        'Whether a 6.25% net margin is good depends on the industry, last year\'s margin and the trend. A single number only starts the questions: why did it change, and can it last?',
        'Profit of 75,000 against a cash increase of 5,000 is the signal to read the cash flow statement next.',
      ],
      decisions: [
        'Raise prices by 5%: the margin on every unit improves, but volume may fall. With a 40% gross margin and fixed running costs, the gain is wiped out only if volume falls by more than about 11.1%. Ask whether your customers would really leave in that number.',
        'Cut marketing: operating profit rises now, but sales may fall later. Test the cut on one product or one month before applying it everywhere.',
        'Borrow to expand: interest lowers net profit but not operating profit. Borrow only if the extra operating profit comfortably exceeds the interest cost.',
      ],
      check: [
        { q: 'Revenue $800,000; COGS $520,000; operating expenses $200,000. What are the gross and operating margins?', a: 'Gross profit = 280,000, so gross margin = 35%. Operating profit = 80,000, so operating margin = 10%.' },
        { q: 'Two firms have the same operating profit, but one has a large bank loan. Which has the higher net profit, and why?', a: 'The one with less debt. Interest is deducted after operating profit, so more debt means more interest and less net profit.' },
        { q: 'A shop reports rising net profit but its bank balance keeps falling. Which two statements should you read, and what is one possible cause?', a: 'The balance sheet and the cash flow statement. For example, customers may be paying more slowly, so receivables are growing.' },
      ],
      takeaways: [
        'The three statements are three pictures of one business.',
        'The profit ladder: revenue minus COGS is gross profit, minus operating expenses is operating profit, minus interest and tax is net profit.',
        'A margin is profit divided by revenue. Compare it with the past and with similar firms.',
        'Profit is not cash. Read the cash flow statement next.',
      ],
      apply: 'Think of a small business you know, such as a cafe or a shop. Estimate its gross margin: what does a product cost to make or buy, and what does it sell for? Then list three running costs that sit below gross profit.',
    },
  },

  'l4-inventory-wc': {
    title: 'Inventory and Working Capital: Cash Tied Up in the Business',
    summary: 'Find out where a profitable business\'s cash went: customers\' unpaid bills, stock on the shelf, and what is owed to suppliers.',
    objectives: [
      'Explain working capital as money already spent and waiting to come back.',
      'Calculate DSO, DIO, DPO, the cash conversion cycle and trade working capital.',
      'Estimate how much cash a change in the number of days releases.',
      'Weigh the trade-offs of collecting faster, holding less stock and paying suppliers later.',
    ],
    explanation: [
      'Sunrise Bakery had a good year, yet its cash barely moved. Where did the money go? Look at the balance sheet. Customers owe Sunrise 150,000. Flour and cakes in stock cost 90,000. Sunrise owes its suppliers 70,000. The net amount, 170,000, is money the business has already spent and is still waiting to get back. This is working capital.',
      'Trade working capital is receivables plus inventory minus payables. Each part is driven by time. How long do customers take to pay? That is days sales outstanding (DSO). How long does stock sit before it is sold? That is days inventory outstanding (DIO). How long does Sunrise take to pay its suppliers? That is days payables outstanding (DPO).',
      'Add the first two and subtract the third and you get the cash conversion cycle (CCC): the number of days between paying for ingredients and being paid by the customer. A shorter cycle means less cash is tied up.',
      'Conventions used in this lesson: a 365-day year, ending balances, DSO measured against revenue, and DIO and DPO measured against COGS. Some analysts use the average of opening and closing balances, especially for turnover ratios. State which you use, and use the same one when you compare.',
      'Net working capital (current assets minus current liabilities) is a wider measure that also includes cash and short-term debt. Trade working capital looks only at the operating cycle.',
      'Growth uses cash. If sales rise 40% and the days stay the same, receivables and inventory also rise 40%, and that growth must be financed.',
    ],
    formulas: [
      { name: 'Trade working capital', expr: 'Trade Working Capital = Receivables + Inventory - Payables' },
      { name: 'Days sales outstanding', expr: 'DSO = Receivables / Revenue x 365' },
      { name: 'Days inventory outstanding', expr: 'DIO = Inventory / COGS x 365' },
      { name: 'Days payables outstanding', expr: 'DPO = Payables / COGS x 365' },
      { name: 'Cash conversion cycle', expr: 'CCC = DSO + DIO - DPO' },
      { name: 'Cash released by a change in days', expr: 'Cash = change in days x Revenue / 365 (DSO), or x COGS / 365 (DIO and DPO)' },
      { name: 'Inventory turnover', expr: 'Turnover = COGS / Inventory (use average inventory when the question says so)' },
    ],
    realWorld: 'Retailers that sell for cash and buy on credit can have a very short, even negative, cycle. Businesses that sell to other businesses on credit and hold many products usually have a long one. Compare a company only with others in its own industry, and read the notes to its annual report for how it measures the days.',
    misconceptions: [
      'More working capital is better. It is cash that is tied up. For a given level of sales, less is usually better, unless too little stock loses sales.',
      'A shorter cycle is always good. Pushing customers to pay faster or running with very low stock can lose customers or cause stockouts.',
      'Paying suppliers late is free money. Suppliers may charge more, cut your credit or stop supplying, and an early-payment discount may be worth more than the delay.',
      'Growing profit means growing cash. Sunrise\'s working capital rose from 110,000 to 170,000 in one year, which took 60,000 of cash that the profit could not provide.',
    ],
    workedExamples: [
      {
        title: 'Sunrise Bakery: the days and the cash conversion cycle',
        given: ['Revenue $1,200,000 and COGS $720,000 for the year', 'Receivables $150,000, inventory $90,000, payables $70,000 at the year end', 'A 365-day year and ending balances'],
        steps: [
          'DSO = 150,000 / 1,200,000 x 365 = 45.6 days',
          'DIO = 90,000 / 720,000 x 365 = 45.6 days',
          'DPO = 70,000 / 720,000 x 365 = 35.5 days',
          'CCC = 45.6 + 45.6 - 35.5 = about 56 days',
          'Trade working capital = 150,000 + 90,000 - 70,000 = $170,000',
        ],
        result: 'Sunrise waits about 56 days between paying for ingredients and collecting the cash from the sale, and 170,000 of its money is tied up in that wait.',
      },
      {
        title: 'Sunrise Bakery: what a plan is worth and what a discount costs',
        given: ['Sales $1,200,000 a year', 'Plan A: collect from customers 10 days faster', 'Offer B: a supplier gives 2% off if Sunrise pays in 10 days instead of 30', 'Sunrise can borrow at 11% a year'],
        steps: [
          'One day of sales = 1,200,000 / 365 = about 3,288',
          'Plan A releases 10 x 3,288 = about 32,900 of cash, once',
          'Offer B: paying 20 days early saves 2 on every 98 paid, about 2.04% for 20 days',
          'Annualised: 2.04% x 365 / 20 = about 37.2% a year',
          'That is far above the 11% borrowing cost, so taking the discount is cheaper than borrowing, if Sunrise has the cash or a credit line',
        ],
        result: 'Collecting 10 days faster releases about 32,900 once. The supplier discount is worth about 37.2% a year. Both help cash, and neither changes profit very much.',
      },
    ],
    teaching: {
      why: 'A profitable business can still run out of cash, because growth, slow customers and unsold stock tie money up. A manager who understands the cash conversion cycle can free cash without borrowing, and a lender looks at it to judge whether a loan will be repaid.',
      terms: [
        { term: 'Receivables', meaning: 'Money customers owe you for sales already made (accounts receivable).' },
        { term: 'Inventory', meaning: 'Goods held for sale. This course also calls it stock.' },
        { term: 'DSO', meaning: 'Days sales outstanding: the average number of days customers take to pay.' },
        { term: 'DIO', meaning: 'Days inventory outstanding: the average number of days stock waits before it is sold.' },
        { term: 'DPO', meaning: 'Days payables outstanding: the average number of days you take to pay suppliers.' },
        { term: 'Cash conversion cycle', meaning: 'Days from paying for goods to being paid by customers: DSO plus DIO minus DPO.' },
        { term: 'Trade working capital', meaning: 'Receivables plus inventory minus payables: operating money waiting to come back.' },
      ],
      interpretation: [
        'A cycle of about 56 days means little alone. Compare it with last year, with competitors and with your supplier terms. Rising days are an early warning, and falling days free cash.',
        'Look at which part moved. If DSO rises while sales growth is strong, customers may be buying your growth with longer credit. If DIO rises, stock may be piling up unsold.',
        'Days are averages. A few very late customers can hide inside a healthy-looking average, so ask for an aged list of receivables.',
      ],
      decisions: [
        'Collect faster: this releases cash but may annoy customers. Offer an early-payment discount only if its annualised cost is below your cost of borrowing.',
        'Hold less stock: this releases cash but risks stockouts. Cut the slow-selling items first and keep the fast sellers in stock.',
        'Pay suppliers later: this raises payables but may cost trust, discounts or priority. The best policy depends on how much the supplier needs you.',
      ],
      check: [
        { q: 'Receivables are 300,000 and revenue is 3,650,000. What is DSO?', a: '300,000 / 3,650,000 x 365 = 30 days.' },
        { q: 'DSO is 40, DIO is 60 and DPO is 30. What is the cash conversion cycle? If sales are 10,000 a day and DSO falls to 30, how much cash is released?', a: 'CCC = 40 + 60 - 30 = 70 days. Cash released = 10 days x 10,000 = 100,000.' },
        { q: 'A rival has a 20-day cycle and yours is 70 days with the same margins. Give two possible reasons and one risk of closing the gap too fast.', a: 'Possible reasons: customers pay more slowly, you hold more stock, or you have shorter supplier terms. The risk: lost customers or stockouts.' },
      ],
      takeaways: [
        'Working capital is money already spent and waiting to come back.',
        'DSO plus DIO minus DPO is the cash conversion cycle. A shorter cycle ties up less cash.',
        'State your conventions: a 365-day year, and ending or average balances.',
        'Every improvement has a trade-off. Compare its benefit with its cost.',
      ],
      apply: 'Choose a shop or restaurant you know. Who owes it money, what stock does it hold, and which suppliers give it credit? Guess which of the three is the largest.',
    },
  },

  'l5-operating-cash-flow': {
    title: 'Operating Cash Flow: Why Profit Is Not Cash',
    summary: 'Move from profit to cash step by step, understand the reason for each sign, and judge whether a gap between them is normal growth or a warning.',
    objectives: [
      'Explain, in plain language, why profit and operating cash flow differ.',
      'Calculate operating cash flow with the indirect method and the direct method.',
      'Calculate free cash flow and the cash conversion ratio.',
      'Judge whether a gap between profit and cash is a warning sign or normal growth.',
    ],
    explanation: [
      'Profit asks, "Did we earn more than we spent?" Cash asks, "Is there more money in the bank?" They sound the same but use different timing. Sunrise delivers cakes to a supermarket in March. The sale is profit in March, but the supermarket pays in May. Until May, Sunrise has profit but no cash, and it has already paid cash for flour and wages.',
      'Operating cash flow (OCF) is the cash the day-to-day business makes or uses. The indirect method starts from net profit and corrects it for timing differences. Add back depreciation: it reduced profit, but no cash left this year. Subtract an increase in receivables: the sale is in profit, but the cash is still with customers. Subtract an increase in inventory: cash was spent on stock that has not yet become a cost. Add an increase in payables: the cost is in profit, but suppliers have not yet been paid. A decrease in any of these reverses the sign.',
      'A memory aid: assets up means cash down, and liabilities up means cash up.',
      'The direct method lists the cash itself: cash received from customers, minus cash paid to suppliers, to employees, for interest and for tax. Both methods give the same answer. The direct method shows where the cash came from. The indirect method shows why it differs from profit.',
      'Assumptions in this lesson: tax and interest are paid in cash in the same year, salaries and rent are paid in the year they are expensed, and interest paid is shown in operating cash flow. Accounting rules allow a firm to show interest in operating or in financing activities, so always check the firm\'s policy.',
      'Two further measures use OCF. Free cash flow is OCF minus the cash spent on equipment. The cash conversion ratio is OCF divided by net profit, the share of profit that became cash.',
    ],
    formulas: [
      { name: 'Operating cash flow (indirect)', expr: 'OCF = Net Profit + Depreciation - Increase in Receivables - Increase in Inventory + Increase in Payables' },
      { name: 'Operating cash flow (direct)', expr: 'OCF = Cash from Customers - Cash to Suppliers - Cash Operating Expenses - Interest Paid - Tax Paid' },
      { name: 'Cash from customers', expr: 'Cash from Customers = Revenue - Increase in Receivables' },
      { name: 'Cash paid to suppliers', expr: 'Purchases = COGS + Increase in Inventory; Cash to Suppliers = Purchases - Increase in Payables' },
      { name: 'Free cash flow', expr: 'FCF = OCF - Capital Expenditure' },
      { name: 'Cash conversion ratio', expr: 'Cash Conversion Ratio = OCF / Net Profit' },
    ],
    realWorld: 'Analysts compare operating cash flow with net profit over several years. If profit keeps rising while operating cash flow stays flat or falls, they ask questions: are customers paying later, is stock building up, or is revenue being recorded too early? To use a real company as an example, take the figures from its published annual report and cite them.',
    misconceptions: [
      'Depreciation is cash coming in. It is a cost that used no cash this year, so it is added back to undo the deduction.',
      'A rising accounts payable balance is bad. For cash it is a source, because suppliers are lending you money, though the loan has to be repaid.',
      'Positive profit means positive cash. Sunrise earned 75,000 but made only 45,000 of operating cash, and with faster growth it could be negative.',
      'Moving a payment to January is a real improvement. It only shifts cash between periods and does not make the business better.',
    ],
    workedExamples: [
      {
        title: 'Sunrise Bakery: the indirect method',
        given: ['Net profit $75,000 and depreciation $30,000', 'Receivables up $50,000, inventory up $30,000, payables up $20,000'],
        steps: [
          'Start with net profit: $75,000',
          'Add back depreciation (no cash left): 75,000 + 30,000 = $105,000',
          'Subtract the rise in receivables (customers hold our cash): 105,000 - 50,000 = $55,000',
          'Subtract the rise in inventory (cash spent on unsold stock): 55,000 - 30,000 = $25,000',
          'Add the rise in payables (suppliers financed us): 25,000 + 20,000 = $45,000',
        ],
        result: 'Operating cash flow is $45,000. The cash conversion ratio is 45,000 / 75,000 = 60%: only 60 cents of each profit dollar became cash this year.',
      },
      {
        title: 'Sunrise Bakery: the direct method and free cash flow',
        given: ['Revenue $1,200,000 and COGS $720,000', 'Receivables up $50,000, inventory up $30,000, payables up $20,000', 'Cash operating expenses $330,000 (depreciation excluded), interest paid $20,000, tax paid $25,000', 'Equipment bought $40,000'],
        steps: [
          'Cash from customers = 1,200,000 - 50,000 = $1,150,000',
          'Purchases = 720,000 + 30,000 = $750,000, so cash paid to suppliers = 750,000 - 20,000 = $730,000',
          'OCF = 1,150,000 - 730,000 - 330,000 - 20,000 - 25,000 = $45,000, the same as the indirect method',
          'Free cash flow = 45,000 - 40,000 = $5,000',
        ],
        result: 'Both methods give 45,000. After buying equipment, only 5,000 of cash was left over, which matches the 5,000 rise in Sunrise\'s cash balance.',
      },
    ],
    teaching: {
      why: 'Employees, suppliers and banks are paid in cash, not in profit. A business can report a profit every year and still be unable to pay its wages. Operating cash flow tells you whether the business can fund itself or must keep borrowing.',
      terms: [
        { term: 'Operating cash flow (OCF)', meaning: 'Cash made or used by the day-to-day business.' },
        { term: 'Net profit', meaning: 'Profit after all costs, interest and tax. Many books call it net income, and some questions use that name.' },
        { term: 'Non-cash expense', meaning: 'A cost in the profit figure that took no cash out this year, such as depreciation.' },
        { term: 'Indirect method', meaning: 'Start from net profit and adjust for timing differences.' },
        { term: 'Direct method', meaning: 'List the cash received and the cash paid.' },
        { term: 'Free cash flow', meaning: 'Cash left after buying the equipment the business needs: OCF minus capital expenditure.' },
        { term: 'Cash conversion ratio', meaning: 'The share of profit that became operating cash: OCF divided by net profit.' },
      ],
      interpretation: [
        'Profit was 75,000 but OCF was 45,000. The gap is mostly receivables (50,000) and inventory (30,000), partly offset by supplier credit (20,000). It is the price of growth, not necessarily a sign of fraud.',
        'Whether the gap is bad depends on why it exists. If receivables rose roughly in line with sales, growth explains it. If customers are paying slowly or stock is unsold, it is a worry.',
        'After 40,000 of equipment, free cash flow is only 5,000. A business that keeps growing like this will need financing.',
      ],
      decisions: [
        'Collect faster: this brings cash in sooner but may lose customers.',
        'Hold less stock: this frees cash but risks running out of products.',
        'Delay supplier payments: this keeps cash but may cost trust or discounts.',
        'Raise outside money: lenders charge interest, and new owners take a share of the business.',
        'Grow more slowly: this protects cash but gives up sales. None of these is free; ask which is cheapest for this business now.',
      ],
      check: [
        { q: 'Net profit $60,000; depreciation $15,000; receivables up $40,000; inventory down $10,000; payables down $5,000. What is OCF?', a: '60,000 + 15,000 - 40,000 + 10,000 - 5,000 = 40,000.' },
        { q: 'Why is a decrease in inventory added to profit?', a: 'Stock was sold or used without buying new stock, so the cost in profit was not matched by new cash spending.' },
        { q: 'The cash conversion ratio falls from 90% to 55% over three years while sales grow. Name two possible causes.', a: 'Receivables growing faster than sales, and stock building up.' },
      ],
      takeaways: [
        'Profit counts sales and costs when they happen. Cash counts money when it moves.',
        'Indirect method: profit plus depreciation, minus rises in receivables and inventory, plus a rise in payables.',
        'Direct method: cash from customers minus cash paid out. Both give the same answer.',
        'Judge the gap: is it normal growth, or a collection or stock problem?',
      ],
      apply: 'Take a business you know that is growing. Ask: are its customers paying later than before, is it holding more stock, and is it paying suppliers later? Which of these is giving it cash, and which is using it?',
    },
  },
};
