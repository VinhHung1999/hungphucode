import React, { useState } from 'react';
import { Expense, ExpenseCategory, CATEGORY_COLORS } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
}

export function ExpenseList({ expenses, onDelete, onEdit }: ExpenseListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'All'>('All');

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-100">
        <CardTitle>Recent Expenses</CardTitle>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search expenses..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | 'All')}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <option value="All">All Categories</option>
            {Object.keys(CATEGORY_COLORS).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-lg font-medium text-slate-900">No expenses found</p>
            <p className="text-sm mt-1">Try adjusting your filters or add a new expense.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                  >
                    <span className="text-xs font-bold">{expense.category.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{expense.description}</p>
                    <p className="text-xs text-slate-500">
                      {expense.category} • {formatDate(expense.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(expense.amount)}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                      onClick={() => onEdit(expense)}
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                      onClick={() => onDelete(expense.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
