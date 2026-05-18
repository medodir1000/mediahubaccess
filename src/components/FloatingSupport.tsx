import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';
import { FREE_TEST_WA_URL } from '../lib/whatsapp';

export default function FloatingSupport() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="fixed bottom-8 right-8 z-[100]"
    >
      <a
        href={FREE_TEST_WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-green-500 text-white px-6 py-4 rounded-full shadow-[0_10px_30px_rgba(34,197,94,0.4)] hover:scale-105 transition-transform"
      >
        <MessageCircle className="w-6 h-6" />
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">Get Your</span>
          <span className="font-black uppercase tracking-tight text-sm">Free 12h Test</span>
        </div>
      </a>
    </motion.div>
  );
}
