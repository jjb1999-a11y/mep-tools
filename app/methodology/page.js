'use client';
import { useState } from 'react';
import Link from 'next/link';

function Section({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-800/50 transition">
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="text-base font-semibold text-white">{title}</span>
        </div>
        <span className="text-gray-500 text-lg ml-4">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-6 pb-6 space-y-4 border-t border-gray-800 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-gray-800 rounded-xl p-5">
      {title && <h3 className="text-sm font-semibold text-gray-200 mb-3">{title}</h3>}
      {children}
    </div>
  );
}

function Formula({ children }) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-blue-300">
      {children}
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-2 text-xs text-gray-500 font-medium pr-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-400">
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-700 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className={`py-2 pr-4 ${j === 0 ? 'text-blue-400' : ''} ${j === row.length - 1 && cell === '✓' ? 'text-green-400' : ''}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Methodology() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-8">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition mb-4 inline-block">← Back to tools</a>
          <h1 className="text-3xl font-bold text-white mb-2">Methodology & Validation</h1>
          <p className="text-gray-400">
            All calculations on MEP Calcs are based on published ASHRAE, SMACNA, IPC, and UPC standards.
            This page documents the exact formulas, assumptions, and validation examples used in each tool.
          </p>
        </div>

        {/* Meta */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 mb-8 flex items-center justify-between">
          <p className="text-xs text-gray-500">Last updated: April 2026</p>
          <p className="text-xs text-gray-500">Version 1.1</p>
        </div>

        {/* ── Duct Sizer ── */}
        <Section title="Duct Sizer" icon="💨" defaultOpen={true}>

          <Card title="Reference Standards">
            <p className="text-sm text-gray-400">ASHRAE Handbook — Fundamentals, Chapter 21: Duct Design (2021 Edition)</p>
            <p className="text-sm text-gray-400 mt-2">SMACNA HVAC Systems Duct Design Manual, 4th Edition</p>
          </Card>

          <Card title="Sizing Method">
            <p className="text-sm text-gray-400 mb-2">
              Uses the <span className="text-white font-medium">Equal Friction Method</span> — the most widely used method for commercial duct system design. Friction loss per unit length is held constant throughout the system.
            </p>
            <p className="text-sm text-gray-400">
              Round duct diameter is calculated using the ASHRAE equal friction formula derived from the Darcy-Weisbach equation and Colebrook friction factor for galvanized steel ductwork.
            </p>
          </Card>

          <Card title="Round Duct Diameter Formula">
            <Formula>D = [0.109 × Q¹·⁹ / fr]^0.199</Formula>
            <div className="space-y-1 text-sm text-gray-400 mt-3">
              <p><span className="text-white">D</span> = Duct diameter (inches)</p>
              <p><span className="text-white">Q</span> = Airflow rate (CFM)</p>
              <p><span className="text-white">fr</span> = Friction rate (in. w.g. per 100 ft)</p>
            </div>
            <p className="text-xs text-gray-600 mt-3">Source: ASHRAE Handbook — Fundamentals 2021, Chapter 21</p>
          </Card>

          <Card title="Rectangular & Flat Oval Sizing">
            <p className="text-sm text-gray-400 mb-3">
              Rectangular ducts are sized to match the round duct cross-sectional area at the same velocity, then rounded up to the nearest 2" increment per SMACNA. Aspect ratio is flagged when it exceeds 4:1.
            </p>
            <p className="text-sm text-gray-400 mb-2">Flat oval area formula:</p>
            <Formula>Area = (π/4) × A² + A × (B − A)</Formula>
            <p className="text-sm text-gray-400 mt-3">Dimensions reported as Major × Minor per McGill AirFlow catalog convention.</p>
          </Card>

          <Card title="Assumptions">
            <ul className="space-y-1 text-sm text-gray-400">
              <li>• Standard air at 70°F, 0.075 lb/ft³, sea level pressure</li>
              <li>• Galvanized steel ductwork, ε = 0.0003 ft</li>
              <li>• Straight duct only — fitting losses not included</li>
              <li>• Results snapped to nearest standard duct size</li>
            </ul>
          </Card>

          <Card title="Validation">
            <p className="text-sm text-gray-400 mb-3">Verified against ASHRAE friction chart (Figure 1, Chapter 21) and physical ductulator:</p>
            <Table
              headers={['CFM', 'Fr (in/100ft)', 'ASHRAE Chart', 'MEP Calcs', 'Match']}
              rows={[
                ['1000', '0.1', '14"', '14"', '✓'],
                ['2000', '0.1', '18"', '18"', '✓'],
                ['500',  '0.1', '10"', '10"', '✓'],
                ['4000', '0.1', '24"', '24"', '✓'],
                ['2000', '0.08','18"', '18"', '✓'],
              ]}
            />
          </Card>

        </Section>

        {/* ── Pipe Sizer ── */}
        <Section title="Pipe Sizer (Hydronic)" icon="🔧">

          <Card title="Reference Standards">
            <p className="text-sm text-gray-400">ASHRAE Handbook — Fundamentals, Chapter 22: Pipe Sizing (2021 Edition)</p>
            <p className="text-sm text-gray-400 mt-2">ASME B36.10M — Welded and Seamless Wrought Steel Pipe</p>
            <p className="text-sm text-gray-400 mt-2">ASTM B88 — Standard Specification for Seamless Copper Water Tube</p>
          </Card>

          <Card title="Sizing Method">
            <p className="text-sm text-gray-400">
              Uses the <span className="text-white font-medium">Darcy-Weisbach equation</span> with the <span className="text-white font-medium">Colebrook-White equation</span> for friction factor — the industry standard for pressure drop in HVAC piping per ASHRAE Chapter 22.
            </p>
          </Card>

          <Card title="Formulas">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Darcy-Weisbach</p>
            <Formula>ΔP = f × (L/D) × (V²/2g)</Formula>
            <p className="text-xs text-gray-500 mb-1 mt-3 uppercase tracking-wide">Colebrook-White (Friction Factor)</p>
            <Formula>1/√f = −2 log₁₀(ε/3.7D + 2.51/Re√f)</Formula>
            <p className="text-xs text-gray-500 mb-1 mt-3 uppercase tracking-wide">Reynolds Number</p>
            <Formula>Re = V × D / ν</Formula>
            <div className="space-y-1 text-sm text-gray-400 mt-3">
              <p><span className="text-white">f</span> = Darcy friction factor</p>
              <p><span className="text-white">D</span> = Internal diameter (ft)</p>
              <p><span className="text-white">V</span> = Flow velocity (ft/s)</p>
              <p><span className="text-white">ε</span> = Absolute roughness (ft)</p>
              <p><span className="text-white">ν</span> = Kinematic viscosity (ft²/s)</p>
            </div>
            <p className="text-xs text-gray-600 mt-3">Source: ASHRAE Handbook — Fundamentals 2021, Chapter 22</p>
          </Card>

          <Card title="Pipe Internal Diameters">
            <Table
              headers={['Nominal Size', 'Material', 'ID (in)', 'Standard']}
              rows={[
                ['½"',  'Type L Copper',      '0.545',  'ASTM B88'],
                ['¾"',  'Type L Copper',      '0.785',  'ASTM B88'],
                ['1"',  'Type L Copper',      '1.025',  'ASTM B88'],
                ['1¼"', 'Type L Copper',      '1.265',  'ASTM B88'],
                ['1½"', 'Type L Copper',      '1.505',  'ASTM B88'],
                ['2"',  'Type L Copper',      '1.985',  'ASTM B88'],
                ['2½"', 'Sch 40 Black Steel', '2.469',  'ASME B36.10M'],
                ['3"',  'Sch 40 Black Steel', '3.068',  'ASME B36.10M'],
                ['4"',  'Sch 40 Black Steel', '4.026',  'ASME B36.10M'],
                ['6"',  'Sch 40 Black Steel', '6.065',  'ASME B36.10M'],
                ['8"',  'Sch 40 Black Steel', '7.981',  'ASME B36.10M'],
                ['10"', 'Sch 40 Black Steel', '10.020', 'ASME B36.10M'],
                ['12"', 'Sch 40 Black Steel', '11.938', 'ASME B36.10M'],
              ]}
            />
          </Card>

          <Card title="Fluid Properties by System Type">
            <Table
              headers={['System Type', 'Temperature', 'ν (ft²/s)']}
              rows={[
                ['Chilled Water',       '44°F / 54°F',   '0.0000141'],
                ['Heating Hot Water',   '140°F / 120°F', '0.0000052'],
                ['High Temp Hot Water', '180°F / 160°F', '0.0000038'],
                ['Condenser Water',     '85°F / 95°F',   '0.0000083'],
              ]}
            />
            <p className="text-xs text-gray-600 mt-3">Source: CRC Handbook of Chemistry and Physics, 97th Edition</p>
          </Card>

          <Card title="Glycol Correction">
            <p className="text-sm text-gray-400 mb-3">Propylene glycol viscosity multipliers applied to base water viscosity:</p>
            <Table
              headers={['Glycol %', 'Viscosity Multiplier', 'Typical Use']}
              rows={[
                ['0%',  '1.0×', 'Interior systems'],
                ['20%', '1.4×', 'Mild climates'],
                ['30%', '1.8×', 'Most common commercial'],
                ['40%', '2.5×', 'Cold climates'],
                ['50%', '3.5×', 'Extreme cold / outdoor'],
              ]}
            />
            <p className="text-xs text-gray-600 mt-3">Source: Dow Chemical DOWFROST data / ASHRAE HVAC Systems and Equipment</p>
          </Card>

          <Card title="Assumptions & Limitations">
            <ul className="space-y-1 text-sm text-gray-400">
              <li>• Straight pipe only — fitting losses not included</li>
              <li>• Colebrook-White solved iteratively (20 iterations)</li>
              <li>• Laminar flow (Re &lt; 2300) uses f = 64/Re</li>
              <li>• Glycol multipliers are approximate — use manufacturer data for precise design</li>
              <li>• Copper ε = 0.000005 ft, steel ε = 0.00015 ft</li>
              <li>• Sch 80 required for systems exceeding 160 PSI or 250°F</li>
            </ul>
          </Card>

        </Section>

        {/* ── Domestic Water Pipe Sizer ── */}
        <Section title="Domestic Water Pipe Sizer" icon="💧">

          <Card title="Reference Standards">
            <p className="text-sm text-gray-400">International Plumbing Code (IPC) 2021 — Appendix E: Sizing of Water Piping System</p>
            <p className="text-sm text-gray-400 mt-2">Uniform Plumbing Code (UPC) 2021 — Chapter 6: Water Supply and Distribution</p>
            <p className="text-sm text-gray-400 mt-2">ASTM B88 — Standard Specification for Seamless Copper Water Tube (Type L)</p>
          </Card>

          <Card title="Sizing Method">
            <p className="text-sm text-gray-400 mb-2">
              Domestic water pipe sizing uses <span className="text-white font-medium">Water Supply Fixture Units (WSFU)</span> to estimate peak demand, converted to GPM using the Hunter's Curve method per IPC Appendix E / UPC Chapter 6.
            </p>
            <p className="text-sm text-gray-400">
              Pipe size is selected to keep velocity within code limits and maintain adequate residual pressure at the most demanding fixture.
            </p>
          </Card>

          <Card title="WSFU to GPM Conversion">
            <p className="text-sm text-gray-400 mb-3">
              Total fixture units are converted to design flow rate using IPC Table E103.3(3) — the Hunter's Curve. Separate tables are used for flushometer valve and flush tank systems:
            </p>
            <Formula>GPM = f(WSFU, flush type)</Formula>
            <p className="text-sm text-gray-400 mt-3">
              Values between table entries are linearly interpolated. Flushometer valve systems produce higher GPM for the same WSFU due to higher instantaneous flow demand.
            </p>
            <p className="text-xs text-gray-600 mt-3">Source: IPC 2021 Appendix E, Table E103.3(3)</p>
          </Card>

          <Card title="Pressure Drop Formula">
            <p className="text-sm text-gray-400 mb-2">Same Darcy-Weisbach / Colebrook-White method as the hydronic pipe sizer, using water properties at 60°F:</p>
            <Formula>ΔP (PSI) = f × (L/D) × (V²/2g) × 0.4335</Formula>
            <div className="space-y-1 text-sm text-gray-400 mt-3">
              <p><span className="text-white">0.4335</span> = Conversion factor from ft w.g. to PSI</p>
              <p><span className="text-white">ν</span> = 0.00001059 ft²/s (water at 60°F)</p>
              <p><span className="text-white">ε</span> = 0.000005 ft (Type L Copper)</p>
            </div>
          </Card>

          <Card title="Pressure Budget">
            <p className="text-sm text-gray-400 mb-3">Remaining pressure at the fixture is calculated as:</p>
            <Formula>P_fixture = P_available − P_elevation − P_system − P_friction</Formula>
            <div className="space-y-1 text-sm text-gray-400 mt-3">
              <p><span className="text-white">P_elevation</span> = Height × 0.433 PSI/ft</p>
              <p><span className="text-white">P_system</span> = Meter + backflow preventer + valves (default 10 PSI)</p>
              <p><span className="text-white">P_friction</span> = Darcy-Weisbach loss over pipe run length</p>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Result is compared against IPC Table 604.3 minimum residual pressures (e.g. 35 PSI for flushometer valves, 8 PSI for flush tanks).
            </p>
            <p className="text-xs text-gray-600 mt-3">Source: IPC 2021 Table 604.3</p>
          </Card>

          <Card title="Fixture Unit Values (IPC 2021)">
            <Table
              headers={['Fixture', 'WSFU', 'Min Pipe', 'Min PSI']}
              rows={[
                ['Water Closet (Flushometer)',  '10',  '1"',    '35'],
                ['Water Closet (Flush Tank)',   '2.5', '3/8"',  '8'],
                ['Urinal (Flushometer)',        '5',   '¾"',    '25'],
                ['Lavatory (Public)',           '1.5', '½"',    '8'],
                ['Lavatory (Private)',          '1.0', '½"',    '8'],
                ['Shower',                     '2.0', '½"',    '8'],
                ['Bathtub',                    '2.0', '½"',    '8'],
                ['Kitchen Sink',               '1.5', '½"',    '8'],
                ['Service Sink',               '3.0', '½"',    '8'],
                ['Hose Bibb',                  '2.5', '½"',    '8'],
              ]}
            />
            <p className="text-xs text-gray-600 mt-3">Source: IPC 2021 Table E103.3(2) and Table 604.3</p>
          </Card>

          <Card title="Assumptions & Limitations">
            <ul className="space-y-1 text-sm text-gray-400">
              <li>• Type L Copper used for all domestic water sizing</li>
              <li>• Water properties at 60°F — cold water sizing only</li>
              <li>• Straight pipe only — fitting losses not included</li>
              <li>• System losses default of 10 PSI covers most commercial meter + BFP installations</li>
              <li>• IPC and UPC WSFU values differ — select correct code for your jurisdiction</li>
              <li>• IPC max velocity 8 FPS — 5 FPS recommended for noise-sensitive spaces</li>
            </ul>
          </Card>

        </Section>

        {/* ── General Notes ── */}
        <Section title="General Notes" icon="📋">

          <Card title="Intended Use">
            <p className="text-sm text-gray-400">
              MEP Calcs is intended as a quick-check and preliminary sizing tool for licensed MEP engineers and designers.
              Results should be reviewed by a qualified engineer before use on construction documents.
              All calculations are provided for informational purposes only.
            </p>
          </Card>

          <Card title="Version History">
            <div className="space-y-3">
              {[
                { version: '1.1', date: 'April 2026', notes: 'Added Domestic Water Pipe Sizer, collapsible methodology sections' },
                { version: '1.0', date: 'April 2026', notes: 'Initial release — Duct Sizer and Hydronic Pipe Sizer' },
              ].map((v, i) => (
                <div key={i} className="flex gap-4 text-sm">
                  <span className="text-blue-400 font-medium whitespace-nowrap">v{v.version}</span>
                  <span className="text-gray-600 whitespace-nowrap">{v.date}</span>
                  <span className="text-gray-400">{v.notes}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Questions or Corrections">
            <p className="text-sm text-gray-400">
              If you find an error in any calculation or have a suggestion,
              please reach out at{' '}
              <a href="mailto:hello@mepcalcs.com" className="text-blue-400 hover:text-blue-300 transition">
                hello@mepcalcs.com
              </a>
            </p>
          </Card>

        </Section>

        {/* Footer nav */}
        <div className="border-t border-gray-800 pt-8 flex justify-between items-center mt-8">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition">← Back to tools</a>
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} MEP Calcs</p>
        </div>

      </div>
    </main>
  );
}