import { motion } from 'motion/react';
import { ArrowRight, ChevronRight, Monitor, Shield } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">
      {/* Background Visuals - cinematic poster collage, just barely visible behind hero text */}
      <div className="absolute inset-0 z-0">
        {/* Poster collage — 6 posters tiled in a grid, heavily blurred so they read as ambient texture */}
        <div
          className="absolute inset-0 grid grid-cols-3 sm:grid-cols-6 grid-rows-2 gap-0 scale-110 blur-[6px]"
          style={{ filter: 'blur(8px) saturate(1.2)' }}
        >
          <img src="/posters/venom-last-dance.webp"  alt="" className="w-full h-full object-cover" loading="eager" decoding="async" />
          <img src="/posters/last-of-us.webp"        alt="" className="w-full h-full object-cover" loading="eager" decoding="async" />
          <img src="/posters/house-of-dragon.webp"   alt="" className="w-full h-full object-cover" loading="eager" decoding="async" />
          <img src="/posters/shogun.webp"            alt="" className="w-full h-full object-cover" loading="eager" decoding="async" />
          <img src="/posters/deadpool-wolverine.webp" alt="" className="w-full h-full object-cover" loading="eager" decoding="async" />
          <img src="/posters/the-boys.webp"          alt="" className="w-full h-full object-cover" loading="eager" decoding="async" />
          <img src="/posters/arcane.webp"            alt="" className="w-full h-full object-cover hidden sm:block" loading="eager" decoding="async" />
          <img src="/posters/shogun-s2.webp"         alt="" className="w-full h-full object-cover hidden sm:block" loading="eager" decoding="async" />
          <img src="/posters/squid-game-2.webp"      alt="" className="w-full h-full object-cover hidden sm:block" loading="eager" decoding="async" />
          <img src="/posters/moana-2.webp"           alt="" className="w-full h-full object-cover hidden sm:block" loading="eager" decoding="async" />
          <img src="/posters/venom-last-dance.webp"  alt="" className="w-full h-full object-cover hidden sm:block" loading="eager" decoding="async" />
          <img src="/posters/last-of-us.webp"        alt="" className="w-full h-full object-cover hidden sm:block" loading="eager" decoding="async" />
        </div>

        {/* Dim the collage so only ~25-30% visible */}
        <div className="absolute inset-0 bg-deep-black/72" />

        {/* Radial vignette: keep center darker (text readability) — posters peek out at edges */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.55) 50%, rgba(5,5,5,0.15) 100%)',
          }}
        />

        {/* Bottom fade into deep-black so next section blends */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deep-black/40 to-deep-black z-10" />

        {/* Noise grain */}
        <div className="absolute inset-0 bg-noise opacity-15 mix-blend-overlay z-20" />

        {/* Brand ambient blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-electric-blue/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-luxury-gold/8 rounded-full blur-[150px] animate-pulse delay-700" />
      </div>

      <div className="relative z-30 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex flex-wrap justify-center items-center gap-4 mb-8"
        >
          <div className="flex items-center gap-2 px-6 py-2 rounded-full glass-card">
            <span className="flex h-2 w-2 rounded-full bg-electric-blue animate-ping" />
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-blue-400">Global License Authorization Server</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-green-500 uppercase">Live: 14,204 Active Nodes</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-9xl font-black mb-6 tracking-tighter leading-[0.85] uppercase"
        >
          JOIN, <span className="blue-gradient">ENJOY!</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto text-lg md:text-2xl text-zinc-400 font-medium mb-12 leading-relaxed"
        >
          Stream all the TV shows you love. Stream full seasons of the best TV shows, 
          the latest blockbuster movies, children’s shows, live matches, complete seasons of 
          exclusive series, and everything you desire from our extensive library.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20"
        >
          <a 
            href="#pricing"
            className="w-full sm:w-auto bg-electric-blue text-white px-12 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-[0_0_40px_rgba(59,130,246,0.3)] group"
          >
            ACTIVATE NOW
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </a>
          
          <a 
            href="#devices"
            className="w-full sm:w-auto glass-card border-white/5 px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-zinc-300"
          >
            <Monitor className="w-5 h-5" />
            Check Compatibility
          </a>
        </motion.div>
      </div>

      {/* Decorative lines */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
