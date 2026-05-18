import { motion } from 'motion/react';
import { Check, ShieldCheck, Zap, Crown } from 'lucide-react';
import { FREE_TEST_WA_URL } from '../lib/whatsapp';

const plans = [
  {
    name: "Standard",
    duration: "1 Month",
    price: "14,99",
    features: ["65,000+ Live Channels", "120,000+ Movies & Series", "4K / UHD / FHD / HD", "1 Device + Extra (Paid Add-On)", "M3U & portal access", "24/7 support"],
    accent: "electric-blue",
    link: "https://planetkeys.store/prd_bti32a?chw_pvar=Z0VEFO"
  },
  {
    name: "Business",
    duration: "3 Months",
    price: "39,99",
    features: ["65,000+ Live Channels", "120,000+ Movies & Series", "4K / UHD / FHD / HD", "1 Device + Extra (Paid Add-On)", "M3U & portal access", "24/7 support"],
    accent: "zinc-400",
    link: "https://planetkeys.store/prd_bti32a?chw_pvar=YFSRLA"
  },
  {
    name: "Executive",
    duration: "6 Months",
    price: "49,99",
    features: ["65,000+ Live Channels", "120,000+ Movies & Series", "4K / UHD / FHD / HD", "1 Device + Extra (Paid Add-On)", "M3U & portal access", "24/7 priority support"],
    recommended: true,
    accent: "electric-blue",
    link: "https://planetkeys.store/prd_bti32a?chw_pvar=GCJNXM"
  },
  {
    name: "Black Label",
    duration: "12 Months",
    price: "79,99",
    features: ["65,000+ Live Channels", "120,000+ Movies & Series", "4K / UHD / FHD / HD", "1 Device + Extra (Paid Add-On)", "M3U & portal access", "24/7 priority support"],
    bestValue: true,
    accent: "luxury-gold",
    link: "https://planetkeys.store/prd_bti32a"
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-32 bg-deep-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <ShieldCheck className="w-4 h-4 text-electric-blue" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Premium Digital Licenses</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter">SELECT YOUR <br /> <span className="blue-gradient">ACCESS TIER.</span></h2>
          <p className="text-zinc-500 max-w-xl mx-auto mb-10">Same premium quality across all tiers. Choose the duration that best fits your lifestyle.</p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
             <a
               href={FREE_TEST_WA_URL}
               target="_blank"
               rel="noopener noreferrer"
               className="group flex items-center gap-3 bg-white hover:bg-electric-blue border-2 border-electric-blue/30 hover:border-electric-blue px-8 py-4 rounded-2xl transition-all shadow-sm hover:shadow-[0_8px_24px_rgba(59,130,246,0.35)]"
             >
                <div className="w-2 h-2 rounded-full bg-green-500 group-hover:bg-white animate-pulse transition-colors" />
                <span className="text-sm font-black uppercase tracking-widest text-electric-blue group-hover:!text-white transition-colors">Request 12h Free Test</span>
             </a>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">No credit card required</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative glass-card rounded-[32px] p-8 group overflow-hidden transition-all duration-500 hover:translate-y-[-8px] ${plan.recommended ? 'border-electric-blue border-2 shadow-[0_0_40px_rgba(59,130,246,0.2)]' : 'border-white/5'}`}
            >
              {plan.recommended && (
                <div className="absolute top-0 left-0 right-0 bg-electric-blue text-white py-1.5 text-center text-[10px] font-black tracking-widest uppercase">
                  Most Popular
                </div>
              )}
              {plan.bestValue && (
                <div className="absolute top-4 right-4 bg-luxury-gold text-black px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                  Best Value
                </div>
              )}

              <div className="mt-4 mb-8">
                <h3 className="text-white font-black text-xl tracking-tight uppercase mb-4">{plan.duration}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold opacity-50">$</span>
                  <span className="text-5xl font-black">{plan.price}</span>
                  <span className="text-zinc-500 font-medium ml-1 text-sm">/ {plan.duration.toLowerCase()}</span>
                </div>
                <p className="mt-3 text-zinc-400 text-sm font-medium">Essai gratuit de 12 heures</p>
              </div>

              <div className="space-y-4 mb-10 h-[280px]">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.03]">
                    <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-green-500" />
                    </div>
                    <span className="text-[13px] text-zinc-400 group-hover:text-zinc-300 transition-colors uppercase font-bold tracking-tight">{feat}</span>
                  </div>
                ))}
              </div>

              <a 
                href={plan.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center ${plan.recommended ? 'bg-electric-blue text-white hover:bg-blue-600' : 'bg-white/5 text-electric-blue border border-electric-blue/30 hover:bg-white/10'}`}
              >
                ACTIVATE NOW
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
