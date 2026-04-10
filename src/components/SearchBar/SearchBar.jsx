import { useState, useRef } from 'react';
import { Search, MapPin, X, Loader2, ChevronDown, SlidersHorizontal } from 'lucide-react';

const SERVICE_OPTIONS = [
  { value: '', label: 'Any service' },
  { value: 'primary_care', label: 'Primary Care / General' },
  { value: 'dental', label: 'Dental' },
  { value: 'behavioral_health', label: 'Behavioral Health' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'substance_abuse', label: 'Substance Abuse Treatment' },
  { value: 'prenatal', label: 'Prenatal / OB' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'telehealth', label: 'Telehealth' },
  { value: 'traditional_healing', label: 'Traditional Healing' },
  { value: 'optometry', label: 'Eye Care' },
  { value: 'lab', label: 'Laboratory' },
  { value: 'radiology', label: 'Radiology / Imaging' },
];

const DISTANCE_OPTIONS = [
  { value: 25, label: '25 miles' },
  { value: 50, label: '50 miles' },
  { value: 100, label: '100 miles' },
  { value: 150, label: '150 miles' },
  { value: 250, label: '250 miles' },
];

const FACILITY_TYPE_OPTIONS = [
  { value: '', label: 'All facility types' },
  { value: 'ihs_direct', label: 'IHS Direct Service' },
  { value: 'tribal_638', label: 'Tribal 638 Program' },
  { value: 'urban_indian', label: 'Urban Indian' },
  { value: 'fqhc', label: 'Community Health Center (FQHC)' },
];

export default function SearchBar({
  onStructuredSearch,
  onUseLocation,
  geoLoading,
  geoLabel,
  geocoding,
}) {
  const locationRef = useRef(null);
  const [service, setService] = useState('');
  const [location, setLocation] = useState('');
  const [distance, setDistance] = useState(100);
  const [facilityType, setFacilityType] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onStructuredSearch({ service, location, distance, facilityType });
    locationRef.current?.blur();
  };

  const handleGeoClick = () => {
    onUseLocation((label) => {
      setLocation(label || 'My location');
    });
  };

  const handleClear = () => {
    setService('');
    setLocation('');
    setDistance(100);
    setFacilityType('');
    onStructuredSearch(null);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full" role="search" aria-label="Search for healthcare facilities">
      <div className="bg-white iha-card shadow-lg p-4 sm:p-6">
        {/* Row 1: Service + Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {/* Service selector */}
          <div>
            <label htmlFor="search-service" className="block text-xs font-semibold text-iha-teal mb-1.5">
              What do you need?
            </label>
            <div className="relative">
              <select
                id="search-service"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full appearance-none bg-iha-sand text-iha-blue text-sm font-medium pl-3 pr-8 py-3 iha-card-sm outline-none focus:ring-2 focus:ring-iha-orange/40 cursor-pointer"
              >
                {SERVICE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-iha-blue/40 pointer-events-none" />
            </div>
          </div>

          {/* Location input */}
          <div>
            <label htmlFor="search-location" className="block text-xs font-semibold text-iha-teal mb-1.5">
              Where are you?
            </label>
            <div className="flex items-center bg-iha-sand iha-card-sm focus-within:ring-2 focus-within:ring-iha-orange/40">
              <input
                ref={locationRef}
                id="search-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, zip, or reservation"
                className="flex-1 bg-transparent text-sm text-iha-blue placeholder:text-iha-blue/40 pl-3 py-3 outline-none min-w-0"
                autoComplete="off"
              />
              {location && (
                <button
                  type="button"
                  onClick={() => setLocation('')}
                  className="p-1.5 text-iha-blue/30 hover:text-iha-blue"
                  aria-label="Clear location"
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={handleGeoClick}
                disabled={geoLoading}
                className="p-2.5 text-iha-umber hover:text-iha-orange transition-colors disabled:opacity-50"
                aria-label="Use my current location"
                title="Use my location"
              >
                {geoLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Distance + Facility Type (advanced, collapsible on mobile) */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 ${showAdvanced ? 'block' : 'hidden sm:grid'}`}>
          {/* Distance */}
          <div>
            <label htmlFor="search-distance" className="block text-xs font-semibold text-iha-teal mb-1.5">
              How far can you travel?
            </label>
            <div className="relative">
              <select
                id="search-distance"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full appearance-none bg-iha-sand text-iha-blue text-sm font-medium pl-3 pr-8 py-3 iha-card-sm outline-none focus:ring-2 focus:ring-iha-orange/40 cursor-pointer"
              >
                {DISTANCE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-iha-blue/40 pointer-events-none" />
            </div>
          </div>

          {/* Facility type */}
          <div>
            <label htmlFor="search-type" className="block text-xs font-semibold text-iha-teal mb-1.5">
              Facility type
            </label>
            <div className="relative">
              <select
                id="search-type"
                value={facilityType}
                onChange={(e) => setFacilityType(e.target.value)}
                className="w-full appearance-none bg-iha-sand text-iha-blue text-sm font-medium pl-3 pr-8 py-3 iha-card-sm outline-none focus:ring-2 focus:ring-iha-orange/40 cursor-pointer"
              >
                {FACILITY_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-iha-blue/40 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Mobile advanced toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="sm:hidden flex items-center gap-1.5 text-xs font-medium text-iha-blue/50 hover:text-iha-teal mb-3 transition-colors"
        >
          <SlidersHorizontal size={12} />
          {showAdvanced ? 'Hide options' : 'More options (distance, facility type)'}
        </button>

        {/* Action row */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="flex-1 sm:flex-none bg-iha-orange hover:bg-iha-umber text-white px-8 py-3 font-semibold text-sm iha-card-sm transition-colors flex items-center justify-center gap-2"
          >
            {geocoding ? (
              <><Loader2 size={16} className="animate-spin" /> Finding...</>
            ) : (
              <><Search size={16} /> Search</>
            )}
          </button>
          {(service || location || facilityType) && (
            <button
              type="button"
              onClick={handleClear}
              className="text-sm font-medium text-iha-blue/50 hover:text-iha-orange transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm text-iha-blue/60 text-center" style={{ textAlign: 'center' }}>
        Select a service and enter your location, or browse by IHS Area below
      </p>
    </form>
  );
}
