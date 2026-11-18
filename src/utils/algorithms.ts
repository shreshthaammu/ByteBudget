import { EXPENSE_CATEGORIES } from '../data/sampleExpenses';
import {
  AlgoStep,
  CategoryBudgets,
  CategoryBudgetStatus,
  CategorySummary,
  CurrencyCode,
  Expense,
  ExpenseCategory,
  MonthlyTrendPoint,
  SearchMode,
  SortOrder,
  TraversalResult,
  YearlyTrendsSummary,
} from '../types/expense';

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);
}

// Array Traversal: O(n) single pass to compute total, category sums, and highest category
export function traverseExpenses(expenses: Expense[]): TraversalResult {
  const totalsMap: Record<ExpenseCategory, { total: number; count: number }> = {
    Food: { total: 0, count: 0 },
    Travel: { total: 0, count: 0 },
    Shopping: { total: 0, count: 0 },
    Education: { total: 0, count: 0 },
    Other: { total: 0, count: 0 },
  };

  let totalExpenditure = 0;

  for (let i = 0; i < expenses.length; i++) {
    const item = expenses[i];
    totalExpenditure += item.amount;
    totalsMap[item.category].total += item.amount;
    totalsMap[item.category].count += 1;
  }

  const categoryBreakdown: CategorySummary[] = EXPENSE_CATEGORIES.map((category) => {
    const entry = totalsMap[category];
    return {
      category,
      total: entry.total,
      count: entry.count,
      percentage: totalExpenditure > 0 ? Math.round((entry.total / totalExpenditure) * 100) : 0,
    };
  });

  let highestCategory: CategorySummary | null = null;
  for (let i = 0; i < categoryBreakdown.length; i++) {
    const current = categoryBreakdown[i];
    if (current.total > 0 && (!highestCategory || current.total > highestCategory.total)) {
      highestCategory = current;
    }
  }

  return {
    totalExpenditure,
    highestCategory,
    categoryBreakdown,
    averageExpense: expenses.length > 0 ? Math.round(totalExpenditure / expenses.length) : 0,
  };
}

// Linear Search trace: O(n)
export function generateLinearSearchTrace(
  expenses: Expense[],
  mode: SearchMode,
  query: string
): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const normalizedQuery = query.trim().toLowerCase();
  const matchedIndices: number[] = [];
  let comparisons = 0;

  steps.push({
    stepNumber: 0,
    array: [...expenses],
    activeIndices: [],
    comparingIndices: [],
    swappedIndices: [],
    matchedIndices: [],
    sortedIndices: [],
    explanation:
      normalizedQuery.length === 0
        ? `Ready to run Linear Search by ${mode}. Enter a ${mode} value to compare from index 0.`
        : `Start Linear Search for ${mode} "${query}" from index i = 0 to ${Math.max(0, expenses.length - 1)}.`,
    cExpression:
      mode === 'category'
        ? `strcmp(expenses[i].category, "${query}") == 0`
        : `strcmp(expenses[i].date, "${query}") == 0`,
    variables: { i: 0, comparisons: 0, swaps: 0, matches: 0 },
  });

  if (normalizedQuery.length === 0 || expenses.length === 0) {
    return steps;
  }

  for (let i = 0; i < expenses.length; i++) {
    comparisons++;
    const fieldValue = mode === 'category' ? expenses[i].category : expenses[i].date;
    const isMatch = fieldValue.toLowerCase().includes(normalizedQuery);

    if (isMatch) {
      matchedIndices.push(i);
    }

    steps.push({
      stepNumber: steps.length,
      array: [...expenses],
      activeIndices: [i],
      comparingIndices: [i],
      swappedIndices: [],
      matchedIndices: [...matchedIndices],
      sortedIndices: [],
      explanation: isMatch
        ? `Index [${i}]: "${fieldValue}" matches "${query}". Record added to matched results.`
        : `Index [${i}]: "${fieldValue}" does not match "${query}". Move to i = ${i + 1}.`,
      cExpression:
        mode === 'category'
          ? `expenses[${i}].category ("${expenses[i].category}") == "${query}" -> ${isMatch ? 'TRUE' : 'FALSE'}`
          : `expenses[${i}].date ("${expenses[i].date}") == "${query}" -> ${isMatch ? 'TRUE' : 'FALSE'}`,
      variables: {
        i,
        comparisons,
        swaps: 0,
        matches: matchedIndices.length,
      },
    });
  }

  steps.push({
    stepNumber: steps.length,
    array: [...expenses],
    activeIndices: [],
    comparingIndices: [],
    swappedIndices: [],
    matchedIndices: [...matchedIndices],
    sortedIndices: [],
    explanation:
      matchedIndices.length > 0
        ? `Linear Search complete after ${comparisons} comparisons. Found ${matchedIndices.length} matching expense(s).`
        : `Linear Search complete after ${comparisons} comparisons. No records matched "${query}".`,
    cExpression: `return found; // ${matchedIndices.length} match(es) in O(n) time`,
    variables: {
      i: expenses.length,
      comparisons,
      swaps: 0,
      matches: matchedIndices.length,
    },
  });

  return steps;
}

// Bubble Sort trace: O(n^2)
export function generateBubbleSortTrace(expenses: Expense[], order: SortOrder): AlgoStep[] {
  const arr = expenses.map((e) => ({ ...e }));
  const steps: AlgoStep[] = [];
  const sortedIndices: number[] = [];
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    stepNumber: 0,
    array: arr.map((e) => ({ ...e })),
    activeIndices: [],
    comparingIndices: [],
    swappedIndices: [],
    matchedIndices: [],
    sortedIndices: [],
    explanation: `Initialize Bubble Sort (${order === 'asc' ? 'Lowest to Highest' : 'Highest to Lowest'} amount) across ${arr.length} records.`,
    cExpression: `for (int i = 0; i < count - 1; i++)`,
    variables: { i: 0, j: 0, comparisons: 0, swaps: 0 },
  });

  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swappedInPass = false;
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      const shouldSwap =
        order === 'asc'
          ? arr[j].amount > arr[j + 1].amount
          : arr[j].amount < arr[j + 1].amount;

      steps.push({
        stepNumber: steps.length,
        array: arr.map((e) => ({ ...e })),
        activeIndices: [j, j + 1],
        comparingIndices: [j, j + 1],
        swappedIndices: [],
        matchedIndices: [],
        sortedIndices: [...sortedIndices],
        explanation: `Pass ${i + 1}: Compare expenses[${j}] (${arr[j].amount}) and expenses[${j + 1}] (${arr[j + 1].amount}). ${
          shouldSwap ? 'Out of order — swap needed.' : 'Already in order.'
        }`,
        cExpression:
          order === 'asc'
            ? `if (expenses[${j}].amount > expenses[${j + 1}].amount)`
            : `if (expenses[${j}].amount < expenses[${j + 1}].amount)`,
        variables: { i, j, comparisons, swaps },
      });

      if (shouldSwap) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swaps++;
        swappedInPass = true;

        steps.push({
          stepNumber: steps.length,
          array: arr.map((e) => ({ ...e })),
          activeIndices: [j, j + 1],
          comparingIndices: [],
          swappedIndices: [j, j + 1],
          matchedIndices: [],
          sortedIndices: [...sortedIndices],
          explanation: `Swapped expenses[${j}] and expenses[${j + 1}] using temporary struct variable.`,
          cExpression: `temp = expenses[${j}]; expenses[${j}] = expenses[${j + 1}]; expenses[${j + 1}] = temp;`,
          variables: { i, j, comparisons, swaps },
        });
      }
    }

    sortedIndices.push(n - 1 - i);
    if (!swappedInPass) {
      for (let k = 0; k < n - 1 - i; k++) {
        if (!sortedIndices.includes(k)) sortedIndices.push(k);
      }
      steps.push({
        stepNumber: steps.length,
        array: arr.map((e) => ({ ...e })),
        activeIndices: [],
        comparingIndices: [],
        swappedIndices: [],
        matchedIndices: [],
        sortedIndices: [...sortedIndices],
        explanation: `Early exit: No swaps in pass ${i + 1}, so the entire array is now sorted!`,
        cExpression: `if (!swapped) break; // Array sorted early`,
        variables: { i, j: '-', comparisons, swaps },
      });
      return steps;
    }
  }

  if (n > 0 && !sortedIndices.includes(0)) {
    sortedIndices.push(0);
  }

  steps.push({
    stepNumber: steps.length,
    array: arr.map((e) => ({ ...e })),
    activeIndices: [],
    comparingIndices: [],
    swappedIndices: [],
    matchedIndices: [],
    sortedIndices: Array.from({ length: n }, (_, idx) => idx),
    explanation: `Bubble Sort complete! Sorted ${n} records in ${comparisons} comparisons and ${swaps} swaps.`,
    cExpression: `// Sorted in O(n^2) worst-case time`,
    variables: { i: Math.max(0, n - 1), j: '-', comparisons, swaps },
  });

  return steps;
}

// Merge Sort trace: O(n log n)
export function generateMergeSortTrace(expenses: Expense[], order: SortOrder): AlgoStep[] {
  const arr = expenses.map((e) => ({ ...e }));
  const steps: AlgoStep[] = [];
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    stepNumber: 0,
    array: arr.map((e) => ({ ...e })),
    activeIndices: [],
    comparingIndices: [],
    swappedIndices: [],
    matchedIndices: [],
    sortedIndices: [],
    explanation: `Initialize Merge Sort (${order === 'asc' ? 'Lowest to Highest' : 'Highest to Lowest'} amount) by dividing the array recursively.`,
    cExpression: `mergeSortByAmount(expenses, 0, ${Math.max(0, arr.length - 1)});`,
    variables: { i: 0, j: Math.max(0, arr.length - 1), comparisons: 0, swaps: 0 },
  });

  function mergeSortHelper(left: number, right: number) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);

    steps.push({
      stepNumber: steps.length,
      array: arr.map((e) => ({ ...e })),
      activeIndices: [],
      comparingIndices: [],
      swappedIndices: [],
      matchedIndices: [],
      sortedIndices: [],
      mergeRange: [left, right],
      explanation: `Divide subarray [${left}..${right}] at midpoint mid = ${mid} into [${left}..${mid}] and [${mid + 1}..${right}].`,
      cExpression: `mid = ${left} + (${right} - ${left}) / 2; // mid = ${mid}`,
      variables: { i: left, j: right, comparisons, swaps },
    });

    mergeSortHelper(left, mid);
    mergeSortHelper(mid + 1, right);

    const leftArr = arr.slice(left, mid + 1).map((e) => ({ ...e }));
    const rightArr = arr.slice(mid + 1, right + 1).map((e) => ({ ...e }));

    let i = 0;
    let j = 0;
    let k = left;

    while (i < leftArr.length && j < rightArr.length) {
      comparisons++;
      const takeLeft =
        order === 'asc'
          ? leftArr[i].amount <= rightArr[j].amount
          : leftArr[i].amount >= rightArr[j].amount;

      if (takeLeft) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      swaps++;

      steps.push({
        stepNumber: steps.length,
        array: arr.map((e) => ({ ...e })),
        activeIndices: [k],
        comparingIndices: [left + Math.min(i, leftArr.length - 1), mid + 1 + Math.min(j, rightArr.length - 1)],
        swappedIndices: [k],
        matchedIndices: [],
        sortedIndices: [],
        mergeRange: [left, right],
        explanation: `Merge [${left}..${mid}] & [${mid + 1}..${right}]: Placed ${arr[k].category} (${arr[k].amount}) at index [${k}].`,
        cExpression: `arr[${k}] = ${takeLeft ? `L[${i - 1}]` : `R[${j - 1}]`};`,
        variables: { i: left + i, j: mid + 1 + j, comparisons, swaps },
      });

      k++;
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      i++;
      swaps++;
      steps.push({
        stepNumber: steps.length,
        array: arr.map((e) => ({ ...e })),
        activeIndices: [k],
        comparingIndices: [],
        swappedIndices: [k],
        matchedIndices: [],
        sortedIndices: [],
        mergeRange: [left, right],
        explanation: `Copy remaining left element (${arr[k].amount}) into index [${k}].`,
        cExpression: `arr[${k}] = L[${i - 1}];`,
        variables: { i: left + i, j: right, comparisons, swaps },
      });
      k++;
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      j++;
      swaps++;
      steps.push({
        stepNumber: steps.length,
        array: arr.map((e) => ({ ...e })),
        activeIndices: [k],
        comparingIndices: [],
        swappedIndices: [k],
        matchedIndices: [],
        sortedIndices: [],
        mergeRange: [left, right],
        explanation: `Copy remaining right element (${arr[k].amount}) into index [${k}].`,
        cExpression: `arr[${k}] = R[${j - 1}];`,
        variables: { i: left, j: mid + 1 + j, comparisons, swaps },
      });
      k++;
    }
  }

  if (arr.length > 1) {
    mergeSortHelper(0, arr.length - 1);
  }

  steps.push({
    stepNumber: steps.length,
    array: arr.map((e) => ({ ...e })),
    activeIndices: [],
    comparingIndices: [],
    swappedIndices: [],
    matchedIndices: [],
    sortedIndices: Array.from({ length: arr.length }, (_, idx) => idx),
    explanation: `Merge Sort complete! Sorted ${arr.length} records in ${comparisons} comparisons and ${swaps} array writes (O(n log n)).`,
    cExpression: `// Merge Sort finished in O(n log n) time`,
    variables: { i: arr.length, j: '-', comparisons, swaps },
  });

  return steps;
}

// Array Traversal trace: O(n)
export function generateTraversalTrace(expenses: Expense[]): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const catTotals: Record<ExpenseCategory, number> = {
    Food: 0,
    Travel: 0,
    Shopping: 0,
    Education: 0,
    Other: 0,
  };
  let runningTotal = 0;

  const getHighest = () => {
    let bestCat = 'None';
    let bestVal = 0;
    for (const cat of EXPENSE_CATEGORIES) {
      if (catTotals[cat] > bestVal) {
        bestVal = catTotals[cat];
        bestCat = `${cat} (${bestVal})`;
      }
    }
    return bestCat;
  };

  steps.push({
    stepNumber: 0,
    array: [...expenses],
    activeIndices: [],
    comparingIndices: [],
    swappedIndices: [],
    matchedIndices: [],
    sortedIndices: [],
    explanation: `Initialize totalExpenditure = 0 and categoryTotals[] = {0}. Ready to traverse ${expenses.length} array elements.`,
    cExpression: `float totalExpenditure = 0.0f; float catTotals[5] = {0};`,
    variables: {
      i: 0,
      comparisons: 0,
      swaps: 0,
      runningTotal: 0,
      highestCategory: 'None',
    },
  });

  for (let i = 0; i < expenses.length; i++) {
    const item = expenses[i];
    runningTotal += item.amount;
    catTotals[item.category] += item.amount;
    const highest = getHighest();

    steps.push({
      stepNumber: steps.length,
      array: [...expenses],
      activeIndices: [i],
      comparingIndices: [],
      swappedIndices: [],
      matchedIndices: Array.from({ length: i + 1 }, (_, idx) => idx),
      sortedIndices: [],
      explanation: `Visit index [${i}]: Add ${item.amount} to total (${runningTotal}) and update ${item.category} bucket (${catTotals[item.category]}).`,
      cExpression: `total += expenses[${i}].amount; catTotals["${item.category}"] += ${item.amount};`,
      variables: {
        i,
        comparisons: i + 1,
        swaps: 0,
        runningTotal,
        highestCategory: highest,
      },
    });
  }

  const finalHighest = getHighest();
  steps.push({
    stepNumber: steps.length,
    array: [...expenses],
    activeIndices: [],
    comparingIndices: [],
    swappedIndices: [],
    matchedIndices: Array.from({ length: expenses.length }, (_, idx) => idx),
    sortedIndices: [],
    explanation: `Traversal complete in ${expenses.length} steps! Total = ${runningTotal}, Highest Category = ${finalHighest}.`,
    cExpression: `// O(n) single-pass traversal complete`,
    variables: {
      i: expenses.length,
      comparisons: expenses.length,
      swaps: 0,
      runningTotal,
      highestCategory: finalHighest,
    },
  });

  return steps;
}

export function sortExpensesDirect(
  expenses: Expense[],
  algorithm: 'bubble' | 'merge',
  order: SortOrder
): Expense[] {
  const trace =
    algorithm === 'bubble'
      ? generateBubbleSortTrace(expenses, order)
      : generateMergeSortTrace(expenses, order);
  const last = trace[trace.length - 1];
  return last ? last.array : [...expenses];
}

const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MONTH_NAMES_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function formatCompactCurrency(amount: number, currency: CurrencyCode): string {
  const symbol = currency === 'INR' ? '₹' : '$';
  if (amount >= 100000) {
    return `${symbol}${(amount / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  }
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return `${symbol}${Math.round(amount)}`;
}

export function getAvailableYears(expenses: Expense[], currentYear: number): number[] {
  const yearSet = new Set<number>([currentYear]);
  for (let i = 0; i < expenses.length; i++) {
    const parsedYear = Number(expenses[i].date.slice(0, 4));
    if (Number.isInteger(parsedYear) && parsedYear >= 1970 && parsedYear <= 2100) {
      yearSet.add(parsedYear);
    }
  }
  return Array.from(yearSet).sort((a, b) => b - a);
}

// Monthly Array Traversal: O(n) single pass bucketing expenses[0..n-1] into 12 month slots
export function calculateMonthlyTrends(
  expenses: Expense[],
  targetYear: number,
  currentMonthIndex: number = new Date().getMonth()
): YearlyTrendsSummary {
  const buckets: MonthlyTrendPoint[] = MONTH_NAMES_SHORT.map((monthShort, idx) => ({
    monthIndex: idx,
    monthShort,
    monthFull: MONTH_NAMES_FULL[idx],
    monthKey: `${targetYear}-${String(idx + 1).padStart(2, '0')}`,
    total: 0,
    count: 0,
    topCategory: null,
    topCategoryAmount: 0,
    momDeltaPercent: null,
    Food: 0,
    Travel: 0,
    Shopping: 0,
    Education: 0,
    Other: 0,
  }));

  for (let i = 0; i < expenses.length; i++) {
    const item = expenses[i];
    const parts = item.date.split('-');
    if (parts.length < 2) continue;

    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    if (year !== targetYear || month < 0 || month > 11) continue;

    const bucket = buckets[month];
    bucket.total += item.amount;
    bucket.count += 1;
    bucket[item.category] += item.amount;
  }

  let yearTotal = 0;
  let activeMonthsCount = 0;
  let peakMonth: MonthlyTrendPoint | null = null;
  let previousActiveTotal: number | null = null;

  for (let m = 0; m < 12; m++) {
    const bucket = buckets[m];
    yearTotal += bucket.total;

    if (bucket.total > 0) {
      activeMonthsCount++;
      let bestCategory: ExpenseCategory | null = null;
      let bestAmount = 0;
      for (const cat of EXPENSE_CATEGORIES) {
        if (bucket[cat] > bestAmount) {
          bestAmount = bucket[cat];
          bestCategory = cat;
        }
      }
      bucket.topCategory = bestCategory;
      bucket.topCategoryAmount = bestAmount;

      if (previousActiveTotal !== null && previousActiveTotal > 0) {
        bucket.momDeltaPercent = Math.round(
          ((bucket.total - previousActiveTotal) / previousActiveTotal) * 1000
        ) / 10;
      }
      previousActiveTotal = bucket.total;

      if (!peakMonth || bucket.total > peakMonth.total) {
        peakMonth = bucket;
      }
    }
  }

  return {
    year: targetYear,
    months: buckets,
    yearTotal,
    activeMonthsCount,
    monthlyAverage: activeMonthsCount > 0 ? Math.round(yearTotal / activeMonthsCount) : 0,
    peakMonth,
    currentMonthTotal:
      currentMonthIndex >= 0 && currentMonthIndex <= 11 ? buckets[currentMonthIndex].total : 0,
  };
}

// Per-Category Budget Traversal: O(n) single pass evaluating spending vs target limits
export function calculateCategoryBudgetStatus(
  expenses: Expense[],
  categoryBudgets: CategoryBudgets,
  monthKey: string | null
): {
  items: CategoryBudgetStatus[];
  totalSpent: number;
  totalTarget: number;
  highestCategory: ExpenseCategory | null;
  overLimitCount: number;
} {
  const spentMap: Record<ExpenseCategory, number> = {
    Food: 0,
    Travel: 0,
    Shopping: 0,
    Education: 0,
    Other: 0,
  };

  let totalSpent = 0;

  for (let i = 0; i < expenses.length; i++) {
    const item = expenses[i];
    if (monthKey && !item.date.startsWith(monthKey)) continue;
    spentMap[item.category] += item.amount;
    totalSpent += item.amount;
  }

  let totalTarget = 0;
  let highestCategory: ExpenseCategory | null = null;
  let highestAmount = 0;
  let overLimitCount = 0;

  const items: CategoryBudgetStatus[] = EXPENSE_CATEGORIES.map((category) => {
    const spent = spentMap[category];
    const target = Math.max(0, categoryBudgets[category] ?? 0);
    totalTarget += target;

    if (spent > highestAmount) {
      highestAmount = spent;
      highestCategory = category;
    }

    const remaining = target - spent;
    const usagePercent = target > 0 ? Math.round((spent / target) * 100) : spent > 0 ? 100 : 0;
    const sharePercent = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;

    let status: 'ok' | 'near' | 'over' = 'ok';
    if (target > 0 && spent > target) {
      status = 'over';
      overLimitCount++;
    } else if (target > 0 && usagePercent >= 80) {
      status = 'near';
    }

    return {
      category,
      spent,
      target,
      remaining,
      usagePercent,
      sharePercent,
      status,
    };
  });

  return {
    items,
    totalSpent,
    totalTarget,
    highestCategory,
    overLimitCount,
  };
}

