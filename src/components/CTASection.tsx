import { motion } from 'motion/react';
import { Smartphone, Zap, ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <div className="glass-card rounded-[60px] p-12 md:p-20 relative overflow-hidden text-center">
          {/* Accent Blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-yellow/10 rounded-full blur-[100px] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-brand-orange rounded-3xl flex items-center justify-center rotate-3 shadow-2xl hover:rotate-0 transition-transform">
                <Smartphone className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h2 className="font-display text-4xl md:text-6xl font-black mb-6 uppercase">Instant Activation</h2>
            <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
              Simple, secure, and instant. Activate your access directly from your phone and start watching in seconds. Don't miss another second of the action!
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
               <motion.button 
                whileHover={{ scale: 1.05 }}
                className="w-full md:w-auto bg-white text-black px-10 py-5 rounded-full font-black text-xl flex items-center justify-center gap-3"
               >
                 ACTIVATE NOW <Zap className="w-6 h-6 fill-black" />
               </motion.button>
               
               <div className="flex items-center gap-4 text-sm font-bold text-zinc-500 uppercase tracking-widest">
                 <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> SECURE</span>
                 <span className="w-px h-4 bg-zinc-800" />
                 <span className="flex items-center gap-2">INSTANT SETUP</span>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
