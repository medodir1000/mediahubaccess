import { motion } from 'motion/react';

const items = [
  "CHAMPIONS LEAGUE", "NBA", "PREMIER LEAGUE", "LA LIGA", "SERIE A", "BUNDESLIGA", 
  "NHL", "NFL", "UFC", "F1", "CRICKET", "TENNIS", "BOXING", "AFL", "NRL",
  "NETFLIX", "HBO MAX", "DISNEY+", "HULU", "APPLE TV+", "PARAMOUNT+"
];

export default function CoverageMarquee() {
  return (
    <section className="py-12 bg-deep-black border-y border-white/5 overflow-hidden">
      <div className="flex whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-16 items-center"
        >
          {[...items, ...items].map((item, idx) => (
            <span 
              key={idx} 
              className="text-zinc-600 font-black text-2xl md:text-4xl tracking-tighter opacity-30 hover:opacity-80 transition-opacity cursor-default"
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
