import * as E from '../../lib/engines/economics';
import { Pool, f2 } from '../pool';

const L18 = 'l18-game-theory';

/** Question pool, part 3: top-up questions for game theory. */
export function part3(p: Pool): void {
  ([[[0.2, 0.5, 0.3], [60, 30, -10]], [[0.7, 0.3], [40, -20]], [[0.1, 0.4, 0.5], [200, 50, 0]]] as const).forEach(([probs, pay]) =>
    p.num(L18, 2, 'usd', E.expectedPayoff(probs as unknown as number[], pay as unknown as number[]),
      { concept: 'Expected payoff of a mixed outcome', prompt: `A launch pays ${pay.map((x) => `$${x}k`).join(', ')} in three possible rival reactions with probabilities ${probs.join(', ')} respectively. What is the expected payoff ($k)?`, explanation: `Expected payoff = $${f2(E.expectedPayoff(probs as unknown as number[], pay as unknown as number[]))}k.` },
      { concept: 'ผลตอบแทนที่คาดหวังของผลลัพธ์ผสม', prompt: `การเปิดตัวให้ผลตอบแทน ${pay.map((x) => `$${x} พัน`).join(' ')} ในปฏิกิริยาที่เป็นไปได้ของคู่แข่งตามลำดับด้วยความน่าจะเป็น ${probs.join(' ')} ผลตอบแทนที่คาดหวังคือเท่าไร ($พัน)`, explanation: `ผลตอบแทนที่คาดหวัง = $${f2(E.expectedPayoff(probs as unknown as number[], pay as unknown as number[]))} พัน` }));
  p.mcq(L18, 1,
    { concept: 'Simultaneous game', prompt: 'What does it mean for a game to be simultaneous?', explanation: 'Players choose their strategies at the same time, without knowing what the others have chosen.', correct: ['Players choose without knowing the others\' choices', 'No one observes the rival\'s move first.'], wrong: [['One player moves and the other watches', 'That is a sequential game.'], ['Players always cooperate', 'Cooperation is not implied.'], ['The game has only one player', 'A game needs several players.']] },
    { concept: 'เกมพร้อมกัน', prompt: 'เกมที่เล่นพร้อมกันหมายความว่าอย่างไร', explanation: 'ผู้เล่นเลือกกลยุทธ์พร้อมกันโดยไม่ทราบว่าผู้อื่นเลือกอะไร', correct: ['ผู้เล่นเลือกโดยไม่ทราบการเลือกของผู้อื่น', 'ไม่มีใครเห็นการเดินของคู่แข่งก่อน'], wrong: [['ผู้เล่นคนหนึ่งเดินและอีกคนดู', 'นั่นคือเกมตามลำดับ'], ['ผู้เล่นร่วมมือเสมอ', 'ไม่ได้บ่งชี้ความร่วมมือ'], ['เกมมีผู้เล่นเพียงคนเดียว', 'เกมต้องมีผู้เล่นหลายคน']] });
}
