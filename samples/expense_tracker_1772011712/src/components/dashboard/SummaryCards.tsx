import React from 'react';
import { Expense } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, PieChart } from 'lucide-react';

interface SummaryCardsProps {
  expenses: Expense[];
}

export function SummaryCards({ expenses }: SummaryCardsProps) {
  const total = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTotal = expenses
    .filter((exp) => {
      const date = new Date(exp.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((acc, exp) => acc + exp.amount, 0);

  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || ['None', 0];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
          <DollarSign className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tabular-nums text-slate-900">{formatCurrency(total)}</div>
          <p className="text-xs text-slate-500 mt-1">All time</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tabular-nums text-slate-900">{formatCurrency(monthlyTotal)}</div>
          <p className="text-xs text-slate-500 mt-1">This month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          <PieChart className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{topCategory[0]}</div>
          <p className="text-xs text-slate-500 mt-1">{formatCurrency(topCategory[1] as number)} total</p>
        </CardContent>
      </Card>
    </div>
  );
}
