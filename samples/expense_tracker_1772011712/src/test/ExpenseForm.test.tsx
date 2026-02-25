import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpenseForm } from '../components/expenses/ExpenseForm';
import '@testing-library/jest-dom';

describe('ExpenseForm', () => {
  it('renders correctly', () => {
    render(<ExpenseForm onSubmit={() => {}} />);
    expect(screen.getByText('Add New Expense')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount ($)')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
  });

  it('validates form inputs', async () => {
    const onSubmit = vi.fn();
    render(<ExpenseForm onSubmit={onSubmit} />);
    
    fireEvent.click(screen.getByText('Add Expense'));
    
    expect(await screen.findByText('Please enter a valid positive amount.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid data', async () => {
    const onSubmit = vi.fn();
    render(<ExpenseForm onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Amount ($)'), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Groceries' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Food' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2023-01-01' } });
    
    fireEvent.click(screen.getByText('Add Expense'));
    
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      amount: 50,
      description: 'Groceries',
      category: 'Food',
      date: '2023-01-01',
    }));
  });
});
