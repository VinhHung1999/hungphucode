import { useState, useEffect } from 'react';
import { Expense } from '../types';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedExpenses = localStorage.getItem('expenses');
    if (storedExpenses) {
      try {
        setExpenses(JSON.parse(storedExpenses));
      } catch (error) {
        console.error('Failed to parse expenses', error);
      }
    }
    setIsLoading(false);
  }, []);

  const saveExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    localStorage.setItem('expenses', JSON.stringify(newExpenses));
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: crypto.randomUUID(),
    };
    saveExpenses([newExpense, ...expenses]);
  };

  const deleteExpense = (id: string) => {
    saveExpenses(expenses.filter((e) => e.id !== id));
  };

  const editExpense = (updatedExpense: Expense) => {
    saveExpenses(expenses.map((e) => (e.id === updatedExpense.id ? updatedExpense : e)));
  };

  return { expenses, isLoading, addExpense, deleteExpense, editExpense };
};
