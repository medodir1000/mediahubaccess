import { motion } from 'motion/react';
import { Tablet, Smartphone, Tv, Laptop } from 'lucide-react';

export default function DeviceShowcase() {
  return (
    <section className="py-32 bg-charcoal relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
            JOIN ANYWHERE. <span className="blue-gradient">ENJOY EVERYWHERE.</span>
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
            Whether you're at home on the big screen or on the move with your smartphone, 
            our universal license ensures you never miss a moment of the action.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              { icon: <Tv />, title: "Smart TVs & Firesticks", desc: "Native integration for LG, Samsung, Sony and Amazon devices." },
              { icon: <Smartphone />, title: "Mobile & Tablets", desc: "Crystal clear 4K streaming on the go with our specialized iOS & Android apps." },
              { icon: <Laptop />, title: "Desktop & Web", desc: "Zero-install web player for Chrome, Safari, and dedicated Windows/Mac software." }
            ].map((item, idx) => (
              <div key={idx} className="glass-card p-6 rounded-[24px] flex gap-6 hover:border-electric-blue/30 transition-all cursor-default group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 text-electric-blue group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1 uppercase tracking-tight">{item.title}</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-electric-blue/20 rounded-full blur-[120px] animate-pulse" />
            <img 
              src="https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=1000&auto=format&fit=crop" 
              alt="Device Eco System" 
              className="relative z-10 w-full rounded-[40px] shadow-2xl border border-white/10"
              referrerPolicy="no-referrer"
            />
            {/* Floating badges */}
            <div className="absolute -bottom-6 -left-6 glass-card px-6 py-4 rounded-2xl z-20 shadow-2xl animate-float">
               <p className="text-[10px] font-black uppercase text-zinc-500 mb-1">Optimized for</p>
               <p className="text-lg font-black text-white italic">FIBER GRID</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
