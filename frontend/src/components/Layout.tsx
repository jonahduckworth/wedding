import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Pages with full-bleed dark hero images
  const isHeroPage = ['/', '/story', '/details'].includes(location.pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/story', label: 'Our Story' },
    { path: '/party', label: 'Wedding Party' },
    { path: '/details', label: 'Details' },
    { path: '/travel', label: 'Travel' },
    { path: '/registry', label: 'Registry' },
    { path: '/faq', label: 'FAQ' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // On hero pages, header starts transparent with white text.
  // On other pages (light bg) or once scrolled, header is solid cream.
  const isTransparent = isHeroPage && !scrolled;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* ─── Header ─── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isTransparent
            ? 'bg-transparent'
            : 'bg-cream/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.06)]'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className={`text-2xl md:text-[1.65rem] font-display transition-colors duration-500 ${
                isTransparent ? 'text-white drop-shadow-md' : 'text-heading'
              }`}
              style={{ fontWeight: 300, letterSpacing: '0.03em' }}
            >
              Sam{' '}
              <span className={isTransparent ? 'text-gold-light' : 'text-gold'}>
                &amp;
              </span>{' '}
              Jonah
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-7 xl:gap-9">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-[12px] xl:text-[13px] font-medium uppercase tracking-[0.14em] transition-colors duration-300 ${
                    isActive(link.path)
                      ? isTransparent
                        ? 'text-gold-light'
                        : 'text-gold'
                      : isTransparent
                        ? 'text-white/80 hover:text-white'
                        : 'text-body hover:text-heading'
                  }`}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-1.5 left-0 right-0 h-[1.5px] bg-gold"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* RSVP Button (desktop) */}
            <Link
              to="/rsvp"
              className={`hidden lg:inline-flex text-[12px] xl:text-[13px] font-medium uppercase tracking-[0.14em] px-5 py-2 rounded-full border transition-all duration-300 ${
                isTransparent
                  ? 'border-white/40 text-white hover:bg-white/10'
                  : 'border-berry text-berry hover:bg-berry hover:text-white'
              }`}
            >
              RSVP
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 transition-colors ${
                isTransparent ? 'text-white' : 'text-heading'
              }`}
              aria-label="Toggle menu"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="8" x2="20" y2="8" />
                    <line x1="4" y1="16" x2="20" y2="16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* ─── Mobile Menu Overlay ─── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-cream/[0.98] backdrop-blur-lg lg:hidden z-[60]"
            >
              {/* Close button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-5 right-6 p-2 text-heading"
                aria-label="Close menu"
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <div className="flex flex-col items-center justify-center h-full gap-7">
                {[...navLinks, { path: '/rsvp', label: 'RSVP' }].map(
                  (link, index) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.3 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`font-display text-3xl transition-colors ${
                          isActive(link.path)
                            ? 'text-gold'
                            : 'text-heading hover:text-gold'
                        }`}
                        style={{ fontWeight: 300 }}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── Main ─── */}
      <main className="flex-1">{children}</main>

      {/* ─── Footer ─── */}
      <footer className="bg-berry-dark py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p
            className="font-display text-4xl md:text-5xl text-white mb-3"
            style={{ fontWeight: 300, letterSpacing: '0.02em' }}
          >
            Sam <span className="text-gold-light">&amp;</span> Jonah
          </p>
          <p className="text-white/40 text-sm tracking-[0.2em] uppercase mb-10">
            August 15, 2026 &nbsp;·&nbsp; Calgary, Alberta
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-px bg-white/15" />
            <div className="w-1 h-1 rounded-full bg-gold/40" />
            <div className="w-12 h-px bg-white/15" />
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-[13px] text-white/35 mb-12">
            <Link to="/story" className="hover:text-gold-light transition-colors">
              Our Story
            </Link>
            <Link to="/details" className="hover:text-gold-light transition-colors">
              Details
            </Link>
            <Link to="/travel" className="hover:text-gold-light transition-colors">
              Travel
            </Link>
            <Link to="/registry" className="hover:text-gold-light transition-colors">
              Registry
            </Link>
            <Link to="/rsvp" className="hover:text-gold-light transition-colors">
              RSVP
            </Link>
          </div>

          <p className="text-white/20 text-xs tracking-wider">Made with love</p>
        </div>
      </footer>
    </div>
  );
}
