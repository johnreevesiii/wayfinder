import { useState, useCallback } from 'react';
import { geocodeLocation } from './useFilteredFacilities';
import { parseSearch } from '../utils/searchParser';

export function useSearch() {
  const [searchParams, setSearchParams] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geoLabel, setGeoLabel] = useState('');

  /**
   * Structured search from the guided form.
   * { service, location, distance, facilityType }
   */
  const executeStructuredSearch = useCallback(async (params) => {
    if (!params) {
      setSearchParams(null);
      return;
    }

    const { service, location, distance, facilityType } = params;

    // If no location provided, just filter by service/type
    if (!location || !location.trim()) {
      setSearchParams({
        services: service ? [service] : [],
        facilityType: facilityType || null,
        location: null,
        maxDistance: null,
        locationLabel: null,
      });
      return;
    }

    // Try to resolve the location
    const locationText = location.trim();

    // First try the search parser's built-in location lookup
    const parsed = parseSearch(locationText);
    if (parsed.location && parsed.location.lat && parsed.location.lng) {
      setSearchParams({
        services: service ? [service] : [],
        facilityType: facilityType || null,
        location: { lat: parsed.location.lat, lng: parsed.location.lng },
        maxDistance: distance,
        locationLabel: parsed.location.label || locationText,
      });
      return;
    }

    // Fall back to geocoding
    setGeocoding(true);
    const geo = await geocodeLocation(locationText);
    setGeocoding(false);

    if (geo) {
      setSearchParams({
        services: service ? [service] : [],
        facilityType: facilityType || null,
        location: { lat: geo.lat, lng: geo.lng },
        maxDistance: distance,
        locationLabel: geo.label || locationText,
      });
    } else {
      // Location not found
      setSearchParams({
        services: service ? [service] : [],
        facilityType: facilityType || null,
        location: null,
        maxDistance: null,
        locationLabel: null,
        locationNotFound: locationText,
      });
    }
  }, []);

  /**
   * Set location from browser geolocation.
   */
  const setLocationFromGeo = useCallback((lat, lng) => {
    setGeoLabel('Your location');
    setSearchParams(prev => ({
      ...(prev || { services: [], facilityType: null }),
      location: { lat, lng },
      maxDistance: prev?.maxDistance || 100,
      locationLabel: 'Your location',
      locationNotFound: null,
    }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchParams(null);
    setGeoLabel('');
  }, []);

  return {
    searchParams,
    geocoding,
    geoLabel,
    executeStructuredSearch,
    setLocationFromGeo,
    clearSearch,
  };
}
