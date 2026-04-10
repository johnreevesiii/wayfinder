import { useMemo } from 'react';
import facilities from '../data/facilities.json';
import { sortByDistance } from '../utils/distanceCalc';

const MAX_RESULTS = 50;

/**
 * Filter facilities based on structured search params.
 * searchParams: { services, facilityType, location, maxDistance, locationLabel, locationNotFound }
 */
export function useFilteredFacilities(searchParams) {
  return useMemo(() => {
    if (!searchParams) {
      return { facilities: [], center: null, hasLocation: false, locationNotFound: null, totalMatches: 0 };
    }

    const { services, facilityType, location, maxDistance, locationLabel, locationNotFound } = searchParams;
    let filtered = [...facilities];

    // Filter by service type
    if (services && services.length > 0) {
      filtered = filtered.filter(f =>
        services.some(s => f.services.includes(s))
      );
    }

    // Filter by facility type
    if (facilityType) {
      filtered = filtered.filter(f => f.type === facilityType);
    }

    // If we have a location, sort by distance and cap
    if (location && location.lat && location.lng) {
      filtered = sortByDistance(filtered, location.lat, location.lng);

      if (maxDistance) {
        filtered = filtered.filter(f => f.distance <= maxDistance);
      }

      const totalMatches = filtered.length;
      const capped = filtered.slice(0, MAX_RESULTS);

      return {
        facilities: capped,
        center: { lat: location.lat, lng: location.lng, label: locationLabel },
        hasLocation: true,
        locationNotFound: null,
        totalMatches,
      };
    }

    // No location: return service/type-filtered results, capped
    return {
      facilities: filtered.slice(0, MAX_RESULTS),
      center: null,
      hasLocation: false,
      locationNotFound: locationNotFound || null,
      totalMatches: filtered.length,
    };
  }, [searchParams]);
}

/**
 * Geocode a city/place name using OpenStreetMap Nominatim.
 */
export async function geocodeLocation(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=us&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'WayFinder/1.0 (wayfinder.indigenous.health)' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.length === 0) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      label: data[0].display_name?.split(',').slice(0, 2).join(',').trim() || query,
    };
  } catch {
    return null;
  }
}
