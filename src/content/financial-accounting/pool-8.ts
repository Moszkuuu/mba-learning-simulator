import { Pool } from '../pool';

/**
 * Phase 3.2: skill-tagged questions for the three pilot lessons (l2 profit statements, l4 working capital, l5 operating cash flow).
 * They add interpretation, assumption-spotting and decision items to the existing calculation-heavy pools. Decision items ask which
 * reasoning is best supported by the stated facts; they do not claim one universally correct management decision.
 * Numbers were recomputed by script: see the comments next to each answer.
 */
export function part8(p: Pool): void {
  const L2 = 'l2-operating-profit', L4 = 'l4-inventory-wc', L5 = 'l5-operating-cash-flow';

  // ---------------- l2: profit statements ----------------
  p.mcq(L2, 2, {
    concept: 'Comparing cost structures',
    scenario: 'Cafe A and Cafe B both have revenue of $500,000. Cafe A has a 60% gross margin and a 5% operating margin. Cafe B has a 40% gross margin and a 12% operating margin.',
    prompt: 'Which statement is best supported by these figures?',
    explanation: 'Gross profit is 300,000 for Cafe A and 200,000 for Cafe B. Operating profit is 25,000 for A and 60,000 for B. So A spends 275,000 on running costs and B only 140,000. Gross margin ignores running costs, so it cannot decide which business is more profitable.',
    correct: ['Cafe A earns more on its products but spends much more on running costs, so Cafe B keeps more of each sales dollar as operating profit', 'Running costs are 275,000 for A and 140,000 for B, which explains the reversal.'],
    wrong: [
      ['Cafe A is more profitable because its gross margin is higher', 'Gross margin stops before running costs. After them, A keeps only 5% and B keeps 12%.'],
      ['The two cafes are equally profitable because their revenue is equal', 'Equal revenue says nothing about costs. Profit depends on what is left after costs.'],
      ['Cafe B must be understating its cost of goods sold', 'Nothing in the figures suggests this. B has a lower gross margin, not a higher one.'],
    ],
  }, {
    concept: 'การเปรียบเทียบโครงสร้างต้นทุน',
    scenario: 'คาเฟ่ A และคาเฟ่ B มีรายได้ $500,000 เท่ากัน คาเฟ่ A มีอัตรากำไรขั้นต้น 60% และอัตรากำไรจากการดำเนินงาน 5% คาเฟ่ B มีอัตรากำไรขั้นต้น 40% และอัตรากำไรจากการดำเนินงาน 12%',
    prompt: 'ข้อความใดได้รับการสนับสนุนจากตัวเลขเหล่านี้ดีที่สุด',
    explanation: 'กำไรขั้นต้นของ A คือ 300,000 และของ B คือ 200,000 กำไรจากการดำเนินงานของ A คือ 25,000 และของ B คือ 60,000 ดังนั้น A จ่ายค่าใช้จ่ายประจำ 275,000 ส่วน B จ่ายเพียง 140,000 อัตรากำไรขั้นต้นไม่รวมค่าใช้จ่ายประจำ จึงตัดสินไม่ได้ว่าธุรกิจใดทำกำไรได้มากกว่า',
    correct: ['คาเฟ่ A ได้กำไรจากสินค้ามากกว่าแต่จ่ายค่าใช้จ่ายประจำมากกว่ามาก ดังนั้นคาเฟ่ B เก็บกำไรจากการดำเนินงานจากยอดขายแต่ละดอลลาร์ได้มากกว่า', 'ค่าใช้จ่ายประจำของ A คือ 275,000 และของ B คือ 140,000 ซึ่งอธิบายการกลับด้านนี้'],
    wrong: [
      ['คาเฟ่ A ทำกำไรได้มากกว่าเพราะอัตรากำไรขั้นต้นสูงกว่า', 'อัตรากำไรขั้นต้นหยุดก่อนค่าใช้จ่ายประจำ หลังหักแล้ว A เหลือเพียง 5% และ B เหลือ 12%'],
      ['คาเฟ่ทั้งสองทำกำไรเท่ากันเพราะรายได้เท่ากัน', 'รายได้เท่ากันไม่ได้บอกอะไรเรื่องต้นทุน กำไรขึ้นกับสิ่งที่เหลือหลังหักต้นทุน'],
      ['คาเฟ่ B ต้องรายงานต้นทุนขายต่ำกว่าความเป็นจริง', 'ตัวเลขไม่ได้บอกเช่นนั้น B มีอัตรากำไรขั้นต้นต่ำกว่า ไม่ใช่สูงกว่า'],
    ],
  }, undefined, 'interpret');

  p.mcq(L2, 2, {
    concept: 'Limits of one profit figure',
    scenario: 'A manager says: "Our net profit rose 20% this year, so the business is clearly healthier."',
    prompt: 'What extra information would you want most before agreeing?',
    explanation: 'Net profit is an accrual figure. A healthier business also collects cash, keeps its debts manageable and earns profit that is repeatable. Cash flow from operations and the balance sheet show whether profit became cash.',
    correct: ['Operating cash flow and the change in receivables, to see whether the profit was actually collected in cash', 'Profit alone does not show whether customers have paid.'],
    wrong: [
      ['Nothing more, because net profit is the final measure of health', 'Net profit ignores timing of cash, debt levels and whether the profit will repeat.'],
      ['Only the gross margin, because it shows the whole story', 'Gross margin leaves out running costs, interest, tax and cash.'],
      ['The number of employees, because larger firms are healthier', 'Size does not show health; a large firm can run out of cash too.'],
    ],
  }, {
    concept: 'ข้อจำกัดของตัวเลขกำไรเพียงตัวเดียว',
    scenario: 'ผู้จัดการพูดว่า "ปีนี้กำไรสุทธิของเราเพิ่ม 20% ธุรกิจจึงแข็งแรงขึ้นอย่างชัดเจน"',
    prompt: 'ก่อนเห็นด้วย คุณอยากได้ข้อมูลเพิ่มอะไรมากที่สุด',
    explanation: 'กำไรสุทธิเป็นตัวเลขตามเกณฑ์คงค้าง ธุรกิจที่แข็งแรงขึ้นยังต้องเก็บเงินสดได้ มีหนี้ที่จัดการได้ และมีกำไรที่เกิดซ้ำได้ กระแสเงินสดจากการดำเนินงานและงบดุลแสดงว่ากำไรกลายเป็นเงินสดหรือไม่',
    correct: ['กระแสเงินสดจากการดำเนินงานและการเปลี่ยนแปลงของลูกหนี้ เพื่อดูว่ากำไรถูกเก็บเป็นเงินสดจริงหรือไม่', 'กำไรลำพังไม่ได้บอกว่าลูกค้าจ่ายเงินแล้วหรือยัง'],
    wrong: [
      ['ไม่ต้องการอะไรเพิ่ม เพราะกำไรสุทธิเป็นตัวชี้วัดความแข็งแรงขั้นสุดท้าย', 'กำไรสุทธิไม่ได้บอกจังหวะเงินสด ระดับหนี้ หรือว่ากำไรจะเกิดซ้ำหรือไม่'],
      ['เฉพาะอัตรากำไรขั้นต้น เพราะบอกเรื่องราวทั้งหมด', 'อัตรากำไรขั้นต้นไม่รวมค่าใช้จ่ายประจำ ดอกเบี้ย ภาษี และเงินสด'],
      ['จำนวนพนักงาน เพราะบริษัทใหญ่แข็งแรงกว่า', 'ขนาดไม่ได้แสดงความแข็งแรง บริษัทใหญ่ก็เงินสดหมดได้'],
    ],
  }, undefined, 'assumptions');

  p.mcq(L2, 3, {
    concept: 'Pricing decision under uncertainty',
    scenario: 'A bakery has a 40% gross margin and a 10% operating margin. Running costs are fixed. The owner is thinking of raising all prices by 5%.',
    prompt: 'Which approach shows the best reasoning?',
    explanation: 'On a product costing 60 and selling for 100, a 5% rise gives a price of 105 and 45 of gross profit instead of 40. The gain is wiped out only if volume falls by more than 40 / 45 - 1 = about 11.1%. Whether customers would really leave in that number depends on competition and loyalty. Reasonable owners could decide differently; the quality of the reasoning is what matters here.',
    correct: ['Estimate how much volume could be lost before the extra margin is wiped out (about 11.1%), then judge whether customers would really leave in that number', 'It combines a calculation with a judgement about customers.'],
    wrong: [
      ['Raise prices, because a higher price always raises profit', 'If volume falls enough, total profit falls even though each sale earns more.'],
      ['Do not raise prices, because customers dislike increases', 'This ignores that a small rise may cost very few customers and add a lot of profit.'],
      ['Cut marketing instead, because it is always the safer option', 'Cutting marketing can reduce future sales, so it is not automatically safe.'],
    ],
  }, {
    concept: 'การตัดสินใจเรื่องราคาภายใต้ความไม่แน่นอน',
    scenario: 'ร้านเบเกอรี่มีอัตรากำไรขั้นต้น 40% และอัตรากำไรจากการดำเนินงาน 10% ค่าใช้จ่ายประจำคงที่ เจ้าของกำลังคิดจะขึ้นราคาสินค้าทุกชนิด 5%',
    prompt: 'แนวทางใดแสดงการให้เหตุผลที่ดีที่สุด',
    explanation: 'สำหรับสินค้าที่ต้นทุน 60 ขาย 100 การขึ้น 5% ทำให้ราคา 105 และได้กำไรขั้นต้น 45 แทน 40 ส่วนที่ได้จะหมดไปก็ต่อเมื่อปริมาณลดมากกว่า 40 / 45 - 1 = ประมาณ 11.1% ลูกค้าจะจากไปมากขนาดนั้นจริงหรือไม่ขึ้นกับการแข่งขันและความภักดี เจ้าของที่สมเหตุสมผลอาจตัดสินต่างกันได้ สิ่งสำคัญที่นี่คือคุณภาพของเหตุผล',
    correct: ['ประมาณว่าปริมาณขายลดได้เท่าไรก่อนที่กำไรส่วนเพิ่มจะหมดไป (ประมาณ 11.1%) แล้วตัดสินว่าลูกค้าจะจากไปมากขนาดนั้นจริงหรือไม่', 'รวมการคำนวณเข้ากับการตัดสินเรื่องลูกค้า'],
    wrong: [
      ['ขึ้นราคา เพราะราคาที่สูงขึ้นทำให้กำไรเพิ่มเสมอ', 'ถ้าปริมาณลดมากพอ กำไรรวมจะลดแม้การขายแต่ละครั้งได้กำไรมากขึ้น'],
      ['ไม่ขึ้นราคา เพราะลูกค้าไม่ชอบการขึ้นราคา', 'วิธีนี้ละเลยว่าการขึ้นเล็กน้อยอาจเสียลูกค้าน้อยมากและเพิ่มกำไรได้มาก'],
      ['ตัดงบการตลาดแทน เพราะปลอดภัยกว่าเสมอ', 'การตัดการตลาดอาจลดยอดขายในอนาคต จึงไม่ปลอดภัยโดยอัตโนมัติ'],
    ],
  }, undefined, 'decide');

  // Net profit: GP 2,400,000-1,560,000 = 840,000; OP 840,000-540,000 = 300,000; PBT 300,000-48,000 = 252,000; tax 63,000; NI 189,000.
  p.num(L2, 3, 'usd', 189_000, {
    concept: 'Full profit ladder',
    scenario: 'A firm has revenue of $2,400,000 and COGS of $1,560,000. Operating expenses are $540,000 (this already includes $60,000 of depreciation). Interest is $48,000 and the tax rate is 25%.',
    prompt: 'What is the net profit?',
    explanation: 'Gross profit = 2,400,000 - 1,560,000 = 840,000. Operating profit = 840,000 - 540,000 = 300,000. Profit before tax = 300,000 - 48,000 = 252,000. Tax = 25% x 252,000 = 63,000. Net profit = 252,000 - 63,000 = $189,000.',
    commonMistake: 'Taxing the operating profit, or subtracting the depreciation again.',
  }, {
    concept: 'บันไดกำไรครบทุกขั้น',
    scenario: 'บริษัทมีรายได้ $2,400,000 และ COGS $1,560,000 ค่าใช้จ่ายในการดำเนินงาน $540,000 (รวมค่าเสื่อมราคา $60,000 แล้ว) ดอกเบี้ย $48,000 และอัตราภาษี 25%',
    prompt: 'กำไรสุทธิเท่ากับเท่าไร',
    explanation: 'กำไรขั้นต้น = 2,400,000 - 1,560,000 = 840,000 กำไรจากการดำเนินงาน = 840,000 - 540,000 = 300,000 กำไรก่อนภาษี = 300,000 - 48,000 = 252,000 ภาษี = 25% x 252,000 = 63,000 กำไรสุทธิ = 252,000 - 63,000 = $189,000',
    commonMistake: 'เก็บภาษีจากกำไรจากการดำเนินงาน หรือหักค่าเสื่อมราคาซ้ำ',
  }, undefined, undefined, 'calculate');

  // ---------------- l4: working capital ----------------
  // CCC last year 40+50-45 = 45; this year 62+55-45 = 72; +27 days (DSO +22, DIO +5).
  p.mcq(L4, 2, {
    concept: 'Reading a change in the cycle',
    scenario: 'Last year DSO was 40 days, DIO 50 days and DPO 45 days. This year DSO is 62 days, DIO 55 days and DPO 45 days. Sales grew 8%.',
    prompt: 'What is the best reading of the change?',
    explanation: 'The cash conversion cycle grew from 40 + 50 - 45 = 45 days to 62 + 55 - 45 = 72 days, an increase of 27 days. DSO accounts for 22 of them and DIO for 5, while DPO did not change. Growth of 8% alone should not lengthen the days, because receivables should grow with sales. The first thing to examine is why customers are paying more slowly.',
    correct: ['The cycle is 27 days longer, mostly because customers take 22 days more to pay, so credit terms and old receivables should be reviewed first', 'DSO accounts for 22 of the 27 extra days.'],
    wrong: [
      ['Stock is the main problem, because DIO rose', 'DIO rose by only 5 days; DSO rose by 22.'],
      ['The 8% growth fully explains the change', 'If receivables grew in line with sales, the days would stay about the same.'],
      ['A longer cycle is good because the firm holds more assets', 'A longer cycle ties up more cash that could be used elsewhere.'],
    ],
  }, {
    concept: 'การอ่านการเปลี่ยนแปลงของรอบเงินสด',
    scenario: 'ปีที่แล้ว DSO 40 วัน DIO 50 วัน และ DPO 45 วัน ปีนี้ DSO 62 วัน DIO 55 วัน และ DPO 45 วัน ยอดขายโต 8%',
    prompt: 'การอ่านการเปลี่ยนแปลงนี้ที่ดีที่สุดคืออะไร',
    explanation: 'รอบการแปลงเป็นเงินสดเพิ่มจาก 40 + 50 - 45 = 45 วัน เป็น 62 + 55 - 45 = 72 วัน เพิ่มขึ้น 27 วัน DSO เป็นส่วนของ 22 วันและ DIO เป็นส่วนของ 5 วัน ขณะที่ DPO ไม่เปลี่ยน การเติบโต 8% เพียงอย่างเดียวไม่ควรทำให้จำนวนวันยาวขึ้น เพราะลูกหนี้ควรโตตามยอดขาย สิ่งแรกที่ต้องตรวจคือทำไมลูกค้าจ่ายช้าลง',
    correct: ['รอบยาวขึ้น 27 วัน ส่วนใหญ่เพราะลูกค้าใช้เวลาจ่ายเพิ่ม 22 วัน จึงควรทบทวนเงื่อนไขเครดิตและลูกหนี้ค้างนานก่อน', 'DSO เป็นส่วนของ 22 จาก 27 วันที่เพิ่ม'],
    wrong: [
      ['สต็อกเป็นปัญหาหลัก เพราะ DIO เพิ่ม', 'DIO เพิ่มเพียง 5 วัน ส่วน DSO เพิ่ม 22 วัน'],
      ['การเติบโต 8% อธิบายการเปลี่ยนแปลงได้ทั้งหมด', 'ถ้าลูกหนี้โตตามยอดขาย จำนวนวันจะเท่าเดิมโดยประมาณ'],
      ['รอบที่ยาวขึ้นเป็นเรื่องดี เพราะบริษัทถือสินทรัพย์มากขึ้น', 'รอบที่ยาวขึ้นทำให้เงินสดจมมากขึ้น ซึ่งนำไปใช้อย่างอื่นได้'],
    ],
  }, undefined, 'interpret');

  // Revenue per day 7,300,000/365 = 20,000; 12 days -> 240,000. (COGS per day 14,000 -> 168,000 is the common error.)
  p.num(L4, 2, 'usd', 240_000, {
    concept: 'Cash released by faster collection',
    scenario: 'Annual revenue is $7,300,000 and annual COGS is $5,110,000. A new collection process cuts DSO from 60 days to 48 days. Use a 365-day year.',
    prompt: 'How much cash is released (once)?',
    explanation: 'DSO is measured against revenue, so one day of sales is 7,300,000 / 365 = $20,000. Cutting 12 days releases 12 x 20,000 = $240,000.',
    commonMistake: 'Using COGS per day (14,000), which gives 168,000. Receivables are measured against sales.',
  }, {
    concept: 'เงินสดที่ปล่อยจากการเก็บเงินเร็วขึ้น',
    scenario: 'รายได้ต่อปี $7,300,000 และ COGS ต่อปี $5,110,000 กระบวนการเก็บเงินใหม่ลด DSO จาก 60 วันเหลือ 48 วัน ใช้ปี 365 วัน',
    prompt: 'เงินสดถูกปล่อยออกมาเท่าไร (ครั้งเดียว)',
    explanation: 'DSO วัดกับรายได้ ดังนั้นยอดขายหนึ่งวันคือ 7,300,000 / 365 = $20,000 ลดลง 12 วันคือ 12 x 20,000 = $240,000',
    commonMistake: 'ใช้ COGS ต่อวัน (14,000) ซึ่งได้ 168,000 ลูกหนี้วัดกับยอดขาย',
  }, undefined, undefined, 'calculate');

  // 1/99 = 1.0101%; x 365/30 = 12.29% a year versus a 12% overdraft.
  p.mcq(L4, 3, {
    concept: 'Early-payment discount versus borrowing',
    scenario: 'A supplier offers 1% off if you pay in 10 days instead of 40 days. Your overdraft costs 12% a year and you would need it to pay early.',
    prompt: 'Which conclusion is best supported?',
    explanation: 'Paying 30 days early saves 1 on every 99 paid, about 1.01%. Annualised that is 1.01% x 365 / 30 = about 12.3% a year, almost exactly the 12% overdraft cost. So the money gained is very small, and other factors, such as your cash buffer and your relationship with the supplier, should decide. A firm with spare cash could reasonably take it; a firm already near its overdraft limit could reasonably refuse.',
    correct: ['The discount is worth about 12.3% a year, almost the same as the 12% overdraft, so the gain is tiny and other factors should decide', 'Annualising 1% for 30 days gives about 12.3%.'],
    wrong: [
      ['Always take it, because any discount is a saving', 'It is only a saving if the annualised return beats your cost of funds, and here it barely does.'],
      ['Never take discounts, because they are traps', 'Some discounts are worth a lot; this one must be judged by its annualised cost.'],
      ['It is worth a clear 1% a year, so take it', 'The 1% is earned for 30 days of earlier payment, not for a year.'],
    ],
  }, {
    concept: 'ส่วนลดจ่ายเร็วเทียบกับการกู้',
    scenario: 'ซัพพลายเออร์เสนอส่วนลด 1% ถ้าคุณจ่ายภายใน 10 วันแทน 40 วัน ตัวเลือกเบิกเกินบัญชีของคุณมีต้นทุน 12% ต่อปี และคุณต้องใช้มันเพื่อจ่ายเร็ว',
    prompt: 'ข้อสรุปใดได้รับการสนับสนุนดีที่สุด',
    explanation: 'การจ่ายเร็วขึ้น 30 วันประหยัด 1 ทุก 99 ที่จ่าย ประมาณ 1.01% คิดเป็นต่อปี 1.01% x 365 / 30 = ประมาณ 12.3% ต่อปี เกือบเท่ากับต้นทุนเบิกเกินบัญชี 12% พอดี เงินที่ได้จึงน้อยมาก และปัจจัยอื่น เช่น เงินสำรองและความสัมพันธ์กับซัพพลายเออร์ ควรเป็นตัวตัดสิน บริษัทที่มีเงินสดเหลือรับได้อย่างสมเหตุสมผล บริษัทที่ใกล้วงเงินเบิกเกินบัญชีปฏิเสธได้อย่างสมเหตุสมผล',
    correct: ['ส่วนลดมีค่าประมาณ 12.3% ต่อปี เกือบเท่ากับเบิกเกินบัญชี 12% ผลได้จึงน้อยและปัจจัยอื่นควรเป็นตัวตัดสิน', 'คิดต่อปีของ 1% ใน 30 วันได้ประมาณ 12.3%'],
    wrong: [
      ['รับเสมอ เพราะส่วนลดทุกครั้งคือการประหยัด', 'จะประหยัดจริงก็ต่อเมื่อผลตอบแทนต่อปีสูงกว่าต้นทุนเงินทุน และที่นี่สูงกว่าเพียงเล็กน้อย'],
      ['ไม่รับส่วนลดเลย เพราะเป็นกับดัก', 'ส่วนลดบางครั้งมีค่ามาก ครั้งนี้ต้องตัดสินจากต้นทุนต่อปี'],
      ['มีค่า 1% ต่อปีอย่างชัดเจน จึงควรรับ', '1% ได้จากการจ่ายเร็วขึ้น 30 วัน ไม่ใช่ต่อปี'],
    ],
  }, undefined, 'decide');

  p.mcq(L4, 2, {
    concept: 'Comparing ratios fairly',
    scenario: 'A company report says "Our DSO is 45 days." A competitor\'s DSO is 38 days.',
    prompt: 'What should you ask first before concluding the competitor collects faster?',
    explanation: 'DSO can be calculated with year-end or average receivables, with or without cash sales, and on a 365-day or 360-day year. Two companies using different methods can show different numbers for the same reality. Compare only like with like.',
    correct: ['How both figures were calculated: year-end or average balances, whether cash sales are included, and a 365-day or 360-day year', 'Different methods can make equal businesses look different.'],
    wrong: [
      ['Nothing: 45 is higher than 38, so the competitor is clearly better', 'The numbers may not be comparable if the methods differ.'],
      ['Which company is older', 'Age has no direct link to how DSO was measured.'],
      ['Whether the competitor earns a higher net profit', 'Net profit is a different measure and does not show how DSO was calculated.'],
    ],
  }, {
    concept: 'การเปรียบเทียบอัตราส่วนอย่างยุติธรรม',
    scenario: 'รายงานของบริษัทหนึ่งบอกว่า "DSO ของเราคือ 45 วัน" ส่วน DSO ของคู่แข่งคือ 38 วัน',
    prompt: 'ก่อนสรุปว่าคู่แข่งเก็บเงินได้เร็วกว่า ควรถามอะไรก่อน',
    explanation: 'DSO คำนวณได้ด้วยลูกหนี้ปลายงวดหรือค่าเฉลี่ย รวมหรือไม่รวมยอดขายเงินสด และใช้ปี 365 วันหรือ 360 วัน สองบริษัทที่ใช้วิธีต่างกันอาจแสดงตัวเลขต่างกันทั้งที่สถานการณ์จริงเหมือนกัน ให้เปรียบเทียบเฉพาะสิ่งที่วัดแบบเดียวกัน',
    correct: ['ทั้งสองตัวเลขคำนวณอย่างไร ใช้ยอดปลายงวดหรือค่าเฉลี่ย รวมยอดขายเงินสดหรือไม่ และใช้ปี 365 วันหรือ 360 วัน', 'วิธีที่ต่างกันทำให้ธุรกิจที่เท่ากันดูต่างกันได้'],
    wrong: [
      ['ไม่ต้องถามอะไร 45 มากกว่า 38 คู่แข่งจึงดีกว่าอย่างชัดเจน', 'ตัวเลขอาจเปรียบเทียบกันไม่ได้ถ้าวิธีต่างกัน'],
      ['บริษัทไหนก่อตั้งมานานกว่า', 'อายุไม่เกี่ยวโดยตรงกับวิธีวัด DSO'],
      ['คู่แข่งมีกำไรสุทธิสูงกว่าหรือไม่', 'กำไรสุทธิเป็นตัวชี้วัดอื่นและไม่ได้บอกว่า DSO คำนวณอย่างไร'],
    ],
  }, undefined, 'assumptions');

  // ---------------- l5: operating cash flow ----------------
  // 120,000 + 20,000 - 110,000 = 30,000. Receivables +110,000 on 200,000 = +55% versus sales +12%.
  p.mcq(L5, 2, {
    concept: 'Diagnosing a profit-to-cash gap',
    scenario: 'Net profit is $120,000 and depreciation is $20,000. Receivables rose from $200,000 to $310,000 while sales rose 12%. Inventory and payables did not change. Operating cash flow was $30,000.',
    prompt: 'What is the best reading?',
    explanation: 'OCF = 120,000 + 20,000 - 110,000 = 30,000. Receivables rose 55% (110,000 on 200,000) while sales rose only 12%. Growth explains a small part. The larger part suggests customers are paying more slowly, or some sales may not be collected. Review credit terms and the age of receivables.',
    correct: ['Receivables grew 55% while sales grew 12%, so customers may be paying more slowly; this is a collection warning, not just growth', 'The gap is mostly the 110,000 increase in receivables.'],
    wrong: [
      ['Depreciation causes the gap between profit and cash', 'Depreciation is added back, so it raises OCF relative to profit.'],
      ['The business is making a loss', 'Net profit is positive at 120,000; the problem is that it is not arriving as cash.'],
      ['Normal growth fully explains it', 'With sales up 12%, receivables would be expected to rise by roughly that much, not 55%.'],
    ],
  }, {
    concept: 'การวินิจฉัยช่องว่างระหว่างกำไรกับเงินสด',
    scenario: 'กำไรสุทธิ $120,000 และค่าเสื่อมราคา $20,000 ลูกหนี้เพิ่มจาก $200,000 เป็น $310,000 ขณะที่ยอดขายโต 12% สินค้าคงเหลือและเจ้าหนี้ไม่เปลี่ยน กระแสเงินสดจากการดำเนินงานคือ $30,000',
    prompt: 'การอ่านที่ดีที่สุดคืออะไร',
    explanation: 'OCF = 120,000 + 20,000 - 110,000 = 30,000 ลูกหนี้เพิ่ม 55% (110,000 จาก 200,000) ขณะที่ยอดขายโตเพียง 12% การเติบโตอธิบายได้เพียงส่วนเล็ก ส่วนที่ใหญ่กว่าบ่งชี้ว่าลูกค้าอาจจ่ายช้าลง หรือบางยอดขายอาจเก็บเงินไม่ได้ ควรทบทวนเงื่อนไขเครดิตและอายุลูกหนี้',
    correct: ['ลูกหนี้โต 55% ขณะที่ยอดขายโต 12% ลูกค้าจึงอาจจ่ายช้าลง นี่คือสัญญาณเตือนเรื่องการเก็บหนี้ ไม่ใช่เพียงการเติบโต', 'ช่องว่างส่วนใหญ่มาจากลูกหนี้ที่เพิ่ม 110,000'],
    wrong: [
      ['ค่าเสื่อมราคาทำให้เกิดช่องว่างระหว่างกำไรกับเงินสด', 'ค่าเสื่อมราคาถูกบวกกลับ จึงทำให้ OCF สูงกว่ากำไร'],
      ['ธุรกิจกำลังขาดทุน', 'กำไรสุทธิเป็นบวก 120,000 ปัญหาคือกำไรไม่ได้เข้ามาเป็นเงินสด'],
      ['การเติบโตปกติอธิบายได้ทั้งหมด', 'เมื่อยอดขายเพิ่ม 12% ลูกหนี้ควรเพิ่มประมาณนั้น ไม่ใช่ 55%'],
    ],
  }, undefined, 'interpret');

  // Cash from customers 900,000-60,000 = 840,000; purchases 540,000-20,000 = 520,000; paid suppliers 520,000-15,000 = 505,000;
  // OCF = 840,000-505,000-210,000-10,000-30,000 = 85,000.
  p.num(L5, 2, 'usd', 85_000, {
    concept: 'Direct-method cash flow with changes',
    scenario: 'Revenue $900,000 and receivables rose $60,000. COGS $540,000, inventory fell $20,000 and payables rose $15,000. Cash operating expenses were $210,000, interest paid $10,000 and tax paid $30,000.',
    prompt: 'What is the operating cash flow?',
    explanation: 'Cash from customers = 900,000 - 60,000 = 840,000. Purchases = 540,000 - 20,000 = 520,000 (a fall in inventory means less was bought than was sold). Cash paid to suppliers = 520,000 - 15,000 = 505,000. OCF = 840,000 - 505,000 - 210,000 - 10,000 - 30,000 = $85,000.',
    commonMistake: 'Adding the rise in receivables to revenue, or adding the fall in inventory to COGS.',
  }, {
    concept: 'กระแสเงินสดวิธีทางตรงพร้อมการเปลี่ยนแปลง',
    scenario: 'รายได้ $900,000 และลูกหนี้เพิ่ม $60,000 COGS $540,000 สินค้าคงเหลือลด $20,000 และเจ้าหนี้เพิ่ม $15,000 ค่าใช้จ่ายดำเนินงานที่เป็นเงินสด $210,000 ดอกเบี้ยจ่าย $10,000 และภาษีจ่าย $30,000',
    prompt: 'กระแสเงินสดจากการดำเนินงานเท่ากับเท่าไร',
    explanation: 'เงินสดรับจากลูกค้า = 900,000 - 60,000 = 840,000 ยอดซื้อ = 540,000 - 20,000 = 520,000 (สินค้าคงเหลือลดแปลว่าซื้อน้อยกว่าที่ขาย) เงินสดจ่ายซัพพลายเออร์ = 520,000 - 15,000 = 505,000 OCF = 840,000 - 505,000 - 210,000 - 10,000 - 30,000 = $85,000',
    commonMistake: 'บวกลูกหนี้ที่เพิ่มเข้ากับรายได้ หรือบวกสินค้าคงเหลือที่ลดเข้ากับ COGS',
  }, undefined, undefined, 'calculate');

  p.mcq(L5, 3, {
    concept: 'Dividend decision based on cash',
    scenario: 'An owner says: "We made $60,000 profit, so we can pay a $50,000 dividend." Operating cash flow was $40,000, the business plans $25,000 of equipment purchases, and its overdraft is near its limit.',
    prompt: 'Which advice is best supported?',
    explanation: 'Free cash flow is 40,000 - 25,000 = 15,000. A dividend is paid in cash, so paying 50,000 would need about 35,000 of new borrowing from a business whose overdraft is nearly full. A smaller or postponed dividend is better supported. Another owner might accept more risk for personal reasons, so the argument, not a single right answer, is what counts.',
    correct: ['Base the dividend on cash: free cash flow is about 15,000, so 50,000 would need borrowing the business may not be able to get; reduce or postpone it', 'The dividend is paid in cash, not profit.'],
    wrong: [
      ['Pay it, because profit is larger than the dividend', 'Profit does not pay a dividend; cash does, and operating cash flow was only 40,000.'],
      ['Never pay dividends, because cash is always short', 'A blanket rule ignores years when there is spare cash.'],
      ['Pay it and use the overdraft, because the interest is small', 'The overdraft is near its limit, so it may not be available, and borrowing to pay a dividend adds risk.'],
    ],
  }, {
    concept: 'การตัดสินใจเรื่องเงินปันผลโดยอิงเงินสด',
    scenario: 'เจ้าของพูดว่า "เรากำไร $60,000 จึงจ่ายเงินปันผล $50,000 ได้" กระแสเงินสดจากการดำเนินงานคือ $40,000 ธุรกิจวางแผนซื้ออุปกรณ์ $25,000 และวงเงินเบิกเกินบัญชีใกล้เต็ม',
    prompt: 'คำแนะนำใดได้รับการสนับสนุนดีที่สุด',
    explanation: 'กระแสเงินสดอิสระคือ 40,000 - 25,000 = 15,000 เงินปันผลจ่ายเป็นเงินสด การจ่าย 50,000 จึงต้องกู้เพิ่มประมาณ 35,000 จากธุรกิจที่วงเงินเบิกเกินบัญชีเกือบเต็ม เงินปันผลที่น้อยลงหรือเลื่อนออกไปได้รับการสนับสนุนดีกว่า เจ้าของอีกคนอาจยอมรับความเสี่ยงมากกว่าด้วยเหตุผลส่วนตัว ดังนั้นสิ่งที่สำคัญคือเหตุผล ไม่ใช่คำตอบถูกเพียงข้อเดียว',
    correct: ['ใช้เงินสดเป็นฐานของเงินปันผล กระแสเงินสดอิสระประมาณ 15,000 การจ่าย 50,000 จึงต้องกู้ซึ่งธุรกิจอาจกู้ไม่ได้ ควรลดหรือเลื่อน', 'เงินปันผลจ่ายเป็นเงินสด ไม่ใช่กำไร'],
    wrong: [
      ['จ่าย เพราะกำไรมากกว่าเงินปันผล', 'กำไรไม่ได้จ่ายเงินปันผล เงินสดต่างหาก และกระแสเงินสดจากการดำเนินงานมีเพียง 40,000'],
      ['ไม่จ่ายเงินปันผลเลย เพราะเงินสดขาดเสมอ', 'กฎตายตัวละเลยปีที่มีเงินสดเหลือ'],
      ['จ่ายและใช้เบิกเกินบัญชี เพราะดอกเบี้ยน้อย', 'วงเงินเบิกเกินบัญชีใกล้เต็มจึงอาจใช้ไม่ได้ และการกู้เพื่อจ่ายเงินปันผลเพิ่มความเสี่ยง'],
    ],
  }, undefined, 'decide');

  p.mcq(L5, 3, {
    concept: 'Classification assumptions',
    scenario: 'Two analysts compute operating cash flow for the same firm. Analyst A gets $45,000 and Analyst B gets $25,000. The firm paid $20,000 of interest and has $30,000 of depreciation.',
    prompt: 'What is the most likely reason for the difference?',
    explanation: 'The difference is 45,000 - 25,000 = 20,000, exactly the interest paid. International accounting standards allow interest paid to be shown in operating or financing activities. A includes it in financing and B in operating. Always check the firm\'s policy and compare figures that use the same one.',
    correct: ['They classified interest paid differently, which the standards allow, so the figures must be put on the same basis before comparing', 'The 20,000 gap equals the interest paid.'],
    wrong: [
      ['One analyst forgot depreciation', 'Depreciation is 30,000, which would create a 30,000 difference, not 20,000.'],
      ['Operating cash flow should always be identical, so one is wrong', 'Policy choices such as interest classification can legitimately differ.'],
      ['The difference is caused by tax rates', 'The gap exactly matches the interest paid, not a tax effect.'],
    ],
  }, {
    concept: 'ข้อสมมติเรื่องการจัดประเภท',
    scenario: 'นักวิเคราะห์สองคนคำนวณกระแสเงินสดจากการดำเนินงานของบริษัทเดียวกัน นักวิเคราะห์ A ได้ $45,000 และนักวิเคราะห์ B ได้ $25,000 บริษัทจ่ายดอกเบี้ย $20,000 และมีค่าเสื่อมราคา $30,000',
    prompt: 'สาเหตุที่เป็นไปได้มากที่สุดของความต่างคืออะไร',
    explanation: 'ความต่างคือ 45,000 - 25,000 = 20,000 ซึ่งเท่ากับดอกเบี้ยจ่ายพอดี มาตรฐานบัญชีระหว่างประเทศอนุญาตให้แสดงดอกเบี้ยจ่ายในกิจกรรมดำเนินงานหรือกิจกรรมจัดหาเงิน A รวมไว้ในกิจกรรมจัดหาเงินและ B ในกิจกรรมดำเนินงาน ควรตรวจนโยบายของบริษัทเสมอและเปรียบเทียบตัวเลขที่ใช้นโยบายเดียวกัน',
    correct: ['จัดประเภทดอกเบี้ยจ่ายต่างกัน ซึ่งมาตรฐานอนุญาต จึงต้องปรับตัวเลขให้อยู่บนฐานเดียวกันก่อนเปรียบเทียบ', 'ช่องว่าง 20,000 เท่ากับดอกเบี้ยจ่าย'],
    wrong: [
      ['นักวิเคราะห์คนหนึ่งลืมค่าเสื่อมราคา', 'ค่าเสื่อมราคาคือ 30,000 ซึ่งจะทำให้ต่างกัน 30,000 ไม่ใช่ 20,000'],
      ['กระแสเงินสดจากการดำเนินงานต้องเหมือนกันเสมอ จึงมีคนผิดคนหนึ่ง', 'ทางเลือกนโยบาย เช่น การจัดประเภทดอกเบี้ย ต่างกันได้อย่างถูกต้อง'],
      ['ความต่างเกิดจากอัตราภาษี', 'ช่องว่างตรงกับดอกเบี้ยจ่ายพอดี ไม่ใช่ผลของภาษี'],
    ],
  }, undefined, 'assumptions');
}
