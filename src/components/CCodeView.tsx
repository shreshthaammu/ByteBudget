import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { C_SOURCE_CODE } from '../data/sampleExpenses';

type CodeSection = 'full' | 'struct' | 'search' | 'sort' | 'traversal' | 'file';

const SECTION_SNIPPETS: Record<CodeSection, { title: string; subtitle: string; code: string }> = {
  full: {
    title: 'Complete C Program (expense_tracker.c)',
    subtitle: 'Menu-driven C implementation combining struct, arrays, Linear Search, Bubble/Merge Sort, Array Traversal, and File Handling.',
    code: C_SOURCE_CODE,
  },
  struct: {
    title: 'Structure & Array Declaration',
    subtitle: 'Groups date, category, amount, and note into a single record and stores up to MAX_EXPENSES records contiguously.',
    code: `#define MAX_EXPENSES 100

struct Expense {
    char date[11];      // YYYY-MM-DD (11 bytes)
    char category[20];  // Food, Travel, Shopping, Education, Other (20 bytes)
    float amount;       // Expense value (4 bytes)
    char note[50];      // Short description (50 bytes)
};

struct Expense expenses[MAX_EXPENSES];
int count = 0;`,
  },
  search: {
    title: 'Linear Search by Date or Category — O(n)',
    subtitle: 'Scans the unsorted expense array sequentially from index 0 to count - 1 using strcmp().',
    code: `void linearSearch(int mode, const char *target) {
    int found = 0;
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
        printf("No matching records found.\\n");
    }
}`,
  },
  sort: {
    title: 'Bubble Sort O(n²) & Merge Sort O(n log n)',
    subtitle: 'Orders struct Expense records by amount. Bubble Sort swaps adjacent structs; Merge Sort divides & merges subarrays.',
    code: `// Bubble Sort — simple adjacent swaps
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
}

// Merge Sort — divide and conquer
void mergeSortByAmount(struct Expense arr[], int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSortByAmount(arr, left, mid);
        mergeSortByAmount(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}`,
  },
  traversal: {
    title: 'Array Traversal for Totals & Highest Category — O(n)',
    subtitle: 'Single pass through expenses[0..count-1] to sum total expenditure, category buckets, and identify the highest category.',
    code: `void analyzeSpending(float monthlyBudget) {
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
        if (catTotals[c] > catTotals[maxIdx]) maxIdx = c;
    }

    printf("Total: %.2f | Highest Category: %s (%.2f)\\n",
           totalExpenditure, categories[maxIdx], catTotals[maxIdx]);
}`,
  },
  file: {
    title: 'File Handling (Persistence Across Runs)',
    subtitle: 'Addresses the basic limitation where memory is lost on exit by saving and loading records via FILE *fp.',
    code: `void saveToFile() {
    FILE *fp = fopen("expenses.txt", "w");
    if (!fp) return;
    fprintf(fp, "%d\\n", count);
    for (int i = 0; i < count; i++) {
        fprintf(fp, "%s|%s|%.2f|%s\\n",
                expenses[i].date, expenses[i].category,
                expenses[i].amount, expenses[i].note);
    }
    fclose(fp);
}`,
  },
};

export default function CCodeView() {
  const [section, setSection] = useState<CodeSection>('full');
  const [copied, setCopied] = useState<boolean>(false);

  const activeSnippet = SECTION_SNIPPETS[section];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(activeSnippet.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function handleDownloadC() {
    const blob = new Blob([C_SOURCE_CODE], { type: 'text/x-csrc;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expense_tracker.c';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            C Implementation & Complexity
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Inspect the C data structures, memory layout, time complexities, and download the complete compilable source file.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadC}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>Download expense_tracker.c</span>
        </button>
      </div>

      {/* Memory Layout & Complexity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Struct Memory Layout */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Memory Layout of struct Expense
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Contiguous array allocation enables O(1) index lookup via base_address + i × sizeof(struct Expense).
            </p>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200 text-xs font-mono">
            <div className="grid grid-cols-12 bg-slate-50 px-3 py-2 text-slate-500 font-medium">
              <span className="col-span-4">Field</span>
              <span className="col-span-4">C Type</span>
              <span className="col-span-4 text-right">Size</span>
            </div>
            <div className="grid grid-cols-12 px-3 py-2.5 text-slate-800">
              <span className="col-span-4 font-semibold">date</span>
              <span className="col-span-4 text-slate-600">char[11]</span>
              <span className="col-span-4 text-right tabular-nums">11 bytes</span>
            </div>
            <div className="grid grid-cols-12 px-3 py-2.5 text-slate-800">
              <span className="col-span-4 font-semibold">category</span>
              <span className="col-span-4 text-slate-600">char[20]</span>
              <span className="col-span-4 text-right tabular-nums">20 bytes</span>
            </div>
            <div className="grid grid-cols-12 px-3 py-2.5 text-slate-800">
              <span className="col-span-4 font-semibold">amount</span>
              <span className="col-span-4 text-slate-600">float</span>
              <span className="col-span-4 text-right tabular-nums">4 bytes</span>
            </div>
            <div className="grid grid-cols-12 px-3 py-2.5 text-slate-800">
              <span className="col-span-4 font-semibold">note</span>
              <span className="col-span-4 text-slate-600">char[50]</span>
              <span className="col-span-4 text-right tabular-nums">50 bytes</span>
            </div>
          </div>

          <div className="text-xs text-slate-600 flex items-center justify-between pt-1">
            <span>Contiguous Array Capacity</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              100 × struct Expense
            </span>
          </div>
        </div>

        {/* Complexity Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Algorithm Time & Space Complexity
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparing each operation implemented in the Personal Expense Tracker.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="py-2.5 px-3 font-medium">Operation / Algorithm</th>
                  <th className="py-2.5 px-3 font-medium font-mono">Time (Avg / Worst)</th>
                  <th className="py-2.5 px-3 font-medium font-mono">Space</th>
                  <th className="py-2.5 px-3 font-medium">Role in Tracker</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-900">Add Expense (Append)</td>
                  <td className="py-2.5 px-3 font-mono tabular-nums">O(1)</td>
                  <td className="py-2.5 px-3 font-mono tabular-nums">O(1)</td>
                  <td className="py-2.5 px-3">Insert at expenses[count++]</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-900">Linear Search</td>
                  <td className="py-2.5 px-3 font-mono tabular-nums">O(n)</td>
                  <td className="py-2.5 px-3 font-mono tabular-nums">O(1)</td>
                  <td className="py-2.5 px-3">Find by Date or Category</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-900">Bubble Sort</td>
                  <td className="py-2.5 px-3 font-mono tabular-nums">O(n²)</td>
                  <td className="py-2.5 px-3 font-mono tabular-nums">O(1)</td>
                  <td className="py-2.5 px-3">Sort by amount in-place</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-900">Merge Sort</td>
                  <td className="py-2.5 px-3 font-mono tabular-nums">O(n log n)</td>
                  <td className="py-2.5 px-3 font-mono tabular-nums">O(n)</td>
                  <td className="py-2.5 px-3">Fast divide-and-conquer sort</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-900">Array Traversal</td>
                  <td className="py-2.5 px-3 font-mono tabular-nums">O(n)</td>
                  <td className="py-2.5 px-3 font-mono tabular-nums">O(1)</td>
                  <td className="py-2.5 px-3">Total & highest category</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Interactive C Code Viewer */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                ['full', 'Full Program'],
                ['struct', 'Struct & Array'],
                ['search', 'Linear Search'],
                ['sort', 'Bubble & Merge Sort'],
                ['traversal', 'Array Traversal'],
                ['file', 'File Handling'],
              ] as [CodeSection, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSection(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  section === key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 self-start lg:self-auto"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copy C Code</span>
              </>
            )}
          </button>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">{activeSnippet.title}</h3>
          <p className="text-xs text-slate-600 mt-0.5">{activeSnippet.subtitle}</p>
        </div>

        <pre className="p-5 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto max-h-[540px]">
          <code>{activeSnippet.code}</code>
        </pre>
      </div>
    </div>
  );
}
