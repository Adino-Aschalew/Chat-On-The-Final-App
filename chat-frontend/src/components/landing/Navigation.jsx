import { Link } from 'react-router-dom';
import { ChatCircleText } from '@phosphor-icons/react';

const Navigation = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-xl bg-tg-bg/70 border-b border-tg-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-tg-primary-gradient rounded-xl flex items-center justify-center shadow-lg shadow-tg-primary/20 group-hover:scale-105 transition-transform">
            <ChatCircleText size={24} weight="fill" className="text-white" />
          </div>
          <span className="text-xl font-bold text-tg-text">ChatApp</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => scrollToSection('features')}
            className="text-tg-secondary hover:text-tg-primary transition-colors font-medium"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className="text-tg-secondary hover:text-tg-primary transition-colors font-medium"
          >
            About
          </button>
          <Link
            to="/login"
            className="px-5 py-2 text-tg-primary hover:text-tg-primary/80 font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="btn-tg"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
