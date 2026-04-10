import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Phone } from 'lucide-react';

const TYPE_COLORS = {
  ihs_direct: '#014b50',
  tribal_638: '#b75527',
  urban_indian: '#563333',
  fqhc: '#8a4229',
};

function createMarkerIcon(type, isSelected) {
  const color = TYPE_COLORS[type] || '#014b50';
  const size = isSelected ? 14 : 10;
  const border = isSelected ? 3 : 2;

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: ${size * 2}px;
      height: ${size * 2}px;
      border-radius: 50%;
      background: ${color};
      border: ${border}px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ${isSelected ? 'transform: scale(1.3); z-index: 1000;' : ''}
    "></div>`,
    iconSize: [size * 2, size * 2],
    iconAnchor: [size, size],
    popupAnchor: [0, -size],
  });
}

function MapController({ center, facilities, selectedId }) {
  const map = useMap();

  useEffect(() => {
    if (selectedId) {
      const f = facilities.find(f => f.id === selectedId);
      if (f) {
        map.setView([f.lat, f.lng], Math.max(map.getZoom(), 10), { animate: true });
      }
    }
  }, [selectedId, facilities, map]);

  useEffect(() => {
    if (center) {
      const zoom = center.zoom || 9;
      map.setView([center.lat, center.lng], zoom, { animate: true });
    } else if (facilities.length > 0) {
      const bounds = L.latLngBounds(facilities.map(f => [f.lat, f.lng]));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 10 });
    }
  }, [center, facilities, map]);

  return null;
}

export default function FacilityMap({ facilities, center, selectedId, onSelectFacility, onViewDetails, prcdaVisible, prcdaData }) {
  const defaultCenter = [39.8283, -98.5795]; // center of US
  const defaultZoom = 4;

  const markers = useMemo(() =>
    facilities.map(f => ({
      ...f,
      icon: createMarkerIcon(f.type, f.id === selectedId),
    })),
    [facilities, selectedId]
  );

  return (
    <div className="w-full h-full iha-card-sm overflow-hidden" style={{ minHeight: 300 }}>
      <MapContainer
        center={center ? [center.lat, center.lng] : defaultCenter}
        zoom={center ? 9 : defaultZoom}
        className="w-full h-full"
        style={{ minHeight: 300, background: '#eae8e2' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={center} facilities={facilities} selectedId={selectedId} />

        {/* PRCDA boundaries */}
        {prcdaVisible && prcdaData && prcdaData.features && prcdaData.features.map((feature, idx) => {
          if (!feature.geometry || !feature.geometry.coordinates) return null;
          const coords = feature.geometry.coordinates[0];
          if (!coords) return null;

          return (
            <PRCDAPolygon key={idx} feature={feature} />
          );
        })}

        {/* User location */}
        {center && (
          <CircleMarker
            center={[center.lat, center.lng]}
            radius={8}
            pathOptions={{ color: '#b75527', fillColor: '#b75527', fillOpacity: 0.3, weight: 2 }}
          >
            <Popup>
              <span className="text-sm font-semibold">Your search location</span>
            </Popup>
          </CircleMarker>
        )}

        {/* Facility markers */}
        {markers.map(f => (
          <Marker
            key={f.id}
            position={[f.lat, f.lng]}
            icon={f.icon}
            eventHandlers={{
              click: () => onSelectFacility(f.id),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <p className="font-bold text-sm mb-1" style={{ fontFamily: 'Libre Baskerville, serif', color: '#014b50' }}>
                  {f.name}
                </p>
                <p className="text-xs text-gray-600 mb-2">{f.address}</p>
                <a
                  href={`tel:${f.phone.replace(/[^0-9+]/g, '')}`}
                  className="text-xs font-medium"
                  style={{ color: '#b75527' }}
                >
                  {f.phone}
                </a>
                <br />
                <button
                  onClick={() => onViewDetails(f.id)}
                  className="mt-2 text-xs font-bold px-3 py-1 rounded"
                  style={{ background: '#b75527', color: 'white' }}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

function PRCDAPolygon({ feature }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!feature.geometry || !feature.geometry.coordinates) return;

    const coords = feature.geometry.coordinates[0].map(c => [c[1], c[0]]);
    const polygon = L.polygon(coords, {
      color: feature.properties?.strokeColor || '#b75527',
      fillColor: feature.properties?.fillColor || '#014b50',
      fillOpacity: 0.1,
      weight: 2,
      dashArray: '5, 5',
    });

    polygon.bindTooltip(
      `<strong>${feature.properties?.name || 'PRCDA'}</strong><br/><span style="font-size:11px">${feature.properties?.description || ''}</span>`,
      { sticky: true }
    );

    polygon.addTo(map);
    layerRef.current = polygon;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [feature, map]);

  return null;
}
