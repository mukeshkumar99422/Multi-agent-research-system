import { useState } from 'react'

const EXAMPLES = ['Progress of AI agents in last 2 years', 'AI in healthcare', 'Future of indian politics']

export default function TopicForm({ onSubmit, onCancel, isRunning }) {
  const [topic, setTopic] = useState('')
  const canSubmit = topic.trim().length >= 3 && !isRunning

  const handleSubmit = (e) => {
    e.preventDefault()
    if (canSubmit) onSubmit(topic.trim())
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <label htmlFor="topic" className="block text-sm font-semibold text-slate-900">
        Research Topic
      </label>
      <p className="mt-1 text-sm text-slate-500">
        Enter any topic (3 to 200 characters) and the agents will research it.
      </p>

      <input
        id="topic"
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="e.g. Quantum computing breakthroughs in 2025"
        minLength={3}
        maxLength={200}
        disabled={isRunning}
        className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 disabled:bg-slate-100 disabled:text-slate-500"
      />

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isRunning ? 'Running…' : 'Run Research Pipeline'}
        </button>
        {isRunning && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Try:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setTopic(example)}
            disabled={isRunning}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {example}
          </button>
        ))}
      </div>
    </form>
  )
}