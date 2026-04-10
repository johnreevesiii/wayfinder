import { useState, useMemo } from 'react';
import { Video, Phone, Monitor, Pill, Brain, Stethoscope, MapPin, PhoneCall, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import facilities from '../../data/facilities.json';

const TELEHEALTH_CATEGORIES = [
  { key: 'all', label: 'All Telehealth', icon: Video },
  { key: 'general_telehealth', label: 'General', icon: Stethoscope },
  { key: 'telebehavioral_health', label: 'Behavioral Health', icon: Brain },
  { key: 'teledermatology', label: 'Dermatology', icon: Monitor },
  { key: 'telepharmacy', label: 'Pharmacy', icon: Pill },
];

export default function TelehealthDirectory() {
  const [activeCategory, setActiveCategory] = useState('all');

  const telehealthFacilities = useMemo(() => {
    const th = facilities.filter(f => f.telehealth && f.telehealthServices && f.telehealthServices.length > 0);
    if (activeCategory === 'all') return th;
    return th.filter(f => f.telehealthServices.includes(activeCategory));
  }, [activeCategory]);

  return (
    <div>
      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Filter telehealth services by category">
        {TELEHEALTH_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = cat.key === activeCategory;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold iha-card-sm transition-all ${
                isActive
                  ? 'bg-iha-teal text-white shadow-md'
                  : 'bg-white text-iha-blue border border-iha-teal/20 hover:bg-iha-teal/5'
              }`}
              aria-pressed={isActive}
            >
              <Icon size={16} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 iha-card-sm mb-6">
        <p className="text-sm text-blue-800" style={{ textAlign: 'left' }}>
          <strong>Telehealth can be a great option</strong> if you live far from a healthcare facility
          or have difficulty traveling. Many IHS and tribal facilities now offer phone and video visits
          for routine care, behavioral health, and more. Contact the facility to learn how to enroll.
        </p>
      </div>

      {/* Results */}
      <p className="text-sm text-iha-blue/60 mb-4">
        {telehealthFacilities.length} {telehealthFacilities.length === 1 ? 'facility' : 'facilities'} offering telehealth
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {telehealthFacilities.map(facility => (
          <TelehealthCard key={facility.id} facility={facility} />
        ))}
      </div>

      {telehealthFacilities.length === 0 && (
        <div className="text-center py-12">
          <Video size={40} className="mx-auto text-iha-blue/20 mb-4" />
          <h3 className="font-heading text-iha-teal text-lg mb-2">No facilities found</h3>
          <p className="text-sm text-iha-blue/60">
            Try selecting a different telehealth category or viewing all telehealth services.
          </p>
        </div>
      )}
    </div>
  );
}

function TelehealthCard({ facility }) {
  const phoneDigits = facility.phone.replace(/[^0-9+]/g, '');

  return (
    <div className="facility-card p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-heading text-iha-teal text-base font-bold leading-snug">
          {facility.name}
        </h3>
        <Video size={18} className="text-blue-600 shrink-0" />
      </div>

      <div className="flex items-start gap-2 text-sm text-iha-blue/70 mb-2">
        <MapPin size={14} className="mt-0.5 shrink-0 text-iha-umber" />
        <span>{facility.address}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {facility.telehealthServices.map(ts => (
          <span key={ts} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-800 rounded font-medium">
            {ts.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-iha-sand">
        <a
          href={`tel:${phoneDigits}`}
          className="flex items-center gap-1 text-sm font-semibold text-iha-orange hover:text-iha-umber transition-colors no-underline"
        >
          <PhoneCall size={14} /> Call to Enroll
        </a>
        <Link
          to={`/facility/${facility.id}`}
          className="flex items-center gap-1 text-sm font-semibold text-iha-teal hover:text-iha-orange transition-colors no-underline"
        >
          Details <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
