import Link from 'next/link';

const TOOLS = [
  {
    name: 'Duct Sizer',
    description: 'Size round, rectangular & flat oval ducts using the ASHRAE equal friction method.',
    href: '/duct-sizer',
    icon: '💨',
    available: true,
  },
  {
    name: 'Pipe Sizer',
    description: 'Size hydronic and domestic water piping systems by flow rate and velocity.',
    href: '/pipe-sizer',
    icon: '🔧',
    available: false,
  },
  {
    name: 'Duct Fitting Losses',
    description: 'Calculate pressure losses across duct fittings using ASHRAE fitting coefficients.',
    href: '/duct-fitting-losses',
    icon: '📐',
    available: false,
  },
  {
    name: 'Equipment Schedule',
    description: 'Generate formatted mechanical equipment schedules from input specs.',
    href: '/equipment-schedule',
    icon: '📋',
    available: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-blue-400">MEP Calcs</h1>
          <p className="text-gray-400 mt-2">Professional MEP engineering tools for commercial design</p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TOOLS.map((tool) => (
            <div key={tool.name} className={`bg-gray-900 rounded-2xl p-6 flex flex-col gap-3 border transition
              ${tool.available
                ? 'border-gray-800 hover:border-blue-500 cursor-pointer'
                : 'border-gray-800 opacity-50 cursor-not-allowed'}`}>

              {tool.available ? (
                <Link href={tool.href} className="flex flex-col gap-3 h-full">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{tool.icon}</span>
                    <span className="text-xs text-blue-400 font-medium bg-blue-950 px-2 py-1 rounded-full">Live</span>
                  </div>
                  <h2 className="text-lg font-semibold text-white">{tool.name}</h2>
                  <p className="text-sm text-gray-400">{tool.description}</p>
                </Link>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{tool.icon}</span>
                    <span className="text-xs text-gray-500 font-medium bg-gray-800 px-2 py-1 rounded-full">Coming Soon</span>
                  </div>
                  <h2 className="text-lg font-semibold text-white">{tool.name}</h2>
                  <p className="text-sm text-gray-400">{tool.description}</p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-600">
          Built for MEP engineers · Calculations based on ASHRAE & SMACNA standards
        </div>

      </div>
    </main>
  );
}