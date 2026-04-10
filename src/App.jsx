import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import FacilityPage from './pages/FacilityPage';
import Eligibility from './pages/Eligibility';
import Telehealth from './pages/Telehealth';
import About from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-iha-sand">
        {/* Skip to content link */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <Header />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/facility/:id" element={<FacilityPage />} />
            <Route path="/eligibility" element={<Eligibility />} />
            <Route path="/telehealth" element={<Telehealth />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
