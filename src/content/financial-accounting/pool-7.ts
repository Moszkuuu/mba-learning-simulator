import * as A from '../../lib/engines/accounting';
import * as F from '../../lib/finance';
import { Pool, f0, f1 } from '../pool';

const L48 = 'l48-double-entry', L49 = 'l49-accrual-recognition', L50 = 'l50-adjusting-entries', L1 = 'l1-gross-profit', L3 = 'l3-ar-ap', L4 = 'l4-inventory-wc';
const L51 = 'l51-inventory-costing', L52 = 'l52-inventory-nrv-errors', L5 = 'l5-operating-cash-flow';

/** Question pool, part 7: top-up questions so every Financial Accounting lesson reaches the 30-question target. */
export function part7(p: Pool): void {
  ([[9_600, 6_900], [4_500, 5_400]] as const).forEach(([right, wrong]) =>
    p.num(L48, 2, 'usd', Math.abs(right - wrong),
      { concept: 'Size of a transposition error', prompt: `A debit of $${f0(right)} was recorded as $${f0(wrong)}. By how much do the two sides of the trial balance differ ($)?`, explanation: `|${f0(right)} - ${f0(wrong)}| = $${f0(Math.abs(right - wrong))}, a multiple of 9 as expected for transposed digits.` },
      { concept: 'ขนาดของความต่างจากการสลับตัวเลข', prompt: `เดบิต $${f0(right)} ถูกบันทึกเป็น $${f0(wrong)} สองด้านของงบทดลองต่างกันเท่าไร ($)`, explanation: `|${f0(right)} - ${f0(wrong)}| = $${f0(Math.abs(right - wrong))} ซึ่งหารด้วย 9 ลงตัวตามที่คาดสำหรับการสลับตัวเลข` }));
  p.mcq(L48, 2,
    { concept: 'Suspense account', prompt: 'A trial balance does not balance and the cause cannot be found before the deadline. What is the usual temporary treatment?', explanation: 'The difference is placed in a suspense account until the error is found and corrected; it must not be ignored.', correct: ['Hold the difference in a suspense account until the error is found', 'It keeps the books balanced while the error is investigated.'], wrong: [['Write it off as an expense', 'This would hide the problem and misstate profit.'], ['Add it to revenue', 'This would misstate revenue.'], ['Leave the trial balance unbalanced permanently', 'The difference must be investigated and cleared.']] },
    { concept: 'บัญชีพัก', prompt: 'งบทดลองไม่สมดุลและหาสาเหตุไม่ได้ก่อนกำหนดส่ง การปฏิบัติชั่วคราวตามปกติคืออะไร', explanation: 'วางส่วนต่างไว้ในบัญชีพักจนกว่าจะพบและแก้ไขข้อผิดพลาด ห้ามเพิกเฉย', correct: ['พักส่วนต่างไว้ในบัญชีพักจนกว่าจะพบข้อผิดพลาด', 'ทำให้บัญชีสมดุลชั่วคราวระหว่างสอบสวนข้อผิดพลาด'], wrong: [['ตัดเป็นค่าใช้จ่าย', 'จะซ่อนปัญหาและทำให้กำไรผิด'], ['เพิ่มเข้าไปในรายได้', 'จะทำให้รายได้ผิด'], ['ปล่อยให้งบทดลองไม่สมดุลถาวร', 'ต้องสอบสวนและล้างส่วนต่าง']] });

  ([[4_800, 12, 7], [3_000, 6, 4]] as const).forEach(([amt, months, el]) =>
    p.num(L49, 2, 'usd', A.monthlyShare(amt, months, el),
      { concept: 'Revenue earned on a service contract', prompt: `A customer prepays $${f0(amt)} for a ${months}-month contract. After ${el} months, how much revenue has been earned ($)?`, explanation: `${f0(amt)} x ${el} / ${months} = $${f0(A.monthlyShare(amt, months, el))}.` },
      { concept: 'รายได้ที่ได้รับจากสัญญาบริการ', prompt: `ลูกค้าจ่ายล่วงหน้า $${f0(amt)} สำหรับสัญญา ${months} เดือน ผ่านไป ${el} เดือน รายได้ที่ได้รับแล้วคือเท่าไร ($)`, explanation: `${f0(amt)} x ${el} / ${months} = $${f0(A.monthlyShare(amt, months, el))}` }));

  p.num(L50, 2, 'usd', A.monthlyShare(7_200, 12, 9),
    { concept: 'Prepaid expense used up', prompt: 'A business pays $7,200 for 12 months of rent in advance. After 9 months, how much has become an expense ($)?', explanation: '7,200 x 9 / 12 = $5,400.' },
    { concept: 'ค่าใช้จ่ายจ่ายล่วงหน้าที่ใช้ไป', prompt: 'กิจการจ่ายค่าเช่าล่วงหน้า $7,200 สำหรับ 12 เดือน ผ่านไป 9 เดือน มีส่วนที่กลายเป็นค่าใช้จ่ายแล้วเท่าไร ($)', explanation: '7,200 x 9 / 12 = $5,400' });

  ([[420_000, 273_000], [96_000, 60_000]] as const).forEach(([rev, cogs], i) => {
    if (i === 0) p.num(L1, 1, 'usd', F.grossProfit(rev + 30_000, cogs),
      { concept: 'Gross profit', prompt: `Revenue is $${f0(rev + 30_000)} and cost of goods sold is $${f0(cogs)}. What is gross profit ($)?`, explanation: `${f0(rev + 30_000)} - ${f0(cogs)} = $${f0(rev + 30_000 - cogs)}.` },
      { concept: 'กำไรขั้นต้น', prompt: `รายได้คือ $${f0(rev + 30_000)} และต้นทุนขายคือ $${f0(cogs)} กำไรขั้นต้นคือเท่าไร ($)`, explanation: `${f0(rev + 30_000)} - ${f0(cogs)} = $${f0(rev + 30_000 - cogs)}` });
    else p.num(L1, 2, 'pct', F.grossMarginPct(rev, cogs),
      { concept: 'Gross margin percentage', prompt: `Revenue is $${f0(rev)} and cost of goods sold is $${f0(cogs)}. What is the gross margin (%)?`, explanation: `(${f0(rev)} - ${f0(cogs)}) / ${f0(rev)} = ${f1(F.grossMarginPct(rev, cogs))}%.` },
      { concept: 'อัตรากำไรขั้นต้น', prompt: `รายได้คือ $${f0(rev)} และต้นทุนขายคือ $${f0(cogs)} อัตรากำไรขั้นต้น (%) คือเท่าไร`, explanation: `(${f0(rev)} - ${f0(cogs)}) / ${f0(rev)} = ${f1(F.grossMarginPct(rev, cogs))}%` });
  });

  p.num(L3, 2, 'days', F.dso(84_000, 1_008_000, 360),
    { concept: 'Days sales outstanding', prompt: 'Receivables are $84,000 and annual revenue is $1,008,000. Using a 360-day year, what is DSO (days)?', explanation: '84,000 / 1,008,000 x 360 = 30.0 days.' },
    { concept: 'ระยะเวลาเก็บหนี้เฉลี่ย (DSO)', prompt: 'ลูกหนี้คือ $84,000 และรายได้ต่อปีคือ $1,008,000 ใช้ปี 360 วัน DSO (วัน) คือเท่าไร', explanation: '84,000 / 1,008,000 x 360 = 30.0 วัน' });
  p.num(L3, 2, 'days', F.dpo(54_000, 432_000, 360),
    { concept: 'Days payable outstanding', prompt: 'Accounts payable are $54,000 and annual cost of goods sold is $432,000. Using a 360-day year, what is DPO (days)?', explanation: '54,000 / 432,000 x 360 = 45.0 days.' },
    { concept: 'ระยะเวลาชำระหนี้เฉลี่ย (DPO)', prompt: 'เจ้าหนี้การค้าคือ $54,000 และต้นทุนขายต่อปีคือ $432,000 ใช้ปี 360 วัน DPO (วัน) คือเท่าไร', explanation: '54,000 / 432,000 x 360 = 45.0 วัน' });

  p.num(L4, 2, 'x', F.inventoryTurnover(780_000, 130_000),
    { concept: 'Inventory turnover', prompt: 'Cost of goods sold is $780,000 and average inventory is $130,000. What is inventory turnover (times per year)?', explanation: '780,000 / 130,000 = 6.0x.' },
    { concept: 'อัตราหมุนเวียนสินค้าคงเหลือ', prompt: 'ต้นทุนขายคือ $780,000 และสินค้าคงเหลือเฉลี่ยคือ $130,000 อัตราหมุนเวียนสินค้าคงเหลือ (ครั้งต่อปี) คือเท่าไร', explanation: '780,000 / 130,000 = 6.0 เท่า' });

  const lay = [{ units: 120, cost: 8 }, { units: 180, cost: 9 }, { units: 200, cost: 11 }];
  p.num(L51, 2, 'usd', A.fifo(lay, 250).ending,
    { concept: 'FIFO ending inventory', prompt: 'Inventory layers in purchase order: 120 units at $8, 180 units at $9, 200 units at $11. 250 units are sold. What is ending inventory under FIFO ($)?', explanation: 'FIFO sells the oldest 250 units (120 at $8 and 130 at $9), leaving 50 units at $9 and 200 at $11 = $2,650.' },
    { concept: 'สินค้าปลายงวดตาม FIFO', prompt: 'ชั้นสินค้าตามลำดับการซื้อ: 120 หน่วยหน่วยละ $8 180 หน่วยหน่วยละ $9 200 หน่วยหน่วยละ $11 ขาย 250 หน่วย สินค้าปลายงวดตาม FIFO คือเท่าไร ($)', explanation: 'FIFO ขาย 250 หน่วยเก่าสุด (120 หน่วยที่ $8 และ 130 หน่วยที่ $9) เหลือ 50 หน่วยที่ $9 และ 200 หน่วยที่ $11 = $2,650' });

  p.num(L52, 1, 'usd', A.netRealisableValue(72, 9),
    { concept: 'Net realisable value', prompt: 'An item can be sold for $72, after incurring $9 of selling costs. What is its net realisable value per unit ($)?', explanation: '72 - 9 = $63.' },
    { concept: 'มูลค่าสุทธิที่จะได้รับ', prompt: 'สินค้ารายการหนึ่งขายได้ $72 โดยมีต้นทุนการขาย $9 มูลค่าสุทธิที่จะได้รับต่อหน่วยคือเท่าไร ($)', explanation: '72 - 9 = $63' });
  p.num(L52, 2, 'usd', A.inventoryWriteDown(65, 63, 150),
    { concept: 'Inventory write-down', prompt: '150 units cost $65 each and have a net realisable value of $63 each. What write-down is required ($)?', explanation: '(65 - 63) x 150 = $300.' },
    { concept: 'การตัดลดสินค้าคงเหลือ', prompt: 'สินค้า 150 หน่วยมีต้นทุนหน่วยละ $65 และมูลค่าสุทธิที่จะได้รับหน่วยละ $63 ต้องตัดลดเท่าไร ($)', explanation: '(65 - 63) x 150 = $300' });

  const v = F.operatingCashFlowIndirect({ netIncome: 64_000, depreciation: 18_000, changeInAR: 9_000, changeInInventory: 5_000, changeInAP: 3_000 });
  p.num(L5, 2, 'usd', v,
    { concept: 'Operating cash flow (indirect method)', prompt: 'Net income is $64,000, depreciation $18,000, receivables rose by $9,000, inventory rose by $5,000 and payables rose by $3,000. What is operating cash flow ($)?', explanation: `64,000 + 18,000 - 9,000 - 5,000 + 3,000 = $${f0(v)}.` },
    { concept: 'กระแสเงินสดจากการดำเนินงาน (วิธีทางอ้อม)', prompt: 'กำไรสุทธิ $64,000 ค่าเสื่อมราคา $18,000 ลูกหนี้เพิ่ม $9,000 สินค้าคงเหลือเพิ่ม $5,000 และเจ้าหนี้เพิ่ม $3,000 กระแสเงินสดจากการดำเนินงานคือเท่าไร ($)', explanation: `64,000 + 18,000 - 9,000 - 5,000 + 3,000 = $${f0(v)}` });
}
