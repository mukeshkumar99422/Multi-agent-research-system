import { STEPS } from '../constants/steps'
import StepCard from './StepCard'

export default function PipelineSteps({ stepStatus }) {
  const doneCount = STEPS.filter((step) => stepStatus[step.id] === 'done').length
  const percent = (doneCount / STEPS.length) * 100

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Pipeline</h2>
        <span className="text-xs font-medium text-slate-500">
          {doneCount} of {STEPS.length} complete
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Pipeline progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="mb-5 h-1.5 overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ol aria-live="polite">
        {STEPS.map((step, i) => (
          <StepCard
            key={step.id}
            number={step.number}
            title={step.title}
            description={step.description}
            state={stepStatus[step.id]}
            isLast={i === STEPS.length - 1}
          />
        ))}
      </ol>
    </section>
  )
}