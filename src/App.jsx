import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Eager-load Home (it's the landing page)
import Home from './pages/Home';

// Lazy-load secondary pages
const FacilityPage = lazy(() => import('./pages/FacilityPage'));
const Eligibility = lazy(() => import('./pages/Eligibility'));
const Telehealth = lazy(() => import('./pages/Telehealth'));
const About = lazy(() => import('./pages/About'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-iha-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-iha-blue/50">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-iha-sand">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <Header />

        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/facility/:id" element={<FacilityPage />} />
              <Route path="/eligibility" element={<Eligibility />} />
              <Route path="/telehealth" element={<Telehealth />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
