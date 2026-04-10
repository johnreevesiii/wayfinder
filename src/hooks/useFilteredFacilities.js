import { useMemo } from 'react';
import facilities from '../data/facilities.json';
import { sortByDistance } from '../utils/distanceCalc';

// Zip code to lat/lng for common tribal-area zips
const ZIP_COORDS = {
  '86503': { lat: 36.1547, lng: -109.5547 },
  '87301': { lat: 35.5281, lng: -108.7426 },
  '87420': { lat: 36.7856, lng: -108.6868 },
  '57770': { lat: 43.0255, lng: -102.5551 },
  '57572': { lat: 43.2325, lng: -100.8534 },
  '82514': { lat: 42.9839, lng: -108.8826 },
  '85256': { lat: 33.5372, lng: -111.8613 },
  '99501': { lat: 61.2181, lng: -149.9003 },
  '55401': { lat: 44.9778, lng: -93.2650 },
  '98101': { lat: 47.6062, lng: -122.3321 },
  '97201': { lat: 45.5152, lng: -122.6784 },
  '85001': { lat: 33.4484, lng: -112.0740 },
  '85701': { lat: 32.2226, lng: -110.9747 },
  '73101': { lat: 35.4676, lng: -97.5164 },
  '87101': { lat: 35.0844, lng: -106.6504 },
  '57701': { lat: 44.0805, lng: -103.2310 },
  '59101': { lat: 45.7833, lng: -108.5007 },
  '28719': { lat: 35.4740, lng: -83.3146 },
  '74464': { lat: 35.9154, lng: -94.9699 },
  '74820': { lat: 34.7748, lng: -96.6783 },
  '86045': { lat: 36.1350, lng: -111.2396 },
  '60601': { lat: 41.8781, lng: -87.6298 },
  '94601': { lat: 37.8044, lng: -122.2712 },
};

function getSearchCenter(location) {
  if (!location) return null;

  if (location.type === 'coords') {
    return { lat: location.lat, lng: location.lng };
  }

  if (location.lat && location.lng) {
    return { lat: location.lat, lng: location.lng };
  }

  if (location.type === 'zip' && ZIP_COORDS[location.value]) {
    return ZIP_COORDS[location.value];
  }

  return null;
}

const MAX_RESULTS = 50;

export function useFilteredFacilities(parsedQuery, maxDistance = 150) {
  return useMemo(() => {
    if (!parsedQuery) {
      return { facilities: facilities, center: null, hasLocation: false, locationNotFound: false };
    }

    const { services, location } = parsedQuery;
    let filtered = [...facilities];

    // Filter by services
    if (services && services.length > 0) {
      filtered = filtered.filter(f =>
        services.some(s => f.services.includes(s))
      );
    }

    // Get center point for distance calculation
    const center = getSearchCenter(location);

    if (center) {
      // Add distance and sort by proximity
      filtered = sortByDistance(filtered, center.lat, center.lng);

      // Filter by max distance
      if (maxDistance) {
        filtered = filtered.filter(f => f.distance <= maxDistance);
      }
    } else if (location && !center) {
      // Location was specified but we couldn't resolve it.
      // Still return service-filtered results but cap them and flag it.
      return {
        facilities: filtered.slice(0, MAX_RESULTS),
        center: null,
        hasLocation: false,
        locationNotFound: true,
        locationQuery: location.value || location.label || '',
      };
    }

    // Cap results to prevent overwhelming the UI
    const capped = filtered.slice(0, MAX_RESULTS);

    return {
      facilities: capped,
      center,
      hasLocation: !!center,
      locationNotFound: false,
      totalMatches: filtered.length,
    };
  }, [parsedQuery, maxDistance]);
}

/**
 * Geocode a city/place name using OpenStreetMap Nominatim.
 * Returns { lat, lng, label } or null.
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
