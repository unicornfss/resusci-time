import {
  AIRWAY_OPTIONS,
  BREATHING_OPTIONS,
  CIRCULATION_OPTIONS,
  getInterventionCategoryLabel,
  getSavedOthersForCategory,
  INTERVENTION_OPTIONS,
  MEDICATION_SIMPLE_OPTIONS,
  SODIUM_CHLORIDE_OPTIONS,
  type InterventionId,
  type InterventionSubStep,
  type OtherInterventionCategory,
  type SavedOtherIntervention,
  type VascularAccessStep,
} from '../interventions'
import { serviceConfig } from '../config'
import { InterventionOtherForm } from './InterventionOtherForm'
import { VascularAccessFlow } from './VascularAccessFlow'

interface InterventionsPanelProps {
  step: 'list' | InterventionId
  subStep: InterventionSubStep
  vascularAccessStep: VascularAccessStep
  otherDraft: string
  savedOthers: SavedOtherIntervention[]
  onSelectIntervention: (id: InterventionId) => void
  onSubStepChange: (subStep: InterventionSubStep) => void
  onOtherDraftChange: (value: string) => void
  onVascularAccessStepChange: (step: VascularAccessStep) => void
  onLogAirway: (option: string) => void
  onLogBreathing: (option: (typeof BREATHING_OPTIONS)[number]) => void
  onLogCirculation: (option: (typeof CIRCULATION_OPTIONS)[number]) => void
  onLogSodiumChloride: (variant: (typeof SODIUM_CHLORIDE_OPTIONS)[number]) => void
  onLogMedication: (label: string) => void
  onLogOther: (category: OtherInterventionCategory, label: string) => void
  onVascularAccessComplete: (logText: string) => void
  onBack: () => void
}

function OptionButtons({
  options,
  savedLabels,
  onSelect,
  onOther,
}: {
  options: readonly string[]
  savedLabels: string[]
  onSelect: (option: string) => void
  onOther: () => void
}) {
  return (
    <div className="intervention-options">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className="btn btn-secondary btn-lg btn-touch intervention-option"
          onClick={() => onSelect(option)}
        >
          {option}
        </button>
      ))}
      {savedLabels.map((label) => (
        <button
          key={`saved-${label}`}
          type="button"
          className="btn btn-secondary btn-lg btn-touch intervention-option intervention-option-saved"
          onClick={() => onSelect(label)}
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        className="btn btn-secondary btn-lg btn-touch intervention-option intervention-option-other"
        onClick={onOther}
      >
        Other
      </button>
    </div>
  )
}

export function InterventionsPanel({
  step,
  subStep,
  vascularAccessStep,
  otherDraft,
  savedOthers,
  onSelectIntervention,
  onSubStepChange,
  onOtherDraftChange,
  onVascularAccessStepChange,
  onLogAirway,
  onLogBreathing,
  onLogCirculation,
  onLogSodiumChloride,
  onLogMedication,
  onLogOther,
  onVascularAccessComplete,
  onBack,
}: InterventionsPanelProps) {
  if (step === 'list') {
    return (
      <div className="interventions-panel">
        <p className="interventions-title">Interventions</p>
        <div className="interventions-list">
          {INTERVENTION_OPTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className="btn btn-secondary btn-lg btn-touch intervention-option"
              onClick={() => onSelectIntervention(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-secondary btn-touch" onClick={onBack}>
          Close
        </button>
      </div>
    )
  }

  if (step === 'vascular-access') {
    return (
      <div className="interventions-panel">
        <p className="interventions-title">Vascular access</p>
        <VascularAccessFlow
          step={vascularAccessStep}
          onStepChange={onVascularAccessStepChange}
          onComplete={onVascularAccessComplete}
          onCancel={() => onVascularAccessStepChange('route')}
          showPrompt={false}
        />
        <button type="button" className="btn btn-touch intervention-back-btn" onClick={onBack}>
          Back
        </button>
      </div>
    )
  }

  const categoryLabel = getInterventionCategoryLabel(step)
  const otherCategory = step as OtherInterventionCategory

  if (subStep === 'other') {
    return (
      <div className="interventions-panel">
        <p className="interventions-title">{categoryLabel} — Other</p>
        <InterventionOtherForm
          value={otherDraft}
          onChange={onOtherDraftChange}
          onSubmit={(label) => onLogOther(otherCategory, label)}
          onCancel={() => onSubStepChange('options')}
        />
        <button type="button" className="btn btn-touch intervention-back-btn" onClick={onBack}>
          Back
        </button>
      </div>
    )
  }

  if (step === 'medications' && subStep === 'sodium-chloride') {
    return (
      <div className="interventions-panel">
        <p className="interventions-title">Sodium chloride</p>
        <div className="intervention-options">
          {SODIUM_CHLORIDE_OPTIONS.map((variant) => (
            <button
              key={variant}
              type="button"
              className="btn btn-secondary btn-lg btn-touch intervention-option"
              onClick={() => onLogSodiumChloride(variant)}
            >
              {variant}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-touch intervention-back-btn" onClick={onBack}>
          Back
        </button>
      </div>
    )
  }

  if (step === 'airway') {
    return (
      <div className="interventions-panel">
        <p className="interventions-title">Airway</p>
        <OptionButtons
          options={AIRWAY_OPTIONS}
          savedLabels={getSavedOthersForCategory(savedOthers, 'airway')}
          onSelect={onLogAirway}
          onOther={() => onSubStepChange('other')}
        />
        <button type="button" className="btn btn-touch intervention-back-btn" onClick={onBack}>
          Back
        </button>
      </div>
    )
  }

  if (step === 'breathing') {
    return (
      <div className="interventions-panel">
        <p className="interventions-title">Breathing</p>
        <OptionButtons
          options={BREATHING_OPTIONS}
          savedLabels={getSavedOthersForCategory(savedOthers, 'breathing')}
          onSelect={(option) => onLogBreathing(option as (typeof BREATHING_OPTIONS)[number])}
          onOther={() => onSubStepChange('other')}
        />
        <button type="button" className="btn btn-touch intervention-back-btn" onClick={onBack}>
          Back
        </button>
      </div>
    )
  }

  if (step === 'circulation') {
    return (
      <div className="interventions-panel">
        <p className="interventions-title">Circulation</p>
        <OptionButtons
          options={CIRCULATION_OPTIONS}
          savedLabels={getSavedOthersForCategory(savedOthers, 'circulation')}
          onSelect={(option) => onLogCirculation(option as (typeof CIRCULATION_OPTIONS)[number])}
          onOther={() => onSubStepChange('other')}
        />
        <button type="button" className="btn btn-touch intervention-back-btn" onClick={onBack}>
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="interventions-panel">
      <p className="interventions-title">Medications</p>
      <div className="intervention-options">
        <button
          type="button"
          className="btn btn-secondary btn-lg btn-touch intervention-option"
          onClick={() => onSubStepChange('sodium-chloride')}
        >
          Sodium chloride
        </button>
        {MEDICATION_SIMPLE_OPTIONS.map(({ label }) => (
          <button
            key={label}
            type="button"
            className="btn btn-secondary btn-lg btn-touch intervention-option"
            onClick={() => onLogMedication(label)}
          >
            {label}
          </button>
        ))}
        {serviceConfig.features.extraMedications.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className="btn btn-secondary btn-lg btn-touch intervention-option"
            onClick={() => onLogMedication(label)}
          >
            {label}
          </button>
        ))}
        {getSavedOthersForCategory(savedOthers, 'medications').map((label) => (
          <button
            key={`saved-${label}`}
            type="button"
            className="btn btn-secondary btn-lg btn-touch intervention-option intervention-option-saved"
            onClick={() => onLogMedication(label)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-secondary btn-lg btn-touch intervention-option intervention-option-other"
          onClick={() => onSubStepChange('other')}
        >
          Other
        </button>
      </div>
      <button type="button" className="btn btn-touch intervention-back-btn" onClick={onBack}>
        Back
      </button>
    </div>
  )
}
