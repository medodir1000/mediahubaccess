import { motion } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    q: "How fast is activation after purchase?",
    a: "Immediately. Our automated gateway generates your 24-character security hash and setup instructions as soon as the transaction completes. Check your email or customer portal."
  },
  {
    q: "Which devices are compatible with the license?",
    a: "Virtually all modern hardware. This includes Amazon Firesticks, AndroidTV boxes, Smart TVs (LG, Samsung), iOS, Android, and Desktop browsers. We provide custom apps for most platforms."
  },
  {
    q: "Do I need a VPN to use MediaHubAccess?",
    a: "No. Our nodes are optimized for standard internet service providers. However, if you choose the 'Black Label' tier, we include an integrated VPN for enhanced privacy."
  },
  {
    q: "Can I use my license on multiple screens?",
    a: "Our standard license is optimized for 1 concurrent stream to ensure maximum stability and zero-lag performance for your primary device."
  },
  {
    q: "Is there any lag during major sporting events?",
    a: "We utilize dynamic load-balancing. When a high-traffic event (like a world-class final) starts, our system automatically clones your node to a less-populated cluster to ensure 0ms latency."
  }
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-32 bg-deep-black">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <HelpCircle className="w-4 h-4 text-zinc-500" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500">Concierge Support</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tighter">Common <span className="blue-gradient">Inquiries.</span></h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`glass-card rounded-3xl overflow-hidden transition-all duration-500 ${openIdx === idx ? 'bg-white/[0.06] border-white/20' : 'hover:bg-white/[0.04]'}`}
            >
              <button 
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full p-8 flex items-center justify-between text-left group"
              >
                <span className="text-xl font-bold tracking-tight">{faq.q}</span>
                <ChevronDown className={`w-6 h-6 text-zinc-500 transition-transform duration-500 ${openIdx === idx ? 'rotate-180' : ''}`} />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${openIdx === idx ? 'max-h-96 pb-8' : 'max-h-0'}`}
              >
                <div className="px-8 text-zinc-500 leading-relaxed text-lg">
                   {faq.a}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
