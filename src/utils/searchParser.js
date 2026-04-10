/**
 * Parses natural language search input into structured query.
 * Returns { services: string[], location: { type, value }, rawQuery: string }
 */
import facilities from '../data/facilities.json';

const SERVICE_KEYWORDS = {
  primary_care: ['doctor', 'primary care', 'primary', 'checkup', 'physical', 'sick', 'flu', 'cold', 'diabetes', 'blood sugar', 'a1c', 'hypertension', 'blood pressure', 'clinic', 'general', 'medical'],
  dental: ['dental', 'dentist', 'teeth', 'tooth', 'cavity', 'cleaning', 'oral'],
  behavioral_health: ['mental health', 'counseling', 'therapy', 'behavioral health', 'behavioral', 'depression', 'anxiety', 'ptsd', 'trauma', 'psychologist', 'psychiatrist', 'mental'],
  pharmacy: ['pharmacy', 'medication', 'prescription', 'refill', 'medicine', 'rx'],
  substance_abuse: ['substance abuse', 'substance', 'alcohol', 'drug treatment', 'addiction', 'recovery', 'sober', 'detox', 'rehab', 'opioid', 'meth', 'naloxone', 'mat treatment', 'suboxone'],
  prenatal: ['pregnant', 'prenatal', 'ob-gyn', 'ob gyn', 'obgyn', 'baby', 'maternity', 'obstetric', 'birth', 'midwife', 'gynecology', 'women health'],
  telehealth: ['telehealth', 'virtual', 'video visit', 'phone visit', 'remote care', 'online visit'],
  traditional_healing: ['traditional healing', 'traditional medicine', 'medicine man', 'healer', 'sweat lodge', 'ceremony', 'cultural healing', 'traditional'],
  emergency: ['emergency', 'er', 'urgent care', 'urgent'],
  lab: ['lab', 'laboratory', 'blood test', 'blood work', 'testing'],
  radiology: ['radiology', 'imaging', 'x-ray', 'xray', 'mri', 'ct scan', 'ultrasound'],
  optometry: ['eye', 'vision', 'glasses', 'optometry', 'ophthalmology', 'eye care'],
};

// Well-known tribal/reservation names (manually curated for natural language matching)
const TRIBAL_LOCATIONS = {
  'navajo': { lat: 36.1547, lng: -109.5547, label: 'Navajo Nation' },
  'navajo nation': { lat: 36.1547, lng: -109.5547, label: 'Navajo Nation' },
  'pine ridge': { lat: 43.0255, lng: -102.5551, label: 'Pine Ridge Reservation' },
  'oglala': { lat: 43.0255, lng: -102.5551, label: 'Pine Ridge Reservation' },
  'rosebud': { lat: 43.2325, lng: -100.8534, label: 'Rosebud Reservation' },
  'standing rock': { lat: 46.0861, lng: -100.6296, label: 'Standing Rock Reservation' },
  'wind river': { lat: 42.9839, lng: -108.8826, label: 'Wind River Reservation' },
  'crow': { lat: 45.6025, lng: -107.4612, label: 'Crow Reservation' },
  'blackfeet': { lat: 48.5597, lng: -113.0263, label: 'Blackfeet Reservation' },
  'fort peck': { lat: 48.1105, lng: -105.1963, label: 'Fort Peck Reservation' },
  'northern cheyenne': { lat: 45.6250, lng: -106.6667, label: 'Northern Cheyenne Reservation' },
  'warm springs': { lat: 44.7640, lng: -121.2651, label: 'Warm Springs Reservation' },
  'yakama': { lat: 46.3773, lng: -120.3103, label: 'Yakama Reservation' },
  'red lake': { lat: 47.8764, lng: -95.0170, label: 'Red Lake Reservation' },
  'white earth': { lat: 47.0917, lng: -95.8428, label: 'White Earth Reservation' },
  'leech lake': { lat: 47.2508, lng: -94.4499, label: 'Leech Lake Reservation' },
  'turtle mountain': { lat: 48.8067, lng: -99.7410, label: 'Turtle Mountain Reservation' },
  'fond du lac': { lat: 46.7167, lng: -92.5083, label: 'Fond du Lac Reservation' },
  'mille lacs': { lat: 46.2100, lng: -93.7300, label: 'Mille Lacs Reservation' },
  'tohono o\'odham': { lat: 31.9120, lng: -111.8812, label: 'Tohono O\'odham Nation' },
  'gila river': { lat: 33.0767, lng: -111.7365, label: 'Gila River Reservation' },
  'salt river': { lat: 33.5372, lng: -111.8613, label: 'Salt River Reservation' },
  'hopi': { lat: 35.8428, lng: -110.3856, label: 'Hopi Reservation' },
  'san carlos': { lat: 33.3464, lng: -110.4543, label: 'San Carlos Apache Reservation' },
  'white mountain apache': { lat: 33.8375, lng: -109.9645, label: 'White Mountain Apache Reservation' },
  'cherokee': { lat: 35.4740, lng: -83.3146, label: 'Eastern Cherokee' },
  'cherokee nation': { lat: 35.9154, lng: -94.9699, label: 'Cherokee Nation' },
  'chickasaw': { lat: 34.7748, lng: -96.6783, label: 'Chickasaw Nation' },
  'choctaw': { lat: 34.7512, lng: -95.0482, label: 'Choctaw Nation' },
  'muscogee': { lat: 35.6267, lng: -95.9538, label: 'Muscogee (Creek) Nation' },
  'creek nation': { lat: 35.6267, lng: -95.9538, label: 'Muscogee (Creek) Nation' },
  'seminole nation': { lat: 35.1742, lng: -96.6850, label: 'Seminole Nation' },
  'osage': { lat: 36.6267, lng: -96.4000, label: 'Osage Nation' },
  'acoma': { lat: 34.9647, lng: -107.6247, label: 'Pueblo of Acoma' },
  'zuni': { lat: 35.0686, lng: -108.8515, label: 'Pueblo of Zuni' },
  'mescalero': { lat: 33.1571, lng: -105.7733, label: 'Mescalero Apache Reservation' },
  'jicarilla': { lat: 36.8286, lng: -106.9908, label: 'Jicarilla Apache Reservation' },
  'southern ute': { lat: 37.0667, lng: -107.6333, label: 'Southern Ute Reservation' },
  'colville': { lat: 48.2000, lng: -118.7000, label: 'Colville Reservation' },
  'tulalip': { lat: 48.0886, lng: -122.2876, label: 'Tulalip Reservation' },
  'lummi': { lat: 48.7926, lng: -122.6540, label: 'Lummi Reservation' },
  'nez perce': { lat: 46.0711, lng: -116.7489, label: 'Nez Perce Reservation' },
  'fort hall': { lat: 42.9000, lng: -112.4000, label: 'Fort Hall Reservation' },
  'umatilla': { lat: 45.6761, lng: -118.6978, label: 'Umatilla Reservation' },
  'menominee': { lat: 45.0000, lng: -88.7000, label: 'Menominee Reservation' },
  'oneida': { lat: 44.4833, lng: -88.1833, label: 'Oneida Reservation (WI)' },
  'flathead': { lat: 47.5000, lng: -114.1000, label: 'Flathead Reservation' },
  'rocky boy': { lat: 48.6000, lng: -109.8000, label: 'Rocky Boy Reservation' },
  'fort belknap': { lat: 48.5000, lng: -108.8000, label: 'Fort Belknap Reservation' },
  'cheyenne river': { lat: 44.9905, lng: -101.2332, label: 'Cheyenne River Reservation' },
  'eagle butte': { lat: 44.9905, lng: -101.2332, label: 'Eagle Butte' },
  'lower brule': { lat: 43.8000, lng: -99.7000, label: 'Lower Brule Reservation' },
  'crow creek': { lat: 44.1000, lng: -99.3000, label: 'Crow Creek Reservation' },
  'spirit lake': { lat: 47.9000, lng: -99.0000, label: 'Spirit Lake Reservation' },
  'sisseton': { lat: 45.8000, lng: -97.1000, label: 'Sisseton-Wahpeton Reservation' },
  'winnebago': { lat: 42.2000, lng: -96.5000, label: 'Winnebago Reservation' },
  'flandreau': { lat: 44.0000, lng: -96.6000, label: 'Flandreau Santee Reservation' },
  'pascua yaqui': { lat: 32.2226, lng: -111.0000, label: 'Pascua Yaqui' },
  'poarch creek': { lat: 31.0240, lng: -87.4936, label: 'Poarch Creek' },
  'eastern band': { lat: 35.4740, lng: -83.3146, label: 'Eastern Band of Cherokee' },
  'qualla boundary': { lat: 35.4740, lng: -83.3146, label: 'Qualla Boundary' },
  'seminole florida': { lat: 26.0849, lng: -80.3052, label: 'Seminole Tribe of Florida' },
  'miccosukee': { lat: 25.7617, lng: -80.4456, label: 'Miccosukee Tribe of Indians of Florida' },
};

// Build city lookup dynamically from facility data
const CITY_LOCATIONS = {};
for (const f of facilities) {
  // Parse city from address
  const parts = f.address.split(',');
  if (parts.length >= 2) {
    const cityPart = parts[parts.length - 2].trim().toLowerCase();
    // Also try the city without state
    const cityOnly = cityPart.replace(/\s+(ak|al|ar|az|ca|co|ct|de|fl|ga|hi|ia|id|il|in|ks|ky|la|ma|md|me|mi|mn|mo|ms|mt|nc|nd|ne|nh|nj|nm|nv|ny|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|va|vt|wa|wi|wv|wy)$/i, '').trim();
    if (cityOnly && cityOnly.length > 2 && !CITY_LOCATIONS[cityOnly]) {
      CITY_LOCATIONS[cityOnly] = { lat: f.lat, lng: f.lng, label: parts.slice(-2).join(',').trim() };
    }
  }
  // Also index by facility name keywords
  const nameLower = f.name.toLowerCase();
  const nameWords = nameLower.split(/[\s-]+/).filter(w => w.length > 3);
  // Don't add generic words
  const skip = new Set(['health', 'center', 'hospital', 'clinic', 'indian', 'medical', 'tribal', 'nation', 'community', 'comprehensive', 'service', 'care', 'wellness', 'native', 'american', 'primary', 'family', 'regional']);
  for (const word of nameWords) {
    if (!skip.has(word) && !CITY_LOCATIONS[word]) {
      CITY_LOCATIONS[word] = { lat: f.lat, lng: f.lng, label: f.name };
    }
  }
}

// Add well-known cities that may not have facilities but people search for
const MAJOR_CITIES = {
  'anchorage': { lat: 61.2181, lng: -149.9003, label: 'Anchorage, AK' },
  'fairbanks': { lat: 64.8378, lng: -147.7164, label: 'Fairbanks, AK' },
  'juneau': { lat: 58.3005, lng: -134.4197, label: 'Juneau, AK' },
  'albuquerque': { lat: 35.0844, lng: -106.6504, label: 'Albuquerque, NM' },
  'gallup': { lat: 35.5281, lng: -108.7426, label: 'Gallup, NM' },
  'santa fe': { lat: 35.6870, lng: -105.9378, label: 'Santa Fe, NM' },
  'minneapolis': { lat: 44.9778, lng: -93.2650, label: 'Minneapolis, MN' },
  'seattle': { lat: 47.6062, lng: -122.3321, label: 'Seattle, WA' },
  'portland': { lat: 45.5152, lng: -122.6784, label: 'Portland, OR' },
  'phoenix': { lat: 33.4484, lng: -112.0740, label: 'Phoenix, AZ' },
  'tucson': { lat: 32.2226, lng: -110.9747, label: 'Tucson, AZ' },
  'oklahoma city': { lat: 35.4676, lng: -97.5164, label: 'Oklahoma City, OK' },
  'tulsa': { lat: 36.1540, lng: -95.9928, label: 'Tulsa, OK' },
  'rapid city': { lat: 44.0805, lng: -103.2310, label: 'Rapid City, SD' },
  'billings': { lat: 45.7833, lng: -108.5007, label: 'Billings, MT' },
  'chicago': { lat: 41.8781, lng: -87.6298, label: 'Chicago, IL' },
  'oakland': { lat: 37.8044, lng: -122.2712, label: 'Oakland, CA' },
  'san jose': { lat: 37.3382, lng: -121.8863, label: 'San Jose, CA' },
  'sacramento': { lat: 38.5816, lng: -121.4944, label: 'Sacramento, CA' },
  'los angeles': { lat: 34.0522, lng: -118.2437, label: 'Los Angeles, CA' },
  'san diego': { lat: 32.7157, lng: -117.1611, label: 'San Diego, CA' },
  'denver': { lat: 39.7392, lng: -104.9903, label: 'Denver, CO' },
  'milwaukee': { lat: 43.0389, lng: -87.9065, label: 'Milwaukee, WI' },
  'detroit': { lat: 42.3314, lng: -83.0458, label: 'Detroit, MI' },
  'dallas': { lat: 32.7767, lng: -96.7970, label: 'Dallas, TX' },
  'kansas city': { lat: 39.0997, lng: -94.5786, label: 'Kansas City, MO' },
  'salt lake city': { lat: 40.7608, lng: -111.8910, label: 'Salt Lake City, UT' },
  'omaha': { lat: 41.2565, lng: -95.9345, label: 'Omaha, NE' },
  'bismarck': { lat: 46.8083, lng: -100.7837, label: 'Bismarck, ND' },
  'bemidji': { lat: 47.4736, lng: -94.8803, label: 'Bemidji, MN' },
  'flagstaff': { lat: 35.1983, lng: -111.6513, label: 'Flagstaff, AZ' },
  'shiprock': { lat: 36.7856, lng: -108.6868, label: 'Shiprock, NM' },
  'chinle': { lat: 36.1547, lng: -109.5547, label: 'Chinle, AZ' },
  'tuba city': { lat: 36.1350, lng: -111.2396, label: 'Tuba City, AZ' },
  'window rock': { lat: 35.6808, lng: -109.0523, label: 'Window Rock, AZ' },
  'tahlequah': { lat: 35.9154, lng: -94.9699, label: 'Tahlequah, OK' },
  'ada': { lat: 34.7748, lng: -96.6783, label: 'Ada, OK' },
  'lawton': { lat: 34.6036, lng: -98.3959, label: 'Lawton, OK' },
  'claremore': { lat: 36.3126, lng: -95.6161, label: 'Claremore, OK' },
  'durango': { lat: 37.2753, lng: -107.8801, label: 'Durango, CO' },
  'farmington': { lat: 36.7281, lng: -108.2187, label: 'Farmington, NM' },
  'missoula': { lat: 46.8721, lng: -113.9940, label: 'Missoula, MT' },
  'great falls': { lat: 47.5053, lng: -111.3008, label: 'Great Falls, MT' },
  'sioux falls': { lat: 43.5446, lng: -96.7311, label: 'Sioux Falls, SD' },
  'pierre': { lat: 44.3683, lng: -100.3510, label: 'Pierre, SD' },
  'bellingham': { lat: 48.7519, lng: -122.4787, label: 'Bellingham, WA' },
  'tacoma': { lat: 47.2529, lng: -122.4443, label: 'Tacoma, WA' },
  'spokane': { lat: 47.6588, lng: -117.4260, label: 'Spokane, WA' },
};
Object.assign(CITY_LOCATIONS, MAJOR_CITIES);

const ZIP_REGEX = /\b(\d{5})\b/;

export function parseSearch(query) {
  if (!query || !query.trim()) {
    return { services: [], location: null, rawQuery: '' };
  }

  const raw = query.trim();
  const lower = raw.toLowerCase();

  // Extract services
  const services = [];
  for (const [serviceKey, keywords] of Object.entries(SERVICE_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        if (!services.includes(serviceKey)) {
          services.push(serviceKey);
        }
        break;
      }
    }
  }

  // Extract location
  let location = null;

  // Check for zip code
  const zipMatch = raw.match(ZIP_REGEX);
  if (zipMatch) {
    // Try to find a facility near this zip
    location = { type: 'zip', value: zipMatch[1], label: `ZIP ${zipMatch[1]}` };
  }

  // Check tribal/reservation names (longer matches first)
  if (!location) {
    const tribalKeys = Object.keys(TRIBAL_LOCATIONS).sort((a, b) => b.length - a.length);
    for (const name of tribalKeys) {
      if (lower.includes(name)) {
        const loc = TRIBAL_LOCATIONS[name];
        location = { type: 'tribal', value: name, ...loc };
        break;
      }
    }
  }

  // Check city names (longer matches first)
  if (!location) {
    const cityKeys = Object.keys(CITY_LOCATIONS).sort((a, b) => b.length - a.length);
    for (const name of cityKeys) {
      if (lower.includes(name)) {
        const loc = CITY_LOCATIONS[name];
        location = { type: 'city', value: name, ...loc };
        break;
      }
    }
  }

  return { services, location, rawQuery: raw };
}

/**
 * Returns quick-filter chip definitions.
 */
export const FILTER_CHIPS = [
  { key: 'all', label: 'All Services' },
  { key: 'primary_care', label: 'Primary Care' },
  { key: 'dental', label: 'Dental' },
  { key: 'behavioral_health', label: 'Behavioral Health' },
  { key: 'pharmacy', label: 'Pharmacy' },
  { key: 'substance_abuse', label: 'Substance Abuse' },
  { key: 'prenatal', label: 'Prenatal / OB' },
  { key: 'telehealth', label: 'Telehealth' },
  { key: 'traditional_healing', label: 'Traditional Healing' },
  { key: 'emergency', label: 'Emergency' },
];
