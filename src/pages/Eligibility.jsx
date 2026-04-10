import EligibilityWizard from '../components/EligibilityWizard/EligibilityWizard';

export default function Eligibility() {
  return (
    <div id="main-content" className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-heading text-iha-teal text-3xl sm:text-4xl font-bold mb-4">
          Am I Eligible?
        </h1>
        <p className="text-iha-blue/70 text-base max-w-2xl mx-auto" style={{ textAlign: 'center' }}>
          Answer a few simple questions to learn about your eligibility for IHS, tribal,
          and urban Indian health services. This takes about one minute.
        </p>
      </div>

      <EligibilityWizard />

      {/* FAQ */}
      <div className="mt-12 iha-divider-light pt-8">
        <h2 className="font-heading text-iha-teal text-2xl text-center mb-6">Common Questions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FaqCard
            question="What is IHS?"
            answer="The Indian Health Service (IHS) is a federal agency that provides healthcare to American Indians and Alaska Natives. It operates hospitals, clinics, and health stations across the country."
          />
          <FaqCard
            question="What is a 638 program?"
            answer="A '638 program' is a tribal health program operated by the tribe itself under a contract or compact with the federal government, authorized by Public Law 93-638. These programs are run by tribes rather than by IHS directly."
          />
          <FaqCard
            question="Do I need to live on a reservation?"
            answer="No. While many IHS facilities are on or near reservations, urban Indian health programs serve Native people in cities. Community health centers (FQHCs) serve everyone regardless of where they live or tribal status."
          />
          <FaqCard
            question="Do I need insurance?"
            answer="No. Eligible individuals can receive care at IHS and tribal facilities without insurance. However, if you do have insurance (Medicaid, Medicare, private, or VA), it can be billed first, which helps bring more funding to the facility."
          />
          <FaqCard
            question="What is PRC/PRCDA?"
            answer="Purchased/Referred Care (PRC) is a program that helps cover the cost of specialty care from non-IHS providers when services are not available at your local IHS or tribal facility. A PRCDA (Purchased/Referred Care Delivery Area) is the geographic area where you must live to be eligible."
          />
          <FaqCard
            question="I am a descendant but not enrolled. Can I get services?"
            answer="It depends on the program. Some urban Indian health programs and tribal programs serve descendants and community members. Community health centers serve everyone. Contact the specific facility to ask about their eligibility requirements."
          />
        </div>
      </div>
    </div>
  );
}

function FaqCard({ question, answer }) {
  return (
    <div className="bg-white iha-card p-5 shadow-sm">
      <h3 className="font-heading text-iha-teal text-base mb-2">{question}</h3>
      <p className="text-sm text-iha-blue/70 leading-relaxed" style={{ textAlign: 'left' }}>
        {answer}
      </p>
    </div>
  );
}
