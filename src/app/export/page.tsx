import Papa from 'papaparse';
import { useExpenses } from '@/hooks/useExpenses';

const ExportPage = () => {
  const { expenses } = useExpenses();

  const handleExport = () => {
    const csvData = expenses.map(e => ({
      Description: e.description,
      Category: e.category,
      Amount: `$${e.amount.toFixed(2)}`,
      Date: e.date.toLocaleDateString(),
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Export Expenses</h1>
        <p className="mb-4">Export your expense data to CSV format.</p>
        <button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          disabled={expenses.length === 0}
        >
          {expenses.length === 0 ? 'No Data to Export' : 'Download CSV'}
        </button>
        {expenses.length === 0 && <p className="text-gray-500 mt-2">Add some expenses first.</p>}
      </div>
    </main>
  );
};

export default ExportPage;