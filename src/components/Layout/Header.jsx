import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV_LINKS = [
  { to: '/', label: 'Find Care' },
  { to: '/eligibility', label: 'Am I Eligible?' },
  { to: '/telehealth', label: 'Telehealth' },
  { to: '/about', label: 'About' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-iha-teal text-white shadow-md relative z-[1000] no-print" role="banner">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo + title */}
        <Link to="/" className="flex items-center gap-3 group no-underline">
          <img
            src="/assets/logo-white.png"
            alt="Indigenous Healthcare Advancements"
            className="h-10 w-auto flex-shrink-0"
            style={{ minWidth: '40px' }}
            aria-label="Indigenous Healthcare Advancements logo"
            onError={(e) => { e.target.onerror = null; e.target.src = '/assets/logo-white.svg'; }}
          />
          <div className="hidden sm:block">
            <span className="text-base font-heading font-semibold leading-tight group-hover:text-white/80 transition-colors text-iha-orange">
              WayFinder
            </span>
            <p className="text-xs text-white/70 leading-tight font-body">
              Indigenous Healthcare Advancements
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors no-underline ${
                location.pathname === link.to
                  ? 'bg-iha-orange text-white'
                  : 'text-white/80 hover:bg-iha-teal-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-white hover:text-iha-orange transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          className="md:hidden bg-iha-brown border-t border-white/10"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block px-6 py-4 text-base font-medium no-underline border-b border-white/5 ${
                location.pathname === link.to
                  ? 'text-iha-orange bg-white/5'
                  : 'text-white hover:text-iha-orange hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
