import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, PlusCircle } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import StatCard from '../components/StatCard.jsx';
import SpendingChart from '../components/SpendingChart.jsx';
import AIInsightBanner from '../components/AIInsightBanner.jsx';
import TransactionList from '../components/TransactionList.jsx';
import ChatbotWidget from '../components/ChatbotWidget.jsx';
import api from '../services/api.js';
import Footer from '../components/Footer.jsx';

export default function Dashboard({ darkMode, setDarkMode }) {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, byCategory: {} });
  const [transactions, setTransactions] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [insight, setInsight] = useState('');
  const [form, setForm] = useState({ amount: '', type: 'expense', description: '' });
  const [showForm, setShowForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const loadData = async () => {
    const [
      { data: summaryData },
      { data: txData },
      { data: anomalyData },
      { data: goalsData }
    ] = await Promise.all([
      api.get('/transactions/summary'),
      api.get('/transactions'),
      api.get('/ai/anomalies'),
      api.get('/goals')
    ]);
    setSummary(summaryData);
    setTransactions(txData);

    const total = goalsData.reduce(
      (sum, goal) => sum + Number(goal.savedAmount),
      0
    );

    setTotalSavings(total);

    if (anomalyData.anomalies?.length) {
      const a = anomalyData.anomalies[0];
      setInsight(`Heads up — your ${a.category} spending is ${a.multiplier}x your usual average this month.`);
    } else {
      setInsight('Your spending looks steady this month — nice work staying on track.');
    }
  };

  useEffect(() => {
    loadData();

    const refresh = () => loadData();

    window.addEventListener("goalUpdated", refresh);
    window.addEventListener("transactionUpdate", refresh);

    return () => {
      window.removeEventListener("goalUpdated", refresh);
      window.removeEventListener("transactionUpdate", refresh);
    };
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();

    const transactionData = {
      amount: parseFloat(form.amount),
      type: form.type,
      description: form.description,
    };

    if (
      form.type === "expense" &&
      parseFloat(form.amount) > summary.balance
    ) {
      alert("Insufficient balance! You cannot spend more that your available balance.");
      return;
    }

    if (editingId) {
      await api.put(`/transactions/${editingId}`, transactionData);
    } else {
      await api.post('/transactions', transactionData);
    }

    setForm({
      amount: '',
      type: 'expense',
      description: '',
    });

    setEditingId(null);
    setShowForm(false);
    loadData();
  };

  const handleDeleteTransaction = async () => {
    try {
      await api.delete(`/transactions/${selectedTransaction._id}`);

      setSelectedTransaction(null);

      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete transaction.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-indigo-950 transition-colors">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <AIInsightBanner insight={insight} />

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Wallet} label="Balance" value={`₹${summary.balance.toFixed(2)}`} color="indigo" />
          <StatCard icon={TrendingUp} label="Income" value={`₹${summary.totalIncome.toFixed(2)}`} color="teal" />
          <StatCard icon={TrendingDown} label="Expenses" value={`₹${summary.totalExpense.toFixed(2)}`} color="coral" />
          <StatCard icon={PiggyBank} label="Savings" value={`₹${totalSavings.toFixed(2)}`} color="yellow" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-indigo-900 rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-800 dark:text-white mb-2">Spending by Category</h2>
            <SpendingChart data={summary.byCategory} />
          </div>

          <div className="bg-white dark:bg-indigo-900 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-gray-800 dark:text-white">Recent Transactions</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-1 text-sm text-brand-teal font-medium hover:underline"
              >
                <PlusCircle size={16} /> Add
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleAddTransaction} className="flex flex-col gap-2 mb-4 bg-gray-50 dark:bg-indigo-800 p-3 rounded-xl">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  className="border rounded-lg px-3 py-2 text-sm"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Description (e.g. 'Starbucks coffee')"
                  className="border rounded-lg px-3 py-2 text-sm"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <select
                  className="border rounded-lg px-3 py-2 text-sm"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <button type="submit" className="bg-brand-gradient text-white rounded-lg py-2 text-sm font-semibold">
                  {/* Save (AI will auto-categorize) */}
                  {editingId ? 'Update Transaction' : 'Save (AI will auto-categorize)'}
                </button>
              </form>
            )}

            <TransactionList transactions={transactions}
              setSelectedTransaction={setSelectedTransaction}
            />
          </div>
        </div>
      </main>

      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-indigo-900 p-6 rounded-xl w-96 shadow-xl">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Transaction Details
            </h2>

            <p className="dark:text-white">
              <strong>Description:</strong> {selectedTransaction.description}
            </p>

            <p className="dark:text-white">
              <strong>Amount:</strong> ₹{selectedTransaction.amount}
            </p>

            <p className="dark:text-white">
              <strong>Category:</strong> {selectedTransaction.category}
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-900"
              >
                Close
              </button>

              <button onClick={() => {
                setForm({
                  amount: selectedTransaction.amount,
                  type: selectedTransaction.type,
                  description: selectedTransaction.description,
                });

                setEditingId(selectedTransaction._id);

                setShowForm(true);
                setSelectedTransaction(null);
              }}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-900"
              >
                Edit
              </button>

              <button
                onClick={handleDeleteTransaction}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatbotWidget />
      <Footer />
    </div>
  );
}
