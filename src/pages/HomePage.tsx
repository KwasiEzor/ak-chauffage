import Header from '../components/Header';
import Hero from '../components/Hero';
import Services from '../components/Services';
import WhyChooseUs from '../components/WhyChooseUs';
import Projects from '../components/Projects';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import CTABanner from '../components/CTABanner';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import FloatingCTA from '../components/FloatingCTA';
import CookieBanner from '../components/CookieBanner';
import CookieSettingsButton from '../components/CookieSettingsButton';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navigation */}
      <Header />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Services Section */}
        <Services />

        {/* Why Choose Us / Trust Section */}
        <WhyChooseUs />

        {/* Projects / Realizations */}
        <Projects />

        {/* Testimonials */}
        <Testimonials />

        {/* FAQ Section */}
        <FAQ />

        {/* Strong CTA Banner */}
        <CTABanner />

        {/* Contact Section */}
        <Contact />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating CTA for mobile */}
      <FloatingCTA />

      {/* Cookie Consent System */}
      <CookieBanner />
      <CookieSettingsButton />
    </div>
  );
}
