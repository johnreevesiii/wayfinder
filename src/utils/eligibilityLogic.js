/**
 * Eligibility wizard logic.
 * Returns personalized guidance based on user responses.
 */

export const WIZARD_STEPS = [
  {
    id: 'tribal_member',
    question: 'Are you a member of a federally recognized tribe?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'unsure', label: "I'm not sure" },
    ],
    helpText: null,
  },
  {
    id: 'location',
    question: 'Where do you live in relation to Indian health services?',
    options: [
      { value: 'on_reservation', label: 'On a reservation' },
      { value: 'near_reservation', label: 'Near a reservation' },
      { value: 'urban', label: 'In an urban area' },
      { value: 'unsure', label: "I'm not sure" },
    ],
    helpText: null,
  },
  {
    id: 'insurance',
    question: 'Do you currently have health insurance?',
    options: [
      { value: 'medicaid', label: 'Yes, Medicaid' },
      { value: 'medicare', label: 'Yes, Medicare' },
      { value: 'private', label: 'Yes, private insurance' },
      { value: 'va', label: 'Yes, VA benefits' },
      { value: 'none', label: 'No insurance' },
      { value: 'unsure', label: "I'm not sure" },
    ],
    helpText: null,
  },
];

export function getEligibilityResult(answers) {
  const { tribal_member, location, insurance } = answers;

  const result = {
    headline: '',
    explanation: '',
    programs: [],
    documents: [],
    insuranceNote: '',
    nextSteps: [],
    importantNote: 'Eligibility can vary by program and location. Contact the facility directly to confirm your eligibility before your visit.',
  };

  // Enrolled tribal member
  if (tribal_member === 'yes') {
    result.headline = 'You are likely eligible for IHS, tribal, and urban Indian health services.';

    if (location === 'on_reservation' || location === 'near_reservation') {
      result.explanation = 'As an enrolled tribal member living on or near a reservation, you have the broadest access to Indian health services. You can receive care at IHS facilities, tribal health programs (638 programs), and urban Indian health centers.';
      result.programs = [
        { name: 'IHS Direct Service', description: 'Healthcare facilities operated directly by the Indian Health Service', icon: 'building' },
        { name: 'Tribal 638 Programs', description: 'Health programs operated by your tribe under a contract or compact with the federal government', icon: 'building-2' },
        { name: 'Purchased/Referred Care (PRC)', description: 'If your provider refers you to a specialist, some costs may be covered through the PRC program if you live within a PRCDA', icon: 'file-check' },
        { name: 'Urban Indian Health Programs', description: 'Health centers in urban areas that serve Native people', icon: 'map-pin' },
      ];
    } else if (location === 'urban') {
      result.explanation = 'As an enrolled tribal member living in an urban area, you can access care through urban Indian health programs. You may also be able to receive care at IHS or tribal facilities when visiting reservation areas.';
      result.programs = [
        { name: 'Urban Indian Health Programs', description: 'Health centers in cities across the country that serve Native people, including enrolled members and descendants', icon: 'map-pin' },
        { name: 'IHS/Tribal Facilities', description: 'You can still receive care at IHS or tribal facilities when visiting reservation areas', icon: 'building' },
      ];
    } else {
      result.explanation = 'As an enrolled tribal member, you have access to Indian health services regardless of where you live. The specific programs available depend on your location.';
      result.programs = [
        { name: 'IHS Direct Service', description: 'Healthcare facilities operated by IHS', icon: 'building' },
        { name: 'Tribal 638 Programs', description: 'Health programs operated by tribes', icon: 'building-2' },
        { name: 'Urban Indian Health Programs', description: 'Health centers in urban areas serving Native people', icon: 'map-pin' },
      ];
    }

    result.documents = [
      'Tribal enrollment card or Certificate of Indian Blood (CIB)',
      'Photo ID (driver\'s license, state ID, or passport)',
      'Proof of residence (utility bill, lease, or mail with your address)',
      'Insurance cards (if you have any coverage)',
    ];

  // Not enrolled but may be a descendant
  } else if (tribal_member === 'no') {
    result.headline = 'You may still be eligible for some services, especially urban Indian health programs.';
    result.explanation = 'Even if you are not an enrolled tribal member, some programs serve Native descendants and community members. Urban Indian health programs often have more flexible eligibility. Community health centers (FQHCs) serve everyone regardless of tribal status, and many have experience serving Native communities.';
    result.programs = [
      { name: 'Urban Indian Health Programs', description: 'Many urban Indian health centers serve descendants and community members, not just enrolled tribal members. Contact them to ask about eligibility.', icon: 'map-pin' },
      { name: 'Community Health Centers (FQHCs)', description: 'Federally Qualified Health Centers serve everyone on a sliding fee scale based on income, regardless of tribal membership', icon: 'heart' },
    ];
    result.documents = [
      'Photo ID',
      'Proof of income (for sliding fee programs)',
      'Any documentation of Native ancestry (optional, but may help)',
      'Insurance cards (if you have any coverage)',
    ];
    result.nextSteps = [
      'Contact your nearest urban Indian health program to ask about their eligibility requirements',
      'Look into community health centers (FQHCs) near you for affordable primary care',
      'If you think you may qualify for tribal enrollment, contact the enrollment office of the tribe your family is connected to',
    ];

  // Unsure about enrollment
  } else {
    result.headline = 'Let\'s help you figure out your options.';
    result.explanation = 'If you are not sure about your tribal enrollment status, there are ways to find out. In the meantime, some programs may be able to serve you while you explore your eligibility.';
    result.programs = [
      { name: 'Urban Indian Health Programs', description: 'A good first step: many urban Indian health centers can help you navigate the system and may serve you while your enrollment status is being determined', icon: 'map-pin' },
      { name: 'Community Health Centers', description: 'FQHCs serve everyone regardless of tribal membership, with fees based on your ability to pay', icon: 'heart' },
    ];
    result.documents = [
      'Photo ID',
      'Any family records or documents related to tribal heritage',
    ];
    result.nextSteps = [
      'Contact the Bureau of Indian Affairs (BIA) to learn about tribal enrollment verification: 1-800-245-6340',
      'If you know which tribe your family is connected to, contact their enrollment office directly',
      'Visit your nearest urban Indian health program, as staff can often help you navigate the enrollment process',
    ];
  }

  // Insurance note
  if (insurance === 'medicaid' || insurance === 'medicare' || insurance === 'private' || insurance === 'va') {
    const insuranceName = {
      medicaid: 'Medicaid',
      medicare: 'Medicare',
      private: 'private insurance',
      va: 'VA benefits',
    }[insurance];
    result.insuranceNote = `Great news: since you have ${insuranceName}, your insurance can be billed first when you receive care at an IHS or tribal facility. This actually helps the whole community because it brings additional funding to these programs. IHS and tribal programs are often the payer of last resort, meaning they cover costs that your insurance does not.`;
  } else if (insurance === 'none') {
    result.insuranceNote = 'If you are eligible for IHS or tribal services, you can receive care without insurance. You may also qualify for Medicaid or marketplace coverage. Staff at your local facility can help you explore your insurance options.';
  } else {
    result.insuranceNote = 'Staff at your local health facility can help you figure out what insurance options may be available to you, including Medicaid, Medicare, or marketplace plans.';
  }

  return result;
}
