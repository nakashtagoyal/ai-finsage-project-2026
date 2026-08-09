import { motion } from 'framer-motion';

const categoryColor = {
  'Food & Dining': 'bg-rose-100 text-rose-700',
  Groceries: 'bg-teal-100 text-teal-700',
  Transport: 'bg-indigo-100 text-indigo-700',
  Housing: 'bg-amber-100 text-amber-700',
  Utilities: 'bg-sky-100 text-sky-700',
  Entertainment: 'bg-purple-100 text-purple-700',
  Health: 'bg-emerald-100 text-emerald-700',
  Shopping: 'bg-pink-100 text-pink-700',
  Subscriptions: 'bg-violet-100 text-violet-700',
  Income: 'bg-green-100 text-green-700',
  Other: 'bg-gray-100 text-gray-700'
};

export default function TransactionList({ transactions, setSelectedTransaction, }) {
  if (!transactions?.length) {
    return <p className="text-sm text-gray-400 py-6 text-center">No transactions yet.</p>;
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin pr-1">
      {transactions.map((t, i) => (
        <motion.div
        onClick={()=> setSelectedTransaction(t)}
          key={t._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.02 }}
          className="flex items-center justify-between bg-white dark:bg-indigo-900 rounded-xl px-4 py-3 shadow-sm cursor-pointer hover:shadow-lg transaction"
        >
          <div>
            <p className="font-medium text-gray-800 dark:text-white">
              {t.merchant || t.description || 'Transaction'}
            </p>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${categoryColor[t.category] || categoryColor.Other}`}>
              {t.category}
            </span>
          </div>
          <p className={`font-semibold ${t.type === 'income' ? 'text-teal-600' : 'text-rose-600'}`}>
            {t.type === 'income' ? '+' : '-'}₹{Math.abs(t.amount).toFixed(2)}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
