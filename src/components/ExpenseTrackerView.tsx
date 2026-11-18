import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownUp,
  CheckCircle2,
  Download,
  Pencil,
  Play,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES } from '../data/sampleExpenses';
import {
  AlgoMode,
  CategoryBudgets,
  CurrencyCode,
  Expense,
  ExpenseCategory,
  SearchMode,
  SortAlgorithm,
  SortOrder,
} from '../types/expense';
import {
  formatCurrency,
  generateLinearSearchTrace,
  sortExpensesDirect,
  traverseExpenses,
} from '../utils/algorithms';
import CategoryBudgetsCard from './CategoryBudgetsCard';
import MonthlyTrendsChart from './MonthlyTrendsChart';

interface ExpenseTrackerViewProps {
  expenses: Expense[];
  budget: number;
  categoryBudgets: CategoryBudgets;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onBudgetChange: (newBudget: number) => void;
  onCategoryBudgetsChange: (budgets: CategoryBudgets) => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onReplaceExpenses: (expenses: Expense[]) => void;
  onResetSample: () => void;
  onOpenAlgorithmLab: (preset: {
    mode: AlgoMode;
    searchMode?: SearchMode;
    searchQuery?: string;
    sortOrder?: SortOrder;
  }) => void;
  formInputRef: React.RefObject<HTMLInputElement | null>;
}

const MAX_ARRAY_CAPACITY = 100;

export default function ExpenseTrackerView({
  expenses,
  budget,
  categoryBudgets,
  currency,
  onCurrencyChange,
  onBudgetChange,
  onCategoryBudgetsChange,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onReplaceExpenses,
  onResetSample,
  onOpenAlgorithmLab,
  formInputRef,
}: ExpenseTrackerViewProps) {
  // Search & Sort states
  const [searchMode, setSearchMode] = useState<SearchMode>('category');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortAlgorithm, setSortAlgorithm] = useState<SortAlgorithm>('bubble');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isSortApplied, setIsSortApplied] = useState<boolean>(false);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);

  // Add / Edit Expense Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState<string>('2026-11-18');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Budget editing state
  const [isEditingBudget, setIsEditingBudget] = useState<boolean>(false);
  const [budgetDraft, setBudgetDraft] = useState<string>(String(budget));

  // File feedback state
  const [statusMessage, setStatusMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Array Traversal calculations
  const traversal = useMemo(() => traverseExpenses(expenses), [expenses]);
  const remainingBudget = budget - traversal.totalExpenditure;
  const budgetRatio = budget > 0 ? Math.min(100, Math.round((traversal.totalExpenditure / budget) * 100)) : 0;

  const budgetStatus =
    remainingBudget < 0
      ? { label: 'Over Budget', tone: 'text-red-700', bar: 'bg-red-600', icon: AlertTriangle }
      : budgetRatio >= 80
        ? { label: 'Nearing Limit', tone: 'text-amber-700', bar: 'bg-amber-600', icon: AlertTriangle }
        : { label: 'Within Budget', tone: 'text-emerald-700', bar: 'bg-emerald-600', icon: CheckCircle2 };

  const BudgetIcon = budgetStatus.icon;

  // 2. Linear Search & Sort pipeline preserving original array index reference
  const displayedRows = useMemo(() => {
    const indexed = expenses.map((item, originalIndex) => ({ item, originalIndex }));

    let filtered = indexed;
    if (selectedMonthKey) {
      filtered = filtered.filter((entry) => entry.item.date.startsWith(selectedMonthKey));
    }
    if (searchQuery.trim().length > 0) {
      const trace = generateLinearSearchTrace(expenses, searchMode, searchQuery);
      const finalStep = trace[trace.length - 1];
      const matchedSet = new Set(finalStep ? finalStep.matchedIndices : []);
      filtered = filtered.filter((entry) => matchedSet.has(entry.originalIndex));
    }

    if (!isSortApplied) {
      return filtered;
    }

    const sortedItems = sortExpensesDirect(
      filtered.map((entry) => entry.item),
      sortAlgorithm,
      sortOrder
    );
    const indexMap = new Map(indexed.map((entry) => [entry.item.id, entry.originalIndex]));
    return sortedItems.map((item) => ({
      item,
      originalIndex: indexMap.get(item.id) ?? 0,
    }));
  }, [expenses, searchMode, searchQuery, selectedMonthKey, isSortApplied, sortAlgorithm, sortOrder]);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!date) {
      setFormError('Please select a valid date.');
      return;
    }
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setFormError('Enter an amount greater than 0.');
      return;
    }
    if (!editingId && expenses.length >= MAX_ARRAY_CAPACITY) {
      setFormError(`Array capacity of ${MAX_ARRAY_CAPACITY} records reached.`);
      return;
    }

    const cleanNote = note.trim() || `${category} expense`;

    if (editingId) {
      onUpdateExpense({
        id: editingId,
        date,
        category,
        amount: numericAmount,
        note: cleanNote,
      });
      setEditingId(null);
      setStatusMessage('Updated record in expenses[] array.');
    } else {
      onAddExpense({
        date,
        category,
        amount: numericAmount,
        note: cleanNote,
      });
      setStatusMessage(`Inserted record at expenses[${expenses.length}].`);
    }

    setAmount('');
    setNote('');
    setFormError('');
  }

  function startEditing(item: Expense) {
    setEditingId(item.id);
    setDate(item.date);
    setCategory(item.category);
    setAmount(String(item.amount));
    setNote(item.note);
    setFormError('');
    formInputRef.current?.focus();
  }

  function cancelEditing() {
    setEditingId(null);
    setAmount('');
    setNote('');
    setFormError('');
  }

  function handleApplySortToArray() {
    const sorted = sortExpensesDirect(expenses, sortAlgorithm, sortOrder);
    onReplaceExpenses(sorted);
    setIsSortApplied(false);
    setStatusMessage(
      `Sorted expenses[] permanently using ${sortAlgorithm === 'bubble' ? 'Bubble Sort' : 'Merge Sort'} (${sortOrder === 'asc' ? 'ascending' : 'descending'}).`
    );
  }

  function handleSaveBudget(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(budgetDraft);
    if (!Number.isNaN(parsed) && parsed > 0) {
      onBudgetChange(parsed);
      setIsEditingBudget(false);
    }
  }

  function handleExportJSON() {
    const payload = JSON.stringify({ budget, categoryBudgets, currency, expenses }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses_data.json';
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Saved expenses_data.json (File Handling export).');
  }

  function handleExportCSV() {
    const header = 'Index,Date,Category,Amount,Note';
    const lines = expenses.map(
      (item, idx) =>
        `${idx},${item.date},${item.category},${item.amount},"${item.note.replace(/"/g, '""')}"`
    );
    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses_ledger.csv';
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Exported expenses_ledger.csv.');
  }

  function handleImportJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const list: unknown[] = Array.isArray(parsed) ? parsed : parsed.expenses;
        if (!Array.isArray(list)) {
          setStatusMessage('Invalid JSON file format.');
          return;
        }
        const valid: Expense[] = list
          .filter(
            (row): row is Record<string, unknown> =>
              typeof row === 'object' && row !== null && typeof (row as Record<string, unknown>).amount === 'number'
          )
          .slice(0, MAX_ARRAY_CAPACITY)
          .map((row, idx) => ({
            id: typeof row.id === 'string' ? row.id : `imp-${Date.now()}-${idx}`,
            date: typeof row.date === 'string' ? row.date : '2026-11-18',
            category: EXPENSE_CATEGORIES.includes(row.category as ExpenseCategory)
              ? (row.category as ExpenseCategory)
              : 'Other',
            amount: Number(row.amount),
            note: typeof row.note === 'string' ? row.note : 'Imported record',
          }));
        onReplaceExpenses(valid);
        if (typeof parsed.budget === 'number' && parsed.budget > 0) {
          onBudgetChange(parsed.budget);
        }
        if (typeof parsed.categoryBudgets === 'object' && parsed.categoryBudgets !== null) {
          onCategoryBudgetsChange({
            Food: Number(parsed.categoryBudgets.Food) || categoryBudgets.Food,
            Travel: Number(parsed.categoryBudgets.Travel) || categoryBudgets.Travel,
            Shopping: Number(parsed.categoryBudgets.Shopping) || categoryBudgets.Shopping,
            Education: Number(parsed.categoryBudgets.Education) || categoryBudgets.Education,
            Other: Number(parsed.categoryBudgets.Other) || categoryBudgets.Other,
          });
        }
        setStatusMessage(`Loaded ${valid.length} records from ${file.name}.`);
      } catch {
        setStatusMessage('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="space-y-6">
      {/* Workspace Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            ByteBudge — Personal Expense Tracker
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Record daily expenses in an indexed struct array, search with Linear Search, and sort or analyze spending in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Currency segmented switch */}
          <div className="inline-flex items-center p-1 bg-slate-200/70 rounded-lg" role="group" aria-label="Currency selector">
            <button
              type="button"
              onClick={() => onCurrencyChange('INR')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currency === 'INR'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              INR (₹)
            </button>
            <button
              type="button"
              onClick={() => onCurrencyChange('USD')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currency === 'USD'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              USD ($)
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Save JSON</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Load JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportJSON}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => {
              onResetSample();
              setSearchQuery('');
              setSelectedMonthKey(null);
              setIsSortApplied(false);
              setStatusMessage('Restored sample dataset.');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Sample</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage('')}
            aria-label="Dismiss notification"
            className="text-blue-700 hover:text-blue-900 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4-Column KPI Summary Strip (computed via Array Traversal) */}
      <section aria-label="Spending summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Expenditure */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500">Total Expenditure</span>
            <button
              type="button"
              onClick={() => onOpenAlgorithmLab({ mode: 'array-traversal' })}
              className="text-xs font-medium text-blue-700 hover:underline whitespace-nowrap shrink-0"
            >
              Trace Traversal
            </button>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(traversal.totalExpenditure, currency)}
          </div>
          <div className="mt-1.5 text-xs text-slate-500 tabular-nums">
            Avg {formatCurrency(traversal.averageExpense, currency)} per record
          </div>
        </div>

        {/* Card 2: Monthly Budget & Remaining */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500">Monthly Budget</span>
            {!isEditingBudget ? (
              <button
                type="button"
                onClick={() => {
                  setBudgetDraft(String(budget));
                  setIsEditingBudget(true);
                }}
                className="text-xs font-medium text-blue-700 hover:underline whitespace-nowrap shrink-0"
              >
                Edit Budget
              </button>
            ) : (
              <form onSubmit={handleSaveBudget} className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  value={budgetDraft}
                  onChange={(e) => setBudgetDraft(e.target.value)}
                  className="w-20 px-1.5 py-0.5 text-xs border border-slate-300 rounded font-mono tabular-nums"
                  aria-label="Monthly budget amount"
                />
                <button
                  type="submit"
                  className="text-xs font-medium text-blue-700 hover:underline px-1"
                >
                  Save
                </button>
              </form>
            )}
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {formatCurrency(Math.abs(remainingBudget), currency)}
            </span>
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${budgetStatus.tone}`}>
              <BudgetIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{remainingBudget < 0 ? 'Over' : 'Left'}</span>
            </span>
          </div>
          <div className="mt-2.5">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${budgetStatus.bar} transition-all duration-200`}
                style={{ width: `${budgetRatio}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 tabular-nums">
              <span>{budgetStatus.label}</span>
              <span>{budgetRatio}% of {formatCurrency(budget, currency)}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Highest Spending Category */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Highest Spending Category</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {traversal.highestCategory ? traversal.highestCategory.category : 'None'}
          </div>
          <div className="mt-1.5 text-xs text-slate-500 tabular-nums">
            {traversal.highestCategory ? (
              <>
                {formatCurrency(traversal.highestCategory.total, currency)} ·{' '}
                {traversal.highestCategory.percentage}% of total
              </>
            ) : (
              'Add expenses to analyze'
            )}
          </div>
        </div>

        {/* Card 4: Array Records */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Array Storage (expenses[])</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {expenses.length} <span className="text-base font-normal text-slate-400">/ {MAX_ARRAY_CAPACITY}</span>
          </div>
          <div className="mt-1.5 text-xs text-slate-500">
            struct Expense contiguous records
          </div>
        </div>
      </section>

      {/* Monthly Spending Trends Bar Chart (Recharts) */}
      <MonthlyTrendsChart
        expenses={expenses}
        currency={currency}
        selectedMonthKey={selectedMonthKey}
        onSelectMonthKey={setSelectedMonthKey}
      />

      {/* Main Two-Column Balanced Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Search, Sort & Expense Array Ledger */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
          {/* Search & Sort Control Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Expense Records Array</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing {displayedRows.length} of {expenses.length} records
                  {selectedMonthKey ? (
                    <>
                      {' '}· Month {selectedMonthKey}{' '}
                      <button
                        type="button"
                        onClick={() => setSelectedMonthKey(null)}
                        className="text-blue-700 hover:underline font-medium"
                      >
                        (Clear)
                      </button>
                    </>
                  ) : null}
                  {searchQuery.trim() ? ` · Filtered via Linear Search (${searchMode})` : ''}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  onOpenAlgorithmLab({
                    mode: searchQuery.trim()
                      ? 'linear-search'
                      : sortAlgorithm === 'bubble'
                        ? 'bubble-sort'
                        : 'merge-sort',
                    searchMode,
                    searchQuery: searchQuery.trim() || expenses[0]?.category || 'Food',
                    sortOrder,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0"
              >
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Visualize in Algorithm Lab</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Linear Search input */}
              <div className="md:col-span-6 flex items-center gap-2">
                <select
                  aria-label="Search field"
                  value={searchMode}
                  onChange={(e) => setSearchMode(e.target.value as SearchMode)}
                  className="px-2.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-700 shrink-0"
                >
                  <option value="category">Category</option>
                  <option value="date">Date</option>
                </select>
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      searchMode === 'category' ? 'Search Food, Travel...' : 'Search 2026-11-17...'
                    }
                    className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sort controls (Bubble / Merge Sort) */}
              <div className="md:col-span-6 flex flex-wrap sm:flex-nowrap items-center gap-2">
                <select
                  aria-label="Sorting algorithm"
                  value={sortAlgorithm}
                  onChange={(e) => {
                    setSortAlgorithm(e.target.value as SortAlgorithm);
                    setIsSortApplied(true);
                  }}
                  className="px-2.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-700"
                >
                  <option value="bubble">Bubble Sort</option>
                  <option value="merge">Merge Sort</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                    setIsSortApplied(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                >
                  <ArrowDownUp className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{sortOrder === 'asc' ? 'Amount: Low → High' : 'Amount: High → Low'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplySortToArray}
                  disabled={expenses.length < 2}
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  title="Commit sorted order directly to the stored array"
                >
                  Commit Sort
                </button>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          {displayedRows.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-slate-900">
                {expenses.length === 0
                  ? 'No expenses recorded in expenses[] yet.'
                  : `No expenses matched "${searchQuery}" using Linear Search.`}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {expenses.length === 0
                  ? 'Use the Add Expense form to insert your first struct Expense record.'
                  : 'Try another category (Food, Travel, Shopping, Education) or clear your search filter.'}
              </p>
              <div className="mt-4">
                {expenses.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => formInputRef.current?.focus()}
                    className="px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    Log First Expense
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                    <th className="py-3 px-4 font-mono">Index</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Note</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {displayedRows.map(({ item, originalIndex }) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/90 transition-colors ${
                        editingId === item.id ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
                        [{originalIndex}]
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`font-medium text-sm ${CATEGORY_COLORS[item.category].text}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-[260px] truncate" title={item.note}>
                        {item.note}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 tabular-nums whitespace-nowrap">
                        {formatCurrency(item.amount, currency)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => startEditing(item)}
                            aria-label={`Edit ${item.note}`}
                            className="p-1.5 text-slate-500 hover:text-blue-700 rounded hover:bg-blue-50 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (editingId === item.id) cancelEditing();
                              onDeleteExpense(item.id);
                            }}
                            aria-label={`Delete ${item.note}`}
                            className="p-1.5 text-slate-500 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Add Expense Form + Category Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          {/* Add / Edit struct Expense Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {editingId ? 'Edit Expense Record' : 'Record New Expense'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  {editingId ? 'struct Expense update' : `expenses[${expenses.length}]`}
                </p>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-3.5">
              <div>
                <label htmlFor="expense-date" className="block text-xs font-medium text-slate-700 mb-1">
                  Date
                </label>
                <input
                  id="expense-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label htmlFor="expense-category" className="block text-xs font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  id="expense-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="expense-amount" className="block text-xs font-medium text-slate-700 mb-1">
                  Amount ({currency === 'INR' ? '₹' : '$'})
                </label>
                <input
                  ref={formInputRef}
                  id="expense-amount"
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="e.g. 350"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label htmlFor="expense-note" className="block text-xs font-medium text-slate-700 mb-1">
                  Description / Note
                </label>
                <input
                  id="expense-note"
                  type="text"
                  maxLength={49}
                  placeholder="e.g. Textbooks, lunch, bus fare"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700"
                />
              </div>

              {formError && <p className="text-xs text-red-700">{formError}</p>}

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                {editingId ? 'Save Changes' : 'Add to Expense Array'}
              </button>
            </form>
          </div>

          {/* Per-Category Monthly Budget Targets */}
          <CategoryBudgetsCard
            expenses={expenses}
            categoryBudgets={categoryBudgets}
            currency={currency}
            selectedMonthKey={selectedMonthKey}
            onSaveCategoryBudgets={(nextBudgets, syncOverallBudget) => {
              onCategoryBudgetsChange(nextBudgets);
              if (syncOverallBudget) {
                onBudgetChange(syncOverallBudget);
              }
              setStatusMessage('Updated monthly budget targets per category.');
            }}
          />
        </div>
      </div>
    </div>
  );
}
