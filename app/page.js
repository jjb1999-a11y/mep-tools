import Link from 'next/link';

const TOOLS = [
  {
    name: 'Duct Sizer',
    description: 'Size round, rectangular & flat oval ducts using the ASHRAE equal friction method. Includes velocity and pressure drop validation.',
    href: '/duct-sizer',
    icon: '💨',
    standard: 'ASHRAE Fundamentals',
  },
  {
    name: 'Pipe Sizer',
    description: 'Size hydronic piping by flow rate with system type, glycol mix, and temperature corrections per ASHRAE Chapter 22.',
    href: '/pipe-sizer',
    icon: '🔧',
    standard: 'ASHRAE Fundamentals',
  },
  {
    name: 'Domestic Water Pipe Sizer',
    description: 'Size domestic cold and hot water piping using fixture units, velocity limits, and pressure budget per IPC / UPC.',
    href: '/domestic-water-sizer',
    icon: '💧',
    standard: 'IPC / UPC 2021',
  },
  {
    name: 'Water Service Sizer',
    description: 'Size building water service and meter from fixture counts per IPC / UPC and AWWA M22.',
    href: '/water-service-sizer',
    icon: '🏗️',
    standard: 'IPC / UPC / AWWA M22',
  },
];

const TRUST_ITEMS = [
  { label: 'ASHRAE Fundamentals',    desc: 'Calculations based on ASHRAE Handbook standards' },
  { label: 'SMACNA Standards',       desc: 'Duct construction per SMACNA guidelines' },
  { label: 'Built by MEP Engineers', desc: 'Designed for real commercial design work' },
  { label: 'Free to Use',            desc: 'No account required to get started' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="inline-block bg-blue-950 border border-blue-800 text-blue-400 text-xs font-medium px-3 py-1 rounded-full mb-6">
          Built for commercial MEP engineers
        </div>
        <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
          MEP calculations,<br />
          <span className="text-blue-400">done right.</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Fast, accurate engineering tools based on ASHRAE, SMACNA, IPC, and UPC standards.
        </p>
      </section>

      {/* ── Trust Bar ── */}
      <section className="border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ITEMS.map((t, i) => (
            <div key={i} className="text-center">
              <p className="text-sm font-medium text-white mb-1">{t.label}</p>
              <p className="text-xs text-gray-500">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tools ── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white">Engineering Tools</h2>
          <p className="text-gray-400 mt-1">All calculations cite their source standard so you know exactly where the math comes from.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TOOLS.map((tool) => (
            <Link key={tool.name} href={tool.href}
              className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-blue-500 transition flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{tool.icon}</span>
                <span className="text-xs text-blue-400 font-medium bg-blue-950 px-2 py-1 rounded-full">Live</span>
              </div>
              <h3 className="text-base font-semibold text-white">{tool.name}</h3>
              <p className="text-sm text-gray-400 flex-1">{tool.description}</p>
              <p className="text-xs text-gray-600">📖 {tool.standard}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Methodology Banner ── */}
      <section className="border-t border-gray-800 bg-gray-900/30">
        <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-base font-semibold text-white mb-1">How are these calculations verified?</h3>
            <p className="text-sm text-gray-400 max-w-lg">
              Every tool cites its source standard — ASHRAE, SMACNA, IPC, or UPC.
              Our methodology page documents the exact formulas, assumptions, and validation examples used in each tool.
            </p>
          </div>
          <Link href="/methodology"
            className="whitespace-nowrap bg-gray-800 hover:bg-gray-700 transition text-white text-sm font-medium px-6 py-3 rounded-xl border border-gray-700">
            View Methodology →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-400">MEP Calcs</p>
            <p className="text-xs text-gray-600 mt-1">Professional MEP engineering tools</p>
          </div>
          <div className="flex gap-6 text-xs text-gray-500">
            <Link href="/methodology" className="hover:text-gray-300 transition">Methodology</Link>
            <a href="mailto:hello@mepcalcs.com" className="hover:text-gray-300 transition">Contact</a>
          </div>
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} MEP Calcs</p>
        </div>
      </footer>

    </main>
  );
}