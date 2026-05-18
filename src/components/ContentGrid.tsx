import { motion } from 'motion/react';

const blocks = [
  {
    title: "Global Sports",
    subtitle: "UCL, NBA, & Premier League",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000&auto=format&fit=crop",
    size: "md:col-span-4"
  },
  {
    title: "4K Motion",
    subtitle: "Lag-free Formula 1",
    image: "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?q=80&w=1000&auto=format&fit=crop",
    size: "md:col-span-2"
  },
  {
    title: "Cinema Tier",
    subtitle: "Latest Blockbusters",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop",
    size: "md:col-span-2"
  },
  {
    title: "Multi-Node",
    subtitle: "Stable 20 Gbps Logic",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop",
    size: "md:col-span-4"
  }
];

export default function ContentGrid() {
  return (
    <section className="py-32 bg-deep-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            EVERY LEAGUE, <br /> <span className="gold-gradient">EVERY MATCH — LIVE.</span>
          </h2>
          <p className="text-zinc-500 text-lg max-w-xl">
            Stream all the legends, the upsets, and the championships in crystal-clear 4K. 
            The stadium experience, delivered to your screen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 h-auto md:h-[900px]">
          {blocks.map((block, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`${block.size} relative rounded-[40px] overflow-hidden group cursor-pointer`}
            >
              <img 
                src={block.image} 
                alt={block.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-10 left-10">
                <p className="text-luxury-gold font-bold text-xs tracking-widest uppercase mb-2">
                  {block.subtitle}
                </p>
                <h3 className="text-3xl font-black uppercase text-white">
                  {block.title}
                </h3>
              </div>
              
              {/* Interaction Overlay */}
              <div className="absolute inset-0 bg-electric-blue/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
