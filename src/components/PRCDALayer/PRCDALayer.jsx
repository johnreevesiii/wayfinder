import { Layers, Info } from 'lucide-react';

export default function PRCDAToggle({ visible, onToggle }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold iha-card-sm transition-all ${
          visible
            ? 'bg-iha-teal text-white shadow-md'
            : 'bg-white text-iha-blue border border-iha-teal/20 hover:bg-iha-teal/5'
        }`}
        aria-pressed={visible}
        title="Toggle Purchased/Referred Care Delivery Area boundaries on the map"
      >
        <Layers size={16} />
        PRCDA Boundaries
      </button>

      <div className="relative group">
        <button
          className="p-1 text-iha-blue/40 hover:text-iha-blue transition-colors"
          aria-label="What is a PRCDA?"
        >
          <Info size={16} />
        </button>
        <div className="absolute bottom-full right-0 mb-2 w-64 sm:w-72 p-3 bg-white shadow-lg rounded-lg text-xs text-iha-blue/80 invisible group-hover:visible group-focus-within:visible z-50 border border-iha-sand">
          <strong className="text-iha-teal block mb-1">Purchased/Referred Care Delivery Area (PRCDA)</strong>
          <p style={{ textAlign: 'left' }}>
            A PRCDA is a geographic area around an IHS or tribal facility. If you live within a PRCDA
            and are referred by your IHS or tribal provider for specialty care that is not available
            at the local facility, some of those costs may be covered through the PRC program.
          </p>
        </div>
      </div>
    </div>
  );
}
