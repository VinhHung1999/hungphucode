export type ExpenseCategory = 'Food' | 'Transportation' | 'Entertainment' | 'Shopping' | 'Bills' | 'Other';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  description: string;
}

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: '#fb923c', // orange-400
  Transportation: '#38bdf8', // sky-400
  Entertainment: '#c084fc', // purple-400
  Shopping: '#f472b6', // pink-400
  Bills: '#fb7185', // rose-400
  Other: '#94a3b8', // slate-400
};

export interface ExpenseSummary {
  total: number;
  byCategory: Record<ExpenseCategory, number>;
  monthlyTotal: number;
}
