import { useState, useEffect } from 'react';
import { Expense } from '../types';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from local storage on mount
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses));
      } catch (e) {
        console.error('Failed to parse expenses', e);
      }
    }
    setIsLoading(false);
  }, []);

  const saveExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    localStorage.setItem('expenses', JSON.stringify(newExpenses));
  };

  const addExpense = (expense: Expense) => {
    const newExpenses = [expense, ...expenses];
    saveExpenses(newExpenses);
  };

  const updateExpense = (updatedExpense: Expense) => {
    const newExpenses = expenses.map((e) =>
      e.id === updatedExpense.id ? updatedExpense : e
    );
    saveExpenses(newExpenses);
  };

  const deleteExpense = (id: string) => {
    const newExpenses = expenses.filter((e) => e.id !== id);
    saveExpenses(newExpenses);
  };

  return {
    expenses,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}
