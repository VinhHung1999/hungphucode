import React from 'react';
import { Expense, CATEGORY_COLORS } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ExpenseChartsProps {
  expenses: Expense[];
}

export function ExpenseCharts({ expenses }: ExpenseChartsProps) {
  const categoryData = expenses.reduce((acc, exp) => {
    const existing = acc.find((item) => item.name === exp.category);
    if (existing) {
      existing.value += exp.amount;
    } else {
      acc.push({ name: exp.category, value: exp.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = categoryData.map(item => CATEGORY_COLORS[item.name as keyof typeof CATEGORY_COLORS]);

  return (
    <Card className="col-span-1 md:col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {categoryData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-slate-500">
            No data available for charts
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number | undefined) => {
                    const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
                    return [formatted, 'Amount'];
                  }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
