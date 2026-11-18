import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const APPLICATIONS = [
  'Recording daily expenses such as Food, Travel, Shopping, and Education.',
  'Tracking total expenditure against a monthly budget.',
  'Identifying the highest spending category automatically.',
  'Searching expenses quickly by date or category.',
  'Sorting expenses based on amount (ascending or descending).',
  'Helping individuals plan and control their personal budgets.',
];

const DATA_STRUCTURES = [
  {
    name: 'Structure (struct Expense)',
    role: 'Groups related fields (date, category, amount, note) into a single logical record.',
  },
  {
    name: 'Array (expenses[MAX])',
    role: 'Stores multiple struct Expense records in contiguous memory for fast indexed access.',
  },
  {
    name: 'Linear Search',
    role: 'Scans records sequentially to search expenses by date or category in O(n) time.',
  },
  {
    name: 'Bubble Sort & Merge Sort',
    role: 'Sorts expense records by amount; Bubble Sort O(n²) for simplicity, Merge Sort O(n log n) for efficiency.',
  },
  {
    name: 'Array Traversal',
    role: 'Iterates through all records once in O(n) time to calculate total spending and category-wise sums.',
  },
];

const VIVA_QA = [
  {
    q: 'Why did you use a Structure inside an Array instead of separate arrays?',
    a: 'A struct binds date, category, amount, and note together as one Expense object. When sorting by amount, swapping two structs moves all related fields together cleanly without desynchronizing parallel arrays.',
  },
  {
    q: 'Why is Linear Search used for searching by Date or Category?',
    a: 'Expenses are usually added in chronological or entry order and may not be sorted by category or date. Linear Search works directly on unsorted arrays in O(n) time and finds all matching records, not just the first one.',
  },
  {
    q: 'What is the difference between Bubble Sort and Merge Sort in this project?',
    a: 'Bubble Sort compares and swaps adjacent elements in-place with O(1) extra memory and O(n²) time, making it easy to understand. Merge Sort uses divide-and-conquer to sort in O(n log n) time, which scales much better as expense records grow.',
  },
  {
    q: 'How do you find the Highest Spending Category?',
    a: 'Using Array Traversal, we visit each expense once, accumulate sums into category buckets (Food, Travel, Shopping, Education, Other), and then scan the 5 category totals to pick the maximum.',
  },
  {
    q: 'How does this project handle the File Handling limitation?',
    a: 'In a basic console C program, data in RAM is lost when the program closes unless FILE *fp read/write is added. Both the included C source code (expenses.txt) and this web app (browser storage + JSON/CSV export & import) implement persistent file handling.',
  },
];

export default function ProjectBriefView() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          ADS PBL Project Brief & Viva Guide
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Structured presentation summary of the Personal Expense Tracker using Data Structures & Algorithms.
        </p>
      </div>

      {/* Objective & Overview */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">01. Title & Objective</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          <span className="font-semibold text-slate-900">Title:</span> ByteBudge — Personal Expense Tracker (using Data Structures)
        </p>
        <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
          <span className="font-semibold text-slate-900">Objective:</span> To develop a C-based application that helps users record, manage, search, and sort their daily expenses and analyze category-wise spending clearly and efficiently.
        </p>
      </section>

      {/* Applications & Data Structures 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">02. Core Applications</h2>
          <ol className="space-y-2.5 text-sm text-slate-700">
            {APPLICATIONS.map((item, idx) => (
              <li key={item} className="flex items-start gap-3">
                <span className="font-mono text-xs font-semibold text-blue-700 mt-0.5 tabular-nums">
                  0{idx + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">03. Data Structures & Algorithms Used</h2>
          <dl className="divide-y divide-slate-100 text-sm">
            {DATA_STRUCTURES.map((ds) => (
              <div key={ds.name} className="py-2.5 first:pt-0 last:pb-0">
                <dt className="font-semibold text-slate-900">{ds.name}</dt>
                <dd className="text-slate-600 mt-0.5 text-xs leading-relaxed">{ds.role}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {/* Limitations & Conclusion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">04. Limitations</h2>
          <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
            <li>Requires manual entry of daily expenses.</li>
            <li>Basic version does not support automatic bank transaction syncing.</li>
            <li>
              In a basic console program, data is lost on exit unless file handling is implemented (solved here via JSON/CSV file export-import and <span className="font-mono text-xs">FILE *fp</span> in the C code).
            </li>
            <li>Scoped to the core tracking, search, sort, and analysis features.</li>
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">05. Conclusion</h2>
          <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
            <li>Helps users manage their daily expenses consistently.</li>
            <li>Provides a clear visual view of category-wise spending habits.</li>
            <li>Makes searching and sorting records simple and efficient.</li>
            <li>Helps individuals plan and control their monthly budgets.</li>
          </ul>
          <p className="pt-2 text-sm font-medium text-slate-900">
            Overall, the Personal Expense Tracker is a practical demonstration of structures, arrays, searching, sorting, and traversal algorithms in C.
          </p>
        </section>
      </div>

      {/* Viva Q&A Guide */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">06. Viva & Presentation Q&A</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any question below to review a clear, concise explanation for your PBL demo.
          </p>
        </div>

        <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
          {VIVA_QA.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full px-4 py-3.5 flex items-center justify-between gap-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-900">{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
