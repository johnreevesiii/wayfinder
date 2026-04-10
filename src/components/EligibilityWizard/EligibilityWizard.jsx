import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, CheckCircle, ExternalLink, Building, MapPin, Heart, FileCheck, HelpCircle } from 'lucide-react';
import { WIZARD_STEPS, getEligibilityResult } from '../../utils/eligibilityLogic';

const PROGRAM_ICONS = {
  'building': Building,
  'building-2': Building,
  'map-pin': MapPin,
  'heart': Heart,
  'file-check': FileCheck,
};

export default function EligibilityWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const step = WIZARD_STEPS[currentStep];
  const totalSteps = WIZARD_STEPS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [step.id]: value };
    setAnswers(newAnswers);

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (showResult) {
      setShowResult(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResult(false);
  };

  if (showResult) {
    return <ResultPanel answers={answers} onBack={handleBack} onRestart={handleRestart} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-iha-blue/60 mb-2">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-iha-sand rounded-full overflow-hidden">
          <div
            className="h-full bg-iha-orange transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white iha-card p-6 sm:p-8 shadow-md">
        <h2 className="font-heading text-iha-teal text-xl sm:text-2xl mb-6">
          {step.question}
        </h2>

        {/* Unsure help for step 1 */}
        {step.id === 'tribal_member' && (
          <p className="text-sm text-iha-blue/60 mb-4" style={{ textAlign: 'left' }}>
            Your tribal enrollment status determines which programs you can access. If you are not sure,
            that is okay; we can help you figure out your options.
          </p>
        )}

        <div className="space-y-3">
          {step.options.map(option => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className={`w-full text-left px-5 py-4 iha-card-sm border-2 transition-all flex items-center justify-between group ${
                answers[step.id] === option.value
                  ? 'border-iha-orange bg-iha-orange/5'
                  : 'border-iha-sand hover:border-iha-orange/50 hover:bg-iha-sand/50'
              }`}
            >
              <span className="text-iha-blue font-medium">{option.label}</span>
              <ChevronRight size={18} className="text-iha-blue/30 group-hover:text-iha-orange transition-colors" />
            </button>
          ))}
        </div>

        {/* Back button */}
        {currentStep > 0 && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 mt-6 text-iha-teal hover:text-iha-orange font-semibold transition-colors"
          >
            <ChevronLeft size={18} /> Previous question
          </button>
        )}
      </div>
    </div>
  );
}

function ResultPanel({ answers, onBack, onRestart }) {
  const result = getEligibilityResult(answers);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Headline */}
      <div className="bg-iha-teal text-white iha-card p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <CheckCircle size={28} className="text-iha-orange shrink-0 mt-1" />
          <div>
            <h2 className="font-heading text-iha-orange text-xl sm:text-2xl mb-3">
              {result.headline}
            </h2>
            <p className="text-white/90 text-sm leading-relaxed" style={{ textAlign: 'left' }}>
              {result.explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Programs */}
      <div className="bg-white iha-card p-6">
        <h3 className="font-heading text-iha-teal text-lg mb-4">Programs You May Access</h3>
        <div className="space-y-4">
          {result.programs.map((program, idx) => {
            const IconComp = PROGRAM_ICONS[program.icon] || Building;
            return (
              <div key={idx} className="flex items-start gap-3 p-3 bg-iha-sand iha-card-sm">
                <IconComp size={20} className="text-iha-orange shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-iha-teal text-sm">{program.name}</p>
                  <p className="text-xs text-iha-blue/70 mt-1" style={{ textAlign: 'left' }}>{program.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insurance note */}
      {result.insuranceNote && (
        <div className="bg-white iha-card p-6 border-l-4 border-iha-orange">
          <h3 className="font-heading text-iha-teal text-lg mb-2">About Your Insurance</h3>
          <p className="text-sm text-iha-blue/80 leading-relaxed" style={{ textAlign: 'left' }}>
            {result.insuranceNote}
          </p>
        </div>
      )}

      {/* What to bring */}
      {result.documents.length > 0 && (
        <div className="bg-white iha-card p-6">
          <h3 className="font-heading text-iha-teal text-lg mb-4">What to Bring to Your Visit</h3>
          <ul className="space-y-2">
            {result.documents.map((doc, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-iha-blue">
                <CheckCircle size={14} className="text-green-600 shrink-0 mt-0.5" />
                {doc}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next steps */}
      {result.nextSteps && result.nextSteps.length > 0 && (
        <div className="bg-white iha-card p-6">
          <h3 className="font-heading text-iha-teal text-lg mb-4">Next Steps</h3>
          <ol className="space-y-2 list-decimal list-inside">
            {result.nextSteps.map((step, idx) => (
              <li key={idx} className="text-sm text-iha-blue/80">{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Important note */}
      <div className="bg-iha-sand iha-card p-4">
        <div className="flex items-start gap-2">
          <HelpCircle size={16} className="text-iha-umber shrink-0 mt-0.5" />
          <p className="text-sm text-iha-blue/70" style={{ textAlign: 'left' }}>
            {result.importantNote}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 bg-iha-orange hover:bg-iha-umber text-white px-6 py-3 font-semibold iha-card-sm transition-colors no-underline"
        >
          Find Care Near Me <ChevronRight size={18} />
        </Link>
        <button
          onClick={onRestart}
          className="flex items-center gap-2 bg-white hover:bg-iha-sand text-iha-teal px-6 py-3 font-semibold iha-card-sm transition-colors border border-iha-teal/20"
        >
          Start Over
        </button>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-iha-teal hover:text-iha-orange font-semibold transition-colors"
        >
          <ChevronLeft size={18} /> Back
        </button>
      </div>
    </div>
  );
}
