export type ExpenseCategory = 'Food' | 'Travel' | 'Shopping' | 'Education' | 'Other';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  amount: number;
  note: string;
}

export type SortAlgorithm = 'bubble' | 'merge';
export type SortOrder = 'asc' | 'desc';
export type SearchMode = 'category' | 'date';
export type AlgoMode = 'linear-search' | 'bubble-sort' | 'merge-sort' | 'array-traversal';
export type CurrencyCode = 'INR' | 'USD';
export type ActiveTab = 'tracker' | 'algorithm-lab' | 'c-code' | 'project-brief';

export interface CategorySummary {
  category: ExpenseCategory;
  total: number;
  count: number;
  percentage: number;
}

export interface TraversalResult {
  totalExpenditure: number;
  highestCategory: CategorySummary | null;
  categoryBreakdown: CategorySummary[];
  averageExpense: number;
}

export interface AlgoStep {
  stepNumber: number;
  array: Expense[];
  activeIndices: number[];
  comparingIndices: number[];
  swappedIndices: number[];
  matchedIndices: number[];
  sortedIndices: number[];
  mergeRange?: [number, number];
  explanation: string;
  cExpression: string;
  variables: {
    i?: number | string;
    j?: number | string;
    comparisons: number;
    swaps: number;
    matches?: number;
    runningTotal?: number;
    highestCategory?: string;
  };
}

export interface MonthlyTrendPoint {
  monthIndex: number;
  monthShort: string;
  monthFull: string;
  monthKey: string; // YYYY-MM
  total: number;
  count: number;
  topCategory: ExpenseCategory | null;
  topCategoryAmount: number;
  momDeltaPercent: number | null;
  Food: number;
  Travel: number;
  Shopping: number;
  Education: number;
  Other: number;
}

export interface YearlyTrendsSummary {
  year: number;
  months: MonthlyTrendPoint[];
  yearTotal: number;
  activeMonthsCount: number;
  monthlyAverage: number;
  peakMonth: MonthlyTrendPoint | null;
  currentMonthTotal: number;
}

export type CategoryBudgets = Record<ExpenseCategory, number>;

export interface CategoryBudgetStatus {
  category: ExpenseCategory;
  spent: number;
  target: number;
  remaining: number;
  usagePercent: number;
  sharePercent: number;
  status: 'ok' | 'near' | 'over';
}
