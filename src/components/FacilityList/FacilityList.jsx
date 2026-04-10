import FacilityCard from '../FacilityCard/FacilityCard';

export default function FacilityList({ facilities, selectedId, onSelectFacility, onViewDetails }) {
  if (facilities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-iha-sand flex items-center justify-center mb-4">
          <span className="text-2xl">🏥</span>
        </div>
        <h3 className="font-heading text-iha-teal text-lg mb-2">No facilities found</h3>
        <p className="text-sm text-iha-blue/60 max-w-xs" style={{ textAlign: 'center' }}>
          Try adjusting your search terms, removing filters, or searching a different location. You can also try using your current location.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4" role="list" aria-label={`${facilities.length} healthcare facilities`}>
      <p className="text-sm text-iha-blue/60 px-1">
        Showing {facilities.length} {facilities.length === 1 ? 'facility' : 'facilities'}
      </p>
      {facilities.map(facility => (
        <div key={facility.id} role="listitem">
          <FacilityCard
            facility={facility}
            isSelected={facility.id === selectedId}
            onClick={() => onSelectFacility(facility.id)}
            onViewDetails={onViewDetails}
          />
        </div>
      ))}
    </div>
  );
}
