import { FILTER_CHIPS } from '../../utils/searchParser';

export default function ServiceChips({ activeFilters, onToggle }) {
  return (
    <div className="flex gap-2 flex-nowrap sm:flex-wrap overflow-x-auto pb-2 sm:pb-0 scrollbar-hide" role="group" aria-label="Filter by service type">
      {FILTER_CHIPS.map(chip => {
        const isActive = chip.key === 'all'
          ? activeFilters.length === 0
          : activeFilters.includes(chip.key);

        return (
          <button
            key={chip.key}
            onClick={() => onToggle(chip.key)}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all iha-card-sm whitespace-nowrap shrink-0 sm:shrink ${
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
