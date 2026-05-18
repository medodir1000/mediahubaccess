import { motion } from 'motion/react';

const categories = [
  {
    title: "Live Sports",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000",
    stats: "24/7 Coverage"
  },
  {
    title: "Global Blockbusters",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000",
    stats: "4K HDR"
  },
  {
    title: "Latest Series",
    image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1000",
    stats: "Weekly Updates"
  }
];

export default function ContentShowcase() {
  return (
    <section id="content" className="py-24 bg-deep-black relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="font-display text-4xl md:text-5xl font-black mb-4 uppercase leading-none">Everything you love, <br /> At your <span className="text-brand-yellow underline decoration-brand-orange/50 decoration-8 underline-offset-4">fingertips.</span></h2>
            <p className="text-zinc-400">From the roar of the stadium to the tension of the big screen. Smooth streaming, zero interruptions, just pure excitement.</p>
          </div>
          <div className="flex gap-4">
             <div className="px-6 py-3 bg-white/5 rounded-full border border-white/10 text-sm font-bold">SPORTS</div>
             <div className="px-6 py-3 bg-white/5 rounded-full border border-white/10 text-sm font-bold">MOVIES</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="relative aspect-[4/5] rounded-[40px] overflow-hidden group cursor-pointer"
            >
              <img 
                src={cat.image} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={cat.title}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-10 left-10">
                <p className="text-brand-orange font-bold text-xs tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
                  {cat.stats}
                </p>
                <h3 className="font-display text-3xl font-black uppercase">{cat.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
