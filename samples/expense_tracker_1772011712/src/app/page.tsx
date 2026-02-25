"use client";

import React, { useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { ExpenseCharts } from '@/components/dashboard/ExpenseCharts';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download } from 'lucide-react';
import { Expense } from '@/types';

export default function Home() {
  const { expenses, isLoading, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const handleExportCSV = () => {
    if (expenses.length === 0) return;
    
    const headers = ['Date,Amount,Category,Description'];
    const csvContent = expenses.map(e => 
      `${e.date},${e.amount},${e.category},"${e.description.replace(/"/g, '""')}"`
    );
    
    const blob = new Blob([[...headers, ...csvContent].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage and track your personal expenses.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none"
            disabled={expenses.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button 
            onClick={() => {
              setEditingExpense(null);
              setIsAddingExpense(true);
            }}
            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      <SummaryCards expenses={expenses} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(isAddingExpense || editingExpense) ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <ExpenseForm 
              initialData={editingExpense}
              onSubmit={(expense) => {
                if (editingExpense) {
                  updateExpense(expense);
                  setEditingExpense(null);
                } else {
                  addExpense(expense);
                  setIsAddingExpense(false);
                }
              }} 
              onCancel={() => {
                setIsAddingExpense(false);
                setEditingExpense(null);
              }}
            />
          </div>
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
             <ExpenseCharts expenses={expenses} />
          </div>
        )}
        
        <div className={`col-span-1 md:col-span-2 ${isAddingExpense || editingExpense ? 'lg:col-span-2' : 'lg:col-span-2'}`}>
          <ExpenseList 
            expenses={expenses} 
            onDelete={deleteExpense}
            onEdit={(expense) => {
              setEditingExpense(expense);
              setIsAddingExpense(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      </div>
    </div>
  );
}
