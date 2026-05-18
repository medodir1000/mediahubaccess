import { useState } from 'react';
import { Mail, Globe, MessageSquare } from 'lucide-react';
import BrandMark from './BrandMark';
import LegalModal from './LegalModal';

export default function Footer() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'terms' | 'privacy' | 'refund' | null>(null);

  const openModal = (type: 'terms' | 'privacy' | 'refund') => {
    setModalType(type);
    setModalOpen(true);
  };

  const legalContent = {
    terms: {
      title: "Merchant Terms",
      content: (
        <>
          <p>By initializing a digital license with MediaHubAccess, you agree to the following terms of operation and service usage protocol.</p>
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-[11px]">01. License Authorization</h4>
            <p>Each license key is authorized for use on a specific number of simultaneous connections as per your selected tier. Unauthorized redistribution or sub-leasing of licenses will result in immediate termination without notice.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-[11px]">02. Service Continuity</h4>
            <p>While we maintain a global network of high-availability nodes, service may be subject to periodic maintenance intervals. We guarantee 99.9% node stability across our global distribution network.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-[11px]">03. Usage Restrictions</h4>
            <p>Scanning, reverse engineering, or attempting to intercept the encrypted data streams is strictly prohibited and monitored by our automated security systems.</p>
          </div>
        </>
      )
    },
    privacy: {
      title: "Privacy Protocol",
      content: (
        <>
          <p>Our Privacy Protocol ensures that your digital footprint remains secure and your streaming data remains anonymous within our distributed node network.</p>
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-[11px]">01. Data Encryption</h4>
            <p>All communication between your device and our licensing servers is protected by military-grade SSL encryption. We do not store viewing history or personal identification logs.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-[11px]">02. Telemetry Logs</h4>
            <p>We only collect essential technical telemetry (bitrate, ping, device model) to automatically optimize your connection to the nearest low-latency node.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-[11px]">03. Third-Party Policy</h4>
            <p>MediaHubAccess does not sell, trade, or share any user data with external marketing entities or third-party analytical firms.</p>
          </div>
        </>
      )
    },
    refund: {
      title: "Refund Guarantee",
      content: (
        <>
          <p>We stand by the stability of our global node network. Your satisfaction is protected by our transparent refund guarantee protocol.</p>
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-[11px]">01. Pre-Purchase Verification</h4>
            <p>We strongly recommend utilizing our 12h Free Test license before purchase to ensure absolute compatibility with your local ISP and hardware setup.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-[11px]">02. Eligibility Criteria</h4>
            <p>Refunds are eligible within 7 days of purchase if technical local failures persist that our VIP Support team cannot resolve within a 48h technical intervention window.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-[11px]">03. Processing Cycle</h4>
            <p>Approved refunds are processed back to the original payment method within 3-5 business days, subject to merchant bank processing times.</p>
          </div>
        </>
      )
    }
  };

  return (
    <footer className="py-32 bg-deep-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24 flex flex-col items-center text-center">
            <BrandMark
              className="w-16 h-16 sm:w-20 sm:h-20 mb-8 drop-shadow-[0_0_30px_rgba(59,130,246,0.45)]"
              variant="full"
            />
            <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter">Secure Your <span className="blue-gradient">Access Today.</span></h2>
            <p className="text-zinc-500 max-w-xl mb-12 text-lg">Join +5,400 satisfied households worldwide and elevate your entertainment standard.</p>
            <a 
              href="#pricing"
              className="bg-electric-blue text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-blue-600 transition-all shadow-[0_0_40px_rgba(59,130,246,0.3)] flex items-center justify-center"
            >
              INITIALIZE LICENSE
            </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 pt-16 border-t border-white/5">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <BrandMark className="w-8 h-8" variant="compact" />
              <p className="font-bold text-xl tracking-tight uppercase">MediaHub<span className="text-electric-blue">Access</span></p>
            </div>
            <p className="text-zinc-600 max-w-sm text-sm">
              MediaHubAccess.com is the premier provider of digital streaming licensing worldwide. Specialized in high-bitrate, low-latency node connections for home cinema enthusiasts.
            </p>
          </div>

          <div>
             <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-6 text-zinc-500">Contact</h4>
             <ul className="space-y-4 text-sm font-medium">
                <li className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center group-hover:bg-electric-blue/10 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  support@mediahubaccess.com
                </li>
                <li>
                  <a 
                    href="https://wa.me/447411202861"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center group-hover:bg-green-500/10 transition-colors">
                      <MessageSquare className="w-4 h-4 text-green-500" />
                    </div>
                    24/7 VIP WhatsApp
                  </a>
                </li>
             </ul>
          </div>

          <div>
             <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-6 text-zinc-500">Links</h4>
             <ul className="space-y-4 text-sm font-medium">
                <li 
                  onClick={() => openModal('terms')}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer uppercase tracking-widest text-[10px]"
                >
                  Merchant Terms
                </li>
                <li 
                  onClick={() => openModal('privacy')}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer uppercase tracking-widest text-[10px]"
                >
                  Privacy Protocol
                </li>
                <li 
                  onClick={() => openModal('refund')}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer uppercase tracking-widest text-[10px]"
                >
                  Refund Guarantee
                </li>
             </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-white/5 text-zinc-600">
           <p className="text-xs uppercase tracking-widest font-bold">© 2026 MediaHubAccess. All digital rights reserved.</p>
           <div className="flex items-center gap-6">
              <Globe className="w-4 h-4 opacity-30" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Licensed Global Distribution</span>
           </div>
        </div>
      </div>

      <LegalModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalType ? legalContent[modalType].title : ''}
        content={modalType ? legalContent[modalType].content : null}
      />
    </footer>
  );
}
