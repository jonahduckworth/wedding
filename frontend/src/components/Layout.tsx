import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-white border-b border-sage/30 shadow-sm">
        <nav className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-3xl font-display font-bold text-primary hover:text-mauve transition-colors">
              Sam & Jonah
            </Link>
            <div className="flex gap-8">
              <Link to="/" className="text-gray-700 hover:text-primary transition-colors font-medium">
                Home
              </Link>
              <Link to="/story" className="text-gray-700 hover:text-primary transition-colors font-medium">
                Our Story
              </Link>
              <Link to="/details" className="text-gray-700 hover:text-primary transition-colors font-medium">
                Details
              </Link>
              <Link to="/travel" className="text-gray-700 hover:text-primary transition-colors font-medium">
                Travel
              </Link>
              <Link to="/registry" className="text-gray-700 hover:text-primary transition-colors font-medium">
                Registry
              </Link>
              <Link to="/faq" className="text-gray-700 hover:text-primary transition-colors font-medium">
                FAQ
              </Link>
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-gradient-to-b from-light/20 to-light/40 border-t border-sage/30 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-primary font-display text-xl mb-2">Sam & Jonah</p>
          <p className="text-gray-600">August 15, 2026 • Rouge, Calgary, Alberta</p>
        </div>
      </footer>
    </div>
  );
}
