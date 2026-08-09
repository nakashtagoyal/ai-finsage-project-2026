import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIInsightBanner({ insight }) {
  if (!insight) return null;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 bg-gradient-to-r from-brand-indigo/10 to-brand-teal/10 border border-brand-teal/30 rounded-xl p-4 mb-6"
    >
      <Sparkles className="text-brand-teal mt-0.5 shrink-0" size={20} />
      <p className="text-sm text-indigo-900 dark:text-indigo-100">{insight}</p>
    </motion.div>
  );
}
