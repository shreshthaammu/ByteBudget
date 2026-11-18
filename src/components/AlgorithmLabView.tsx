import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../data/sampleExpenses';
import {
  AlgoMode,
  AlgoStep,
  CurrencyCode,
  Expense,
  SearchMode,
  SortOrder,
} from '../types/expense';
import {
  formatCurrency,
  generateBubbleSortTrace,
  generateLinearSearchTrace,
  generateMergeSortTrace,
  generateTraversalTrace,
} from '../utils/algorithms';

interface AlgorithmLabViewProps {
  expenses: Expense[];
  currency: CurrencyCode;
  initialPreset?: {
    mode: AlgoMode;
    searchMode?: SearchMode;
    searchQuery?: string;
    sortOrder?: SortOrder;
  };
}

const ALGO_TABS: { id: AlgoMode; label: string; complexity: string }[] = [
  { id: 'linear-search', label: 'Linear Search', complexity: 'O(n)' },
  { id: 'bubble-sort', label: 'Bubble Sort', complexity: 'O(n²)' },
  { id: 'merge-sort', label: 'Merge Sort', complexity: 'O(n log n)' },
  { id: 'array-traversal', label: 'Array Traversal', complexity: 'O(n)' },
];

export default function AlgorithmLabView({
  expenses,
  currency,
  initialPreset,
}: AlgorithmLabViewProps) {
  const [algoMode, setAlgoMode] = useState<AlgoMode>(initialPreset?.mode ?? 'bubble-sort');
  const [searchMode, setSearchMode] = useState<SearchMode>(initialPreset?.searchMode ?? 'category');
  const [searchQuery, setSearchQuery] = useState<string>(
    initialPreset?.searchQuery ?? (expenses[0]?.category || 'Food')
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialPreset?.sortOrder ?? 'asc');

  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(800);

  useEffect(() => {
    if (initialPreset) {
      setAlgoMode(initialPreset.mode);
      if (initialPreset.searchMode) setSearchMode(initialPreset.searchMode);
      if (initialPreset.searchQuery !== undefined) setSearchQuery(initialPreset.searchQuery);
      if (initialPreset.sortOrder) setSortOrder(initialPreset.sortOrder);
      setStepIndex(0);
      setIsPlaying(false);
    }
  }, [initialPreset]);

  const trace: AlgoStep[] = useMemo(() => {
    if (algoMode === 'linear-search') {
      return generateLinearSearchTrace(expenses, searchMode, searchQuery);
    }
    if (algoMode === 'bubble-sort') {
      return generateBubbleSortTrace(expenses, sortOrder);
    }
    if (algoMode === 'merge-sort') {
      return generateMergeSortTrace(expenses, sortOrder);
    }
    return generateTraversalTrace(expenses);
  }, [algoMode, expenses, searchMode, searchQuery, sortOrder]);

  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, [algoMode, searchMode, searchQuery, sortOrder, expenses]);

  useEffect(() => {
    if (!isPlaying) return;
    if (stepIndex >= trace.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setStepIndex((prev) => Math.min(prev + 1, trace.length - 1));
    }, speedMs);
    return () => window.clearTimeout(timer);
  }, [isPlaying, stepIndex, trace.length, speedMs]);

  const currentStep = trace[Math.min(stepIndex, trace.length - 1)] || trace[0];

  const maxAmount = useMemo(() => {
    return Math.max(1, ...expenses.map((e) => e.amount));
  }, [expenses]);

  const speedMultiplier = (1000 / speedMs).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header & Algorithm Selector */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Algorithm Visualizer Lab
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Step through Linear Search, Bubble Sort, Merge Sort, and Array Traversal directly on your expense records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg shrink-0" role="tablist" aria-label="Algorithm selection">
          {ALGO_TABS.map((tab) => {
            const active = algoMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setAlgoMode(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label} · {tab.complexity}
              </button>
            );
          })}
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <p className="text-sm font-medium text-slate-900">
            Your expense array is currently empty.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Add at least 2 expenses in the Tracker tab or click Reset Sample to visualize algorithms.
          </p>
        </div>
      ) : (
        /* Two-Zone Sandbox Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Stage (Left / 8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Array Memory Stage <span className="font-mono text-xs font-normal text-slate-500">struct Expense expenses[{currentStep.array.length}]</span>
                </h2>
              </div>

              {/* Dual-coded state legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" aria-hidden="true" />
                  <span>Comparing / Active</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-700 inline-block" aria-hidden="true" />
                  <span>Swapping / Writing</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" aria-hidden="true" />
                  <span>Matched / Sorted</span>
                </span>
              </div>
            </div>

            {/* Array Blocks Visualization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {currentStep.array.map((item, idx) => {
                const isSwapped = currentStep.swappedIndices.includes(idx);
                const isComparing = currentStep.comparingIndices.includes(idx);
                const isActive = currentStep.activeIndices.includes(idx);
                const isMatched = currentStep.matchedIndices.includes(idx);
                const isSorted = currentStep.sortedIndices.includes(idx);
                const inMergeRange =
                  currentStep.mergeRange &&
                  idx >= currentStep.mergeRange[0] &&
                  idx <= currentStep.mergeRange[1];

                let containerStyle = 'border-slate-200 bg-slate-50/70';
                let stateLabel = 'Idle';
                let stateTextTone = 'text-slate-400';

                if (isSwapped) {
                  containerStyle = 'border-blue-700 bg-blue-50 ring-1 ring-blue-700';
                  stateLabel = algoMode === 'merge-sort' ? 'Writing' : 'Swapping';
                  stateTextTone = 'text-blue-800 font-semibold';
                } else if (isComparing || isActive) {
                  containerStyle = 'border-amber-500 bg-amber-50 ring-1 ring-amber-500';
                  stateLabel = algoMode === 'array-traversal' ? 'Visiting' : 'Comparing';
                  stateTextTone = 'text-amber-800 font-semibold';
                } else if (isMatched) {
                  containerStyle = 'border-emerald-600 bg-emerald-50';
                  stateLabel = algoMode === 'array-traversal' ? 'Visited' : 'Matched';
                  stateTextTone = 'text-emerald-800 font-semibold';
                } else if (isSorted) {
                  containerStyle = 'border-emerald-600 bg-emerald-50';
                  stateLabel = 'Sorted';
                  stateTextTone = 'text-emerald-800 font-semibold';
                } else if (inMergeRange) {
                  containerStyle = 'border-slate-400 bg-white';
                  stateLabel = 'Subarray';
                  stateTextTone = 'text-slate-600 font-medium';
                }

                const barPercent = Math.max(8, Math.round((item.amount / maxAmount) * 100));

                return (
                  <div
                    key={`${item.id}-${idx}`}
                    className={`border rounded-lg p-3.5 transition-all duration-150 ${containerStyle}`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono font-semibold text-slate-700">expenses[{idx}]</span>
                      <span className={stateTextTone}>{stateLabel}</span>
                    </div>

                    <div className="mt-2.5 flex items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {item.category}
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                        {formatCurrency(item.amount, currency)}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="font-mono tabular-nums">{item.date}</span>
                      <span className="truncate max-w-[110px]" title={item.note}>
                        {item.note}
                      </span>
                    </div>

                    {/* Proportional amount magnitude bar */}
                    <div className="mt-2.5 w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-200 ${
                          isSwapped
                            ? 'bg-blue-700'
                            : isComparing || isActive
                              ? 'bg-amber-500'
                              : isMatched || isSorted
                                ? 'bg-emerald-600'
                                : 'bg-slate-400'
                        }`}
                        style={{ width: `${barPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step Explanation & C Expression Banner */}
            <div className="border-t border-slate-200 pt-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums">
                <span>
                  Step {stepIndex + 1} of {trace.length}
                </span>
                <span>
                  {Math.round(((stepIndex + 1) / Math.max(1, trace.length)) * 100)}% complete
                </span>
              </div>

              <p className="text-sm font-medium text-slate-900">{currentStep.explanation}</p>

              <div className="px-3 py-2 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto">
                {currentStep.cExpression}
              </div>
            </div>
          </div>

          {/* Control & Concept Deck (Right / 4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Algorithm Parameters & Playback Controls */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <h2 className="text-base font-semibold text-slate-900 pb-3 border-b border-slate-100">
                Execution Controls
              </h2>

              {/* Mode-specific inputs */}
              {algoMode === 'linear-search' && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="lab-search-mode" className="block text-xs font-medium text-slate-700 mb-1">
                      Search Field
                    </label>
                    <select
                      id="lab-search-mode"
                      value={searchMode}
                      onChange={(e) => setSearchMode(e.target.value as SearchMode)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
                    >
                      <option value="category">Category (strcmp)</option>
                      <option value="date">Date (YYYY-MM-DD)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="lab-search-query" className="block text-xs font-medium text-slate-700 mb-1">
                      Target Value
                    </label>
                    <input
                      id="lab-search-query"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={searchMode === 'category' ? 'Food' : '2026-11-17'}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
                    />
                    {searchMode === 'category' && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSearchQuery(cat)}
                            className={`px-2 py-1 text-xs rounded border transition-colors ${
                              searchQuery.toLowerCase() === cat.toLowerCase()
                                ? 'bg-blue-50 border-blue-300 text-blue-800 font-medium'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(algoMode === 'bubble-sort' || algoMode === 'merge-sort') && (
                <div>
                  <span className="block text-xs font-medium text-slate-700 mb-1.5">
                    Sort Order (by Amount)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSortOrder('asc')}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                        sortOrder === 'asc'
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Ascending
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortOrder('desc')}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                        sortOrder === 'desc'
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Descending
                    </button>
                  </div>
                </div>
              )}

              {/* Playback Transport */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (stepIndex >= trace.length - 1) setStepIndex(0);
                    setIsPlaying((p) => !p);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" aria-hidden="true" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" aria-hidden="true" />
                      <span>Play</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIndex((p) => Math.max(0, p - 1));
                  }}
                  disabled={stepIndex === 0}
                  aria-label="Step backward"
                  className="p-2.5 text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIndex((p) => Math.min(trace.length - 1, p + 1));
                  }}
                  disabled={stepIndex >= trace.length - 1}
                  aria-label="Step forward"
                  className="p-2.5 text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIndex(0);
                  }}
                  aria-label="Reset visualization"
                  className="p-2.5 text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Slider with explicit unit */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <label htmlFor="algo-speed" className="font-medium text-slate-700">
                    Playback Speed
                  </label>
                  <span className="font-mono text-slate-600 tabular-nums">{speedMultiplier}x ({speedMs} ms)</span>
                </div>
                <input
                  id="algo-speed"
                  type="range"
                  min={250}
                  max={1500}
                  step={150}
                  value={1750 - speedMs}
                  onChange={(e) => setSpeedMs(1750 - Number(e.target.value))}
                  className="w-full accent-blue-700"
                />
              </div>
            </div>

            {/* Live Variable Inspector */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-base font-semibold text-slate-900 pb-3 border-b border-slate-100">
                Live Variable State
              </h2>
              <dl className="mt-3 divide-y divide-slate-100 text-xs">
                <div className="py-2 flex items-center justify-between">
                  <dt className="font-mono text-slate-500">Index i</dt>
                  <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                    {currentStep.variables.i ?? '-'}
                  </dd>
                </div>
                {currentStep.variables.j !== undefined && (
                  <div className="py-2 flex items-center justify-between">
                    <dt className="font-mono text-slate-500">Index j</dt>
                    <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                      {currentStep.variables.j}
                    </dd>
                  </div>
                )}
                <div className="py-2 flex items-center justify-between">
                  <dt className="text-slate-500">Comparisons</dt>
                  <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                    {currentStep.variables.comparisons}
                  </dd>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <dt className="text-slate-500">
                    {algoMode === 'merge-sort' ? 'Array Writes' : 'Swaps'}
                  </dt>
                  <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                    {currentStep.variables.swaps}
                  </dd>
                </div>
                {currentStep.variables.matches !== undefined && (
                  <div className="py-2 flex items-center justify-between">
                    <dt className="text-slate-500">Matches Found</dt>
                    <dd className="font-mono font-semibold text-emerald-700 tabular-nums">
                      {currentStep.variables.matches}
                    </dd>
                  </div>
                )}
                {currentStep.variables.runningTotal !== undefined && (
                  <>
                    <div className="py-2 flex items-center justify-between">
                      <dt className="text-slate-500">Running Total</dt>
                      <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                        {formatCurrency(currentStep.variables.runningTotal, currency)}
                      </dd>
                    </div>
                    <div className="py-2 flex items-center justify-between">
                      <dt className="text-slate-500">Highest Category</dt>
                      <dd className="font-mono font-semibold text-blue-700">
                        {currentStep.variables.highestCategory}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
