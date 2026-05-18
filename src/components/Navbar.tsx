import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';
import { FREE_TEST_WA_URL } from '../lib/whatsapp';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-3 sm:py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-card rounded-2xl px-4 sm:px-8 py-3 sm:py-4 gap-3">
        <Link to="/" aria-label="MediaHubAccess — home" className="shrink-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
          >
            <BrandMark
              className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-[0_0_18px_rgba(59,130,246,0.45)] group-hover:scale-110 transition-transform"
              variant="full"
            />
            <p className="font-bold text-base sm:text-lg tracking-tight hidden sm:block whitespace-nowrap leading-none">
              MediaHub<span className="text-electric-blue">Access</span>
            </p>
          </motion.div>
        </Link>

        {/* Status pill — kept compact, single-line. */}
        <div className="hidden xl:flex items-center bg-black/40 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-full gap-2 shadow-sm shrink-0">
           <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 whitespace-nowrap">Linked</span>
           </div>
           <div className="w-px h-3 bg-white/10" />
           <span className="text-[9px] font-black uppercase tracking-[0.2em] text-electric-blue whitespace-nowrap">4K Cluster Active</span>
        </div>

        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-[12px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          <a href="/#features" className="hover:text-electric-blue transition-colors whitespace-nowrap">Features</a>
          <a href="/#license" className="hover:text-electric-blue transition-colors whitespace-nowrap">License</a>
          <a href="/#pricing" className="hover:text-electric-blue transition-colors whitespace-nowrap">Pricing</a>
          <a href="/blog" className="hover:text-electric-blue transition-colors whitespace-nowrap">Blog</a>
          <a href="/#faq" className="hover:text-electric-blue transition-colors whitespace-nowrap">Support</a>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 sm:gap-3 shrink-0"
        >
          <a
            href={FREE_TEST_WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider text-green-600 border border-green-500/40 hover:bg-green-500/10 transition-all whitespace-nowrap"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Free 12h Test
          </a>
          <a
            href="#pricing"
            className="bg-electric-blue px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-blue-600 transition-all shadow-[0_8px_24px_rgba(59,130,246,0.28)] flex items-center justify-center text-white whitespace-nowrap"
          >
            <span className="sm:hidden">Start</span>
            <span className="hidden sm:inline">Get Started</span>
          </a>
        </motion.div>
      </div>
    </nav>
  );
}
