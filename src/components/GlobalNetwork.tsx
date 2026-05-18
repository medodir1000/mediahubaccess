import { motion } from 'motion/react';
import { Globe, Shield, Zap } from 'lucide-react';

export default function GlobalNetwork() {
  return (
    <section className="py-32 bg-deep-black relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 1 }}
             className="relative"
           >
              <img 
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop" 
                alt="Global Network Nodes" 
                className="w-full rounded-[60px] opacity-40 grayscale hover:grayscale-0 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-linear-to-r from-deep-black via-transparent to-deep-black" />
              
              {/* Animated Pings */}
              <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-electric-blue rounded-full">
                 <div className="absolute inset-0 bg-electric-blue rounded-full animate-ping" />
              </div>
              <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-luxury-gold rounded-full">
                 <div className="absolute inset-0 bg-luxury-gold rounded-full animate-ping delay-700" />
              </div>
           </motion.div>

           <div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-[0.9]">
                REDUNDANT <br />
                <span className="gold-gradient">GLOBAL NODES.</span>
              </h2>
              <p className="text-zinc-500 text-lg mb-12 leading-relaxed">
                Our infrastructure spans 50+ countries with dedicated high-speed exits in New York, 
                London, Frankfurt, and Tokyo. This guarantees that your connection never traverses 
                congested public gateways.
              </p>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-6 glass-card rounded-3xl border-luxury-gold/10">
                    <Shield className="w-8 h-8 text-luxury-gold mb-4" />
                    <h4 className="font-bold uppercase tracking-tight text-white mb-2 text-sm">Encrypted Path</h4>
                    <p className="text-xs text-zinc-600">Your IP is masked through our secure node logic.</p>
                 </div>
                 <div className="p-6 glass-card rounded-3xl border-electric-blue/10">
                    <Globe className="w-8 h-8 text-electric-blue mb-4" />
                    <h4 className="font-bold uppercase tracking-tight text-white mb-2 text-sm">Geo-Freedom</h4>
                    <p className="text-xs text-zinc-600">Access content from US, UK, and Euro zones instantly.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
