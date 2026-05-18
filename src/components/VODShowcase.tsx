import { motion } from 'motion/react';

const posters = [
  { title: "Deadpool & Wolverine",   image: "/posters/deadpool-wolverine.webp" },
  { title: "Venom: The Last Dance",  image: "/posters/venom-last-dance.webp" },
  { title: "Squid Game 2",           image: "/posters/squid-game-2.webp" },
  { title: "Moana 2",                image: "/posters/moana-2.webp" },
  { title: "Arcane",                 image: "/posters/arcane.webp" },
  { title: "House of the Dragon",    image: "/posters/house-of-dragon.webp" },
  { title: "The Boys",               image: "/posters/the-boys.webp" },
  { title: "Shōgun",                 image: "/posters/shogun.webp" },
  { title: "Shōgun: Season 2",       image: "/posters/shogun-s2.webp" },
  { title: "The Last of Us",         image: "/posters/last-of-us.webp" },
];

// Double posters for infinite scroll
const marqueePosters = [...posters, ...posters];

export default function VODShowcase() {
  return (
    <section className="py-20 bg-deep-black overflow-hidden border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 text-center mb-16">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-zinc-500 font-medium text-lg md:text-xl"
        >
          everything you desire from the extensive VOD library
        </motion.p>
      </div>

      {/* Scrolling Marquee */}
      <div className="relative flex overflow-x-hidden mb-24">
        <motion.div
          animate={{
            x: [0, "-50%"],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex whitespace-nowrap gap-6 px-3"
        >
          {marqueePosters.map((poster, idx) => (
            <div 
              key={idx} 
              className="relative w-64 md:w-72 aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 group shadow-2xl"
            >
              <img
                src={poster.image}
                alt={poster.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <p className="text-white font-black uppercase tracking-widest text-xs">{poster.title}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 lg:gap-12"
        >
          <div className="text-center group">
             <p className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-2 transition-transform group-hover:scale-105 duration-500 tracking-tighter">
                +5,400
             </p>
             <p className="text-zinc-500 font-light text-lg sm:text-xl lg:text-2xl tracking-tight">Clients</p>
          </div>
          <div className="text-center group">
             <p className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-2 transition-transform group-hover:scale-105 duration-500 tracking-tighter">
                +120,000
             </p>
             <p className="text-zinc-500 font-light text-lg sm:text-xl lg:text-2xl tracking-tight">Films & Series</p>
          </div>
          <div className="text-center group">
             <p className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-2 transition-transform group-hover:scale-105 duration-500 tracking-tighter">
                +65,000
             </p>
             <p className="text-zinc-500 font-light text-lg sm:text-xl lg:text-2xl tracking-tight">Channels</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
