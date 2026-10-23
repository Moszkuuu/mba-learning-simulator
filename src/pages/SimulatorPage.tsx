import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useProgress } from '../components/ProgressContext';
import { Alert, Badge, Button, Card, H2, PageTitle, Stat } from '../components/ui';
import { money, parseNumericInput } from '../lib/numeric';
import {
  CUSTOMER_TERMS, MONTH_NAMES, SIM, SUPPLIER_TERMS, defaultDecision, demandFor, equityOf, initialState, payablesBalance,
  receivablesBalance, simulateMonth, summarize, unitCostFor, validateDecision, type MonthResult, type SimState, type SimWarning,
} from '../lib/simulation';
import { dio, dpo, dso } from '../lib/finance';
import { useI18n } from '../i18n';
import type { TKey } from '../i18n/en';

type T = (key: TKey, vars?: Record<string, string | number>) => string;

const COLORS = { cash: '#4338ca', ar: '#0369a1', inv: '#b45309', ap: '#be123c', rev: '#0f766e', profit: '#4338ca' };
const compact = (n: number) => `${n < 0 ? '-' : ''}$${Math.abs(n) >= 1000 ? `${Math.round(Math.abs(n) / 1000)}k` : Math.abs(Math.round(n))}`;
const monthName = (m: number, t: T) => t(`month.${m}` as 'month.1');

interface Draft { price: string; marketing: string; purchases: string; customer: number; supplier: number }

function draftFrom(d: ReturnType<typeof defaultDecision>): Draft {
  return { price: (d.priceIndex * SIM.basePrice).toFixed(2), marketing: String(d.marketing), purchases: String(d.purchases), customer: d.customerTermsDays, supplier: d.supplierTermsDays };
}

function warningText(w: SimWarning, t: T): { tone: 'red' | 'amber'; title?: string; text: string } {
  const n = (x: number) => x.toLocaleString('en-US');
  switch (w.code) {
    case 'stockout': return { tone: 'amber', text: t('sim.warnStockout', { demand: n(w.demand), sold: n(w.sold), lost: n(w.lost) }) };
    case 'liquidity': return { tone: 'red', title: t('sim.liquidityTitle'), text: t('sim.liquidityBody', { cash: money(w.cash), rate: (SIM.overdraftRate * 100).toFixed(1), limit: money(SIM.overdraftLimit) }) };
    case 'default': return { tone: 'red', title: t('sim.defaultTitle'), text: t('sim.defaultBody') };
  }
}

function Field({ id, label, hint, value, onChange, error }: { id: string; label: string; hint: string; value: string; onChange: (v: string) => void; error?: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-800">{label}</label>
      <input id={id} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={error}
        className={`w-full rounded-lg border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-200 ${error ? 'border-red-500' : 'border-slate-300 focus:border-indigo-500'}`} />
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function SelectField({ id, label, hint, value, options, onChange, t }: { id: string; label: string; hint: string; value: number; options: readonly number[]; onChange: (v: number) => void; t: T }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-800">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base">
        {options.map((o) => <option key={o} value={o}>{o === 0 ? t('sim.immediate') : t('sim.days', { n: o })}</option>)}
      </select>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

const Row = ({ label, value, strong, negative }: { label: string; value: number; strong?: boolean; negative?: boolean }) => (
  <tr className={strong ? 'border-t border-slate-300 font-semibold' : ''}>
    <td className="py-1 pr-2">{label}</td>
    <td className="py-1 text-right tabular-nums">{negative && value > 0 ? `(${money(value)})` : money(value)}</td>
  </tr>
);

function MonthDetail({ r, t }: { r: MonthResult; t: T }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-slate-700">{t('sim.incomeStatement')} - {monthName(r.month, t)}</h3>
        <table className="w-full text-sm"><tbody>
          <Row label={t('sim.revenueRow', { units: r.unitsSold.toLocaleString('en-US'), price: r.price.toFixed(2) })} value={r.revenue} />
          <Row label={t('sim.cogs')} value={r.cogs} negative />
          <Row label={t('sim.grossProfit')} value={r.grossProfit} strong />
          <Row label={t('sim.fixedCosts')} value={r.fixedCosts} negative />
          <Row label={t('sim.marketing')} value={r.marketing} negative />
          <Row label={t('sim.holding')} value={r.holdingCost} negative />
          <Row label={t('sim.badDebt')} value={r.badDebt} negative />
          <Row label={t('sim.operatingProfit')} value={r.operatingProfit} strong />
          <Row label={t('sim.interest')} value={r.interest} negative />
          <Row label={t('sim.netProfit')} value={r.netProfit} strong />
        </tbody></table>
      </div>
      <div>
        <h3 className="mb-1 text-sm font-semibold text-slate-700">{t('sim.cashFlow')}</h3>
        <table className="w-full text-sm"><tbody>
          <Row label={t('sim.openingCash')} value={r.openingCash} />
          <Row label={t('sim.collected')} value={r.collections} />
          <Row label={t('sim.paidSuppliers')} value={r.supplierPayments} negative />
          <Row label={t('sim.overheadsPaid')} value={r.fixedCosts + r.marketing + r.holdingCost} negative />
          <Row label={t('sim.interest')} value={r.interest} negative />
          <Row label={t('sim.closingCash')} value={r.closingCash} strong />
        </tbody></table>
        <p className="mt-2 text-xs text-slate-500">{t('sim.profitVsCash', { revenue: money(r.revenue), collected: money(r.collections), purchases: money(r.purchases) })}</p>
      </div>
    </div>
  );
}

export default function SimulatorPage() {
  const { progress, dispatch } = useProgress();
  const { t } = useI18n();
  const state: SimState = progress.simState ?? initialState();
  const last = state.history[state.history.length - 1];
  const [draft, setDraft] = useState<Draft>(() => draftFrom(last ? last.decision : defaultDecision()));
  const [confirmRestart, setConfirmRestart] = useState(false);
  const running = state.status === 'running';

  const parsed = useMemo(() => {
    const p = parseNumericInput(draft.price), m = parseNumericInput(draft.marketing), u = parseNumericInput(draft.purchases);
    return validateDecision({
      priceIndex: p === null ? NaN : p / SIM.basePrice,
      marketing: m === null ? NaN : m,
      purchases: u === null ? NaN : u,
      customerTermsDays: draft.customer,
      supplierTermsDays: draft.supplier,
    });
  }, [draft]);
  const bad = (field: string) => parsed.errors.some((e) => e.field === field);

  const forecast = useMemo(() => {
    const d = parsed.decision;
    const stock = Math.floor(state.inventoryUnits + d.purchases / unitCostFor(d.supplierTermsDays));
    const mStock = d.marketing + SIM.marketingCarryover * state.marketingStock;
    const demand = demandFor(state.month, d, mStock);
    return { demand, stock, sold: Math.min(demand.units, stock), unitCost: unitCostFor(d.supplierTermsDays) };
  }, [parsed, state]);

  function run() {
    if (!running || parsed.errors.length) return;
    const { state: next } = simulateMonth(state, parsed.decision);
    dispatch({ type: 'saveSim', state: next });
    if (next.status !== 'running') dispatch({ type: 'finishSim', result: summarize(next) });
  }

  function restart() {
    dispatch({ type: 'saveSim', state: null });
    dispatch({ type: 'simStarted' });
    setDraft(draftFrom(defaultDecision()));
    setConfirmRestart(false);
  }

  const chartData = state.history.map((m) => ({
    name: monthName(m.month, t), [t('sim.chartCash')]: m.closingCash, [t('sim.chartRevenue')]: m.revenue, [t('sim.chartOpProfit')]: m.operatingProfit,
    [t('sim.chartAR')]: m.accountsReceivable, [t('sim.chartInv')]: m.inventory, [t('sim.chartAP')]: m.accountsPayable,
  }));
  const summary = summarize(state);
  const liquidity = state.cash < 0;
  const monthLabel = running ? t('sim.monthLabel', { name: monthName(state.month, t), n: state.month, total: SIM.months }) : t('sim.finished');
  const fmtErr = (e: { field: string; message: string }) => (e.field === 'priceIndex' ? t('sim.errPrice', { min: SIM.limits.priceIndex.min * SIM.basePrice, max: SIM.limits.priceIndex.max * SIM.basePrice }) : e.field === 'marketing' ? t('sim.errMarketing', { max: SIM.limits.marketing.max.toLocaleString('en-US') }) : t('sim.errPurchases', { max: SIM.limits.purchases.max.toLocaleString('en-US') }));

  return (
    <div>
      <PageTitle title={t('nav.simulator')} subtitle={t('sim.subtitle')} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label={t('sim.month')} value={monthLabel} />
        <Stat label={t('sim.cash')} value={money(state.cash)} tone={liquidity ? 'text-red-700' : 'text-slate-900'} />
        <Stat label={t('sim.receivables')} value={money(receivablesBalance(state))} />
        <Stat label={t('sim.inventory')} value={money(state.inventoryValue)} hint={t('sim.units', { n: Math.round(state.inventoryUnits).toLocaleString('en-US') })} />
        <Stat label={t('sim.payables')} value={money(payablesBalance(state))} />
        <Stat label={t('sim.equity')} value={money(equityOf(state))} hint={t('sim.equityHint')} />
      </div>

      <div className="mt-4 space-y-3">
        {liquidity && <Alert tone="red" title={t('sim.liquidityTitle')}>{t('sim.liquidityBody', { cash: money(state.cash), rate: (SIM.overdraftRate * 100).toFixed(1), limit: money(SIM.overdraftLimit) })}</Alert>}
        {state.status === 'defaulted' && <Alert tone="red" title={t('sim.defaultTitle')}>{t('sim.defaultBody')}</Alert>}
        {last && last.warnings.filter((w) => w.code === 'stockout').map((w, i) => { const x = warningText(w, t); return <Alert key={i} tone={x.tone}>{x.text}</Alert>; })}
      </div>

      {running ? (
        <Card className="mt-4">
          <H2>{t('sim.decisionsFor', { name: monthName(state.month, t) })}</H2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Field id="price" label={t('sim.price')} hint={t('sim.priceHint', { min: SIM.limits.priceIndex.min * SIM.basePrice, max: SIM.limits.priceIndex.max * SIM.basePrice })} value={draft.price} onChange={(v) => setDraft({ ...draft, price: v })} error={bad('priceIndex')} />
            <Field id="marketing" label={t('sim.marketingSpend')} hint={t('sim.marketingHint', { max: SIM.limits.marketing.max.toLocaleString('en-US') })} value={draft.marketing} onChange={(v) => setDraft({ ...draft, marketing: v })} error={bad('marketing')} />
            <Field id="purchases" label={t('sim.purchases')} hint={t('sim.purchasesHint', { max: SIM.limits.purchases.max.toLocaleString('en-US'), cost: forecast.unitCost.toFixed(2) })} value={draft.purchases} onChange={(v) => setDraft({ ...draft, purchases: v })} error={bad('purchases')} />
            <SelectField id="cterms" label={t('sim.customerTerms')} hint={t('sim.customerTermsHint')} value={draft.customer} options={CUSTOMER_TERMS} onChange={(v) => setDraft({ ...draft, customer: v })} t={t} />
            <SelectField id="sterms" label={t('sim.supplierTerms')} hint={t('sim.supplierTermsHint')} value={draft.supplier} options={SUPPLIER_TERMS} onChange={(v) => setDraft({ ...draft, supplier: v })} t={t} />
          </div>
          {parsed.errors.length > 0 && <ul role="alert" className="mt-3 list-inside list-disc text-sm font-medium text-red-700">{parsed.errors.map((e) => <li key={e.field}>{fmtErr(e)}</li>)}</ul>}
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-semibold">{t('sim.preview')}</p>
            <p>{t('sim.previewBody', { demand: forecast.demand.units.toLocaleString('en-US'), season: forecast.demand.seasonality.toFixed(2), price: forecast.demand.price.toFixed(2), mkt: forecast.demand.marketing.toFixed(2), terms: forecast.demand.terms.toFixed(3), stock: forecast.stock.toLocaleString('en-US'), sold: forecast.sold.toLocaleString('en-US') })}</p>
            {forecast.demand.units > forecast.stock && <p className="mt-1 font-medium text-amber-800">{t('sim.previewLost', { n: (forecast.demand.units - forecast.stock).toLocaleString('en-US') })}</p>}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={run} disabled={parsed.errors.length > 0}>{t('sim.run', { name: monthName(state.month, t) })}</Button>
            <Button tone="secondary" onClick={() => setDraft(draftFrom(defaultDecision()))}>{t('sim.resetDecisions')}</Button>
          </div>
        </Card>
      ) : (
        <Card className="mt-4">
          <H2>{state.status === 'completed' ? t('sim.yearComplete') : t('sim.endedEarly')}</H2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label={t('sim.monthsPlayed')} value={summary.months} />
            <Stat label={t('sim.totalRevenue')} value={money(summary.totalRevenue)} />
            <Stat label={t('sim.cumProfit')} value={money(summary.cumulativeProfit)} tone={summary.cumulativeProfit < 0 ? 'text-red-700' : 'text-emerald-700'} />
            <Stat label={t('sim.finalEquity')} value={money(summary.finalEquity)} hint={t('sim.startedAt', { v: money(equityOf(initialState())) })} />
            <Stat label={t('sim.lowestCash')} value={money(summary.minCash)} />
            <Stat label={t('sim.lostSales')} value={t('sim.units', { n: summary.lostUnits.toLocaleString('en-US') })} />
          </div>
          <p className="mt-3 text-sm text-slate-600">{t('sim.endNote')}</p>
          <div className="mt-3"><Button onClick={restart}>{t('sim.startNew')}</Button></div>
        </Card>
      )}

      {last && (
        <Card className="mt-4">
          <H2>{t('sim.lastMonth', { name: monthName(last.month, t) })}</H2>
          <MonthDetail r={last} t={t} />
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Badge tone="indigo">DSO {dso(last.accountsReceivable, last.revenue, SIM.daysPerMonth).toFixed(0)} {t('sim.daysShort')}</Badge>
            <Badge tone="indigo">DIO {dio(last.inventory, last.cogs, SIM.daysPerMonth).toFixed(0)} {t('sim.daysShort')}</Badge>
            <Badge tone="indigo">DPO {dpo(last.accountsPayable, last.cogs, SIM.daysPerMonth).toFixed(0)} {t('sim.daysShort')}</Badge>
            <Badge tone="indigo">{t('sim.grossMargin')} {(last.revenue ? (last.grossProfit / last.revenue) * 100 : 0).toFixed(1)}%</Badge>
          </div>
        </Card>
      )}

      {chartData.length > 0 && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <H2>{t('sim.chartCashTitle')}</H2>
            <div className="h-64" role="img" aria-label={t('sim.chartCashTitle')}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={compact} width={60} /><Tooltip formatter={(v) => money(Number(v))} /><ReferenceLine y={0} stroke="#b91c1c" /><Line type="monotone" dataKey={t('sim.chartCash')} stroke={COLORS.cash} strokeWidth={2} dot /></LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <H2>{t('sim.chartRevProfitTitle')}</H2>
            <div className="h-64" role="img" aria-label={t('sim.chartRevProfitTitle')}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={compact} width={60} /><Tooltip formatter={(v) => money(Number(v))} /><Legend /><Bar dataKey={t('sim.chartRevenue')} fill={COLORS.rev} /><Bar dataKey={t('sim.chartOpProfit')} fill={COLORS.profit} /></BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="lg:col-span-2">
            <H2>{t('sim.chartWcTitle')}</H2>
            <div className="h-64" role="img" aria-label={t('sim.chartWcTitle')}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={compact} width={60} /><Tooltip formatter={(v) => money(Number(v))} /><Legend /><Line type="monotone" dataKey={t('sim.chartAR')} stroke={COLORS.ar} strokeWidth={2} /><Line type="monotone" dataKey={t('sim.chartInv')} stroke={COLORS.inv} strokeWidth={2} /><Line type="monotone" dataKey={t('sim.chartAP')} stroke={COLORS.ap} strokeWidth={2} strokeDasharray="5 3" /></LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {state.history.length > 0 && (
        <Card className="mt-4">
          <H2>{t('sim.monthlyResults')}</H2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] text-right text-sm tabular-nums">
              <thead className="text-xs uppercase text-slate-500"><tr>
                {(['sim.month', 'sim.colRevenue', 'sim.cogs', 'sim.grossProfit', 'sim.colOpProfit', 'sim.colCollected', 'sim.colPaid', 'sim.colAR', 'sim.inventory', 'sim.colAP', 'sim.cash'] as const).map((h, i) => <th key={h} className={`py-2 ${i === 0 ? 'text-left' : ''}`}>{t(h)}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {state.history.map((m) => (
                  <tr key={m.month} className={m.closingCash < 0 ? 'bg-red-50' : ''}>
                    <td className="py-1.5 text-left">{monthName(m.month, t)}</td><td>{money(m.revenue)}</td><td>{money(m.cogs)}</td><td>{money(m.grossProfit)}</td><td>{money(m.operatingProfit)}</td>
                    <td>{money(m.collections)}</td><td>{money(m.supplierPayments)}</td><td>{money(m.accountsReceivable)}</td><td>{money(m.inventory)}</td><td>{money(m.accountsPayable)}</td><td className={m.closingCash < 0 ? 'font-semibold text-red-700' : ''}>{money(m.closingCash)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card className="mt-4">
        <details>
          <summary className="cursor-pointer text-lg font-semibold text-slate-900">{t('sim.assumptionsTitle')}</summary>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-700">
            {(['sim.as1', 'sim.as2', 'sim.as3', 'sim.as4', 'sim.as5', 'sim.as6', 'sim.as7', 'sim.as8'] as const).map((k) => <li key={k}>{t(k)}</li>)}
          </ul>
        </details>
      </Card>

      {state.history.length > 0 && running && (
        <div className="mt-4">
          {confirmRestart ? (
            <Alert tone="amber" title={t('sim.abandon')}>
              <div className="mt-2 flex gap-2"><Button tone="danger" onClick={restart}>{t('sim.yesRestart')}</Button><Button tone="secondary" onClick={() => setConfirmRestart(false)}>{t('sim.keepPlaying')}</Button></div>
            </Alert>
          ) : <Button tone="secondary" onClick={() => setConfirmRestart(true)}>{t('sim.restart')}</Button>}
        </div>
      )}
    </div>
  );
}

// MONTH_NAMES is kept for non-UI consumers; the UI uses translated month.N keys.
void MONTH_NAMES;
