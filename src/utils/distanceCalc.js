/**
 * Haversine distance between two coordinates in miles.
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Sort facilities by distance from a reference point.
 */
export function sortByDistance(facilities, lat, lng) {
  return facilities
    .map(f => ({
      ...f,
      distance: haversineDistance(lat, lng, f.lat, f.lng)
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Format distance for display.
 */
export function formatDistance(miles) {
  if (miles == null) return null;
  if (miles < 0.5) return 'Less than 1 mi';
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}
