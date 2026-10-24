# MBA Business Lab - Curriculum Architecture and Implementation Plan

Status: Phase 1 deliverable (audit + design). No new content has been generated yet.
Disclaimer (to appear in the app): this is a self-study programme modelled on publicly described MBA core curricula. It awards no degree and has no accreditation.

---

## 1. Audit of the existing application

**Stack:** React 19, TypeScript, Vite, Tailwind 4, Recharts, Vitest, LocalStorage. About 2,000 lines, 33 tests. Free and open source throughout.

### Reusable as-is
| Component | Why it stays |
|---|---|
| `lib/finance.ts`, `lib/numeric.ts` | Pure, tested formulas; tolerance and parsing logic is sound |
| `lib/simulation.ts` | Deterministic, documented, equity identity tested - becomes Simulation 1 |
| `lib/progress.ts` reducer pattern | Good shape; needs a richer data model (below) |
| `ui.tsx`, `QuestionCard`, `QuizRunner`, hash router | Generic and small |

### Limitations
1. **Depth.** Six 10-minute lessons with 5 questions each. No learning objectives, misconceptions, case studies, further reading or levels. This is an introduction, not graduate-level.
2. **Content is code.** All lessons live in one TypeScript file with English strings and numbers embedded in prose. This cannot scale to ~12 subjects or two languages.
3. **No i18n.** Text is hardcoded in components and data. Thai needs one shared question ID and answer key with translated text only.
4. **No competency model.** Attempts carry a free-text `concept` string and a `lessonId`. Weak-subject detection works per lesson, so it cannot say "weak at working-capital analysis".
5. **Completion is not mastery.** A lesson is "complete" when its quiz is finished, whatever the score. The brief explicitly rules this out.
6. **No spaced repetition or cumulative exams.** Attempts are logged but never rescheduled.
7. **Only two question formats.** No short-answer, statement-analysis, multi-step or rubric-graded items; no difficulty levels.
8. **Fixed numbers.** Each question appears with the same figures. Fine for reproducibility, but a seeded variant system would make recall less likely to pass for understanding.
9. **Simulation scope.** One scenario, no uncertainty, no competitors, no post-decision analysis, no balance sheet or cash-flow statement as formal statements (it reports AR/inventory/AP/equity and an income and cash summary). Starting equity ($1.07M) is not split into debt/equity/fixed assets.
10. **Progress storage.** One LocalStorage blob with no schema migrations; no export/import backup.
11. **Test coverage.** Formula, simulation, reducer and content-integrity tests exist; no UI tests and no bilingual-parity tests.

### Errors found in current content
- **Fixed now:** Lesson 5 worked-example takeaway said working capital absorbed "$35,000". Correct statement: working capital absorbed $55,000 (AR +50k, inventory +30k, AP -25k), partly offset by the $20,000 depreciation add-back. OCF of $55,000 was already right.
- **Simplifications to label rather than hide:** DSO/DPO/DIO use period-end balances rather than averages; Lesson 1 teaches COGS only via the inventory formula (no FIFO/weighted-average); no tax or depreciation in the simulation. These need an explicit "limitations of this measure" note in the advanced units.
- All 30 numeric/MCQ answers were rechecked by hand while writing; each is covered by a formula test or an explicit calculation in its explanation.

---

## 2. Programme map

Program = **Core (12 subjects)** + **Integrated threads (6)** + **Capstone**.

| # | Subject | Typical units | Notes |
|---|---|---|---|
| 1 | Financial Accounting | 9 | Built first (Section 6) |
| 2 | Managerial Accounting | 8 | Costing, CVP, budgeting, variance, decision costing |
| 3 | Corporate Finance | 10 | TVM, DCF, cost of capital, appraisal, valuation, capital structure |
| 4 | Managerial Economics | 8 | Demand, cost, market structure, game theory, pricing |
| 5 | Marketing Management | 8 | Segmentation, pricing, CLV, channels, brand |
| 6 | Operations and Supply Chain | 8 | Process, capacity, queues, inventory models, quality |
| 7 | Business Strategy | 7 | Industry analysis, advantage, corporate strategy |
| 8 | Organizational Behavior and Leadership | 7 | Motivation, teams, change, power |
| 9 | Business Analytics and Statistics | 9 | Descriptive, inference, regression, forecasting |
| 10 | Entrepreneurship and Innovation | 6 | Lean startup, unit economics, funding |
| 11 | International Business | 6 | FX, trade, entry modes, political risk |
| 12 | Ethics, Governance and Risk | 6 | Stakeholders, governance, enterprise risk |

Integrated threads (taught inside subjects, assessed in capstone): **Business Communication**, **Negotiation**, **Project Management**, **Decision-Making Under Uncertainty** (expected value, decision trees, sensitivity), **Business Research Methods**, **Capstone Simulation**.

### Hierarchy and level scheme
PROGRAM > SUBJECT > UNIT > LESSON > (objectives, theory, maths, worked examples, applications, misconceptions, practice, case, assessment, further reading).

Each subject has units tagged **L1 Foundation / L2 Application / L3 Advanced Decision-Making**, a practical-applications unit, and a final exam. Levels:
- **L1:** terminology, formulas, interpretation. Tested with MCQ, one-step numerics.
- **L2:** multi-step problems, statement analysis, comparing alternatives.
- **L3:** incomplete data, stated assumptions, uncertainty, trade-offs; the answer is a defended recommendation. Difficulty comes from reasoning, never merely larger numbers.

### Prerequisite map (hard = must be mastered, soft = recommended)
```
Financial Accounting L1 ──► Managerial Accounting ──► Operations (costing, inventory)
        │                          │
        ├──► Corporate Finance ◄───┤ (hard: statements, cash flow)
        │          │
        │          └──► Business Strategy (corp. strategy)  International Business (FX)
Business Analytics (stats) ──► Corporate Finance L3 (risk), Marketing analytics, Operations (queues, forecasting), Research Methods
Managerial Economics ──► Marketing (pricing), Strategy (competition), Corporate Finance (soft)
Org Behavior ──► Negotiation, Leadership cases (soft)
Everything ──► Capstone
```
Hard edges are enforced at competency level (e.g. "Valuation" needs "Cash flow analysis" and "Time value of money" at mastery), not at lesson level. A consistency test will fail the build if any edge references a missing competency or forms a cycle.

---

## 3. Lesson and assessment standards

### Lesson contract (every lesson, validated by a schema test)
1. 3-6 measurable **learning objectives** (verbs: calculate, interpret, compare, defend), each linked to a competency.
2. **Conceptual foundations** (theory in own words, no textbook copying).
3. **Mathematical foundations**: variables, formulas, assumptions, limitations.
4. **At least two worked examples** with step-by-step solutions.
5. **Business applications** - how managers actually use it.
6. **Common misconceptions** with why they arise.
7. **Interactive practice** - mixed MCQ, numeric, applied reasoning.
8. **Case study** needing analysis.
9. **Assessment** items tagged by competency and level (L1/L2/L3).
10. **Further reading** - only real, verifiable sources, checked before inclusion. The initial list will be limited to well-known standard texts and open materials (e.g. OpenStax *Principles of Accounting*, *Principles of Finance*, *Principles of Management*; Damodaran's freely published valuation lectures; the IFRS Foundation and FASB public standards sites). I will confirm each title and URL online during content writing and omit anything I cannot verify.

### Assessment standards
| Format | Grading |
|---|---|
| MCQ | 4 plausible distractors, each tied to a specific error; every option explained |
| Numeric | Deterministic key, unit-aware tolerance, step-by-step solution after submit |
| Statement analysis | Multi-part numeric from a given statement; partial credit per part |
| Short answer / written recommendation | **Self-assessed against a transparent rubric** plus model answer. No keyword matching and no pretending an algorithm can grade reasoning |
| Case study | Structured questions plus a written recommendation graded by rubric |
| Simulation | Scored on outcomes and on post-decision analysis answers |

Rules: one defensible answer per item; distractors reflect real misconceptions; every L2/L3 item states its assumptions; each item tagged `competency`, `level`, `type`, `bloom`.

### Mastery model (replaces "lesson completed")
- Per-competency **mastery score** from recent attempts weighted by level (L3 counts more) and recency.
- Mastery requires: at least 8 attempts across at least 2 levels, accuracy >= 80% on the last 10, and at least one correct result from a spaced review at least 7 days after first learning.
- **Spaced repetition:** Leitner-style boxes per question (1, 3, 7, 21, 60 days); a correct answer promotes, a wrong one resets. A daily "Review" queue replaces random practice.
- **Cumulative assessments:** end-of-unit test, subject final exam, and a mixed exam covering everything studied. Final exams are timed optionally and drawn from unseen items.
- Weak competencies drive recommendations: link to the specific lesson section and a short targeted drill.

---

## 4. Content system and bilingual (EN/TH) design

```
src/
  curriculum/            # metadata only (JSON/TS): program, subjects, units, lessons, competencies, prerequisites
  content/
    <subject>/<lesson>/
      lesson.en.md  lesson.th.md      # prose (Markdown + frontmatter), no numbers that differ
      questions.json                  # ONE file: ids, type, level, competency, params, answer key, solution step formulas
      questions.en.json questions.th.json   # text only: prompt, options, explanations, rubrics
  engines/               # pure calculation engines per subject (no language, no UI)
  i18n/                  # UI strings en.json th.json
  progress/              # schema, migrations, mastery, spaced repetition
  ui/ pages/
```
Guarantees:
- **One answer key.** Language files contain no answers, numbers or formulas for keying; numbers appear in prose through `{placeholders}` filled from `questions.json` params, so values cannot diverge between languages.
- **Parity tests** fail the build if any ID, option count, placeholder set, rubric criterion or glossary term is missing in either language, or if a TH string is empty or identical to EN where it should not be.
- **Glossary** (`glossary.json`, EN/TH pairs for accounting and finance terms) maintained once and checked against content.
- Language switch is a UI setting stored separately from progress, so progress is untouched. Thai text is drafted by me and **flagged for review by a fluent finance-literate reader** before being marked verified; I cannot self-certify translation quality.
- Content is lazy-loaded per subject to fix the bundle size warning. LocalStorage progress gets a schema version, migrations, and JSON export/import.

---

## 5. Simulations
| Sim | Scope | Key mechanisms |
|---|---|---|
| 1 Small business | Existing food distributor | Rework to produce a full income statement, balance sheet and indirect cash-flow statement that reconcile; add fixed assets, loan, and a scenario with a supplier delay (a *scheduled*, documented shock rather than random); post-decision analysis questions; seeded scenario IDs for reproducibility |
| 2 Competitive | 2-4 AI competitors with rule-based strategies | Market share from price/marketing/quality attractiveness (logit model, documented), capacity constraints, seeded demand shocks with stated distributions |
| 3 Corporate | 3 business units, capital allocation, debt/equity financing, hurdle rates | NPV-based projects, risk, covenant limits, multi-year strategy |
All use a fixed seed per scenario so assessments are reproducible, plus invariants tested automatically: balance sheet balances, no negative inventory, cash identity, equity = opening + net income - distributions.

---

## 6. Proposed Financial Accounting syllabus (Subject 1)

Competencies (tracked individually): **FA1 Accrual accounting & recognition, FA2 Accounting equation & double entry, FA3 Financial statements, FA4 Working capital, FA5 Inventory valuation, FA6 Long-lived assets & depreciation, FA7 Liabilities & equity, FA8 Cash flow analysis, FA9 Ratio analysis, FA10 Earnings quality & statement analysis.**

| Unit | Level | Lessons | Competencies |
|---|---|---|---|
| U1 Foundations of financial reporting | L1 | Purpose and users of statements; accounting equation; transactions and double entry; trial balance | FA2 |
| U2 Accrual accounting | L1 | Revenue recognition basics; matching; accruals and deferrals; adjusting entries | FA1, FA2 |
| U3 The income statement | L1-L2 | Revenue, COGS, gross/operating/net profit *(reuse existing lessons 1-2)*; operating expenses; one-off items | FA3 |
| U4 The balance sheet and working capital | L1-L2 | Current assets/liabilities; receivables, bad debts and allowances; payables; inventory; working-capital cycle *(reuse lessons 3-4)* | FA3, FA4 |
| U5 Inventory valuation | L2 | FIFO, weighted average, LIFO (and where each is permitted); lower of cost and NRV; effect on profit and tax | FA5 |
| U6 Long-lived assets and financing | L2 | Capitalise vs expense; depreciation methods; impairment; debt, leases, equity, retained earnings | FA6, FA7 |
| U7 Cash flow statement | L2 | Indirect and direct methods *(reuse lesson 5)*; free cash flow; profit vs cash reconciliation | FA8 |
| U8 Financial statement analysis | L2-L3 | Liquidity, efficiency, leverage and profitability ratios; DuPont; common-size and trend analysis; limits of ratios | FA9 |
| U9 Earnings quality and judgment | L3 | Aggressive vs conservative accounting; red flags (receivables growth vs sales, cash vs profit divergence); comparing firms with different policies; writing an analyst recommendation | FA10 |
| Practical applications | L2-L3 | Break-even and margin analysis *(reuse lesson 6, moves to Managerial Accounting prerequisite bridge)*; full statement analysis case of a distributor; link to Simulation 1 | all |
| Final exam | mixed | 40 items drawn across FA1-FA10, three formats, one written recommendation | all |

Approximate size: 9 units, ~32 lessons, ~12-15 L1, ~12-15 L2, ~6-8 L3 items per competency pool. The case studies use fictional companies with invented numbers; no real company data is presented as real.

---

## 7. Phased implementation plan
| Phase | Deliverable (usable on completion) | Verification |
|---|---|---|
| 1 | This audit and design; Lesson 5 fix | Reviewed by you |
| 2 | Architecture: curriculum/content separation, schema, i18n framework and language switch (UI strings EN/TH), question bank format with params, competency-tagged attempts, progress schema v2 + migration of existing data, mastery and spaced-repetition engine, review queue, rubric self-assessment UI. Existing six lessons migrated into it **unchanged in substance** | Schema, parity, prerequisite-cycle and migration tests; existing 33 tests still pass |
| 3 | Financial Accounting U1-U9, final exam, glossary EN/TH | Independent re-computation script for every numeric key; objective/question alignment check; parity tests; TH flagged for human review |
| 4 | Quality pass: recalculate all answers independently, bilingual audit, progress and mastery scenario tests, mobile check | Test report |
| 5 | Managerial Accounting, then Corporate Finance (with a new DCF/WACC engine) | Same gates |
| 6 | Remaining subjects one at a time, ordered by prerequisites: Economics, Analytics, Marketing, Operations, Strategy, Org Behavior, Entrepreneurship, International, Ethics/Risk | Same gates |
| 7 | Simulations 2 and 3, integrated cases, capstone, cumulative exam | Invariant tests per simulation |

Each phase ends with a runnable app and passing tests. I will not start a subject until its prerequisite competencies and engine exist.

## 7a. Status update - Phase 2 complete

Decisions received: Thai content stays labelled "draft, unreviewed" (no reviewer available); proceed with Phase 2; further reading limited to verified sources.

Delivered (all covered by 66 automated tests):
- `src/curriculum/program.ts` - 12 subjects, 6 threads, units, 15 competencies, competency prerequisite DAG, verified references.
- `src/content/` - language-neutral keys (`keys.ts`) + EN/TH text per subject, resolved at render time; glossary; registry for adding subjects.
- `src/i18n/` - EN/TH interface strings, language switch stored separately from progress, type-enforced key parity.
- Progress schema v2 with automatic migration of existing v1 data, competency/level-tagged attempts, Leitner spaced repetition, mastery engine (not awarded for lesson completion), cumulative exams, backup export/import.
- Question type "written" with transparent rubric and self-assessment (no keyword grading). Two L3 examples added (credit-terms decision, profit-vs-cash diagnosis).
- Quizzes keep their question order when the language is switched mid-quiz.
- Existing 6 lessons migrated with the same numbers and answers; added learning objectives and common misconceptions to each. They are marked "foundation depth" until Phase 3 brings them to the full lesson contract (2+ worked examples, case study, per-lesson further reading).

Verified references: OpenStax *Principles of Accounting Vol. 1 (Financial)* and *Vol. 2 (Managerial)* and *Principles of Finance* appear in the OpenStax catalogue; IFRS Foundation site reachable; FASB site is real but blocked automated checks (HTTP 403), so it is listed on the strength of being the official US standard setter - confirm manually if you wish.

Known limits: Thai is an unreviewed draft; the competency list for Financial Accounting is defined but only 3 of 10 FA competencies (plus Cost-Volume-Profit) have content; Simulation 1 has not yet been rebuilt to produce full statements (Phase 7 / earlier if you prefer).

## 7b. Status update - foundation lessons for Subjects 2-12 written

All twelve subjects now have foundation-level content in English and Thai: 46 lessons (6 migrated Financial Accounting, 40 new), 279 questions of which 20 are written/rubric items, each lesson with a Level 3 item.

New per subject: `src/content/<subject>/{keys,en,th}.ts`, a pure calculation engine in `src/lib/engines/`, and an engine test that recomputes every numeric answer key independently (plus the numbers used in worked examples and written-answer model solutions).

Quality gates passing (109 automated tests): EN/TH structural parity, every number identical between languages, one answer key, every MCQ option explained, competency/prerequisite graph acyclic and consistent with subject prerequisites, and every "available" competency actually taught at 2+ levels.

Lessons are marked "foundation" (not "full"): each has objectives, theory, formulas/frameworks, one or two worked examples, misconceptions, 5-6 questions and a written/applied Level 3 item, but not yet the full contract (case study per lesson, second worked example everywhere, per-lesson further reading). Thai remains an unreviewed draft.

## 8. Decisions that were needed (answered)
1. **Thai review:** are you able to have a Thai reader check finance terminology, or should I mark all Thai content "draft - machine-assisted" until then?
2. **Pace:** proceed with Phase 2 (architecture) next, as the plan suggests?
3. **Further reading:** OK to restrict to a short list of sources I can verify online (open textbooks and official standards bodies), even if shorter than a typical syllabus?

## Update: Financial Accounting completed to 18 lessons

Twelve lessons (l47-l58) were added so every Financial Accounting unit is now teachable: foundations and double entry, accruals and adjusting entries, inventory costing and NRV, depreciation, debt and equity, ratio analysis (two lessons), earnings quality and policy comparison. Each has 6 questions (levels 1-3, with written Level 3 cases where applicable). Lessons are renumbered 1-18 in programme order (other subjects' numbers shift by 12; lesson ids are unchanged, so saved progress is unaffected). All seven previously "Planned" Financial Accounting competencies are now available. The new lessons are status "foundation"; Thai text is an unreviewed draft.
