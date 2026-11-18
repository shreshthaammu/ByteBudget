import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../data/sampleExpenses';
import {
  CurrencyCode,
  Expense,
  ExpenseCategory,
  MonthlyTrendPoint,
} from '../types/expense';
import {
  calculateMonthlyTrends,
  formatCompactCurrency,
  formatCurrency,
  getAvailableYears,
} from '../utils/algorithms';

interface MonthlyTrendsChartProps {
  expenses: Expense[];
  currency: CurrencyCode;
  selectedMonthKey: string | null;
  onSelectMonthKey: (monthKey: string | null) => void;
}

type ChartMode = 'total' | 'category';

const STACK_COLORS: Record<ExpenseCategory, string> = {
  Food: '#D97706',
  Travel: '#0284C7',
  Shopping: '#E11D48',
  Education: '#1D4ED8',
  Other: '#64748B',
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: MonthlyTrendPoint }>;
  currency: CurrencyCode;
  chartMode: ChartMode;
}

function CustomMonthlyTooltip({
  active,
  payload,
  currency,
  chartMode,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3.5 min-w-[210px] text-xs">
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <span className="font-semibold text-slate-900">{point.monthFull}</span>
        <span className="text-slate-500 tabular-nums">
          {point.count} {point.count === 1 ? 'record' : 'records'}
        </span>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-4">
        <span className="text-slate-500">Total Spent</span>
        <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
          {formatCurrency(point.total, currency)}
        </span>
      </div>

      {point.momDeltaPercent !== null && (
        <div className="mt-1 flex items-center justify-between gap-4">
          <span className="text-slate-500">vs Previous Active</span>
          <span
            className={`inline-flex items-center gap-1 font-mono font-medium tabular-nums ${
              point.momDeltaPercent > 0 ? 'text-amber-700' : 'text-emerald-700'
            }`}
          >
            {point.momDeltaPercent > 0 ? (
              <TrendingUp className="w-3 h-3" aria-hidden="true" />
            ) : (
              <TrendingDown className="w-3 h-3" aria-hidden="true" />
            )}
            <span>
              {point.momDeltaPercent > 0 ? `+${point.momDeltaPercent}%` : `${point.momDeltaPercent}%`}
            </span>
          </span>
        </div>
      )}

      {chartMode === 'total' && point.topCategory && (
        <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-4">
          <span className="text-slate-500">Top Category</span>
          <span className="font-medium text-slate-800 tabular-nums">
            {point.topCategory} ({formatCurrency(point.topCategoryAmount, currency)})
          </span>
        </div>
      )}

      {chartMode === 'category' && point.total > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
          {EXPENSE_CATEGORIES.filter((cat) => point[cat] > 0).map((cat) => (
            <div key={cat} className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <span
                  className="w-2 h-2 rounded-xs inline-block"
                  style={{ backgroundColor: STACK_COLORS[cat] }}
                  aria-hidden="true"
                />
                <span>{cat}</span>
              </span>
              <span className="font-mono text-slate-900 tabular-nums">
                {formatCurrency(point[cat], currency)}
              </span>
            </div>
          ))}
        </div>
      )}

      {point.total > 0 && (
        <p className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-blue-700 font-medium">
          Click bar to filter ledger by {point.monthShort}
        </p>
      )}
    </div>
  );
}

export default function MonthlyTrendsChart({
  expenses,
  currency,
  selectedMonthKey,
  onSelectMonthKey,
}: MonthlyTrendsChartProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();

  const availableYears = useMemo(
    () => getAvailableYears(expenses, currentYear),
    [expenses, currentYear]
  );

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [chartMode, setChartMode] = useState<ChartMode>('total');
  const [showAverageLine, setShowAverageLine] = useState<boolean>(true);

  const activeYear = availableYears.includes(selectedYear) ? selectedYear : availableYears[0];

  const trends = useMemo(
    () =>
      calculateMonthlyTrends(
        expenses,
        activeYear,
        activeYear === currentYear ? currentMonthIdx : -1
      ),
    [expenses, activeYear, currentYear, currentMonthIdx]
  );

  function handleBarClick(index: number) {
    const month = trends.months[index];
    if (!month || month.total === 0) return;
    onSelectMonthKey(selectedMonthKey === month.monthKey ? null : month.monthKey);
  }

  return (
    <section
      aria-label="Monthly spending trends"
      className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5"
    >
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              Monthly Spending Trends ({activeYear})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated via O(n) array traversal into 12 monthly buckets · Click any bar to filter the expense table below
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Chart Mode Segmented Switch */}
          <div
            className="inline-flex items-center p-1 bg-slate-100 rounded-lg"
            role="group"
            aria-label="Chart display mode"
          >
            <button
              type="button"
              onClick={() => setChartMode('total')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                chartMode === 'total'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Totals
            </button>
            <button
              type="button"
              onClick={() => setChartMode('category')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                chartMode === 'category'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Category
            </button>
          </div>

          {/* Average Reference Line Toggle */}
          <button
            type="button"
            onClick={() => setShowAverageLine((prev) => !prev)}
            aria-pressed={showAverageLine}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              showAverageLine
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {showAverageLine ? 'Hide Avg Line' : 'Show Avg Line'}
          </button>

          {/* Year Selector */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <select
              aria-label="Select year for monthly trends"
              value={activeYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                onSelectMonthKey(null);
              }}
              className="text-xs font-mono font-medium text-slate-800 bg-transparent focus:outline-none"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inline Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-2">
        <div className="px-3.5 py-2.5 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-xs text-slate-500 block">{activeYear} Total</span>
          <span className="mt-0.5 text-base font-bold font-mono text-slate-900 tabular-nums block">
            {formatCurrency(trends.yearTotal, currency)}
          </span>
        </div>

        <div className="px-3.5 py-2.5 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-xs text-slate-500 block">
            Monthly Avg ({trends.activeMonthsCount} active mo)
          </span>
          <span className="mt-0.5 text-base font-bold font-mono text-slate-900 tabular-nums block">
            {formatCurrency(trends.monthlyAverage, currency)}
          </span>
        </div>

        <div className="px-3.5 py-2.5 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-xs text-slate-500 block">Peak Month</span>
          <span className="mt-0.5 text-base font-bold text-slate-900 tabular-nums block truncate">
            {trends.peakMonth
              ? `${trends.peakMonth.monthShort} · ${formatCurrency(trends.peakMonth.total, currency)}`
              : 'No data'}
          </span>
        </div>

        <div className="px-3.5 py-2.5 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-xs text-slate-500 block">
            {activeYear === currentYear
              ? `Current (${trends.months[currentMonthIdx]?.monthShort})`
              : 'Active Months'}
          </span>
          <span className="mt-0.5 text-base font-bold font-mono text-slate-900 tabular-nums block">
            {activeYear === currentYear
              ? formatCurrency(trends.currentMonthTotal, currency)
              : `${trends.activeMonthsCount} / 12`}
          </span>
        </div>
      </div>

      {/* Chart Canvas or Empty State */}
      {trends.yearTotal === 0 ? (
        <div className="h-[260px] flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50 px-4">
          <p className="text-sm font-medium text-slate-800">
            No expenses recorded for {activeYear}.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Add an expense dated in {activeYear} or switch the year selector to view trends.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="w-full h-[290px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trends.months}
                margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
                barCategoryGap="24%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="monthShort"
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tick={{ fill: '#475569', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(val: number) => formatCompactCurrency(val, currency)}
                  tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.8)' }}
                  content={
                    <CustomMonthlyTooltip
                      currency={currency}
                      chartMode={chartMode}
                    />
                  }
                />

                {showAverageLine && trends.monthlyAverage > 0 && (
                  <ReferenceLine
                    y={trends.monthlyAverage}
                    stroke="#0F172A"
                    strokeDasharray="4 4"
                    strokeOpacity={0.55}
                    label={{
                      value: `Avg ${formatCompactCurrency(trends.monthlyAverage, currency)}`,
                      position: 'insideTopRight',
                      fill: '#334155',
                      fontSize: 11,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  />
                )}

                {chartMode === 'total' ? (
                  <Bar
                    dataKey="total"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={44}
                    className="cursor-pointer"
                    onClick={(_data, index) => {
                      if (typeof index === 'number') handleBarClick(index);
                    }}
                  >
                    {trends.months.map((entry) => {
                      const isSelected = selectedMonthKey === entry.monthKey;
                      const isPeak = trends.peakMonth?.monthKey === entry.monthKey;
                      const isCurrent =
                        activeYear === currentYear && entry.monthIndex === currentMonthIdx;

                      let fill = '#60A5FA'; // standard active month
                      if (entry.total === 0) {
                        fill = '#E2E8F0';
                      } else if (isSelected) {
                        fill = '#1E3A8A'; // deep selected focus
                      } else if (isPeak) {
                        fill = '#1D4ED8'; // peak month cobalt
                      } else if (isCurrent) {
                        fill = '#0284C7'; // current month azure
                      }

                      return (
                        <Cell
                          key={entry.monthKey}
                          fill={fill}
                          stroke={isSelected ? '#0F172A' : 'none'}
                          strokeWidth={isSelected ? 1.5 : 0}
                        />
                      );
                    })}
                  </Bar>
                ) : (
                  EXPENSE_CATEGORIES.map((cat, catIdx) => (
                    <Bar
                      key={cat}
                      dataKey={cat}
                      stackId="monthlyCategory"
                      fill={STACK_COLORS[cat]}
                      radius={
                        catIdx === EXPENSE_CATEGORIES.length - 1 ? [5, 5, 0, 0] : [0, 0, 0, 0]
                      }
                      maxBarSize={44}
                      className="cursor-pointer"
                      onClick={(_data, index) => {
                        if (typeof index === 'number') handleBarClick(index);
                      }}
                    />
                  ))
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Clean Legend Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
            {chartMode === 'total' ? (
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#1D4ED8] inline-block" aria-hidden="true" />
                  <span>Peak Month</span>
                </span>
                {activeYear === currentYear && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#0284C7] inline-block" aria-hidden="true" />
                    <span>Current Month</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#60A5FA] inline-block" aria-hidden="true" />
                  <span>Other Active Months</span>
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                {EXPENSE_CATEGORIES.map((cat) => (
                  <span key={cat} className="inline-flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-xs inline-block"
                      style={{ backgroundColor: STACK_COLORS[cat] }}
                      aria-hidden="true"
                    />
                    <span>{cat}</span>
                  </span>
                ))}
              </div>
            )}

            {selectedMonthKey && (
              <button
                type="button"
                onClick={() => onSelectMonthKey(null)}
                className="text-xs font-medium text-blue-700 hover:underline whitespace-nowrap shrink-0"
              >
                Clear month filter ({selectedMonthKey})
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
