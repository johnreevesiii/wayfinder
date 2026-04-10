import { ExternalLink, Database, Heart, Users, Shield } from 'lucide-react';

export default function About() {
  return (
    <div id="main-content" className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-10">
        <h1 className="font-heading text-iha-teal text-3xl sm:text-4xl font-bold mb-4">
          About WayFinder
        </h1>
        <p className="text-iha-blue/70 text-lg max-w-2xl mx-auto" style={{ textAlign: 'center' }}>
          Tribal Health WayFinder
        </p>
      </div>

      {/* Mission */}
      <section className="bg-iha-teal text-white iha-card p-6 sm:p-8 mb-8">
        <div className="flex items-start gap-4">
          <Heart size={32} className="text-iha-orange shrink-0 mt-1" />
          <div>
            <h2 className="font-heading text-iha-orange text-2xl mb-3">Our Purpose</h2>
            <p className="text-white/90 leading-relaxed" style={{ textAlign: 'left' }}>
              WayFinder was built to make finding healthcare easier for American Indian and Alaska Native
              communities. The current tools available for locating IHS, tribal, and urban Indian
              health services are fragmented, outdated, and hard to use. WayFinder brings them together
              into a single, mobile-friendly search that any community member can use.
            </p>
          </div>
        </div>
      </section>

      {/* What makes WayFinder different */}
      <section className="mb-8">
        <h2 className="font-heading text-iha-teal text-2xl mb-6">What Makes WayFinder Different</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DiffCard
            icon={<Users size={24} className="text-iha-orange" />}
            title="Built for Community"
            description="Every feature was designed with Native community members in mind, not bureaucrats. Plain language, no jargon, and written at a reading level that is accessible to everyone."
          />
          <DiffCard
            icon={<Database size={24} className="text-iha-orange" />}
            title="All Programs, One Search"
            description="IHS direct service, tribal 638 programs, urban Indian health centers, and FQHCs serving Native communities: all searchable from one place for the first time."
          />
          <DiffCard
            icon={<Shield size={24} className="text-iha-orange" />}
            title="PRC/PRCDA Boundaries"
            description="The first public tool to show Purchased/Referred Care Delivery Area boundaries on a map, helping community members understand their referral eligibility."
          />
          <DiffCard
            icon={<Heart size={24} className="text-iha-orange" />}
            title="Health Equity Context"
            description="Each facility profile includes data on health disparities in that IHS Area, connecting individual care access to the bigger picture of community health."
          />
        </div>
      </section>

      <div className="iha-divider-light mb-8" />

      {/* Data Sources */}
      <section className="mb-8">
        <h2 className="font-heading text-iha-teal text-2xl mb-6">
          <Database size={24} className="inline mr-2 text-iha-umber" />
          Data Sources
        </h2>
        <div className="space-y-4">
          <DataSource
            name="IHS Facility Data"
            description="Facility names, locations, types, and service information from the Indian Health Service public facility directory."
            url="https://www.ihs.gov/findhealthcare/"
          />
          <DataSource
            name="HRSA Health Center Data"
            description="Federally Qualified Health Centers (FQHCs) and look-alikes serving areas with significant AI/AN populations, from HRSA's Health Center Program."
            url="https://findahealthcenter.hrsa.gov/"
          />
          <DataSource
            name="Urban Indian Health Directory"
            description="Urban Indian health programs from the National Council of Urban Indian Health (NCUIH) and IHS urban programs directory."
            url="https://www.ncuih.org/"
          />
          <DataSource
            name="PRCDA Federal Register Notices"
            description="Purchased/Referred Care Delivery Area boundaries from published Federal Register notices and IHS area office data."
            url="https://www.ihs.gov/prc/"
          />
          <DataSource
            name="Health Equity Data"
            description="Area-level health indicators from IHS GPRA (Government Performance and Results Act) reports, CDC health data, and HRSA shortage area designations."
            url="https://www.ihs.gov/quality/"
          />
        </div>
      </section>

      <div className="iha-divider-light mb-8" />

      {/* Disclaimer */}
      <section className="bg-iha-sand iha-card p-6 mb-8">
        <h2 className="font-heading text-iha-teal text-xl mb-3">Important Disclaimer</h2>
        <p className="text-sm text-iha-blue/80 leading-relaxed" style={{ textAlign: 'left' }}>
          WayFinder is developed by Indigenous Healthcare Advancements to support community health access.
          <strong> This is not an official IHS tool</strong> and is not affiliated with, endorsed by,
          or funded by the Indian Health Service or the U.S. Department of Health and Human Services.
        </p>
        <p className="text-sm text-iha-blue/80 leading-relaxed mt-3" style={{ textAlign: 'left' }}>
          Facility information is compiled from publicly available data sources and may not reflect
          the most current hours, services, or availability. Always contact facilities directly to
          confirm information before your visit. Eligibility determinations are general guidance only
          and do not constitute a guarantee of services.
        </p>
      </section>

      {/* IHA Link */}
      <section className="text-center">
        <p className="text-sm text-iha-blue/60 mb-2">Developed by</p>
        <h3 className="font-heading text-iha-teal text-xl mb-4">Indigenous Healthcare Advancements</h3>
        <p className="text-sm text-iha-blue/70 max-w-lg mx-auto mb-6" style={{ textAlign: 'center' }}>
          Building technology to strengthen healthcare infrastructure in Indian Country.
          Explore our full Tribal Health Equity Dashboard for deep community health analytics.
        </p>
        <a
          href="https://indigenous.health"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-iha-orange hover:bg-iha-umber text-white px-6 py-3 font-semibold iha-card-sm transition-colors no-underline"
        >
          Visit indigenous.health <ExternalLink size={16} />
        </a>
      </section>
    </div>
  );
}

function DiffCard({ icon, title, description }) {
  return (
    <div className="bg-white iha-card p-5 shadow-sm">
      <div className="mb-3">{icon}</div>
      <h3 className="font-heading text-iha-teal text-base mb-2">{title}</h3>
      <p className="text-sm text-iha-blue/70 leading-relaxed" style={{ textAlign: 'left' }}>{description}</p>
    </div>
  );
}

function DataSource({ name, description, url }) {
  return (
    <div className="bg-white iha-card p-4 border-l-4 border-iha-orange">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-iha-teal text-sm">{name}</h3>
          <p className="text-xs text-iha-blue/70 mt-1" style={{ textAlign: 'left' }}>{description}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-iha-orange hover:text-iha-umber shrink-0"
          aria-label={`Visit ${name} source`}
        >
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
}
