import { useState, useCallback, useRef } from 'react';
import { parseSearch } from '../utils/searchParser';
import { geocodeLocation } from './useFilteredFacilities';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [parsedQuery, setParsedQuery] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [geocoding, setGeocoding] = useState(false);
  const debounceRef = useRef(null);

  const executeSearch = useCallback(async (searchText, filters = []) => {
    const parsed = parseSearch(searchText);
    const allServices = [...new Set([...parsed.services, ...filters])];

    // If the parser found a location, use it directly
    if (parsed.location && parsed.location.lat && parsed.location.lng) {
      setParsedQuery({ ...parsed, services: allServices });
      setActiveFilters(filters);
      return;
    }

    // If no location was found by the parser, try geocoding the raw query
    // Extract potential location text (remove service keywords)
    const locationText = extractLocationText(searchText, parsed.services);

    if (locationText && locationText.length >= 3) {
      setGeocoding(true);
      setParsedQuery({ ...parsed, services: allServices }); // show immediate results while geocoding

      const geo = await geocodeLocation(locationText);
      setGeocoding(false);

      if (geo) {
        const locationOverride = {
          type: 'geocoded',
          value: locationText,
          lat: geo.lat,
          lng: geo.lng,
          label: geo.label,
        };
        setParsedQuery({ ...parsed, services: allServices, location: locationOverride });
        return;
      }
    }

    // No location could be resolved
    setParsedQuery({ ...parsed, services: allServices });
    setActiveFilters(filters);
  }, []);

  const handleQueryChange = useCallback((value) => {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.trim().length >= 2) {
        executeSearch(value, activeFilters);
      } else if (value.trim().length === 0) {
        setParsedQuery(null);
      }
    }, 400);
  }, [executeSearch, activeFilters]);

  const handleSubmit = useCallback((value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery(value);
    executeSearch(value, activeFilters);
  }, [executeSearch, activeFilters]);

  const toggleFilter = useCallback((filterKey) => {
    setActiveFilters(prev => {
      let next;
      if (filterKey === 'all') {
        next = [];
      } else if (prev.includes(filterKey)) {
        next = prev.filter(f => f !== filterKey);
      } else {
        next = [...prev, filterKey];
      }
      executeSearch(query, next);
      return next;
    });
  }, [query, executeSearch]);

  const setLocationFromGeo = useCallback((lat, lng) => {
    const locationOverride = { type: 'coords', value: `${lat},${lng}`, lat, lng, label: 'Your location' };
    const parsed = parseSearch(query);
    const allServices = [...new Set([...parsed.services, ...activeFilters])];
    setParsedQuery({ ...parsed, services: allServices, location: locationOverride });
  }, [query, activeFilters]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setParsedQuery(null);
    setActiveFilters([]);
  }, []);

  return {
    query,
    parsedQuery,
    activeFilters,
    geocoding,
    handleQueryChange,
    handleSubmit,
    toggleFilter,
    setLocationFromGeo,
    clearSearch,
  };
}

/**
 * Try to extract the location portion of a search query by removing known service keywords.
 */
const SERVICE_WORDS = new Set([
  'medical', 'doctor', 'primary', 'care', 'dental', 'dentist', 'teeth', 'tooth',
  'mental', 'health', 'counseling', 'therapy', 'behavioral', 'depression', 'anxiety',
  'pharmacy', 'medication', 'prescription', 'substance', 'abuse', 'alcohol', 'drug',
  'addiction', 'recovery', 'pregnant', 'prenatal', 'baby', 'maternity', 'telehealth',
  'virtual', 'traditional', 'healing', 'emergency', 'urgent', 'lab', 'laboratory',
  'radiology', 'imaging', 'eye', 'vision', 'clinic', 'hospital', 'checkup', 'physical',
  'find', 'need', 'looking', 'for', 'want', 'get', 'the', 'a', 'an', 'in', 'at',
  'i', 'me', 'my', 'near', 'around', 'close', 'to', 'by', 'from', 'services',
]);

function extractLocationText(query, services) {
  const words = query.toLowerCase().trim().split(/\s+/);
  const locationWords = words.filter(w => !SERVICE_WORDS.has(w));
  const text = locationWords.join(' ').trim();
  return text || null;
}
