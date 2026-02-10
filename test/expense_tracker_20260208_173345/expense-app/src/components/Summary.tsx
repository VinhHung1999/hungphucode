import React from 'react';
import { Expense } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalanceWallet } from '@mui/icons-material';

interface SummaryProps {
  expenses: Expense[];
}

export const Summary: React.FC<SummaryProps> = ({ expenses }) => {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTotal = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const prevMonthTotal = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === (currentMonth - 1) && d.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const percentageChange = prevMonthTotal === 0 ? 0 : ((monthlyTotal - prevMonthTotal) / prevMonthTotal) * 100;

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 0.5 }}>
                  Total Spending
                </Typography>
                <Typography variant="h4" component="div" fontWeight="bold">
                  {formatCurrency(total)}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', p: 1, borderRadius: 2 }}>
                <AccountBalanceWallet />
              </Box>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', px: 1, py: 0.5, borderRadius: 1 }}>
                Lifetime
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                All recorded expenses
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ height: '100%', borderLeft: 6, borderColor: 'success.main' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  This Month
                </Typography>
                <Typography variant="h4" component="div" fontWeight="bold" color="text.primary">
                  {formatCurrency(monthlyTotal)}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'success.light', color: 'success.dark', p: 1, borderRadius: 2, bgOpacity: 0.1 }}>
                <TrendingUp />
              </Box>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: percentageChange > 0 ? 'error.main' : 'success.main',
                  bgcolor: percentageChange > 0 ? 'error.lighter' : 'success.lighter',
                  fontWeight: 'bold'
                }}
              >
                {percentageChange > 0 ? <TrendingUp fontSize="inherit" sx={{ mr: 0.5 }} /> : <TrendingDown fontSize="inherit" sx={{ mr: 0.5 }} />}
                {Math.abs(percentageChange).toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                vs last month
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ height: '100%', borderLeft: 6, borderColor: 'secondary.main' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Daily Average
                </Typography>
                <Typography variant="h4" component="div" fontWeight="bold" color="text.primary">
                  {formatCurrency(total / (expenses.length || 1))}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'secondary.light', color: 'secondary.dark', p: 1, borderRadius: 2 }}>
                <TrendingUp />
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Based on {expenses.length} transactions
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
