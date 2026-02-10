import React, { useState } from 'react';
import { Expense, Category } from '@/types';
import { 
  Button, 
  TextField, 
  MenuItem, 
  Box, 
  Stack, 
  InputAdornment 
} from '@mui/material';
import { 
  AttachMoney, 
  Description, 
  Category as CategoryIcon 
} from '@mui/icons-material';

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
}

const categories: Category[] = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other'];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, onCancel }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    onSubmit({
      description,
      amount: parseFloat(amount),
      category,
      date,
    });
    
    // Reset form
    setDescription('');
    setAmount('');
    setCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField
          label="Description"
          placeholder="What did you buy?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Description color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            required
            InputProps={{
              inputProps: { min: 0, step: 0.01 },
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoney color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CategoryIcon color="action" />
                </InputAdornment>
              ),
            }}
          >
            {categories.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          fullWidth
          required
          InputLabelProps={{
            shrink: true,
          }}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button variant="outlined" color="inherit" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Add Expense
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};
