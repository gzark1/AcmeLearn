function App() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold text-primary">AcmeLearn</h1>
        <p className="mb-8 text-lg text-slate-600">
          AI-Powered Learning Recommendation Platform
        </p>

        {/* Design System Demo */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">Design System Test</h2>

          {/* Difficulty Badges */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-slate-500">Difficulty Levels</h3>
            <div className="flex gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                Beginner
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                Intermediate
              </span>
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                Advanced
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-slate-500">Buttons</h3>
            <div className="flex gap-2">
              <button className="rounded-lg bg-primary-light px-4 py-2 font-medium text-white hover:bg-primary">
                Primary
              </button>
              <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50">
                Secondary
              </button>
              <button className="rounded-lg bg-admin px-4 py-2 font-medium text-white hover:bg-admin-light">
                Admin
              </button>
            </div>
          </div>

          {/* Colors */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-500">Custom Colors</h3>
            <div className="flex gap-2">
              <div className="h-10 w-10 rounded bg-primary" title="primary" />
              <div className="h-10 w-10 rounded bg-primary-light" title="primary-light" />
              <div className="h-10 w-10 rounded bg-primary-lighter" title="primary-lighter" />
              <div className="h-10 w-10 rounded bg-admin" title="admin" />
              <div className="h-10 w-10 rounded bg-admin-light" title="admin-light" />
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-400">
          Phase 1 Setup Complete - Tailwind CSS + TypeScript + Vite
        </p>
      </div>
    </div>
  )
}

export default App
