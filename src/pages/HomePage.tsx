import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ContentGrid from '../components/ContentGrid';
import CoverageMarquee from '../components/CoverageMarquee';
import VODShowcase from '../components/VODShowcase';
import Features from '../components/Features';
import GlobalNetwork from '../components/GlobalNetwork';
import LicenseConcept from '../components/LicenseConcept';
import DeviceShowcase from '../components/DeviceShowcase';
import Pricing from '../components/Pricing';
import Testimonials from '../components/Testimonials';
import WhatsAppProof from '../components/WhatsAppProof';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import FloatingSupport from '../components/FloatingSupport';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-deep-black selection:bg-luxury-gold selection:text-black overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-50 bg-noise pointer-events-none" />
      <Navbar />
      <FloatingSupport />
      <main>
        <Hero />
        <VODShowcase />
        <CoverageMarquee />
        <ContentGrid />
        <Features />
        <GlobalNetwork />
        <LicenseConcept />
        <DeviceShowcase />
        <Pricing />
        <Testimonials />
        <WhatsAppProof />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
