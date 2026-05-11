import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          VideoScribe
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          Transcribe meetings in their original language. Get summaries, briefs, action items, 
          key decisions, and meeting minutes in <strong>any language</strong> you choose.
        </p>
        
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/transcribe"
            className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            Start Transcribing
          </Link>
          <Link
            href="/#features"
            className="text-sm font-semibold leading-6 text-slate-900 hover:text-indigo-600 transition-colors"
          >
            Learn more <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div id="features" className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 text-left">
          <div className="p-6 rounded-lg bg-white shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900">🎯 Accurate Transcription</h3>
            <p className="mt-2 text-sm text-slate-600">
              Auto-detects Armenian, English, Russian. Transcript stays in original language.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-white shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900">🌍 Multi-Language Output</h3>
            <p className="mt-2 text-sm text-slate-600">
              Get summaries, action items, and more in hy, en, or ru — independent of source.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-white shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900">🔐 Private & Secure</h3>
            <p className="mt-2 text-sm text-slate-600">
              Your data stays yours. Supabase auth + RLS. Never stored longer than needed.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-white shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900">⚡ Chrome Extension</h3>
            <p className="mt-2 text-sm text-slate-600">
              Capture Google Meet & Zoom calls automatically. One-click upload.
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-20 text-center text-sm text-slate-500">
        <p>© 2026 NewCo. Built for Armenian-speaking teams.</p>
      </footer>
    </main>
  );
}
