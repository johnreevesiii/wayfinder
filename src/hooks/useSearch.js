import { useState, useCallback, useRef } from 'react';
import { parseSearch } from '../utils/searchParser';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [parsedQuery, setParsedQuery] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const debounceRef = useRef(null);

  const executeSearch = useCallback((searchText, filters = []) => {
    const parsed = parseSearch(searchText);
    // Merge chip filters with parsed service filters
    const allServices = [...new Set([...parsed.services, ...filters])];
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
    }, 300);
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
    handleQueryChange,
    handleSubmit,
    toggleFilter,
    setLocationFromGeo,
    clearSearch,
  };
}
