import { AlertIcon } from './components/Icons'
import PipelineSteps from './components/PipelineSteps'
import ResultsPanel from './components/ResultsPanel'
import TopicForm from './components/TopicForm'
import { useResearch } from './hooks/useResearch'
import { assets } from './assets/assets'
import { warmUpBackend } from './api/research'
import { useEffect } from 'react'

export default function App() {
  const { status, stepStatus, outputs, error, start, cancel } = useResearch()

  useEffect(()=>{
    warmUpBackend()
  },[])
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-baseline justify-between px-4 pb-1">
            <img 
              src={assets.logo}
              alt="ResearchMind Logo"
              width={50}
            />
            <a
              href={import.meta.env.VITE_GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
            >
              <img 
                src={assets.githubLogo} 
                alt="Github Repo" 
                width={40}
                className='opacity-75'
                />
            </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Research any topic with a team of AI agents
          </h1>
          <p className="mt-3 text-slate-600">
            Four specialized agents collaborate - searching, scraping, writing, and
            critiquing - to deliver a research report on any topic.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div className="space-y-4">
            <TopicForm
              onSubmit={start}
              onCancel={cancel}
              isRunning={status === 'running'}
            />
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              >
                <AlertIcon className="mt-0.5 size-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>

          <PipelineSteps stepStatus={stepStatus} />
        </div>

        <ResultsPanel outputs={outputs} status={status} />
      </main>

      <footer className="pb-8 text-center text-sm text-slate-500">
        Powered by LangChain multi-agent pipeline · Built with React
        {import.meta.env.VITE_GITHUB_REPO && (
          <>
            {' · '}
            <a
              href={import.meta.env.VITE_GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-700"
            >
              GitHub repository
            </a>
          </>
        )}
      </footer>
    </div>
  )
}