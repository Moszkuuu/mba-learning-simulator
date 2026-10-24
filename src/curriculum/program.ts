/**
 * Curriculum metadata only: subjects, units, competencies and prerequisites.
 * Lesson prose and questions live in src/content. Nothing here depends on the UI language
 * except the display names, which are provided in both languages.
 */
import type { Lang, Level } from '../content/types';

export type Bilingual = Record<Lang, string>;

export interface Subject {
  id: string;
  number: number;
  name: Bilingual;
  /** 'available' = has lessons in the app; 'planned' = designed but not yet written. */
  status: 'available' | 'planned';
  /** Competency-level prerequisites are in COMPETENCY_PREREQS; these are subject-level. */
  requires: string[];
  recommends: string[];
}

export const SUBJECTS: Subject[] = [
  { id: 'financial-accounting', number: 1, name: { en: 'Financial Accounting', th: 'การบัญชีการเงิน' }, status: 'available', requires: [], recommends: [] },
  { id: 'managerial-accounting', number: 2, name: { en: 'Managerial Accounting', th: 'การบัญชีบริหาร' }, status: 'available', requires: ['financial-accounting'], recommends: [] },
  { id: 'corporate-finance', number: 3, name: { en: 'Corporate Finance', th: 'การเงินธุรกิจ' }, status: 'available', requires: ['financial-accounting'], recommends: ['managerial-accounting', 'analytics-statistics'] },
  { id: 'managerial-economics', number: 4, name: { en: 'Managerial Economics', th: 'เศรษฐศาสตร์สำหรับผู้บริหาร' }, status: 'available', requires: [], recommends: [] },
  { id: 'marketing', number: 5, name: { en: 'Marketing Management', th: 'การจัดการการตลาด' }, status: 'available', requires: [], recommends: ['managerial-economics', 'analytics-statistics'] },
  { id: 'operations', number: 6, name: { en: 'Operations and Supply Chain Management', th: 'การจัดการการดำเนินงานและโซ่อุปทาน' }, status: 'available', requires: [], recommends: ['managerial-accounting', 'analytics-statistics'] },
  { id: 'strategy', number: 7, name: { en: 'Business Strategy', th: 'กลยุทธ์ธุรกิจ' }, status: 'available', requires: [], recommends: ['managerial-economics', 'corporate-finance', 'analytics-statistics'] },
  { id: 'organizational-behavior', number: 8, name: { en: 'Organizational Behavior and Leadership', th: 'พฤติกรรมองค์การและภาวะผู้นำ' }, status: 'available', requires: [], recommends: [] },
  { id: 'analytics-statistics', number: 9, name: { en: 'Business Analytics and Statistics', th: 'การวิเคราะห์ธุรกิจและสถิติ' }, status: 'available', requires: [], recommends: [] },
  { id: 'entrepreneurship', number: 10, name: { en: 'Entrepreneurship and Innovation', th: 'ผู้ประกอบการและนวัตกรรม' }, status: 'available', requires: [], recommends: ['financial-accounting', 'marketing', 'corporate-finance'] },
  { id: 'international-business', number: 11, name: { en: 'International Business', th: 'ธุรกิจระหว่างประเทศ' }, status: 'available', requires: [], recommends: ['corporate-finance', 'managerial-economics', 'strategy'] },
  { id: 'ethics-governance-risk', number: 12, name: { en: 'Business Ethics, Governance, and Risk Management', th: 'จริยธรรมธุรกิจ ธรรมาภิบาล และการบริหารความเสี่ยง' }, status: 'available', requires: [], recommends: ['strategy', 'analytics-statistics'] },
];

export const THREADS: { id: string; name: Bilingual }[] = [
  { id: 'communication', name: { en: 'Business Communication', th: 'การสื่อสารทางธุรกิจ' } },
  { id: 'negotiation', name: { en: 'Negotiation', th: 'การเจรจาต่อรอง' } },
  { id: 'project-management', name: { en: 'Project Management', th: 'การบริหารโครงการ' } },
  { id: 'decisions-uncertainty', name: { en: 'Decision-Making Under Uncertainty', th: 'การตัดสินใจภายใต้ความไม่แน่นอน' } },
  { id: 'research-methods', name: { en: 'Business Research Methods', th: 'ระเบียบวิธีวิจัยทางธุรกิจ' } },
  { id: 'capstone', name: { en: 'Capstone Business Simulation', th: 'สถานการณ์จำลองธุรกิจแบบบูรณาการ' } },
];

export interface Unit {
  id: string;
  subjectId: string;
  name: Bilingual;
  /** Dominant level of the unit, used for display. */
  level: Level | 'mixed';
}

const U = (id: string, subjectId: string, en: string, th: string, level: Unit['level']): Unit => ({ id, subjectId, name: { en, th }, level });

export const UNITS: Unit[] = [
  U('u1-foundations', 'financial-accounting', 'Foundations of financial reporting', 'พื้นฐานการรายงานทางการเงิน', 1),
  U('u2-accrual', 'financial-accounting', 'Accrual accounting', 'การบัญชีตามเกณฑ์คงค้าง', 1),
  U('u3-income-statement', 'financial-accounting', 'The income statement', 'งบกำไรขาดทุน', 1),
  U('u4-balance-sheet-wc', 'financial-accounting', 'The balance sheet and working capital', 'งบดุลและเงินทุนหมุนเวียน', 2),
  U('u5-inventory', 'financial-accounting', 'Inventory valuation', 'การวัดมูลค่าสินค้าคงเหลือ', 2),
  U('u6-assets-financing', 'financial-accounting', 'Long-lived assets and financing', 'สินทรัพย์ระยะยาวและแหล่งเงินทุน', 2),
  U('u7-cash-flow', 'financial-accounting', 'The cash flow statement', 'งบกระแสเงินสด', 2),
  U('u8-analysis', 'financial-accounting', 'Financial statement analysis', 'การวิเคราะห์งบการเงิน', 'mixed'),
  U('u9-earnings-quality', 'financial-accounting', 'Earnings quality and judgment', 'คุณภาพกำไรและดุลยพินิจ', 3),
  U('applications', 'financial-accounting', 'Practical applications', 'การประยุกต์ใช้จริง', 'mixed'),
  U('ma-u1', 'managerial-accounting', 'Cost behaviour and classification', 'พฤติกรรมต้นทุนและการจำแนกต้นทุน', 1),
  U('ma-u2', 'managerial-accounting', 'Product costing', 'การคิดต้นทุนผลิตภัณฑ์', 2),
  U('ma-u3', 'managerial-accounting', 'Planning, budgeting and control', 'การวางแผน งบประมาณ และการควบคุม', 2),
  U('ma-u4', 'managerial-accounting', 'Decision analysis', 'การวิเคราะห์เพื่อการตัดสินใจ', 3),
  U('cf-u1', 'corporate-finance', 'Time value of money', 'มูลค่าของเงินตามเวลา', 1),
  U('cf-u2', 'corporate-finance', 'Investment appraisal', 'การประเมินโครงการลงทุน', 2),
  U('cf-u3', 'corporate-finance', 'Cost of capital and valuation', 'ต้นทุนเงินทุนและการประเมินมูลค่า', 3),
  U('me-u1', 'managerial-economics', 'Demand and elasticity', 'อุปสงค์และความยืดหยุ่น', 1),
  U('me-u2', 'managerial-economics', 'Costs and optimisation', 'ต้นทุนและการหาค่าที่เหมาะสมที่สุด', 2),
  U('me-u3', 'managerial-economics', 'Markets and strategic interaction', 'ตลาดและปฏิสัมพันธ์เชิงกลยุทธ์', 3),
  U('mk-u1', 'marketing', 'Customers and positioning', 'ลูกค้าและการวางตำแหน่ง', 1),
  U('mk-u2', 'marketing', 'Pricing and customer economics', 'การกำหนดราคาและเศรษฐศาสตร์ของลูกค้า', 2),
  U('op-u1', 'operations', 'Process and inventory', 'กระบวนการและสินค้าคงคลัง', 2),
  U('op-u2', 'operations', 'Capacity and quality', 'กำลังการผลิตและคุณภาพ', 2),
  U('st-u1', 'strategy', 'Industry and competitive advantage', 'อุตสาหกรรมและความได้เปรียบทางการแข่งขัน', 1),
  U('st-u2', 'strategy', 'Corporate strategy and uncertainty', 'กลยุทธ์ระดับบริษัทและความไม่แน่นอน', 3),
  U('ob-u1', 'organizational-behavior', 'Individuals and motivation', 'บุคคลและแรงจูงใจ', 1),
  U('ob-u2', 'organizational-behavior', 'Teams, leadership and change', 'ทีม ภาวะผู้นำ และการเปลี่ยนแปลง', 2),
  U('as-u1', 'analytics-statistics', 'Describing data and uncertainty', 'การอธิบายข้อมูลและความไม่แน่นอน', 1),
  U('as-u2', 'analytics-statistics', 'Inference and prediction', 'การอนุมานและการพยากรณ์', 2),
  U('en-u1', 'entrepreneurship', 'Starting and validating', 'การเริ่มต้นและการพิสูจน์แนวคิด', 1),
  U('en-u2', 'entrepreneurship', 'Economics and funding', 'เศรษฐศาสตร์และการระดมทุน', 2),
  U('ib-u1', 'international-business', 'Exchange rates and trade', 'อัตราแลกเปลี่ยนและการค้า', 2),
  U('ib-u2', 'international-business', 'Entering foreign markets', 'การเข้าสู่ตลาดต่างประเทศ', 2),
  U('eg-u1', 'ethics-governance-risk', 'Ethics and governance', 'จริยธรรมและธรรมาภิบาล', 1),
  U('eg-u2', 'ethics-governance-risk', 'Risk management', 'การบริหารความเสี่ยง', 2),
];

export interface Competency {
  id: string;
  subjectId: string;
  name: Bilingual;
  /** True when at least one lesson/question teaches this competency in the app. */
  available: boolean;
}

const C = (id: string, subjectId: string, en: string, th: string, available: boolean): Competency => ({ id, subjectId, name: { en, th }, available });

export const COMPETENCIES: Competency[] = [
  C('fa.accrual', 'financial-accounting', 'Accrual accounting and recognition', 'การบัญชีเกณฑ์คงค้างและการรับรู้รายการ', true),
  C('fa.double-entry', 'financial-accounting', 'Accounting equation and double entry', 'สมการบัญชีและการบันทึกบัญชีคู่', true),
  C('fa.financial-statements', 'financial-accounting', 'Income statement and margins', 'งบกำไรขาดทุนและอัตรากำไร', true),
  C('fa.working-capital', 'financial-accounting', 'Working capital', 'เงินทุนหมุนเวียน', true),
  C('fa.inventory-valuation', 'financial-accounting', 'Inventory valuation', 'การวัดมูลค่าสินค้าคงเหลือ', true),
  C('fa.long-lived-assets', 'financial-accounting', 'Long-lived assets and depreciation', 'สินทรัพย์ระยะยาวและค่าเสื่อมราคา', true),
  C('fa.liabilities-equity', 'financial-accounting', 'Liabilities and equity', 'หนี้สินและส่วนของเจ้าของ', true),
  C('fa.cash-flow', 'financial-accounting', 'Cash flow analysis', 'การวิเคราะห์กระแสเงินสด', true),
  C('fa.ratio-analysis', 'financial-accounting', 'Ratio analysis', 'การวิเคราะห์อัตราส่วนทางการเงิน', true),
  C('fa.earnings-quality', 'financial-accounting', 'Earnings quality and statement analysis', 'คุณภาพกำไรและการวิเคราะห์งบการเงิน', true),
  C('ma.cost-behaviour', 'managerial-accounting', 'Cost behaviour and classification', 'พฤติกรรมต้นทุนและการจำแนกต้นทุน', true),
  C('ma.cvp', 'managerial-accounting', 'Cost-volume-profit and break-even', 'ความสัมพันธ์ต้นทุน-ปริมาณ-กำไรและจุดคุ้มทุน', true),
  C('ma.costing', 'managerial-accounting', 'Product costing and overhead', 'การคิดต้นทุนผลิตภัณฑ์และค่าใช้จ่ายการผลิตรวม', true),
  C('ma.budgeting', 'managerial-accounting', 'Budgeting and variance analysis', 'งบประมาณและการวิเคราะห์ผลต่าง', true),
  C('ma.relevant-costs', 'managerial-accounting', 'Relevant costs and decisions', 'ต้นทุนที่เกี่ยวข้องและการตัดสินใจ', true),
  C('cf.tvm', 'corporate-finance', 'Time value of money', 'มูลค่าของเงินตามเวลา', true),
  C('cf.appraisal', 'corporate-finance', 'Investment appraisal (NPV, IRR, payback)', 'การประเมินโครงการลงทุน (NPV, IRR, ระยะเวลาคืนทุน)', true),
  C('cf.cost-of-capital', 'corporate-finance', 'Cost of capital', 'ต้นทุนของเงินทุน', true),
  C('cf.valuation', 'corporate-finance', 'Valuation', 'การประเมินมูลค่ากิจการ', true),
  C('me.demand', 'managerial-economics', 'Demand and elasticity', 'อุปสงค์และความยืดหยุ่น', true),
  C('me.costs-marginal', 'managerial-economics', 'Costs and marginal analysis', 'ต้นทุนและการวิเคราะห์ส่วนเพิ่ม', true),
  C('me.market-structure', 'managerial-economics', 'Market structure and pricing power', 'โครงสร้างตลาดและอำนาจในการกำหนดราคา', true),
  C('me.game-theory', 'managerial-economics', 'Strategic interaction and game theory', 'ปฏิสัมพันธ์เชิงกลยุทธ์และทฤษฎีเกม', true),
  C('mk.stp', 'marketing', 'Segmentation, targeting and positioning', 'การแบ่งส่วนตลาด การเลือกตลาดเป้าหมาย และการวางตำแหน่ง', true),
  C('mk.pricing', 'marketing', 'Value-based pricing', 'การกำหนดราคาตามคุณค่า', true),
  C('mk.customer-economics', 'marketing', 'Customer economics (CAC, lifetime value)', 'เศรษฐศาสตร์ของลูกค้า (CAC และมูลค่าตลอดอายุลูกค้า)', true),
  C('op.process', 'operations', 'Process analysis and bottlenecks', 'การวิเคราะห์กระบวนการและคอขวด', true),
  C('op.inventory', 'operations', 'Inventory models', 'แบบจำลองสินค้าคงคลัง', true),
  C('op.capacity-queues', 'operations', 'Capacity and queues', 'กำลังการผลิตและแถวคอย', true),
  C('op.quality', 'operations', 'Quality management', 'การจัดการคุณภาพ', true),
  C('st.industry', 'strategy', 'Industry analysis', 'การวิเคราะห์อุตสาหกรรม', true),
  C('st.advantage', 'strategy', 'Competitive advantage', 'ความได้เปรียบทางการแข่งขัน', true),
  C('st.corporate', 'strategy', 'Corporate strategy and portfolios', 'กลยุทธ์ระดับบริษัทและพอร์ตโฟลิโอ', true),
  C('st.uncertainty', 'strategy', 'Decisions under uncertainty', 'การตัดสินใจภายใต้ความไม่แน่นอน', true),
  C('ob.motivation', 'organizational-behavior', 'Motivation', 'แรงจูงใจ', true),
  C('ob.teams', 'organizational-behavior', 'Teams and group dynamics', 'ทีมและพลวัตกลุ่ม', true),
  C('ob.leadership', 'organizational-behavior', 'Leadership', 'ภาวะผู้นำ', true),
  C('ob.change', 'organizational-behavior', 'Managing change', 'การบริหารการเปลี่ยนแปลง', true),
  C('as.descriptive', 'analytics-statistics', 'Descriptive statistics', 'สถิติเชิงพรรณนา', true),
  C('as.probability', 'analytics-statistics', 'Probability and expected value', 'ความน่าจะเป็นและค่าคาดหวัง', true),
  C('as.inference', 'analytics-statistics', 'Statistical inference', 'การอนุมานเชิงสถิติ', true),
  C('as.regression', 'analytics-statistics', 'Regression and forecasting', 'การถดถอยและการพยากรณ์', true),
  C('en.lean', 'entrepreneurship', 'Validating ideas (lean start-up)', 'การพิสูจน์แนวคิด (ลีนสตาร์ทอัป)', true),
  C('en.unit-economics', 'entrepreneurship', 'Unit economics, burn and runway', 'เศรษฐศาสตร์ต่อหน่วย อัตราเผาเงิน และระยะเวลาเงินทุน', true),
  C('en.funding', 'entrepreneurship', 'Funding and dilution', 'การระดมทุนและการลดสัดส่วนความเป็นเจ้าของ', true),
  C('ib.fx', 'international-business', 'Exchange rates and parity', 'อัตราแลกเปลี่ยนและความเท่าเทียม', true),
  C('ib.trade', 'international-business', 'Trade and comparative advantage', 'การค้าและความได้เปรียบโดยเปรียบเทียบ', true),
  C('ib.entry', 'international-business', 'Market entry and country risk', 'การเข้าสู่ตลาดและความเสี่ยงประเทศ', true),
  C('eg.ethics', 'ethics-governance-risk', 'Ethical reasoning and stakeholders', 'การให้เหตุผลเชิงจริยธรรมและผู้มีส่วนได้เสีย', true),
  C('eg.governance', 'ethics-governance-risk', 'Corporate governance', 'ธรรมาภิบาลองค์กร', true),
  C('eg.risk', 'ethics-governance-risk', 'Enterprise risk management', 'การบริหารความเสี่ยงองค์กร', true),
];

/** [competency, requires]: "you should master `requires` before `competency`". Must form a DAG. */
export const COMPETENCY_PREREQS: [string, string][] = [
  ['fa.accrual', 'fa.double-entry'],
  ['fa.financial-statements', 'fa.double-entry'],
  ['fa.working-capital', 'fa.financial-statements'],
  ['fa.inventory-valuation', 'fa.financial-statements'],
  ['fa.long-lived-assets', 'fa.financial-statements'],
  ['fa.liabilities-equity', 'fa.double-entry'],
  ['fa.cash-flow', 'fa.working-capital'],
  ['fa.ratio-analysis', 'fa.financial-statements'],
  ['fa.earnings-quality', 'fa.ratio-analysis'],
  ['fa.earnings-quality', 'fa.cash-flow'],
  ['ma.cost-behaviour', 'fa.financial-statements'],
  ['ma.cvp', 'ma.cost-behaviour'],
  ['ma.costing', 'ma.cost-behaviour'],
  ['ma.budgeting', 'ma.costing'],
  ['ma.relevant-costs', 'ma.cvp'],
  ['cf.appraisal', 'cf.tvm'],
  ['cf.appraisal', 'fa.cash-flow'],
  ['cf.cost-of-capital', 'cf.tvm'],
  ['cf.cost-of-capital', 'fa.liabilities-equity'],
  ['cf.valuation', 'cf.appraisal'],
  ['cf.valuation', 'cf.cost-of-capital'],
  ['cf.valuation', 'fa.ratio-analysis'],
  ['me.costs-marginal', 'me.demand'],
  ['me.market-structure', 'me.costs-marginal'],
  ['me.game-theory', 'me.market-structure'],
  ['mk.pricing', 'mk.stp'],
  ['mk.pricing', 'me.demand'],
  ['mk.customer-economics', 'mk.pricing'],
  ['op.inventory', 'ma.cost-behaviour'],
  ['op.capacity-queues', 'op.process'],
  ['op.capacity-queues', 'as.probability'],
  ['op.quality', 'as.descriptive'],
  ['st.advantage', 'st.industry'],
  ['st.corporate', 'st.advantage'],
  ['st.corporate', 'cf.valuation'],
  ['st.uncertainty', 'as.probability'],
  ['ob.teams', 'ob.motivation'],
  ['ob.leadership', 'ob.teams'],
  ['ob.change', 'ob.leadership'],
  ['as.probability', 'as.descriptive'],
  ['as.inference', 'as.probability'],
  ['as.regression', 'as.inference'],
  ['en.unit-economics', 'en.lean'],
  ['en.unit-economics', 'mk.customer-economics'],
  ['en.funding', 'en.unit-economics'],
  ['en.funding', 'cf.valuation'],
  ['ib.fx', 'cf.tvm'],
  ['ib.trade', 'me.market-structure'],
  ['ib.entry', 'st.advantage'],
  ['eg.governance', 'eg.ethics'],
  ['eg.risk', 'as.probability'],
  ['eg.risk', 'eg.governance'],
];

export interface Reference {
  title: string;
  author: string;
  url: string;
  note: Bilingual;
}

/** Only sources that exist and were checked. Add nothing here that has not been verified. */
export const REFERENCES: Record<string, Reference[]> = {
  'financial-accounting': [
    { title: 'Principles of Accounting, Volume 1: Financial Accounting', author: 'OpenStax (open textbook)', url: 'https://openstax.org/subjects/business', note: { en: 'Free university-level textbook covering statements, inventory, working capital and cash flow.', th: 'ตำราระดับมหาวิทยาลัยแบบเปิด ใช้ฟรี ครอบคลุมงบการเงิน สินค้าคงเหลือ เงินทุนหมุนเวียน และกระแสเงินสด' } },
    { title: 'IFRS Foundation - IFRS Accounting Standards', author: 'IFRS Foundation', url: 'https://www.ifrs.org/', note: { en: 'Official source for international financial reporting standards.', th: 'แหล่งข้อมูลทางการของมาตรฐานการรายงานทางการเงินระหว่างประเทศ' } },
    { title: 'Financial Accounting Standards Board', author: 'FASB', url: 'https://www.fasb.org/', note: { en: 'Official source for US GAAP.', th: 'แหล่งข้อมูลทางการของ US GAAP' } },
  ],
  'managerial-accounting': [
    { title: 'Principles of Accounting, Volume 2: Managerial Accounting', author: 'OpenStax (open textbook)', url: 'https://openstax.org/subjects/business', note: { en: 'Free textbook covering cost-volume-profit, budgeting and decision costing.', th: 'ตำราเปิดใช้ฟรี ครอบคลุมความสัมพันธ์ต้นทุน-ปริมาณ-กำไร งบประมาณ และต้นทุนเพื่อการตัดสินใจ' } },
  ],
  'corporate-finance': [
    { title: 'Principles of Finance', author: 'OpenStax (open textbook)', url: 'https://openstax.org/subjects/business', note: { en: 'Free textbook covering time value of money, capital budgeting, cost of capital and valuation.', th: 'ตำราเปิดใช้ฟรี ครอบคลุมมูลค่าของเงินตามเวลา การจัดทำงบประมาณลงทุน ต้นทุนเงินทุน และการประเมินมูลค่า' } },
  ],
  'managerial-economics': [
    { title: 'Principles of Microeconomics', author: 'OpenStax (open textbook)', url: 'https://openstax.org/', note: { en: 'Free textbook on demand, elasticity, costs, market structures and game theory.', th: 'ตำราเปิดใช้ฟรี ว่าด้วยอุปสงค์ ความยืดหยุ่น ต้นทุน โครงสร้างตลาด และทฤษฎีเกม' } },
  ],
  'analytics-statistics': [
    { title: 'Introductory Business Statistics', author: 'OpenStax (open textbook)', url: 'https://openstax.org/', note: { en: 'Free textbook on descriptive statistics, probability, inference and regression.', th: 'ตำราเปิดใช้ฟรี ว่าด้วยสถิติเชิงพรรณนา ความน่าจะเป็น การอนุมาน และการถดถอย' } },
  ],
  'organizational-behavior': [
    { title: 'Principles of Management', author: 'OpenStax (open textbook)', url: 'https://openstax.org/subjects/business', note: { en: 'Free textbook including motivation, teams, leadership and change.', th: 'ตำราเปิดใช้ฟรี รวมแรงจูงใจ ทีม ภาวะผู้นำ และการเปลี่ยนแปลง' } },
  ],
  'entrepreneurship': [
    { title: 'Entrepreneurship', author: 'OpenStax (open textbook)', url: 'https://openstax.org/subjects/business', note: { en: 'Free textbook on opportunity recognition, business models and funding.', th: 'ตำราเปิดใช้ฟรี ว่าด้วยการมองเห็นโอกาส โมเดลธุรกิจ และการระดมทุน' } },
  ],
};

// ---------- helpers ----------
export const subjectById = (id: string): Subject | undefined => SUBJECTS.find((s) => s.id === id);
export const competencyById = (id: string): Competency | undefined => COMPETENCIES.find((c) => c.id === id);
export const unitsOf = (subjectId: string): Unit[] => UNITS.filter((u) => u.subjectId === subjectId);
export const prerequisitesOf = (competencyId: string): string[] =>
  COMPETENCY_PREREQS.filter(([c]) => c === competencyId).map(([, r]) => r);
