import { CheckIcon, SpinnerIcon, XIcon } from './Icons'

const STATUS = {
  waiting: { label: 'Waiting', badge: 'bg-slate-100 text-slate-600' },
  running: { label: 'Running', badge: 'bg-blue-50 text-blue-700' },
  done: { label: 'Done', badge: 'bg-green-50 text-green-700' },
  error: { label: 'Failed', badge: 'bg-red-50 text-red-700' },
}

function StepIcon({ state, number }) {
  const base =
    'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold'

  if (state === 'done') {
    return (
      <span className={`${base} border-green-600 bg-green-600 text-white`}>
        <CheckIcon />
      </span>
    )
  }
  if (state === 'running') {
    return (
      <span className={`${base} border-blue-600 bg-white text-blue-600`}>
        <SpinnerIcon />
      </span>
    )
  }
  if (state === 'error') {
    return (
      <span className={`${base} border-red-600 bg-red-600 text-white`}>
        <XIcon />
      </span>
    )
  }
  return <span className={`${base} border-slate-300 bg-white text-slate-500`}>{number}</span>
}

export default function StepCard({ number, title, description, state, isLast }) {
  const { label, badge } = STATUS[state] ?? STATUS.waiting

  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      {!isLast && (
        <span
          aria-hidden="true"
          className={`absolute bottom-0 left-4.25 top-9 w-px ${
            state === 'done' ? 'bg-green-600' : 'bg-slate-200'
          }`}
        />
      )}
      <StepIcon state={state} number={number} />
      <div className="min-w-0 flex-1 pt-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-900">{title}</p>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge}`}>
            {label}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
    </li>
  )
}