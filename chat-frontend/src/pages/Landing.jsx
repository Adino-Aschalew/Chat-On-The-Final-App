import GridBackground from '../components/landing/GridBackground';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import StatsSection from '../components/landing/StatsSection';
import CTASection from '../components/landing/CTASection';
import AboutSection from '../components/landing/AboutSection';
import Navigation from '../components/landing/Navigation';

const Landing = () => {
  return (
    <div className="min-h-screen bg-tg-bg relative">
      <GridBackground />
      <Navigation />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <AboutSection />
      <CTASection />
      
      {/* Footer-like area */}
      <footer className="py-12 px-6 border-t border-tg-border text-center">
        <p className="text-tg-secondary text-sm">
          &copy; {new Date().getFullYear()} ChatApp Reimagined. Built for the modern web.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
