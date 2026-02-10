'use client';

import { useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { Summary } from '@/components/Summary';
import { ExpenseList } from '@/components/ExpenseList';
import { ExpenseForm } from '@/components/ExpenseForm';
import { Charts } from '@/components/Charts';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Grid,
  Fab,
  Paper,
  Alert
} from '@mui/material';
import { Add as AddIcon, AccountBalanceWallet, Lightbulb } from '@mui/icons-material';

export default function Home() {
  const { expenses, isLoading, addExpense, deleteExpense, editExpense } = useExpenses();
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
              <Box sx={{ bgcolor: 'primary.main', p: 1, borderRadius: 2, display: 'flex' }}>
                <AccountBalanceWallet sx={{ color: 'white' }} />
              </Box>
              <Typography variant="h6" color="text.primary" fontWeight="bold">
                ExpenseTracker
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setIsFormOpen(true)}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Add Expense
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Summary expenses={expenses} />
        
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, xl: 8 }}>
            <Charts expenses={expenses} />
            <ExpenseList 
              expenses={expenses} 
              onDelete={deleteExpense} 
              onEdit={(e) => {
                console.log('Edit', e);
              }} 
            />
          </Grid>
          
          <Grid size={{ xs: 12, xl: 4 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                bgcolor: 'info.light', 
                color: 'info.contrastText',
                borderRadius: 3,
                border: 1,
                borderColor: 'info.main'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Lightbulb />
                <Typography variant="h6" fontWeight="bold">
                  Financial Tip
                </Typography>
              </Box>
              <Typography variant="body2">
                Track your expenses daily to identify spending habits you can improve. Small savings add up over time!
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Floating Action Button */}
      <Fab 
        color="primary" 
        aria-label="add" 
        onClick={() => setIsFormOpen(true)}
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24, 
          display: { xs: 'flex', sm: 'none' } 
        }}
      >
        <AddIcon />
      </Fab>

      {/* Add Expense Dialog */}
      <Dialog 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Add New Expense</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <ExpenseForm 
              onSubmit={addExpense} 
              onCancel={() => setIsFormOpen(false)} 
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
