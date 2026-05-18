import { motion } from 'motion/react';
import { Star } from 'lucide-react';

const reviews = [
  {
    name: "James T.",
    location: "London, UK",
    text: "Switched from a standard cable provider and never looked back. The stability during the Champions League was flawless. Finally, a 4K stream that actually handles live sports without dropping frames.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&h=150&auto=format&fit=crop"
  },
  {
    name: "Sarah L.",
    location: "New York, USA",
    text: "The 'Digital License' setup was easy. I had my login within 30 seconds of paying. My Firestick has never run smoother. 5 stars for the WhatsApp support team as well.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop"
  },
  {
    name: "David M.",
    location: "Berlin, DE",
    text: "As a movie buff, I'm picky about quality. The bitrate on MediaHubAccess is noticeably higher than other services I've tried. Crisp HDR, no noise. Truly a premium product.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&h=150&auto=format&fit=crop"
  }
];

export default function Testimonials() {
  return (
    <section className="py-32 bg-deep-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-20">
          <div className="max-w-xl">
             <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tighter"
             >
               TRUSTED BY <br />
               <span className="gold-gradient">+5,400 GLOBAL USERS.</span>
             </motion.h2>
             <p className="text-zinc-500 text-lg">Don't just take our word for it. Our license holders are our biggest advocates.</p>
          </div>
          <div className="flex items-center gap-4 glass-card px-8 py-4 rounded-2xl">
             <div className="flex text-luxury-gold gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-luxury-gold" />)}
             </div>
             <span className="font-black text-xl">4.9/5</span>
             <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Average Rating</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {reviews.map((review, idx) => (
             <motion.div
               key={idx}
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.1 }}
               className="glass-card p-10 rounded-[40px] flex flex-col justify-between group hover:border-luxury-gold/30 transition-colors"
             >
               <div>
                  <div className="flex gap-1 text-luxury-gold mb-6">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-luxury-gold" />)}
                  </div>
                  <p className="text-zinc-400 italic leading-relaxed mb-10 group-hover:text-zinc-300 transition-colors">"{review.text}"</p>
               </div>
               <div className="flex items-center gap-4 pt-8 border-t border-white/5">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 group-hover:border-luxury-gold/50 transition-colors">
                    <img 
                      src={review.avatar} 
                      alt={review.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold">{review.name}</h4>
                    <p className="text-zinc-600 text-xs uppercase tracking-widest">{review.location}</p>
                  </div>
               </div>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}
