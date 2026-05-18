import type { CSSProperties, FC } from 'react';

export type ChatMessage = {
  side: 'them' | 'us';
  text: string;
  time: string;
};

export type WhatsAppMockupProps = {
  name: string;
  /** Path to avatar image (served from /avatars/<file>.webp). Falls back to initials if omitted. */
  avatarImage?: string;
  /** Tailwind gradient classes for the fallback initials avatar. */
  avatarGradient?: string;
  /** Status bar clock, e.g. "10:18". */
  statusTime?: string;
  /** Battery percentage. */
  battery?: number;
  /** Carrier label, e.g. "Google Fi". */
  carrier?: string;
  messages: ChatMessage[];
  className?: string;
  style?: CSSProperties;
};

/**
 * iOS-style WhatsApp chat screenshot mockup. Pure CSS / SVG so it scales crisply at any DPR.
 */
export default function WhatsAppMockup({
  name,
  avatarImage,
  avatarGradient = 'from-electric-blue to-blue-800',
  statusTime = '10:18',
  battery = 65,
  carrier = 'Google Fi',
  messages,
  className = '',
  style,
}: WhatsAppMockupProps) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={`relative w-[220px] sm:w-[230px] aspect-[9/20] rounded-[30px] overflow-hidden bg-black shadow-2xl ring-1 ring-white/10 select-none ${className}`}
      style={style}
    >
      {/* Phone outer frame */}
      <div className="absolute inset-[2.5px] rounded-[27px] overflow-hidden bg-white flex flex-col">
        {/* Status bar */}
        <div className="bg-white text-black h-6 px-3 flex items-center justify-between text-[9px] font-semibold shrink-0">
          <div className="flex items-center gap-[3px]">
            <div className="flex items-end gap-[1.5px]">
              <span className="w-[2.5px] h-[2.5px] bg-black rounded-[0.5px]" />
              <span className="w-[2.5px] h-[4px] bg-black rounded-[0.5px]" />
              <span className="w-[2.5px] h-[5.5px] bg-black rounded-[0.5px]" />
              <span className="w-[2.5px] h-[7px] bg-black rounded-[0.5px]" />
            </div>
            <span className="ml-0.5">{carrier}</span>
            <svg viewBox="0 0 16 12" className="w-2.5 h-2.5" fill="currentColor">
              <path d="M8 11.5a1 1 0 100-2 1 1 0 000 2zM5.2 8.7a4 4 0 015.6 0l-1.4 1.4a2 2 0 00-2.8 0L5.2 8.7zM2.4 5.9a8 8 0 0111.2 0l-1.4 1.4a6 6 0 00-8.4 0L2.4 5.9z" />
            </svg>
          </div>
          <span className="font-bold">{statusTime}</span>
          <div className="flex items-center gap-1">
            <span>{battery}%</span>
            <div className="relative w-4 h-2 border border-black rounded-[1.5px] flex items-center">
              <div
                className="h-full bg-black rounded-[1px] ml-[0.5px]"
                style={{ width: `${Math.max(0, Math.min(100, battery)) * 0.12}px` }}
              />
              <span className="absolute -right-[2.5px] top-1/2 -translate-y-1/2 w-[1.5px] h-[3px] bg-black rounded-r" />
            </div>
          </div>
        </div>

        {/* WhatsApp header */}
        <div className="bg-[#F6F6F6] border-b border-black/5 px-2 py-1.5 flex items-center gap-1.5 shrink-0">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#007AFF]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {avatarImage ? (
            <img
              src={avatarImage}
              alt={name}
              className="w-7 h-7 rounded-full object-cover shrink-0"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-[9px] font-bold tracking-wide shrink-0`}>
              {initials}
            </div>
          )}
          <p className="flex-1 min-w-0 text-[11px] font-bold text-black truncate">{name}</p>
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#007AFF]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.93.37 1.84.7 2.71a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.37-1.37a2 2 0 012.11-.45c.87.33 1.78.57 2.71.7A2 2 0 0122 16.92z" />
          </svg>
        </div>

        {/* Chat body */}
        <div
          className="flex-1 px-2 py-2 flex flex-col gap-1.5 overflow-hidden relative"
          style={{
            backgroundColor: '#ECE5DD',
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='%23D4C9B3' fill-opacity='0.55'%3E%3Ccircle cx='10' cy='10' r='1.5'/%3E%3Ccircle cx='30' cy='25' r='1'/%3E%3Cpath d='M50 15a4 4 0 11-8 0 4 4 0 018 0zm0 0a3 3 0 016 0 3 3 0 01-6 0z' stroke='%23D4C9B3' stroke-width='0.6' fill='none'/%3E%3Cpath d='M75 50q4 -4 8 0t8 0' stroke='%23D4C9B3' stroke-width='0.8' fill='none'/%3E%3Crect x='100' y='15' width='8' height='5' rx='1' fill='none' stroke='%23D4C9B3' stroke-width='0.6'/%3E%3Cpath d='M15 60c2-3 6-3 8 0s-6 4-8 0z' fill='none' stroke='%23D4C9B3' stroke-width='0.6'/%3E%3Ccircle cx='55' cy='70' r='2' fill='none' stroke='%23D4C9B3' stroke-width='0.6'/%3E%3Cpath d='M90 85l3 5-6 0z' fill='none' stroke='%23D4C9B3' stroke-width='0.6'/%3E%3Cpath d='M25 95q5 5 10 0' stroke='%23D4C9B3' stroke-width='0.6' fill='none'/%3E%3Ccircle cx='105' cy='105' r='1'/%3E%3Cpath d='M65 105l2-4 2 4z' fill='none' stroke='%23D4C9B3' stroke-width='0.6'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        >
          {messages.map((m, i) => (
            <Bubble key={i} message={m} senderName={m.side === 'us' ? 'You' : name.split(' ')[0]} />
          ))}
        </div>

        {/* Input bar */}
        <div className="bg-[#F6F6F6] border-t border-black/5 px-2 py-1.5 flex items-center gap-1.5 shrink-0">
          <div className="w-5 h-5 rounded-full bg-[#007AFF] flex items-center justify-center text-white text-xs leading-none shrink-0">+</div>
          <div className="flex-1 h-5 rounded-full bg-white border border-black/10" />
        </div>
      </div>
    </div>
  );
}

const Bubble: FC<{ message: ChatMessage; senderName: string }> = ({ message, senderName }) => {
  const isUs = message.side === 'us';
  return (
    <div className={`flex ${isUs ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[82%] px-1.5 pt-1 pb-0.5 rounded-[7px] text-[9px] leading-tight text-black shadow-sm ${
          isUs ? 'bg-[#DCF8C6]' : 'bg-white'
        }`}
      >
        <p className={`text-[7.5px] font-bold mb-0.5 ${isUs ? 'text-[#1F9B4D]' : 'text-[#E54B4B]'}`}>{senderName}</p>
        <p className="whitespace-pre-line">{message.text}</p>
        <div className="flex items-center justify-end gap-0.5 mt-0.5">
          <span className="text-[6.5px] text-black/40 font-medium">{message.time}</span>
          {isUs && (
            <svg viewBox="0 0 18 18" className="w-[8px] h-[8px] text-[#34B7F1]" fill="currentColor">
              <path d="M17.394 5.035l-.57-.444a.434.434 0 00-.609.076l-6.39 8.198-.111.108-2.798-2.27a.434.434 0 00-.611.066l-.477.55a.434.434 0 00.067.61l3.74 3.064a.434.434 0 00.612-.068l7.225-9.279a.434.434 0 00-.078-.61zM12.502 5.035l-.57-.444a.434.434 0 00-.609.076L5.16 12.866l-.111.108-2.798-2.27a.434.434 0 00-.611.066l-.477.55a.434.434 0 00.067.61l3.74 3.064a.434.434 0 00.612-.068l7.225-9.279a.434.434 0 00-.078-.61z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};
