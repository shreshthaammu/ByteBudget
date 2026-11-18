import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES } from '../data/sampleExpenses';
import { CategoryBudgets, CurrencyCode, Expense, ExpenseCategory } from '../types/expense';
import { calculateCategoryBudgetStatus, formatCurrency } from '../utils/algorithms';

interface CategoryBudgetsCardProps {
  expenses: Expense[];
  categoryBudgets: CategoryBudgets;
  currency: CurrencyCode;
  selectedMonthKey: string | null;
  onSaveCategoryBudgets: (nextBudgets: CategoryBudgets, syncOverallBudget?: number) => void;
}

export default function CategoryBudgetsCard({
  expenses,
  categoryBudgets,
  currency,
  selectedMonthKey,
  onSaveCategoryBudgets,
}: CategoryBudgetsCardProps) {
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const activeMonthKey = selectedMonthKey ?? currentMonthKey;

  const [scope, setScope] = useState<'month' | 'all'>('month');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draft, setDraft] = useState<Record<ExpenseCategory, string>>({
    Food: String(categoryBudgets.Food),
    Travel: String(categoryBudgets.Travel),
    Shopping: String(categoryBudgets.Shopping),
    Education: String(categoryBudgets.Education),
    Other: String(categoryBudgets.Other),
  });
  const [syncOverall, setSyncOverall] = useState<boolean>(true);

  const effectiveMonthKey = scope === 'month' ? activeMonthKey : null;

  const summary = useMemo(
    () => calculateCategoryBudgetStatus(expenses, categoryBudgets, effectiveMonthKey),
    [expenses, categoryBudgets, effectiveMonthKey]
  );

  const draftSum = useMemo(() => {
    return EXPENSE_CATEGORIES.reduce((acc, cat) => {
      const val = parseFloat(draft[cat]);
      return acc + (Number.isFinite(val) && val > 0 ? val : 0);
    }, 0);
  }, [draft]);

  function openEditMode() {
    setDraft({
      Food: String(categoryBudgets.Food),
      Travel: String(categoryBudgets.Travel),
      Shopping: String(categoryBudgets.Shopping),
      Education: String(categoryBudgets.Education),
      Other: String(categoryBudgets.Other),
    });
    setIsEditing(true);
  }

  function handleSaveTargets(e: React.FormEvent) {
    e.preventDefault();
    const next: CategoryBudgets = { ...categoryBudgets };
    for (const cat of EXPENSE_CATEGORIES) {
      const parsed = parseFloat(draft[cat]);
      next[cat] = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    }
    const sum = EXPENSE_CATEGORIES.reduce((acc, cat) => acc + next[cat], 0);
    onSaveCategoryBudgets(next, syncOverall && sum > 0 ? sum : undefined);
    setIsEditing(false);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Category Budget Targets</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {scope === 'month' ? `Monthly limits · ${activeMonthKey}` : 'All recorded months vs targets'}
            {summary.overLimitCount > 0 && !isEditing
              ? ` · ${summary.overLimitCount} over limit`
              : ''}
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={openEditMode}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Set Targets</span>
          </button>
        )}
      </div>

      {/* Scope Toggle */}
      {!isEditing && (
        <div
          className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg text-xs"
          role="group"
          aria-label="Category target comparison scope"
        >
          <button
            type="button"
            onClick={() => setScope('month')}
            className={`py-1.5 px-2 font-medium rounded-md transition-colors whitespace-nowrap ${
              scope === 'month'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Month ({activeMonthKey})
          </button>
          <button
            type="button"
            onClick={() => setScope('all')}
            className={`py-1.5 px-2 font-medium rounded-md transition-colors whitespace-nowrap ${
              scope === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Records
          </button>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSaveTargets} className="space-y-3">
          <div className="space-y-2.5">
            {EXPENSE_CATEGORIES.map((cat) => (
              <div key={cat} className="flex items-center justify-between gap-3">
                <label
                  htmlFor={`cat-target-${cat}`}
                  className={`text-xs font-medium ${CATEGORY_COLORS[cat].text}`}
                >
                  {cat}
                </label>
                <div className="relative w-32">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                    {currency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    id={`cat-target-${cat}`}
                    type="number"
                    min={0}
                    step="any"
                    value={draft[cat]}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, [cat]: e.target.value }))
                    }
                    className="w-full pl-6 pr-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Combined Monthly Target</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {formatCurrency(draftSum, currency)}
              </span>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={syncOverall}
                onChange={(e) => setSyncOverall(e.target.checked)}
                className="rounded border-slate-300 accent-blue-700"
              />
              <span>Sync overall Monthly Budget to {formatCurrency(draftSum, currency)}</span>
            </label>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2 px-3 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
              >
                Save Targets
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {summary.items.map((item) => {
            const isHighest = summary.highestCategory === item.category && item.spent > 0;
            const barWidth = Math.min(100, item.usagePercent);
            const barColor =
              item.status === 'over'
                ? 'bg-red-600'
                : item.status === 'near'
                  ? 'bg-amber-600'
                  : CATEGORY_COLORS[item.category].bar;

            return (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-slate-900">{item.category}</span>
                    {isHighest && (
                      <span className="text-blue-700 font-semibold">· Highest</span>
                    )}
                  </div>
                  <div className="font-mono tabular-nums text-slate-800">
                    <span className="font-semibold">{formatCurrency(item.spent, currency)}</span>
                    <span className="text-slate-400">
                      {' '}
                      / {formatCurrency(item.target, currency)}
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} transition-all duration-300`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] tabular-nums">
                  {item.target === 0 ? (
                    <span className="text-slate-400">No monthly target set</span>
                  ) : item.status === 'over' ? (
                    <span className="inline-flex items-center gap-1 font-medium text-red-700">
                      <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                      <span>Over by {formatCurrency(Math.abs(item.remaining), currency)}</span>
                    </span>
                  ) : item.status === 'near' ? (
                    <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                      <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                      <span>Near Limit · {formatCurrency(item.remaining, currency)} left</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                      <span>On Track · {formatCurrency(item.remaining, currency)} left</span>
                    </span>
                  )}

                  <span className="font-mono text-slate-500">
                    {item.target > 0 ? `${item.usagePercent}%` : `${item.sharePercent}% share`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
