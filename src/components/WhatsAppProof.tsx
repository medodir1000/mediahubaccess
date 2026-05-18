import { motion } from 'motion/react';
import WhatsAppMockup, { type WhatsAppMockupProps } from './WhatsAppMockup';

const chats: WhatsAppMockupProps[] = [
  {
    name: 'David Walsh',
    avatarImage: '/avatars/david.webp',
    statusTime: '10:18',
    battery: 65,
    messages: [
      { side: 'them', text: 'Hi, I’m a bit lost with the Smarters Pro app on my LG TV. Can you help me?', time: '9:15 AM' },
      { side: 'us',   text: 'Hello! Don’t worry. Just send me the MAC address showing on your screen or enter the login details I’m sending you now.', time: '9:17 AM' },
      { side: 'them', text: 'One sec... MAC is 04:AA:7F:11:22:33', time: '9:21 AM' },
      { side: 'us',   text: 'Got it ✅ Portal URL + user/pass dropped above. Paste them in the app and you’re live.', time: '9:24 AM' },
      { side: 'them', text: 'Wow that was fast! Everything is up and running. Thank you, you’re a lifesaver 👍', time: '9:28 AM' },
    ],
  },
  {
    name: 'Marc Dupont',
    avatarImage: '/avatars/marc.webp',
    statusTime: '21:42',
    battery: 78,
    messages: [
      { side: 'them', text: 'Le stream F1 a buffé pendant le départ 😩 Vous pouvez vérifier mon nœud ?', time: '21:35' },
      { side: 'us',   text: 'Désolé Marc — votre node EU-1 est saturé sur cette course. Je vous bascule sur EU-2 (fibre 20 Gbps).', time: '21:37' },
      { side: 'them', text: 'Ok je relance le player...', time: '21:39' },
      { side: 'them', text: 'Image cristal claire, plus aucun buffer. Merci !', time: '21:41' },
      { side: 'us',   text: 'Profitez bien de la course 🏎️ Verstappen part en pole.', time: '21:42' },
    ],
  },
  {
    name: 'Sofía García',
    avatarImage: '/avatars/sofia.webp',
    statusTime: '14:05',
    battery: 92,
    messages: [
      { side: 'them', text: 'Hola! Quería probar 12h gratis antes de comprar el plan Black Label.', time: '13:50' },
      { side: 'us',   text: 'Claro Sofía — activado ✅ Tienes el enlace M3U + login arriba. 12h completas, 4K incluido.', time: '13:53' },
      { side: 'them', text: 'Probado en mi Apple TV — calidad brutal, sin cortes.', time: '14:01' },
      { side: 'them', text: 'Acabo de comprar el plan 12 meses 🔥', time: '14:04' },
      { side: 'us',   text: 'Bienvenida al Black Label 🥇 Tu licencia premium está activa. Cualquier cosa, aquí estoy 24/7.', time: '14:05' },
    ],
  },
  {
    name: 'Aisha Al-Mansouri',
    avatarImage: '/avatars/aisha.webp',
    statusTime: '23:11',
    battery: 41,
    messages: [
      { side: 'them', text: 'Hi, the Cricket World Cup channel is not showing in my list. Can you add it please?', time: '22:55' },
      { side: 'us',   text: 'Which match are you trying to watch? Star Sports or Willow HD?', time: '22:58' },
      { side: 'them', text: 'Star Sports 1 HD for India vs Pakistan', time: '23:00' },
      { side: 'us',   text: 'Added now ✅ Star Sports 1 HD + Willow HD are both live in your portal. Just refresh once.', time: '23:04' },
      { side: 'them', text: 'Confirmed, both running smooth. Top class service 🙏', time: '23:11' },
    ],
  },
  {
    name: 'Lisa Schneider',
    avatarImage: '/avatars/lisa.webp',
    statusTime: '17:30',
    battery: 54,
    messages: [
      { side: 'them', text: 'Hi, kann ich ein zweites Gerät für das Tablet meiner Kinder hinzufügen?', time: '17:20' },
      { side: 'us',   text: 'Klar! Add-on Lizenz für €5/Monat. Soll ich es direkt einrichten?', time: '17:23' },
      { side: 'them', text: 'Ja bitte, das wäre super', time: '17:25' },
      { side: 'us',   text: 'Eingerichtet ✅ Zweite Lizenz aktiv — Login-Daten für das Tablet sind oben.', time: '17:28' },
      { side: 'them', text: 'Perfekt, Kinder schauen schon Moana 2 😄 Vielen Dank!', time: '17:30' },
    ],
  },
  {
    name: 'John Brown',
    avatarImage: '/avatars/john.webp',
    statusTime: '3:47 AM',
    battery: 27,
    messages: [
      { side: 'them', text: 'Game 7 NBA Finals just froze on my Firestick. Help please!! 🏀', time: '3:40 AM' },
      { side: 'us',   text: 'On it — clearing your session token. Force-close the app and reopen.', time: '3:42 AM' },
      { side: 'them', text: 'Done... still loading', time: '3:44 AM' },
      { side: 'us',   text: 'Try now — token reissued, you’re on a fresh node.', time: '3:45 AM' },
      { side: 'them', text: 'Back live, didn’t even miss a free throw. You guys are the GOAT 🐐', time: '3:47 AM' },
    ],
  },
  {
    name: 'Tom Hughes',
    avatarImage: '/avatars/tom.webp',
    statusTime: '11:09',
    battery: 88,
    messages: [
      { side: 'them', text: 'My Black Label expires tomorrow. Any loyalty deal for renewing 12 months again?', time: '10:50' },
      { side: 'us',   text: 'Absolutely — 20% off renewal for active license holders. Payment link coming up.', time: '10:53' },
      { side: 'us',   text: 'Sent ✅', time: '10:54' },
      { side: 'them', text: 'Paid! 4th year with you guys 🙌 Best decision I ever made.', time: '11:07' },
      { side: 'us',   text: 'Thanks Tom — renewed for 12 more months. Same login, no interruption.', time: '11:09' },
    ],
  },
];

// All carriers set to "Google Fi" for visual consistency with the reference screenshot.
const normalized = chats.map((c) => ({ carrier: 'Google Fi', ...c }));
const marqueeChats = [...normalized, ...normalized];

export default function WhatsAppProof() {
  return (
    <section className="py-32 bg-deep-black relative overflow-hidden border-t border-white/5">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[400px] bg-green-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 mb-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 mb-6"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-green-500">Live WhatsApp Support</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter"
            >
              REAL CLIENTS. <br /> <span className="blue-gradient">REAL CONVERSATIONS.</span>
            </motion.h2>
            <p className="text-zinc-500 max-w-xl text-lg mb-3">
              Every license holder gets a direct line to our VIP support team. Median first response: <span className="text-white font-bold">under 2 minutes</span>.
            </p>
            <p className="text-zinc-700 max-w-xl text-[10px] uppercase tracking-[0.18em] font-bold">
              * Illustrative scenarios based on common client requests. Names &amp; faces anonymised.
            </p>
          </div>

          <div className="flex items-center gap-3 glass-card px-6 py-4 rounded-2xl shrink-0">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-green-500" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 004.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0012.04 2zm0 18.15h-.01a8.18 8.18 0 01-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.21 8.21 0 01-1.26-4.38c0-4.54 3.69-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.82c-.01 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1.01 2.55.12.17 1.74 2.66 4.22 3.73.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.14-1.18-.06-.1-.22-.16-.46-.28z" />
            </svg>
            <div>
              <p className="font-black text-2xl leading-none">+5,400</p>
              <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold mt-1">Tickets Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrolling marquee of mockups */}
      <div className="relative flex overflow-x-hidden">
        <motion.div
          animate={{ x: [0, '-50%'] }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
          className="flex whitespace-nowrap gap-6 px-4"
        >
          {marqueeChats.map((c, idx) => (
            <div key={idx} className="shrink-0">
              <WhatsAppMockup {...c} />
            </div>
          ))}
        </motion.div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-deep-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-deep-black to-transparent" />
      </div>
    </section>
  );
}
