export type Category = 'Food' | 'Transportation' | 'Entertainment' | 'Shopping' | 'Bills' | 'Other';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO string
  category: Category;
}

export interface ExpenseSummary {
  total: number;
  monthly: number;
  categoryBreakdown: { name: string; value: number; color: string }[];
}

export type FilterType = 'all' | 'week' | 'month' | 'year';
