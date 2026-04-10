import { useMemo } from 'react';
import facilities from '../data/facilities.json';
import { sortByDistance, haversineDistance } from '../utils/distanceCalc';

// Simple zip code to lat/lng lookup for common tribal area zips
const ZIP_COORDS = {
  '86503': { lat: 36.1547, lng: -109.5547 },  // Chinle, AZ
  '87301': { lat: 35.5281, lng: -108.7426 },  // Gallup, NM
  '87420': { lat: 36.7856, lng: -108.6868 },  // Shiprock, NM
  '57770': { lat: 43.0255, lng: -102.5551 },  // Pine Ridge, SD
  '57572': { lat: 43.2325, lng: -100.8534 },  // Rosebud, SD
  '82514': { lat: 42.9839, lng: -108.8826 },  // Fort Washakie, WY
  '85256': { lat: 33.5372, lng: -111.8613 },  // Scottsdale (Salt River), AZ
  '99501': { lat: 61.2181, lng: -149.9003 },  // Anchorage, AK
  '55401': { lat: 44.9778, lng: -93.2650 },  // Minneapolis, MN
  '98101': { lat: 47.6062, lng: -122.3321 },  // Seattle, WA
  '97201': { lat: 45.5152, lng: -122.6784 },  // Portland, OR
  '85001': { lat: 33.4484, lng: -112.0740 },  // Phoenix, AZ
  '85701': { lat: 32.2226, lng: -110.9747 },  // Tucson, AZ
  '73101': { lat: 35.4676, lng: -97.5164 },  // Oklahoma City, OK
  '87101': { lat: 35.0844, lng: -106.6504 },  // Albuquerque, NM
  '57701': { lat: 44.0805, lng: -103.2310 },  // Rapid City, SD
  '59101': { lat: 45.7833, lng: -108.5007 },  // Billings, MT
  '28719': { lat: 35.4740, lng: -83.3146 },  // Cherokee, NC
  '74464': { lat: 35.9154, lng: -94.9699 },  // Tahlequah, OK
  '74820': { lat: 34.7748, lng: -96.6783 },  // Ada, OK
  '86045': { lat: 36.1350, lng: -111.2396 },  // Tuba City, AZ
  '60601': { lat: 41.8781, lng: -87.6298 },  // Chicago, IL
  '94601': { lat: 37.8044, lng: -122.2712 },  // Oakland, CA
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

export function useFilteredFacilities(parsedQuery, maxDistance = 200) {
  return useMemo(() => {
    if (!parsedQuery) {
      return { facilities: facilities, center: null, hasLocation: false };
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
      // Add distance and sort
      filtered = sortByDistance(filtered, center.lat, center.lng);

      // Filter by max distance if we have a location
      if (maxDistance) {
        filtered = filtered.filter(f => f.distance <= maxDistance);
      }
    }

    return {
      facilities: filtered,
      center,
      hasLocation: !!center,
    };
  }, [parsedQuery, maxDistance]);
}
