import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search as SearchIcon, Shield, Wifi, Map, List } from 'lucide-react';
import SearchBar from '../components/SearchBar/SearchBar';
import ServiceChips from '../components/ServiceChips/ServiceChips';
import FacilityList from '../components/FacilityList/FacilityList';
import FacilityMap from '../components/FacilityMap/FacilityMap';
import PRCDAToggle from '../components/PRCDALayer/PRCDALayer';
import AreaSelector, { AREAS } from '../components/AreaSelector/AreaSelector';
import { useSearch } from '../hooks/useSearch';
import { useGeolocation } from '../hooks/useGeolocation';
import { useFilteredFacilities } from '../hooks/useFilteredFacilities';
import facilities from '../data/facilities.json';

export default function Home() {
  const navigate = useNavigate();
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [prcdaVisible, setPrcdaVisible] = useState(false);
  const [prcdaData, setPrcdaData] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'map'

  const {
    query, parsedQuery, activeFilters,
    handleQueryChange, handleSubmit, toggleFilter,
    setLocationFromGeo, clearSearch,
  } = useSearch();

  const { position, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();
  const { facilities: searchFiltered, center, hasLocation } = useFilteredFacilities(parsedQuery, hasSearched ? 500 : null);

  // Count facilities per area
  const facilityCounts = useMemo(() => {
    const counts = {};
    for (const f of facilities) {
      counts[f.ihsArea] = (counts[f.ihsArea] || 0) + 1;
    }
    return counts;
  }, []);

  // When in browse mode, filter by selected area
  const areaFacilities = useMemo(() => {
    if (!selectedArea) return [];
    return facilities.filter(f => f.ihsArea === selectedArea);
  }, [selectedArea]);

  // Get area center for map
  const areaCenter = useMemo(() => {
    if (!selectedArea) return null;
    const area = AREAS.find(a => a.key === selectedArea);
    if (!area) return null;
    return { lat: area.center[0], lng: area.center[1], zoom: area.zoom };
  }, [selectedArea]);

  // Filter area facilities by active service chips
  const areaFiltered = useMemo(() => {
    if (activeFilters.length === 0) return areaFacilities;
    return areaFacilities.filter(f =>
      activeFilters.some(s => f.services.includes(s))
    );
  }, [areaFacilities, activeFilters]);

  // Filter PRCDA boundaries by selected area
  const filteredPrcda = useMemo(() => {
    if (!prcdaData || !selectedArea) return prcdaData;
    return {
      ...prcdaData,
      features: prcdaData.features.filter(f =>
        f.properties?.ihsArea === selectedArea
      ),
    };
  }, [prcdaData, selectedArea]);

  // Determine what to display
  const displayFacilities = hasSearched ? searchFiltered : areaFiltered;
  const displayCenter = hasSearched ? center : areaCenter;
  const displayPrcda = hasSearched ? prcdaData : filteredPrcda;

  // When geolocation resolves, set it as center
  useEffect(() => {
    if (position) {
      setLocationFromGeo(position.lat, position.lng);
      setHasSearched(true);
    }
  }, [position, setLocationFromGeo]);

  // Lazy load PRCDA data
  useEffect(() => {
    if (prcdaVisible && !prcdaData) {
      import('../data/prcda-boundaries.json').then(mod => setPrcdaData(mod.default));
    }
  }, [prcdaVisible, prcdaData]);

  const handleSearch = useCallback((val) => {
    handleSubmit(val);
    setHasSearched(true);
    setSelectedArea(null);
  }, [handleSubmit]);

  const handleGeoRequest = useCallback(() => {
    requestLocation();
    setHasSearched(true);
    setSelectedArea(null);
  }, [requestLocation]);

  const handleViewDetails = useCallback((id) => {
    navigate(`/facility/${id}`);
  }, [navigate]);

  const handleSelectArea = useCallback((areaKey) => {
    setSelectedArea(areaKey);
    setHasSearched(false);
    setSelectedFacility(null);
    setMobileView('list');
    if (areaKey) {
      clearSearch();
    }
  }, [clearSearch]);

  const handleClearSearch = useCallback(() => {
    clearSearch();
    setHasSearched(false);
  }, [clearSearch]);

  // Shared map+list renderer for both search and browse modes
  const renderMapAndList = () => (
    <div>
      {/* Mobile view toggle */}
      <div className="flex lg:hidden items-center justify-between mb-3">
        <div className="flex bg-white iha-card-sm overflow-hidden border border-iha-teal/10">
          <button
            onClick={() => setMobileView('list')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors ${
              mobileView === 'list' ? 'bg-iha-teal text-white' : 'text-iha-blue/60'
            }`}
            aria-pressed={mobileView === 'list'}
          >
            <List size={16} /> List
          </button>
          <button
            onClick={() => setMobileView('map')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors ${
              mobileView === 'map' ? 'bg-iha-teal text-white' : 'text-iha-blue/60'
            }`}
            aria-pressed={mobileView === 'map'}
          >
            <Map size={16} /> Map
          </button>
        </div>
        <span className="text-sm text-iha-blue/50">
          {displayFacilities.length} {displayFacilities.length === 1 ? 'facility' : 'facilities'}
        </span>
      </div>

      {/* Desktop: side by side. Mobile: toggle between map and list */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Map */}
        <div className={`lg:w-1/2 lg:sticky lg:top-16 ${
          mobileView === 'map' ? 'h-[calc(100vh-220px)] sm:h-[450px]' : 'hidden lg:block'
        } lg:h-[600px]`}>
          <FacilityMap
            facilities={displayFacilities}
            center={displayCenter}
            selectedId={selectedFacility}
            onSelectFacility={(id) => { setSelectedFacility(id); setMobileView('list'); }}
            onViewDetails={handleViewDetails}
            prcdaVisible={prcdaVisible}
            prcdaData={displayPrcda}
          />
        </div>
        {/* List */}
        <div className={`lg:w-1/2 lg:max-h-[600px] lg:overflow-y-auto lg:pr-1 ${
          mobileView === 'list' ? 'block' : 'hidden lg:block'
        }`}>
          <FacilityList
            facilities={displayFacilities}
            selectedId={selectedFacility}
            onSelectFacility={(id) => { setSelectedFacility(id); setMobileView('map'); }}
            onViewDetails={handleViewDetails}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div id="main-content">
      {/* Hero Section */}
      <section className="bg-iha-teal py-8 sm:py-12 lg:py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-heading text-iha-orange text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Find Healthcare Near You
          </h1>
          <p className="text-white/90 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto" style={{ textAlign: 'center' }}>
            Search IHS, tribal, urban Indian, and community health centers across Indian Country, all in one place.
          </p>

          <SearchBar
            query={query}
            onQueryChange={handleQueryChange}
            onSubmit={handleSearch}
            onUseLocation={handleGeoRequest}
            geoLoading={geoLoading}
          />

          {geoError && (
            <p className="text-sm text-red-300 mt-2">{geoError}</p>
          )}
        </div>
      </section>

      {/* Chips + Controls */}
      <section className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col gap-3">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <ServiceChips activeFilters={activeFilters} onToggle={toggleFilter} />
          </div>
          <div className="flex justify-end">
            <PRCDAToggle visible={prcdaVisible} onToggle={() => setPrcdaVisible(!prcdaVisible)} />
          </div>
        </div>
      </section>

      <div className="iha-divider-light max-w-7xl mx-auto" />

      {/* Main content */}
      <section className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {hasSearched ? (
          /* Search results mode */
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-iha-blue/60">
                {displayFacilities.length} results for "{query || 'your location'}"
              </p>
              <button
                onClick={handleClearSearch}
                className="text-sm font-semibold text-iha-orange hover:text-iha-umber transition-colors"
              >
                Clear search
              </button>
            </div>
            {renderMapAndList()}
          </div>
        ) : (
          /* Browse by area mode */
          <div>
            {/* Feature cards (only when no area selected) */}
            {!selectedArea && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <FeatureCard
                  icon={<SearchIcon size={24} className="text-iha-orange" />}
                  title="Search by Service"
                  description='Type what you need: "dental near Shiprock" or just a zip code.'
                />
                <FeatureCard
                  icon={<Shield size={24} className="text-iha-orange" />}
                  title="Check Eligibility"
                  description="Not sure if you qualify? Our step-by-step guide can help."
                  link="/eligibility"
                  linkLabel="Am I Eligible?"
                />
                <FeatureCard
                  icon={<Wifi size={24} className="text-iha-orange" />}
                  title="Telehealth Options"
                  description="Find facilities offering phone and video visits for rural communities."
                  link="/telehealth"
                  linkLabel="View Telehealth"
                />
              </div>
            )}

            {/* Area Selector */}
            <div className="mb-6">
              <AreaSelector
                selectedArea={selectedArea}
                onSelectArea={handleSelectArea}
                facilityCounts={facilityCounts}
              />
            </div>

            {/* Map + List for selected area */}
            {selectedArea ? (
              renderMapAndList()
            ) : (
              /* No area selected: show overview map */
              <div className="h-[300px] sm:h-[400px] lg:h-[500px]">
                <FacilityMap
                  facilities={[]}
                  center={null}
                  selectedId={null}
                  onSelectFacility={() => {}}
                  onViewDetails={() => {}}
                  prcdaVisible={prcdaVisible}
                  prcdaData={prcdaData}
                />
              </div>
            )}

            <p className="text-sm text-iha-blue/50 text-center mt-3" style={{ textAlign: 'center' }}>
              {selectedArea
                ? `Showing ${displayFacilities.length} facilities in the ${AREAS.find(a => a.key === selectedArea)?.label || ''} Area`
                : `${facilities.length} facilities across 12 IHS Areas. Select an area above or search to get started.`
              }
            </p>
          </div>
        )}
      </section>

      {/* Legend */}
      <section className="max-w-7xl mx-auto px-4 pb-6 sm:pb-8">
        <div className="bg-white iha-card p-3 sm:p-4 flex flex-wrap gap-3 sm:gap-4 items-center justify-center">
          <span className="text-xs font-semibold text-iha-blue/60 mr-1 sm:mr-2">LEGEND:</span>
          <LegendItem color="#014b50" label="IHS Direct" />
          <LegendItem color="#b75527" label="Tribal 638" />
          <LegendItem color="#563333" label="Urban Indian" />
          <LegendItem color="#8a4229" label="FQHC" />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, link, linkLabel }) {
  return (
    <div className="bg-white iha-card p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-2 sm:mb-3">{icon}</div>
      <h3 className="font-heading text-iha-teal text-base sm:text-lg mb-2">{title}</h3>
      <p className="text-sm text-iha-blue/70 mb-3" style={{ textAlign: 'left' }}>{description}</p>
      {link && (
        <a href={link} className="text-sm font-semibold text-iha-orange hover:text-iha-umber no-underline transition-colors">
          {linkLabel} &rarr;
        </a>
      )}
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ background: color }} />
      <span className="text-xs text-iha-blue/70">{label}</span>
    </div>
  );
}
