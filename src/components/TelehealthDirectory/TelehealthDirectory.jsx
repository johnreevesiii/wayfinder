import { useState, useMemo, useCallback } from 'react';
import {
  Video, Monitor, Pill, Brain, Stethoscope, MapPin, PhoneCall,
  ChevronRight, ChevronDown, Search, MapPinIcon, Loader2, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import facilities from '../../data/facilities.json';
import { parseSearch } from '../../utils/searchParser';
import { geocodeLocation } from '../../hooks/useFilteredFacilities';
import { sortByDistance, formatDistance } from '../../utils/distanceCalc';

const TELEHEALTH_CATEGORIES = [
  { key: 'all', label: 'All Telehealth', icon: Video },
  { key: 'general_telehealth', label: 'General', icon: Stethoscope },
  { key: 'telebehavioral_health', label: 'Behavioral Health', icon: Brain },
  { key: 'teledermatology', label: 'Dermatology', icon: Monitor },
  { key: 'telepharmacy', label: 'Pharmacy', icon: Pill },
];

const IHS_AREAS = [
  { value: '', label: 'All IHS Areas' },
  { value: 'alaska', label: 'Alaska' },
  { value: 'albuquerque', label: 'Albuquerque' },
  { value: 'bemidji', label: 'Bemidji (MN/WI/MI)' },
  { value: 'billings', label: 'Billings (MT/WY)' },
  { value: 'california', label: 'California' },
  { value: 'great_plains', label: 'Great Plains (SD/ND/NE)' },
  { value: 'nashville', label: 'Nashville (Eastern US)' },
  { value: 'navajo', label: 'Navajo (AZ/NM/UT)' },
  { value: 'oklahoma_city', label: 'Oklahoma City (OK/KS)' },
  { value: 'phoenix', label: 'Phoenix (AZ/NV/UT)' },
  { value: 'portland', label: 'Portland (OR/WA/ID)' },
  { value: 'tucson', label: 'Tucson (AZ)' },
];

const DISTANCE_OPTIONS = [
  { value: 0, label: 'Any distance' },
  { value: 25, label: 'Within 25 miles' },
  { value: 50, label: 'Within 50 miles' },
  { value: 100, label: 'Within 100 miles' },
  { value: 200, label: 'Within 200 miles' },
];

// All telehealth-capable facilities
const allTelehealth = facilities.filter(
  f => f.telehealth && f.telehealthServices && f.telehealthServices.length > 0
);

export default function TelehealthDirectory() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedArea, setSelectedArea] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locationCenter, setLocationCenter] = useState(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [distance, setDistance] = useState(0);
  const [geocoding, setGeocoding] = useState(false);
  const [locationError, setLocationError] = useState('');

  const handleLocationSearch = useCallback(async () => {
    if (!locationInput.trim()) {
      setLocationCenter(null);
      setLocationLabel('');
      setLocationError('');
      return;
    }

    // Try built-in lookup first
    const parsed = parseSearch(locationInput);
    if (parsed.location && parsed.location.lat) {
      setLocationCenter({ lat: parsed.location.lat, lng: parsed.location.lng });
      setLocationLabel(parsed.location.label || locationInput);
      setLocationError('');
      if (distance === 0) setDistance(100);
      return;
    }

    // Geocode
    setGeocoding(true);
    const geo = await geocodeLocation(locationInput);
    setGeocoding(false);

    if (geo) {
      setLocationCenter({ lat: geo.lat, lng: geo.lng });
      setLocationLabel(geo.label);
      setLocationError('');
      if (distance === 0) setDistance(100);
    } else {
      setLocationCenter(null);
      setLocationLabel('');
      setLocationError(`Could not find "${locationInput}". Try a zip code or city name.`);
    }
  }, [locationInput, distance]);

  const handleClearLocation = () => {
    setLocationInput('');
    setLocationCenter(null);
    setLocationLabel('');
    setLocationError('');
    setDistance(0);
  };

  const filtered = useMemo(() => {
    let results = [...allTelehealth];

    // Filter by category
    if (activeCategory !== 'all') {
      results = results.filter(f => f.telehealthServices.includes(activeCategory));
    }

    // Filter by IHS Area
    if (selectedArea) {
      results = results.filter(f => f.ihsArea === selectedArea);
    }

    // Sort by distance if location set
    if (locationCenter) {
      results = sortByDistance(results, locationCenter.lat, locationCenter.lng);
      if (distance > 0) {
        results = results.filter(f => f.distance <= distance);
      }
    }

    return results.slice(0, 50);
  }, [activeCategory, selectedArea, locationCenter, distance]);

  return (
    <div>
      {/* Search/Filter panel */}
      <div className="bg-white iha-card p-4 sm:p-5 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          {/* Location */}
          <div>
            <label htmlFor="th-location" className="block text-xs font-semibold text-iha-teal mb-1.5">
              Near a location
            </label>
            <div className="flex items-center bg-iha-sand iha-card-sm focus-within:ring-2 focus-within:ring-iha-orange/40">
              <input
                id="th-location"
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLocationSearch(); } }}
                placeholder="City, zip, or reservation"
                className="flex-1 bg-transparent text-sm text-iha-blue placeholder:text-iha-blue/40 pl-3 py-3 outline-none min-w-0"
              />
              {locationInput && (
                <button type="button" onClick={handleClearLocation} className="p-1.5 text-iha-blue/30 hover:text-iha-blue">
                  <X size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={handleLocationSearch}
                disabled={geocoding}
                className="p-2.5 text-iha-umber hover:text-iha-orange transition-colors"
                aria-label="Search location"
              >
                {geocoding ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              </button>
            </div>
          </div>

          {/* Distance */}
          <div>
            <label htmlFor="th-distance" className="block text-xs font-semibold text-iha-teal mb-1.5">
              Distance
            </label>
            <div className="relative">
              <select
                id="th-distance"
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

          {/* IHS Area */}
          <div>
            <label htmlFor="th-area" className="block text-xs font-semibold text-iha-teal mb-1.5">
              IHS Area
            </label>
            <div className="relative">
              <select
                id="th-area"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full appearance-none bg-iha-sand text-iha-blue text-sm font-medium pl-3 pr-8 py-3 iha-card-sm outline-none focus:ring-2 focus:ring-iha-orange/40 cursor-pointer"
              >
                {IHS_AREAS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-iha-blue/40 pointer-events-none" />
            </div>
          </div>
        </div>

        {locationError && (
          <p className="text-sm text-iha-umber bg-iha-orange/10 px-3 py-2 iha-card-sm mb-3">{locationError}</p>
        )}
        {locationLabel && (
          <p className="text-xs text-iha-blue/50 mb-1">
            Showing results near {locationLabel}
          </p>
        )}
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-nowrap overflow-x-auto pb-2 scrollbar-hide mb-6" role="group" aria-label="Filter telehealth by category">
        {TELEHEALTH_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = cat.key === activeCategory;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold iha-card-sm transition-all whitespace-nowrap shrink-0 sm:shrink ${
                isActive
                  ? 'bg-iha-teal text-white shadow-md'
                  : 'bg-white text-iha-blue border border-iha-teal/20 hover:bg-iha-teal/5'
              }`}
              aria-pressed={isActive}
            >
              <Icon size={16} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 iha-card-sm mb-6">
        <p className="text-sm text-blue-800" style={{ textAlign: 'left' }}>
          <strong>Telehealth can be a great option</strong> if you live far from a healthcare facility
          or have difficulty traveling. Many IHS and tribal facilities now offer phone and video visits
          for routine care, behavioral health, and more. Contact the facility to learn how to enroll.
        </p>
      </div>

      {/* Results count */}
      <p className="text-sm text-iha-blue/60 mb-4">
        {filtered.length} {filtered.length === 1 ? 'facility' : 'facilities'} offering telehealth
        {locationLabel ? ` near ${locationLabel}` : ''}
        {selectedArea ? ` in ${IHS_AREAS.find(a => a.value === selectedArea)?.label || selectedArea}` : ''}
      </p>

      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(facility => (
          <TelehealthCard key={facility.id} facility={facility} hasDistance={!!locationCenter} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Video size={40} className="mx-auto text-iha-blue/20 mb-4" />
          <h3 className="font-heading text-iha-teal text-lg mb-2">No facilities found</h3>
          <p className="text-sm text-iha-blue/60">
            Try a different category, expand your distance, or select a different IHS Area.
          </p>
        </div>
      )}
    </div>
  );
}

function TelehealthCard({ facility, hasDistance }) {
  const phoneDigits = facility.phone.replace(/[^0-9+]/g, '');
  const dist = hasDistance ? formatDistance(facility.distance) : null;

  return (
    <div className="facility-card p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-heading text-iha-teal text-base font-bold leading-snug">
          {facility.name}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          {dist && <span className="text-xs font-semibold text-iha-umber">{dist}</span>}
          <Video size={18} className="text-blue-600" />
        </div>
      </div>

      <div className="flex items-start gap-2 text-sm text-iha-blue/70 mb-2">
        <MapPin size={14} className="mt-0.5 shrink-0 text-iha-umber" />
        <span>{facility.address}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {facility.telehealthServices.map(ts => (
          <span key={ts} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-800 rounded font-medium">
            {ts.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-iha-sand">
        <a
          href={`tel:${phoneDigits}`}
          className="flex items-center gap-1 text-sm font-semibold text-iha-orange hover:text-iha-umber transition-colors no-underline"
        >
          <PhoneCall size={14} /> Call to Enroll
        </a>
        <Link
          to={`/facility/${facility.id}`}
          className="flex items-center gap-1 text-sm font-semibold text-iha-teal hover:text-iha-orange transition-colors no-underline"
        >
          Details <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
