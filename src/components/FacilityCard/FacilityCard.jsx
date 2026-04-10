import { MapPin, Phone, Clock, Wifi, Leaf, Globe, ChevronRight } from 'lucide-react';
import { formatDistance } from '../../utils/distanceCalc';
import ServiceIcon from './ServiceIcon';

const TYPE_STYLES = {
  ihs_direct: { label: 'IHS Direct', bg: 'bg-iha-teal', text: 'text-white' },
  tribal_638: { label: 'Tribal 638', bg: 'bg-iha-orange', text: 'text-white' },
  urban_indian: { label: 'Urban Indian', bg: 'bg-iha-brown', text: 'text-white' },
  fqhc: { label: 'FQHC', bg: 'bg-iha-umber', text: 'text-white' },
};

const PATIENT_STATUS = {
  yes: { label: 'Accepting patients', color: 'bg-green-500' },
  call_to_confirm: { label: 'Call to confirm', color: 'bg-yellow-500' },
  no: { label: 'Not accepting', color: 'bg-red-500' },
};

export default function FacilityCard({ facility, isSelected, onClick, onViewDetails }) {
  const typeStyle = TYPE_STYLES[facility.type] || TYPE_STYLES.ihs_direct;
  const patientStatus = PATIENT_STATUS[facility.acceptingNewPatients] || PATIENT_STATUS.call_to_confirm;
  const dist = formatDistance(facility.distance);

  return (
    <article
      className={`facility-card p-4 cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-iha-orange shadow-lg' : 'shadow-sm'
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      aria-label={`${facility.name}, ${typeStyle.label} facility${dist ? `, ${dist} away` : ''}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${typeStyle.bg} ${typeStyle.text}`}>
              {typeStyle.label}
            </span>
            {facility.telehealth && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                <Wifi size={10} /> Telehealth
              </span>
            )}
            {facility.prcEligible && (
              <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-green-100 text-green-800">
                PRC Eligible
              </span>
            )}
          </div>
          <h3 className="font-heading text-iha-teal text-base font-bold leading-snug">
            {facility.name}
          </h3>
        </div>
        {dist && (
          <span className="text-sm font-semibold text-iha-umber whitespace-nowrap">
            {dist}
          </span>
        )}
      </div>

      {/* Address + phone */}
      <div className="space-y-1 mb-3">
        <div className="flex items-start gap-2 text-sm text-iha-blue/80">
          <MapPin size={14} className="mt-0.5 shrink-0 text-iha-umber" />
          <span>{facility.address}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-iha-blue/80">
          <Phone size={14} className="shrink-0 text-iha-umber" />
          <a
            href={`tel:${facility.phone.replace(/[^0-9+]/g, '')}`}
            className="text-iha-teal hover:text-iha-orange no-underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {facility.phone}
          </a>
        </div>
      </div>

      {/* Services icons */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {facility.services.slice(0, 7).map(svc => (
          <ServiceIcon key={svc} serviceKey={svc} size="sm" />
        ))}
        {facility.services.length > 7 && (
          <span className="text-xs text-iha-blue/50 self-center ml-1">
            +{facility.services.length - 7} more
          </span>
        )}
      </div>

      {/* Cultural services */}
      {facility.culturalServices && facility.culturalServices.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3">
          <Leaf size={12} className="text-green-700" />
          <span className="text-xs text-green-800 font-medium">
            {facility.culturalServices.map(cs =>
              cs.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            ).join(', ')}
          </span>
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between pt-2 border-t border-iha-sand">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${patientStatus.color}`} />
          <span className="text-xs text-iha-blue/70">{patientStatus.label}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onViewDetails(facility.id); }}
          className="flex items-center gap-1 text-sm font-semibold text-iha-orange hover:text-iha-umber transition-colors"
          aria-label={`View details for ${facility.name}`}
        >
          Details <ChevronRight size={16} />
        </button>
      </div>
    </article>
  );
}
