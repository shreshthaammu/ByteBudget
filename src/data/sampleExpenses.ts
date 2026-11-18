import { CategoryBudgets, Expense, ExpenseCategory } from '../types/expense';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Travel',
  'Shopping',
  'Education',
  'Other',
];

export const DEFAULT_CATEGORY_BUDGETS: CategoryBudgets = {
  Food: 3000,
  Travel: 2500,
  Shopping: 3000,
  Education: 5000,
  Other: 1500,
};

export const CATEGORY_COLORS: Record<ExpenseCategory, { dot: string; bar: string; text: string }> = {
  Food: { dot: 'bg-amber-600', bar: 'bg-amber-600', text: 'text-amber-800' },
  Travel: { dot: 'bg-sky-600', bar: 'bg-sky-600', text: 'text-sky-800' },
  Shopping: { dot: 'bg-rose-600', bar: 'bg-rose-600', text: 'text-rose-800' },
  Education: { dot: 'bg-blue-700', bar: 'bg-blue-700', text: 'text-blue-800' },
  Other: { dot: 'bg-slate-600', bar: 'bg-slate-600', text: 'text-slate-700' },
};

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    date: '2026-01-18',
    category: 'Education',
    amount: 1200,
    note: 'Semester exam registration fee',
  },
  {
    id: 'exp-2',
    date: '2026-02-14',
    category: 'Food',
    amount: 420,
    note: 'Department fest lunch',
  },
  {
    id: 'exp-3',
    date: '2026-03-22',
    category: 'Travel',
    amount: 680,
    note: 'Intercity train ticket',
  },
  {
    id: 'exp-4',
    date: '2026-04-09',
    category: 'Shopping',
    amount: 980,
    note: 'USB drive & lab stationery',
  },
  {
    id: 'exp-5',
    date: '2026-06-11',
    category: 'Education',
    amount: 1550,
    note: 'Summer coding workshop fee',
  },
  {
    id: 'exp-6',
    date: '2026-07-24',
    category: 'Travel',
    amount: 520,
    note: 'Metro smartcard recharge',
  },
  {
    id: 'exp-7',
    date: '2026-08-19',
    category: 'Shopping',
    amount: 1150,
    note: 'Lab coat & engineering kit',
  },
  {
    id: 'exp-8',
    date: '2026-09-14',
    category: 'Food',
    amount: 580,
    note: 'Team project dinner',
  },
  {
    id: 'exp-9',
    date: '2026-10-08',
    category: 'Education',
    amount: 1450,
    note: 'Data Structures & Algorithms textbook',
  },
  {
    id: 'exp-10',
    date: '2026-10-25',
    category: 'Travel',
    amount: 480,
    note: 'Bus pass & auto fare',
  },
  {
    id: 'exp-11',
    date: '2026-11-13',
    category: 'Food',
    amount: 340,
    note: 'College canteen lunch & coffee',
  },
  {
    id: 'exp-12',
    date: '2026-11-17',
    category: 'Education',
    amount: 950,
    note: 'Spiral binding & PBL report printouts',
  },
];

export const C_SOURCE_CODE = `#include <stdio.h>
#include <string.h>

#define MAX_EXPENSES 100
#define DATA_FILE "expenses.txt"

// 1. Structure Definition: stores date, category, amount, and note
struct Expense {
    char date[11];      // Format: YYYY-MM-DD
    char category[20];  // Food, Travel, Shopping, Education, Other
    float amount;
    char note[50];
};

// Global Array to store multiple expense records
struct Expense expenses[MAX_EXPENSES];
int count = 0;

// 2. Add New Expense Record to Array
void addExpense() {
    if (count >= MAX_EXPENSES) {
        printf("Expense array is full!\\n");
        return;
    }
    printf("Enter Date (YYYY-MM-DD): ");
    scanf("%10s", expenses[count].date);
    printf("Enter Category (Food/Travel/Shopping/Education/Other): ");
    scanf("%19s", expenses[count].category);
    printf("Enter Amount: ");
    scanf("%f", &expenses[count].amount);
    printf("Enter Short Note: ");
    scanf(" %49[^\\n]", expenses[count].note);

    count++;
    printf("Expense recorded at index [%d].\\n", count - 1);
}

// 3. Linear Search: Search expenses by Date or Category - O(n)
void linearSearch(int mode, const char *target) {
    int found = 0;
    printf("\\n--- Linear Search Results ---\\n");
    for (int i = 0; i < count; i++) {
        int match = (mode == 1)
            ? (strcmp(expenses[i].date, target) == 0)
            : (strcmp(expenses[i].category, target) == 0);

        if (match) {
            printf("[%d] %s | %-10s | %.2f | %s\\n",
                   i, expenses[i].date, expenses[i].category,
                   expenses[i].amount, expenses[i].note);
            found++;
        }
    }
    if (found == 0) {
        printf("No matching records found for '%s'.\\n", target);
    }
}

// 4A. Bubble Sort: Sort expenses by Amount (Ascending) - O(n^2)
void bubbleSortByAmount() {
    for (int i = 0; i < count - 1; i++) {
        for (int j = 0; j < count - i - 1; j++) {
            if (expenses[j].amount > expenses[j + 1].amount) {
                struct Expense temp = expenses[j];
                expenses[j] = expenses[j + 1];
                expenses[j + 1] = temp;
            }
        }
    }
    printf("Expenses sorted by amount using Bubble Sort.\\n");
}

// 4B. Merge Sort: Sort expenses by Amount (Ascending) - O(n log n)
void merge(struct Expense arr[], int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    struct Expense L[n1], R[n2];

    for (int i = 0; i < n1; i++) L[i] = arr[left + i];
    for (int j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (L[i].amount <= R[j].amount) {
            arr[k++] = L[i++];
        } else {
            arr[k++] = R[j++];
        }
    }
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}

void mergeSortByAmount(struct Expense arr[], int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSortByAmount(arr, left, mid);
        mergeSortByAmount(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}

// 5. Array Traversal: Total, Category Sums, and Highest Spending Category - O(n)
void analyzeSpending(float monthlyBudget) {
    const char *categories[] = {"Food", "Travel", "Shopping", "Education", "Other"};
    float catTotals[5] = {0};
    float totalExpenditure = 0.0f;

    for (int i = 0; i < count; i++) {
        totalExpenditure += expenses[i].amount;
        for (int c = 0; c < 5; c++) {
            if (strcmp(expenses[i].category, categories[c]) == 0) {
                catTotals[c] += expenses[i].amount;
                break;
            }
        }
    }

    int maxIdx = 0;
    for (int c = 1; c < 5; c++) {
        if (catTotals[c] > catTotals[maxIdx]) {
            maxIdx = c;
        }
    }

    printf("\\nTotal Expenditure: %.2f / Budget: %.2f\\n", totalExpenditure, monthlyBudget);
    printf("Highest Spending Category: %s (%.2f)\\n", categories[maxIdx], catTotals[maxIdx]);
}

// 6. File Handling: Persist expenses across program runs
void saveToFile() {
    FILE *fp = fopen(DATA_FILE, "w");
    if (!fp) return;
    fprintf(fp, "%d\\n", count);
    for (int i = 0; i < count; i++) {
        fprintf(fp, "%s|%s|%.2f|%s\\n",
                expenses[i].date, expenses[i].category,
                expenses[i].amount, expenses[i].note);
    }
    fclose(fp);
}

void loadFromFile() {
    FILE *fp = fopen(DATA_FILE, "r");
    if (!fp) return;
    if (fscanf(fp, "%d\\n", &count) != 1) count = 0;
    for (int i = 0; i < count && i < MAX_EXPENSES; i++) {
        fscanf(fp, "%10[^|]|%19[^|]|%f|%49[^\\n]\\n",
               expenses[i].date, expenses[i].category,
               &expenses[i].amount, expenses[i].note);
    }
    fclose(fp);
}

int main() {
    int choice;
    char query[20];
    float budget = 15000.0f;
    loadFromFile();

    do {
        printf("\\n=== ByteBudge: Personal Expense Tracker (ADS PBL) ===\\n");
        printf("1. Add Expense\\n2. Search by Date\\n3. Search by Category\\n");
        printf("4. Bubble Sort (Amount)\\n5. Merge Sort (Amount)\\n");
        printf("6. Analyze Spending\\n7. Save & Exit\\nChoice: ");
        scanf("%d", &choice);

        switch (choice) {
            case 1: addExpense(); break;
            case 2: printf("Enter Date: "); scanf("%19s", query); linearSearch(1, query); break;
            case 3: printf("Enter Category: "); scanf("%19s", query); linearSearch(2, query); break;
            case 4: bubbleSortByAmount(); break;
            case 5: if (count > 1) mergeSortByAmount(expenses, 0, count - 1); break;
            case 6: analyzeSpending(budget); break;
            case 7: saveToFile(); printf("Saved to %s.\\n", DATA_FILE); break;
        }
    } while (choice != 7);

    return 0;
}
`;
