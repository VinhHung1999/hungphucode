import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Expense, ExpenseCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ExpenseFormProps {
  onSubmit: (expense: Expense) => void;
  initialData?: Expense | null;
  onCancel?: () => void;
}

const CATEGORIES: ExpenseCategory[] = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other'];

export function ExpenseForm({ onSubmit, initialData, onCancel }: ExpenseFormProps) {
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [category, setCategory] = useState<ExpenseCategory>(initialData?.category || 'Other');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(initialData?.description || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDate(initialData.date);
      setDescription(initialData.description);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description.');
      return;
    }

    if (!date) {
      setError('Please select a date.');
      return;
    }

    const expense: Expense = {
      id: initialData?.id || uuidv4(),
      amount: Number(amount),
      category,
      date,
      description: description.trim(),
    };

    onSubmit(expense);
    
    if (!initialData) {
      // Reset form if it's a new expense
      setAmount('');
      setDescription('');
      setCategory('Other');
      setDate(new Date().toISOString().split('T')[0]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Expense' : 'Add New Expense'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm font-medium text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium text-slate-700">Amount ($)</label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={error && (!amount || Number(amount) <= 0) ? "border-rose-500" : ""}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-slate-700">Description</label>
            <Input
              id="description"
              type="text"
              placeholder="e.g., Groceries"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={error && !description.trim() ? "border-rose-500" : ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-slate-700">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium text-slate-700">Date</label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={error && !date ? "border-rose-500" : ""}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="w-full">
              {initialData ? 'Update Expense' : 'Add Expense'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="w-full">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
