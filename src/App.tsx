import { useEffect, useRef, useState } from 'react';
import AlgorithmLabView from './components/AlgorithmLabView';
import CCodeView from './components/CCodeView';
import ExpenseTrackerView from './components/ExpenseTrackerView';
import Header from './components/Header';
import ProjectBriefView from './components/ProjectBriefView';
import { DEFAULT_CATEGORY_BUDGETS, INITIAL_EXPENSES } from './data/sampleExpenses';
import {
  ActiveTab,
  AlgoMode,
  CategoryBudgets,
  CurrencyCode,
  Expense,
  SearchMode,
  SortOrder,
} from './types/expense';

const STORAGE_KEY_EXPENSES = 'expensetrack_ads_expenses_v2';
const STORAGE_KEY_BUDGET = 'expensetrack_ads_budget_v1';
const STORAGE_KEY_CAT_BUDGETS = 'expensetrack_ads_cat_budgets_v1';
const STORAGE_KEY_CURRENCY = 'expensetrack_ads_currency_v1';

function loadSavedExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXPENSES);
    if (!raw) return INITIAL_EXPENSES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_EXPENSES;
  } catch {
    return INITIAL_EXPENSES;
  }
}

function loadSavedBudget(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUDGET);
    if (!raw) return 15000;
    const num = Number(raw);
    return Number.isFinite(num) && num > 0 ? num : 15000;
  } catch {
    return 15000;
  }
}

function loadSavedCurrency(): CurrencyCode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENCY);
    return raw === 'USD' ? 'USD' : 'INR';
  } catch {
    return 'INR';
  }
}

function loadSavedCategoryBudgets(): CategoryBudgets {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CAT_BUDGETS);
    if (!raw) return DEFAULT_CATEGORY_BUDGETS;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_CATEGORY_BUDGETS;
    return {
      Food: typeof parsed.Food === 'number' ? parsed.Food : DEFAULT_CATEGORY_BUDGETS.Food,
      Travel: typeof parsed.Travel === 'number' ? parsed.Travel : DEFAULT_CATEGORY_BUDGETS.Travel,
      Shopping: typeof parsed.Shopping === 'number' ? parsed.Shopping : DEFAULT_CATEGORY_BUDGETS.Shopping,
      Education: typeof parsed.Education === 'number' ? parsed.Education : DEFAULT_CATEGORY_BUDGETS.Education,
      Other: typeof parsed.Other === 'number' ? parsed.Other : DEFAULT_CATEGORY_BUDGETS.Other,
    };
  } catch {
    return DEFAULT_CATEGORY_BUDGETS;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tracker');
  const [expenses, setExpenses] = useState<Expense[]>(loadSavedExpenses);
  const [budget, setBudget] = useState<number>(loadSavedBudget);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudgets>(loadSavedCategoryBudgets);
  const [currency, setCurrency] = useState<CurrencyCode>(loadSavedCurrency);
  const [labPreset, setLabPreset] = useState<
    | {
        mode: AlgoMode;
        searchMode?: SearchMode;
        searchQuery?: string;
        sortOrder?: SortOrder;
      }
    | undefined
  >(undefined);

  const formInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    } catch {
      // Ignore storage quota errors
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BUDGET, String(budget));
    } catch {
      // Ignore storage quota errors
    }
  }, [budget]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENCY, currency);
    } catch {
      // Ignore storage quota errors
    }
  }, [currency]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CAT_BUDGETS, JSON.stringify(categoryBudgets));
    } catch {
      // Ignore storage quota errors
    }
  }, [categoryBudgets]);

  function handleQuickAddClick() {
    setActiveTab('tracker');
    window.setTimeout(() => {
      formInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      formInputRef.current?.focus();
    }, 50);
  }

  function handleAddExpense(newExpense: Omit<Expense, 'id'>) {
    const id = `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setExpenses((prev) => [...prev, { ...newExpense, id }]);
  }

  function handleUpdateExpense(updated: Expense) {
    setExpenses((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  }

  function handleDeleteExpense(id: string) {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  }

  function handleOpenAlgorithmLab(preset: {
    mode: AlgoMode;
    searchMode?: SearchMode;
    searchQuery?: string;
    sortOrder?: SortOrder;
  }) {
    setLabPreset(preset);
    setActiveTab('algorithm-lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onQuickAddClick={handleQuickAddClick}
      />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'tracker' && (
          <ExpenseTrackerView
            expenses={expenses}
            budget={budget}
            categoryBudgets={categoryBudgets}
            currency={currency}
            onCurrencyChange={setCurrency}
            onBudgetChange={setBudget}
            onCategoryBudgetsChange={setCategoryBudgets}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            onReplaceExpenses={setExpenses}
            onResetSample={() => {
              setExpenses(INITIAL_EXPENSES);
              setBudget(15000);
              setCategoryBudgets(DEFAULT_CATEGORY_BUDGETS);
            }}
            onOpenAlgorithmLab={handleOpenAlgorithmLab}
            formInputRef={formInputRef}
          />
        )}

        {activeTab === 'algorithm-lab' && (
          <AlgorithmLabView
            expenses={expenses}
            currency={currency}
            initialPreset={labPreset}
          />
        )}

        {activeTab === 'c-code' && <CCodeView />}

        {activeTab === 'project-brief' && <ProjectBriefView />}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>ByteBudge · Personal Expense Tracker (ADS PBL)</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('algorithm-lab')}
              className="hover:text-slate-900 transition-colors"
            >
              Algorithm Lab
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('c-code')}
              className="hover:text-slate-900 transition-colors"
            >
              C Source Code
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('project-brief')}
              className="hover:text-slate-900 transition-colors"
            >
              Viva Guide
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
