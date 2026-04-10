import { FILTER_CHIPS } from '../../utils/searchParser';

export default function ServiceChips({ activeFilters, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by service type">
      {FILTER_CHIPS.map(chip => {
        const isActive = chip.key === 'all'
          ? activeFilters.length === 0
          : activeFilters.includes(chip.key);

        return (
          <button
            key={chip.key}
            onClick={() => onToggle(chip.key)}
            className={`px-4 py-2 text-sm font-semibold transition-all iha-card-sm ${
              isActive
                ? 'bg-iha-teal text-white shadow-md'
                : 'bg-white text-iha-blue hover:bg-iha-teal/10 border border-iha-teal/20'
            }`}
            aria-pressed={isActive}
            role="button"
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
