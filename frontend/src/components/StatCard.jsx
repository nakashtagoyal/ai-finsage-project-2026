import { motion } from 'framer-motion';

const colorMap = {
  indigo: 'from-indigo-500 to-indigo-700',
  teal: 'from-teal-500 to-teal-700',
  amber: 'from-amber-400 to-amber-600',
  coral: 'from-rose-500 to-rose-700',
  yellow: 'from-yellow-500 to-amber-700',
};

export default function StatCard({ icon: Icon, label, value, color = 'indigo' }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`rounded-2xl p-5 text-white bg-gradient-to-br ${colorMap[color]} shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm opacity-80">{label}</p>
        {Icon && <Icon size={20} className="opacity-90" />}
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </motion.div>
  );
}
