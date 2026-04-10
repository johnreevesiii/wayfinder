import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Phone, Globe, Clock, Shield, Leaf, Wifi,
  Navigation, PhoneCall, ExternalLink, Info, ChevronRight
} from 'lucide-react';
import facilities from '../../data/facilities.json';
import areaMetrics from '../../data/area-metrics.json';
import ServiceIcon from '../FacilityCard/ServiceIcon';

const TYPE_LABELS = {
  ihs_direct: 'IHS Direct Service',
  tribal_638: 'Tribal 638 Program',
  urban_indian: 'Urban Indian Health Program',
  fqhc: 'Federally Qualified Health Center',
};

const TYPE_DESCRIPTIONS = {
  ihs_direct: 'This facility is operated directly by the Indian Health Service, a federal agency within the U.S. Department of Health and Human Services.',
  tribal_638: 'This facility is operated by the tribe itself under a self-determination contract or self-governance compact with the federal government (under P.L. 93-638).',
  urban_indian: 'This is an urban Indian health program that provides healthcare to American Indians and Alaska Natives living in urban areas.',
  fqhc: 'This is a Federally Qualified Health Center that serves the community, including AI/AN patients, with fees based on ability to pay.',
};

const INSURANCE_LABELS = {
  ihs: 'IHS Benefits',
  medicaid: 'Medicaid',
  medicare: 'Medicare',
  private: 'Private Insurance',
  va: 'VA Benefits',
};

export default function FacilityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const facility = facilities.find(f => f.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!facility) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-heading text-iha-teal text-2xl mb-4">Facility Not Found</h2>
        <p className="text-iha-blue/70 mb-6">We could not find the facility you are looking for.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-iha-orange text-white px-6 py-3 font-semibold iha-card-sm hover:bg-iha-umber transition-colors"
        >
          Back to Search
        </button>
      </div>
    );
  }

  const area = areaMetrics[facility.ihsArea];
  const national = areaMetrics._national;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(facility.address)}`;
  const phoneDigits = facility.phone.replace(/[^0-9+]/g, '');

  return (
    <div className="max-w-4xl mx-auto px-4 py-6" id="main-content">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-iha-teal hover:text-iha-orange font-semibold mb-4 transition-colors"
        aria-label="Go back to previous page"
      >
        <ArrowLeft size={18} /> Back to results
      </button>

      {/* Header card */}
      <div className="bg-iha-teal text-white iha-card p-6 sm:p-8 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="inline-block px-3 py-1 text-sm font-bold rounded bg-iha-orange text-white mb-3">
              {TYPE_LABELS[facility.type]}
            </span>
            <h1 className="font-heading text-iha-orange text-2xl sm:text-3xl font-bold mb-2">
              {facility.name}
            </h1>
            <p className="text-white/80 text-sm mb-4">
              {TYPE_DESCRIPTIONS[facility.type]}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0 text-iha-orange" />
            <span className="text-sm">{facility.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} className="shrink-0 text-iha-orange" />
            <a href={`tel:${phoneDigits}`} className="text-sm text-white hover:text-iha-orange no-underline">
              {facility.phone}
            </a>
          </div>
          {facility.website && (
            <div className="flex items-center gap-2">
              <Globe size={16} className="shrink-0 text-iha-orange" />
              <a
                href={facility.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white hover:text-iha-orange no-underline flex items-center gap-1"
              >
                Visit website <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <a
            href={`tel:${phoneDigits}`}
            className="flex items-center gap-2 bg-iha-orange hover:bg-iha-umber text-white px-5 py-3 font-semibold iha-card-sm transition-colors no-underline"
          >
            <PhoneCall size={18} /> Call This Facility
          </a>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 font-semibold iha-card-sm transition-colors no-underline"
          >
            <Navigation size={18} /> Get Directions
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Services */}
          <section className="bg-white iha-card p-6">
            <h2 className="font-heading text-iha-teal text-xl mb-4">Services Available</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {facility.services.map(svc => (
                <ServiceIcon key={svc} serviceKey={svc} size="md" />
              ))}
            </div>
          </section>

          {/* Hours */}
          {facility.hours && Object.keys(facility.hours).length > 0 && (
            <section className="bg-white iha-card p-6">
              <h2 className="font-heading text-iha-teal text-xl mb-4">
                <Clock size={20} className="inline mr-2 text-iha-umber" />
                Hours of Operation
              </h2>
              <dl className="space-y-2">
                {Object.entries(facility.hours).map(([dept, hours]) => (
                  <div key={dept} className="flex justify-between items-center py-1 border-b border-iha-sand last:border-0">
                    <dt className="text-sm font-semibold text-iha-blue capitalize">
                      {dept.replace(/_/g, ' ')}
                    </dt>
                    <dd className="text-sm text-iha-blue/70">{hours}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Telehealth */}
          {facility.telehealth && facility.telehealthServices && (
            <section className="bg-white iha-card p-6">
              <h2 className="font-heading text-iha-teal text-xl mb-4">
                <Wifi size={20} className="inline mr-2 text-iha-umber" />
                Telehealth Services
              </h2>
              <p className="text-sm text-iha-blue/80 mb-3">
                This facility offers virtual care options. Contact them to learn how to schedule a telehealth visit.
              </p>
              <div className="flex flex-wrap gap-2">
                {facility.telehealthServices.map(ts => (
                  <span key={ts} className="px-3 py-1 text-sm bg-blue-50 text-blue-800 rounded font-medium">
                    {ts.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Cultural Services */}
          {facility.culturalServices && facility.culturalServices.length > 0 && (
            <section className="bg-white iha-card p-6">
              <h2 className="font-heading text-iha-teal text-xl mb-4">
                <Leaf size={20} className="inline mr-2 text-green-700" />
                Cultural Care
              </h2>
              <div className="space-y-2">
                {facility.culturalServices.map(cs => (
                  <div key={cs} className="flex items-center gap-2 text-sm text-iha-blue">
                    <Leaf size={14} className="text-green-700" />
                    {cs.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Health Equity Snapshot */}
          {area && (
            <section className="bg-white iha-card p-6">
              <h2 className="font-heading text-iha-teal text-xl mb-4">
                <Info size={20} className="inline mr-2 text-iha-umber" />
                Health Equity Snapshot
              </h2>
              <p className="text-sm text-iha-blue/80 mb-4">
                This facility is in the {area.name}, where health indicators show significant
                disparities compared to national averages.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricCard
                  label="Diabetes Prevalence"
                  value={`${area.diabetesPrevalence}%`}
                  national={`${national.diabetesPrevalence}%`}
                  worse={area.diabetesPrevalence > national.diabetesPrevalence}
                />
                <MetricCard
                  label="BH Providers per 100K"
                  value={area.bhProviderRatio}
                  national={national.bhProviderRatio}
                  worse={area.bhProviderRatio < national.bhProviderRatio}
                />
                <MetricCard
                  label="PCP per 100K"
                  value={area.pcpRatio}
                  national={national.pcpRatio}
                  worse={area.pcpRatio < national.pcpRatio}
                />
                <MetricCard
                  label="Uninsured Rate"
                  value={`${area.uninsuredRate}%`}
                  national={`${national.uninsuredRate}%`}
                  worse={area.uninsuredRate > national.uninsuredRate}
                />
              </div>
              <p className="text-xs text-iha-blue/50 mt-4">
                Data from IHS GPRA reports and CDC sources. {area.name} serves approximately {area.populationServed?.toLocaleString()} AI/AN individuals.
              </p>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Insurance */}
          <section className="bg-white iha-card p-6">
            <h2 className="font-heading text-iha-teal text-lg mb-3">
              <Shield size={18} className="inline mr-2 text-iha-umber" />
              Insurance Accepted
            </h2>
            <ul className="space-y-1">
              {facility.insuranceAccepted?.map(ins => (
                <li key={ins} className="text-sm text-iha-blue flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-iha-orange" />
                  {INSURANCE_LABELS[ins] || ins}
                </li>
              ))}
            </ul>
          </section>

          {/* PRC/PRCDA */}
          {facility.prcEligible && (
            <section className="bg-white iha-card p-6 border-l-4 border-green-600">
              <h2 className="font-heading text-iha-teal text-lg mb-3">PRC Eligible</h2>
              <p className="text-sm text-iha-blue/80">
                {facility.prcdaName
                  ? `This facility is within the ${facility.prcdaName}. If you live within this area and are referred by your IHS or tribal provider, some specialty care costs may be covered through the Purchased/Referred Care program.`
                  : 'This facility participates in the Purchased/Referred Care (PRC) program. Contact the facility for details about referral requirements.'}
              </p>
              <div className="mt-3 p-3 bg-green-50 rounded text-xs text-green-800">
                <strong>What is PRC?</strong> Purchased/Referred Care (formerly Contract Health Services) helps cover the cost of healthcare services from non-IHS providers when those services are not available at your IHS or tribal facility.
              </div>
            </section>
          )}

          {/* Data source */}
          <section className="bg-iha-sand iha-card-sm p-4">
            <p className="text-xs text-iha-blue/50">
              <strong>Data source:</strong> {facility.dataSource}
              {facility.dataSourceNotes && <><br />{facility.dataSourceNotes}</>}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, national, worse }) {
  return (
    <div className="p-3 bg-iha-sand iha-card-sm">
      <p className="text-xs text-iha-blue/60 mb-1">{label}</p>
      <p className={`text-lg font-bold ${worse ? 'text-red-700' : 'text-green-700'}`}>
        {value}
      </p>
      <p className="text-xs text-iha-blue/50">National avg: {national}</p>
    </div>
  );
}
