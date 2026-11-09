import { useEffect, useState } from 'react'
import { downloadTextFile } from '../lib/download'
import { CopyIcon, DownloadIcon, SpinnerIcon } from './Icons'
import Markdown from './Markdown'

// Order matters: the first tab with content is shown by default.
const TABS = [
  { id: 'writer', label: 'Report', markdown: true },
  { id: 'critic', label: 'Critic Feedback', markdown: true },
  { id: 'search', label: 'Search Results', markdown: false },
  { id: 'reader', label: 'Scraped Content', markdown: false },
]

// Pulls "8/10" style scores out of the critic's text, if present.
function extractScore(text = '') {
  const match = text.match(/(\d+(?:\.\d+)?)\s*\/\s*10/)
  return match ? Number(match[1]) : null
}

function scoreColor(score) {
  if (score >= 8) return 'bg-green-50 text-green-700 ring-green-200'
  if (score >= 5) return 'bg-amber-50 text-amber-700 ring-amber-200'
  return 'bg-red-50 text-red-700 ring-red-200'
}

function ActionButton({ onClick, icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
    >
      {icon}
      {children}
    </button>
  )
}

function EmptyState({ status }) {
  const running = status === 'running'
  return (
    <section className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      {running && <SpinnerIcon className="mx-auto mb-3 size-6 text-indigo-600" />}
      <p className="text-sm font-medium text-slate-900">
        {running ? 'The agents are working…' : 'Your results will appear here'}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {running
          ? 'Each result shows up as soon as its step finishes.'
          : 'Enter a topic and run the pipeline to generate a report.'}
      </p>
    </section>
  )
}

export default function ResultsPanel({ outputs, status }) {
  const [selected, setSelected] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const available = TABS.filter((tab) => outputs[tab.id])
  if (available.length === 0) return <EmptyState status={status} />

  const active =
    available.find((tab) => tab.id === selected) ?? available[0]
  const text = outputs[active.id]
  const score = active.id === 'critic' ? extractScore(text) : null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      // clipboard not available (e.g. insecure context) - ignore
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 pt-4">
        <div role="tablist" aria-label="Results" className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const enabled = Boolean(outputs[tab.id])
            const isActive = tab.id === active.id
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="results-panel"
                disabled={!enabled}
                onClick={() => setSelected(tab.id)}
                className={`whitespace-nowrap border-b-2 px-3 pb-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="mb-3 flex items-center gap-2">
          {score !== null && (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${scoreColor(score)}`}
            >
              Score {score}/10
            </span>
          )}
          <ActionButton onClick={handleCopy} icon={<CopyIcon className="size-3.5" />}>
            {copied ? 'Copied' : 'Copy'}
          </ActionButton>
          {active.id === 'writer' && (
            <ActionButton
              onClick={() => downloadTextFile(`research_report_${Date.now()}.md`, text)}
              icon={<DownloadIcon className="size-3.5" />}
            >
              Download .md
            </ActionButton>
          )}
        </div>
      </div>

      <div
        id="results-panel"
        role="tabpanel"
        aria-labelledby={`tab-${active.id}`}
        className="p-5 sm:p-6"
      >
        {active.markdown ? (
          <Markdown>{text}</Markdown>
        ) : (
          <pre className="max-h-128 overflow-auto whitespace-pre-wrap wrap-break-words rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
            {text}
          </pre>
        )}
      </div>
    </section>
  )
}