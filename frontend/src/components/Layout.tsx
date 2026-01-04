import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/story', label: 'Our Story' },
    { path: '/party', label: 'Wedding Party' },
    { path: '/details', label: 'Details' },
    { path: '/travel', label: 'Travel' },
    { path: '/registry', label: 'Registry' },
    { path: '/faq', label: 'FAQ' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <header className="border-b border-dusty-rose/20 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-off-white/95">
        <nav className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="text-3xl font-display text-charcoal hover:text-dusty-rose transition-colors"
              style={{ fontWeight: 300 }}
            >
              Sam <span className="text-dusty-rose">&</span> Jonah
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-sm lg:text-base font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-dusty-rose'
                      : 'text-warm-gray hover:text-dusty-rose'
                  }`}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-dusty-rose"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-charcoal p-2"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-dusty-rose/20"
            >
              <div className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2 font-medium transition-colors ${
                      isActive(link.path)
                        ? 'text-dusty-rose'
                        : 'text-warm-gray hover:text-dusty-rose'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-gradient-to-b from-blush/20 to-dusty-rose/10 border-t border-dusty-rose/20 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="font-display text-3xl mb-3 text-charcoal" style={{ fontWeight: 300 }}>
              Sam <span className="text-dusty-rose">&</span> Jonah
            </p>
            <p className="text-warm-gray mb-6">
              August 15, 2026 • Rouge, Calgary, Alberta
            </p>
            <div className="flex justify-center gap-6 text-sm text-warm-gray">
              <Link to="/story" className="hover:text-dusty-rose transition-colors">
                Our Story
              </Link>
              <span>•</span>
              <Link to="/details" className="hover:text-dusty-rose transition-colors">
                Details
              </Link>
              <span>•</span>
              <Link to="/registry" className="hover:text-dusty-rose transition-colors">
                Registry
              </Link>
              <span>•</span>
              <Link to="/rsvp" className="hover:text-dusty-rose transition-colors">
                RSVP
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
