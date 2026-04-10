import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-iha-teal text-white no-print" role="contentinfo">
      <div className="iha-divider-dark" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-iha-orange text-lg mb-3">WayFinder</h3>
            <p className="text-sm text-white/80 leading-relaxed" style={{ textAlign: 'left' }}>
              Tribal Health WayFinder. Built to make finding healthcare easier for
              American Indian and Alaska Native communities.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-heading text-iha-orange text-lg mb-3">Navigate</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-white/80 hover:text-iha-orange no-underline transition-colors">
                  Find Care
                </Link>
              </li>
              <li>
                <Link to="/eligibility" className="text-sm text-white/80 hover:text-iha-orange no-underline transition-colors">
                  Am I Eligible?
                </Link>
              </li>
              <li>
                <Link to="/telehealth" className="text-sm text-white/80 hover:text-iha-orange no-underline transition-colors">
                  Telehealth Directory
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-white/80 hover:text-iha-orange no-underline transition-colors">
                  About WayFinder
                </Link>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="font-heading text-iha-orange text-lg mb-3">Important Note</h3>
            <p className="text-sm text-white/80 leading-relaxed" style={{ textAlign: 'left' }}>
              This is not an official IHS tool. WayFinder was developed by Indigenous Healthcare
              Advancements to support community health access. Always contact facilities directly
              to confirm services, hours, and eligibility.
            </p>
          </div>
        </div>

        <div className="iha-divider-dark mt-8 pt-6 text-center">
          <p className="text-sm text-white/60">
            (c) 2026 Indigenous Healthcare Advancements | indigenous.health
          </p>
        </div>
      </div>
    </footer>
  );
}
