import {
  Stethoscope, Heart, Brain, Pill, Video, Leaf, Baby, FlaskConical,
  Scan, Siren, Eye, Accessibility, Apple, Users, HeartHandshake
} from 'lucide-react';

const ICON_MAP = {
  primary_care: { Icon: Stethoscope, label: 'Primary Care' },
  dental: { Icon: Heart, label: 'Dental' },
  behavioral_health: { Icon: Brain, label: 'Behavioral Health' },
  pharmacy: { Icon: Pill, label: 'Pharmacy' },
  telehealth: { Icon: Video, label: 'Telehealth' },
  traditional_healing: { Icon: Leaf, label: 'Traditional Healing' },
  substance_abuse: { Icon: HeartHandshake, label: 'Substance Abuse Treatment' },
  prenatal: { Icon: Baby, label: 'Prenatal / OB' },
  lab: { Icon: FlaskConical, label: 'Laboratory' },
  radiology: { Icon: Scan, label: 'Radiology' },
  emergency: { Icon: Siren, label: 'Emergency' },
  optometry: { Icon: Eye, label: 'Eye Care' },
  physical_therapy: { Icon: Accessibility, label: 'Physical Therapy' },
  nutrition: { Icon: Apple, label: 'Nutrition' },
  community_health: { Icon: Users, label: 'Community Health' },
};

export default function ServiceIcon({ serviceKey, size = 'sm' }) {
  const entry = ICON_MAP[serviceKey];
  if (!entry) return null;

  const { Icon, label } = entry;
  const px = size === 'sm' ? 12 : size === 'md' ? 16 : 20;

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-iha-sand text-iha-blue/70"
      title={label}
      aria-label={label}
    >
      <Icon size={px} />
      {size !== 'sm' && <span className="text-xs">{label}</span>}
    </span>
  );
}
