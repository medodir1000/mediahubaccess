import { motion } from 'motion/react';
import { Cpu, Globe, Zap, Shield, PlayCircle, Star } from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="py-32 bg-deep-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter"
          >
            THE GOLD STANDARD <br />
            <span className="blue-gradient">OF STREAMING.</span>
          </motion.h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg">Every feature is engineered to provide a seamless, premium experience for the most demanding viewers worldwide.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 grid-rows-2 gap-6 h-auto lg:h-[800px]">
          {/* Card 1: Main Feature */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="md:col-span-3 glass-card rounded-[40px] p-10 flex flex-col justify-between overflow-hidden relative group"
          >
            <div className="relative z-10">
              <Cpu className="w-12 h-12 text-electric-blue mb-8" />
              <h3 className="text-3xl font-black mb-4 uppercase">AI-Optimized Compression</h3>
              <p className="text-zinc-400 max-w-md">Our servers use proprietary hardware to deliver 4K quality even on slower net connections. Crisp visuals, always.</p>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-electric-blue/10 rounded-full blur-[100px] group-hover:bg-electric-blue/20 transition-colors" />
            <div className="mt-12 flex gap-2">
               <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10">4K UHD</span>
               <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10">50FPS</span>
               <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10">ZERO DROP</span>
            </div>
          </motion.div>

          {/* Card 2: Sports Focus */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-3 glass-card rounded-[40px] p-10 flex flex-col justify-between bg-linear-to-br from-white/5 to-transparent border-white/5"
          >
            <div>
              <Zap className="w-12 h-12 text-luxury-gold mb-8" />
              <h3 className="text-3xl font-black mb-4 uppercase underline decoration-luxury-gold decoration-4 underline-offset-8">Global Node Optimized</h3>
              <p className="text-zinc-400">Specifically engineered for high-bandwidth fiber and ultra-stable broadband. Stay in sync with the real world, no more hearing the goal from your neighbors first.</p>
            </div>
            <div className="flex items-center gap-4 mt-8 opacity-50 grayscale hover:grayscale-0 transition-all">
               <span className="font-black text-xl">AFL</span>
               <span className="font-black text-xl">NRL</span>
               <span className="font-black text-xl">UFC</span>
               <span className="font-black text-xl">F1</span>
            </div>
          </motion.div>

          {/* Card 3: Global Coverage */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 glass-card rounded-[40px] p-10 relative group overflow-hidden"
          >
            <Globe className="w-10 h-10 text-white mb-6 group-hover:rotate-12 transition-transform" />
            <h4 className="text-xl font-bold mb-3 uppercase">Global Access</h4>
            <p className="text-sm text-zinc-500">20,000+ channels from around the world. No geo-blocks, no restrictions.</p>
          </motion.div>

          {/* Card 4: Support */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 glass-card rounded-[40px] p-10 border-electric-blue/20 bg-electric-blue/5"
          >
            <Star className="w-10 h-10 text-electric-blue mb-6 animate-pulse" />
            <h4 className="text-xl font-bold mb-3 uppercase">Priority Care</h4>
            <p className="text-sm text-zinc-400">Direct WhatsApp support for all license holders. We respond in minutes, not days.</p>
          </motion.div>

          {/* Card 5: Security */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 glass-card rounded-[40px] p-10 relative overflow-hidden"
          >
            <Shield className="w-10 h-10 text-zinc-400 mb-6" />
            <h4 className="text-xl font-bold mb-3 uppercase">Secure Node</h4>
            <p className="text-sm text-zinc-500">Your viewing habits are encrypted. Secure, private, and always available.</p>
            <div className="absolute top-0 right-0 p-4">
               <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
