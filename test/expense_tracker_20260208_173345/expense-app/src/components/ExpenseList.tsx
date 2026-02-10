import React, { useState } from 'react';
import { Expense } from '@/types';
import { formatCurrency, formatDate, CATEGORY_COLORS } from '@/utils/formatters';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  TextField, 
  MenuItem, 
  InputAdornment, 
  IconButton, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Typography, 
  Stack, 
  Chip, 
  Divider, 
  Box
} from '@mui/material';
import { 
  Search, 
  FilterList, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Category as CategoryIcon 
} from '@mui/icons-material';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredExpenses = expenses
    .filter((e) =>
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((e) => (filterCategory === 'all' ? true : e.category === filterCategory))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader 
        title="Recent Transactions" 
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: 150, sm: 200 } }}
            />
            <TextField
              select
              size="small"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterList fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: 150, sm: 180 } }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {Object.keys(CATEGORY_COLORS).map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Stack>
        }
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      />
      
      <CardContent sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
        {filteredExpenses.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No expenses found.
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredExpenses.map((expense, index) => (
              <React.Fragment key={expense.id}>
                <ListItem
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <IconButton edge="end" aria-label="edit" onClick={() => onEdit(expense)} size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => onDelete(expense.id)} size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  }
                  sx={{ 
                    '&:hover': { bgcolor: 'action.hover' },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: CATEGORY_COLORS[expense.category], color: 'white' }}>
                      {expense.category[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="medium">
                        {expense.description}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(expense.date)} • {expense.category}
                      </Typography>
                    }
                  />
                  <Typography variant="body1" fontWeight="bold" sx={{ mr: 2, color: 'text.primary' }}>
                    -{formatCurrency(expense.amount)}
                  </Typography>
                </ListItem>
                {index < filteredExpenses.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
