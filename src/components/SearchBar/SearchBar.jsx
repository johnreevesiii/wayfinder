import { useState, useRef } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';

export default function SearchBar({ query, onQueryChange, onSubmit, onUseLocation, geoLoading }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(query);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onQueryChange('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full" role="search" aria-label="Search for healthcare facilities">
      <div
        className={`flex items-center bg-white iha-card shadow-lg transition-shadow ${
          focused ? 'shadow-xl ring-2 ring-iha-orange/40' : ''
        }`}
      >
        <div className="pl-4 pr-2 text-iha-umber">
          <Search size={22} aria-hidden="true" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder='Try "dental near Shiprock" or "behavioral health Minneapolis"'
          className="flex-1 py-4 px-2 text-base text-iha-blue placeholder:text-iha-blue/40 bg-transparent outline-none font-body"
          aria-label="Search for healthcare services by type, location, or facility name"
          autoComplete="off"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-2 text-iha-blue/40 hover:text-iha-blue transition-colors"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}

        <button
          type="button"
          onClick={onUseLocation}
          disabled={geoLoading}
          className="p-3 text-iha-umber hover:text-iha-orange transition-colors disabled:opacity-50"
          aria-label="Use my current location"
          title="Use my location"
        >
          {geoLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <MapPin size={20} />
          )}
        </button>

        <button
          type="submit"
          className="bg-iha-orange hover:bg-iha-umber text-white px-6 py-4 font-semibold text-sm transition-colors"
          style={{ borderRadius: '0 24px 0 0' }}
        >
          Search
        </button>
      </div>

      <p className="mt-3 text-sm text-iha-blue/60 text-center" style={{ textAlign: 'center' }}>
        Search by service type, city, zip code, or reservation name
      </p>
    </form>
  );
}
