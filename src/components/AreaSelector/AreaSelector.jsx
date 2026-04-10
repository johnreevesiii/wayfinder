import { MapPin } from 'lucide-react';
import areaMetrics from '../../data/area-metrics.json';

const AREAS = [
  { key: 'alaska', label: 'Alaska', abbr: 'AK', center: [63.5, -152.0], zoom: 4 },
  { key: 'albuquerque', label: 'Albuquerque', abbr: 'NM', center: [35.2, -107.0], zoom: 7 },
  { key: 'bemidji', label: 'Bemidji', abbr: 'MN/WI/MI', center: [46.0, -92.0], zoom: 6 },
  { key: 'billings', label: 'Billings', abbr: 'MT/WY', center: [46.5, -108.5], zoom: 6 },
  { key: 'california', label: 'California', abbr: 'CA', center: [37.5, -120.5], zoom: 6 },
  { key: 'great_plains', label: 'Great Plains', abbr: 'SD/ND/NE', center: [44.5, -100.5], zoom: 6 },
  { key: 'nashville', label: 'Nashville', abbr: 'Eastern US', center: [35.0, -84.0], zoom: 5 },
  { key: 'navajo', label: 'Navajo', abbr: 'AZ/NM/UT', center: [36.2, -109.8], zoom: 7 },
  { key: 'oklahoma_city', label: 'Oklahoma City', abbr: 'OK/KS', center: [35.5, -97.0], zoom: 7 },
  { key: 'phoenix', label: 'Phoenix', abbr: 'AZ/NV/UT', center: [34.0, -111.5], zoom: 7 },
  { key: 'portland', label: 'Portland', abbr: 'OR/WA/ID', center: [46.0, -120.5], zoom: 6 },
  { key: 'tucson', label: 'Tucson', abbr: 'AZ', center: [32.0, -111.5], zoom: 8 },
];

export { AREAS };

export default function AreaSelector({ selectedArea, onSelectArea, facilityCounts }) {
  return (
    <div>
      <h2 className="font-heading text-iha-teal text-xl mb-4 text-center">
        Select an IHS Area to explore facilities
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {AREAS.map(area => {
          const isActive = selectedArea === area.key;
          const count = facilityCounts?.[area.key] || 0;
          const metrics = areaMetrics[area.key];

          return (
            <button
              key={area.key}
              onClick={() => onSelectArea(isActive ? null : area.key)}
              className={`p-4 iha-card-sm text-left transition-all ${
                isActive
                  ? 'bg-iha-teal text-white shadow-lg ring-2 ring-iha-orange'
                  : 'bg-white text-iha-blue hover:shadow-md hover:border-iha-orange/30 border border-transparent'
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <h3 className={`font-heading text-sm font-bold leading-tight ${
                  isActive ? 'text-iha-orange' : 'text-iha-teal'
                }`}>
                  {area.label}
                </h3>
                <MapPin size={14} className={isActive ? 'text-iha-orange' : 'text-iha-umber/40'} />
              </div>
              <p className={`text-xs mb-2 ${isActive ? 'text-white/70' : 'text-iha-blue/50'}`}>
                {area.abbr}
              </p>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-iha-umber'}`}>
                  {count} {count === 1 ? 'facility' : 'facilities'}
                </span>
                {metrics && (
                  <span className={`text-xs ${isActive ? 'text-white/60' : 'text-iha-blue/40'}`}>
                    {(metrics.populationServed / 1000).toFixed(0)}K served
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Show all option */}
      <div className="text-center mt-4">
        <button
          onClick={() => onSelectArea(null)}
          className={`text-sm font-medium transition-colors ${
            selectedArea === null
              ? 'text-iha-orange font-semibold'
              : 'text-iha-blue/50 hover:text-iha-orange'
          }`}
        >
          {selectedArea ? 'Clear selection (show map overview)' : 'No area selected (showing overview)'}
        </button>
      </div>
    </div>
  );
}
