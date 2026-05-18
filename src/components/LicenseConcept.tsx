import { motion } from 'motion/react';
import { FileText, FastForward, CheckCircle } from 'lucide-react';

export default function LicenseConcept() {
  return (
    <section id="license" className="py-32 relative overflow-hidden bg-white/5 mx-6 rounded-[60px] my-12">
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black mb-8 uppercase leading-tight"
            >
              The <span className="gold-gradient">Digital License</span> <br />
              Paradigm Shift.
            </motion.h2>
            <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
              We don't just sell "streams." We provide a legal, high-performance digital software license that connects your hardware directly to our global redundant server nodes.
            </p>
            
            <ul className="space-y-6">
              {[
                { title: "Hardware Optimization", desc: "Your license unlocks deep integration with Smart TVs and Firesticks." },
                { title: "Direct Server Link", desc: "Bypass the messy public internet with a dedicated node pairing." },
                { title: "Instant Digital Delivery", desc: "Receive your activation credentials via secure portal in seconds." }
              ].map((item, idx) => (
                <motion.li 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-6 h-6 rounded-full bg-luxury-gold/20 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-luxury-gold" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-zinc-500 text-sm">{item.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            {/* Background design image for license context */}
            <div className="absolute -inset-10 z-0">
               <img 
                 src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1000&auto=format&fit=crop" 
                 alt="Cinematic home setup background"
                 className="w-full h-full object-cover opacity-20 blur-xl rounded-full"
                 referrerPolicy="no-referrer"
               />
            </div>

            {/* License Card Rendering */}
            <div className="aspect-[1.6/1] glass-card rounded-[32px] p-8 relative overflow-hidden shadow-2xl border-white/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/20 blur-[60px]" />
               <div className="flex justify-between items-start mb-12">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-electric-blue rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                     </div>
                     <span className="font-bold tracking-widest text-[10px] uppercase opacity-50">Master License Card</span>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Expires</p>
                     <p className="font-mono text-xs">MAY 2027</p>
                  </div>
               </div>
               
               <div className="mb-8">
                  <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-1">Holder Identification</p>
                  <p className="font-display font-medium text-xl tracking-wider">PREMIUM ACCESS NODE #8822</p>
               </div>

               <div className="flex items-end justify-between">
                  <div>
                     <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-1">Status</p>
                     <p className="text-green-500 font-bold text-xs flex items-center gap-2 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Authenticated
                     </p>
                  </div>
                  <div className="flex -space-x-2">
                     <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-charcoal" />
                     <div className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-charcoal" />
                  </div>
               </div>
            </div>

            {/* Floating stats */}
            <div className="absolute -bottom-8 -right-8 glass-card rounded-2xl p-6 shadow-2xl animate-float">
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-1">Active Bandwidth</span>
                  <span className="text-2xl font-black text-electric-blue">120 MB/S</span>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
