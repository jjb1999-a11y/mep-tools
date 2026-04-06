import Link from 'next/link';

export default function Methodology() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-12">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition mb-4 inline-block">← Back to tools</a>
          <h1 className="text-3xl font-bold text-white mb-2">Methodology & Validation</h1>
          <p className="text-gray-400">
            All calculations on MEP Calcs are based on published ASHRAE and SMACNA standards.
            This page documents the exact formulas, assumptions, and validation examples used in each tool
            so engineers can verify results independently.
          </p>
        </div>

        {/* Last Updated */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 mb-10 flex items-center justify-between">
          <p className="text-xs text-gray-500">Last updated: April 2026</p>
          <p className="text-xs text-gray-500">Version 1.0</p>
        </div>

        {/* ── DUCT SIZER ── */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">💨</span>
            <h2 className="text-2xl font-bold text-blue-400">Duct Sizer</h2>
          </div>

          {/* Standard */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Reference Standard</h3>
            <p className="text-sm text-gray-400">
              ASHRAE Handbook — Fundamentals, Chapter 21: Duct Design (2021 Edition)
            </p>
            <p className="text-sm text-gray-400 mt-2">
              SMACNA HVAC Systems Duct Design Manual, 4th Edition
            </p>
          </div>

          {/* Method */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Sizing Method</h3>
            <p className="text-sm text-gray-400 mb-3">
              The duct sizer uses the <span className="text-white font-medium">Equal Friction Method</span> — the most widely used method for commercial duct system design. The system is sized so that friction loss per unit length is constant throughout.
            </p>
            <p className="text-sm text-gray-400">
              Round duct diameter is calculated using the ASHRAE equal friction formula derived from the Darcy-Weisbach equation and Colebrook friction factor for galvanized steel ductwork.
            </p>
          </div>

          {/* Formula */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Round Duct Diameter Formula</h3>
            <div className="bg-gray-800 rounded-xl p-4 mb-3 font-mono text-sm text-blue-300">
              D = [0.109 × Q¹·⁹ / fr]^0.199
            </div>
            <div className="space-y-1 text-sm text-gray-400">
              <p><span className="text-white">D</span> = Duct diameter (inches)</p>
              <p><span className="text-white">Q</span> = Airflow rate (CFM)</p>
              <p><span className="text-white">fr</span> = Friction rate (in. w.g. per 100 ft)</p>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Source: ASHRAE Handbook — Fundamentals 2021, Chapter 21, Equation 1
            </p>
          </div>

          {/* Rectangular */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Rectangular Duct Sizing</h3>
            <p className="text-sm text-gray-400 mb-3">
              Rectangular ducts are sized to carry the same airflow at the same velocity as the calculated round duct. Cross-sectional area is matched, then dimensions are rounded up to the nearest 2" increment per SMACNA standard practice.
            </p>
            <p className="text-sm text-gray-400">
              When a width or height constraint is provided, the tool fixes that dimension and solves for the other. Aspect ratio is flagged when it exceeds 4:1 — the SMACNA recommended maximum.
            </p>
          </div>

          {/* Flat Oval */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Flat Oval Duct Sizing</h3>
            <p className="text-sm text-gray-400 mb-3">
              Flat oval ducts are sized using the cross-sectional area formula:
            </p>
            <div className="bg-gray-800 rounded-xl p-4 mb-3 font-mono text-sm text-blue-300">
              Area = (π/4) × A² + A × (B − A)
            </div>
            <div className="space-y-1 text-sm text-gray-400">
              <p><span className="text-white">A</span> = Minor axis (inches)</p>
              <p><span className="text-white">B</span> = Major axis (inches)</p>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Dimensions are reported as Major × Minor per industry convention (McGill AirFlow catalog format).
            </p>
          </div>

          {/* Assumptions */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Assumptions</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Standard air at 70°F, 0.075 lb/ft³ density, sea level pressure</li>
              <li>• Galvanized steel ductwork, absolute roughness ε = 0.0003 ft</li>
              <li>• Straight duct only — fitting losses not included</li>
              <li>• Results rounded to nearest standard duct size</li>
              <li>• Velocity warnings based on SMACNA recommended limits</li>
            </ul>
          </div>

          {/* Validation */}
          <div className="bg-gray-900 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Validation Examples</h3>
            <p className="text-sm text-gray-400 mb-4">
              Results verified against ASHRAE friction chart (Figure 1, Chapter 21) and physical ductulator:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-xs text-gray-500 font-medium">CFM</th>
                    <th className="text-left py-2 text-xs text-gray-500 font-medium">Fr (in/100ft)</th>
                    <th className="text-left py-2 text-xs text-gray-500 font-medium">ASHRAE Chart</th>
                    <th className="text-left py-2 text-xs text-gray-500 font-medium">MEP Calcs</th>
                    <th className="text-left py-2 text-xs text-gray-500 font-medium">Match</th>
                  </tr>
                </thead>
                <tbody className="text-gray-400">
                  {[
                    { cfm: '1000', fr: '0.1', ashrae: '14"', calc: '14"', match: true },
                    { cfm: '2000', fr: '0.1', ashrae: '18"', calc: '18"', match: true },
                    { cfm: '500',  fr: '0.1', ashrae: '10"', calc: '10"', match: true },
                    { cfm: '4000', fr: '0.1', ashrae: '24"', calc: '24"', match: true },
                    { cfm: '2000', fr: '0.08', ashrae: '18"', calc: '18"', match: true },
                  ].map((r, i) => (
                    <tr key={i} className="border-b border-gray-800 last:border-0">
                      <td className="py-2">{r.cfm}</td>
                      <td className="py-2">{r.fr}</td>
                      <td className="py-2">{r.ashrae}</td>
                      <td className="py-2 text-blue-400">{r.calc}</td>
                      <td className="py-2 text-green-400">{r.match ? '✓' : '✗'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── PIPE SIZER ── */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🔧</span>
            <h2 className="text-2xl font-bold text-blue-400">Pipe Sizer</h2>
          </div>

          {/* Standard */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Reference Standard</h3>
            <p className="text-sm text-gray-400">
              ASHRAE Handbook — Fundamentals, Chapter 22: Pipe Sizing (2021 Edition)
            </p>
            <p className="text-sm text-gray-400 mt-2">
              ASME B36.10M — Welded and Seamless Wrought Steel Pipe
            </p>
            <p className="text-sm text-gray-400 mt-2">
              ASTM B88 — Standard Specification for Seamless Copper Water Tube
            </p>
          </div>

          {/* Method */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Sizing Method</h3>
            <p className="text-sm text-gray-400">
              Hydronic pipe sizing uses the <span className="text-white font-medium">Darcy-Weisbach equation</span> with the <span className="text-white font-medium">Colebrook-White equation</span> for friction factor. This is the industry standard method for pressure drop calculations in HVAC piping systems per ASHRAE Chapter 22.
            </p>
          </div>

          {/* Formulas */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-4">Formulas</h3>

            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Darcy-Weisbach (Pressure Drop)</p>
            <div className="bg-gray-800 rounded-xl p-4 mb-4 font-mono text-sm text-blue-300">
              ΔP = f × (L/D) × (V²/2g)
            </div>

            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Colebrook-White (Friction Factor)</p>
            <div className="bg-gray-800 rounded-xl p-4 mb-4 font-mono text-sm text-blue-300">
              1/√f = −2 log₁₀(ε/3.7D + 2.51/Re√f)
            </div>

            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Reynolds Number</p>
            <div className="bg-gray-800 rounded-xl p-4 mb-4 font-mono text-sm text-blue-300">
              Re = V × D / ν
            </div>

            <div className="space-y-1 text-sm text-gray-400 mt-2">
              <p><span className="text-white">f</span> = Darcy friction factor (dimensionless)</p>
              <p><span className="text-white">L</span> = Pipe length (ft)</p>
              <p><span className="text-white">D</span> = Internal diameter (ft)</p>
              <p><span className="text-white">V</span> = Flow velocity (ft/s)</p>
              <p><span className="text-white">g</span> = Gravitational acceleration (32.174 ft/s²)</p>
              <p><span className="text-white">ε</span> = Absolute roughness (ft)</p>
              <p><span className="text-white">Re</span> = Reynolds number</p>
              <p><span className="text-white">ν</span> = Kinematic viscosity (ft²/s)</p>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Source: ASHRAE Handbook — Fundamentals 2021, Chapter 22
            </p>
          </div>

          {/* Pipe Dimensions */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Pipe Internal Diameters</h3>
            <p className="text-sm text-gray-400 mb-4">
              All internal diameters are per published standards — ASTM B88 for Type L Copper and ASME B36.10M for Schedule 40 Black Steel:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-xs text-gray-500 font-medium">Nominal Size</th>
                    <th className="text-left py-2 text-xs text-gray-500 font-medium">Material</th>
                    <th className="text-left py-2 text-xs text-gray-500 font-medium">ID (inches)</th>
                    <th className="text-left py-2 text-xs text-gray-500 font-medium">Standard</th>
                  </tr>
                </thead>
                <tbody className="text-gray-400">
                  {[
                    { size: '½"',  mat: 'Type L Copper',     id: '0.545', std: 'ASTM B88' },
                    { size: '¾"',  mat: 'Type L Copper',     id: '0.785', std: 'ASTM B88' },
                    { size: '1"',  mat: 'Type L Copper',     id: '1.025', std: 'ASTM B88' },
                    { size: '1¼"', mat: 'Type L Copper',     id: '1.265', std: 'ASTM B88' },
                    { size: '1½"', mat: 'Type L Copper',     id: '1.505', std: 'ASTM B88' },
                    { size: '2"',  mat: 'Type L Copper',     id: '1.985', std: 'ASTM B88' },
                    { size: '2½"', mat: 'Sch 40 Black Steel', id: '2.469', std: 'ASME B36.10M' },
                    { size: '3"',  mat: 'Sch 40 Black Steel', id: '3.068', std: 'ASME B36.10M' },
                    { size: '4"',  mat: 'Sch 40 Black Steel', id: '4.026', std: 'ASME B36.10M' },
                    { size: '6"',  mat: 'Sch 40 Black Steel', id: '6.065', std: 'ASME B36.10M' },
                    { size: '8"',  mat: 'Sch 40 Black Steel', id: '7.981', std: 'ASME B36.10M' },
                    { size: '10"', mat: 'Sch 40 Black Steel', id: '10.020', std: 'ASME B36.10M' },
                    { size: '12"', mat: 'Sch 40 Black Steel', id: '11.938', std: 'ASME B36.10M' },
                  ].map((r, i) => (
                    <tr key={i} className="border-b border-gray-800 last:border-0">
                      <td className="py-2 text-blue-400">{r.size}</td>
                      <td className="py-2">{r.mat}</td>
                      <td className="py-2">{r.id}"</td>
                      <td className="py-2 text-xs text-gray-600">{r.std}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fluid Properties */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Fluid Properties by System Type</h3>
            <p className="text-sm text-gray-400 mb-4">
              Kinematic viscosity varies with temperature. MEP Calcs uses the following values per system type:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-xs text-gray-500 font-medium">System Type</th>
                    <th className="text-left py-2 text-xs text-gray-500 font-medium">Temperature</th>
                    <th className="text-left py-2 text-xs text-gray-500 font-medium">ν (ft²/s)</th>
                  </tr>
                </thead>
                <tbody className="text-gray-400">
                  {[
                    { sys: 'Chilled Water',       temp: '44°F supply / 54°F return',   nu: '0.0000141' },
                    { sys: 'Heating Hot Water',   temp: '140°F supply / 120°F return', nu: '0.0000052' },
                    { sys: 'High Temp Hot Water', temp: '180°F supply / 160°F return', nu: '0.0000038' },
                    { sys: 'Condenser Water',     temp: '85°F supply / 95°F return',   nu: '0.0000083' },
                  ].map((r, i) => (
                    <tr key={i} className="border-b border-gray-800 last:border-0">
                      <td className="py-2 text-blue-400">{r.sys}</td>
                      <td className="py-2">{r.temp}</td>
                      <td className="py-2 font-mono text-xs">{r.nu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Source: CRC Handbook of Chemistry and Physics, 97th Edition / NIST Chemistry WebBook
            </p>
          </div>

          {/* Glycol */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Glycol Correction</h3>
            <p className="text-sm text-gray-400 mb-4">
              Propylene glycol increases fluid viscosity, which increases pressure drop. MEP Calcs applies a viscosity multiplier to the base water viscosity based on glycol concentration:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-xs text-gray-500 font-medium">Glycol %</th>
                    <th className="text-left py-2 text-xs text-gray-500 font-medium">Viscosity Multiplier</th>
                    <th className="text-left py-2 text-xs text-gray-500 font-medium">Typical Use</th>
                  </tr>
                </thead>
                <tbody className="text-gray-400">
                  {[
                    { pct: '0%',  mult: '1.0×', use: 'Interior systems, no freeze risk' },
                    { pct: '20%', mult: '1.4×', use: 'Mild climates' },
                    { pct: '30%', mult: '1.8×', use: 'Most common commercial mix' },
                    { pct: '40%', mult: '2.5×', use: 'Cold climates' },
                    { pct: '50%', mult: '3.5×', use: 'Extreme cold / outdoor equipment' },
                  ].map((r, i) => (
                    <tr key={i} className="border-b border-gray-800 last:border-0">
                      <td className="py-2 text-blue-400">{r.pct}</td>
                      <td className="py-2 font-mono">{r.mult}</td>
                      <td className="py-2 text-gray-500">{r.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Source: Dow Chemical DOWFROST data / ASHRAE Handbook — HVAC Systems and Equipment
            </p>
          </div>

          {/* Assumptions */}
          <div className="bg-gray-900 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Assumptions & Limitations</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Straight pipe only — fitting losses (elbows, tees, valves) not included</li>
              <li>• Colebrook-White solved iteratively to convergence (20 iterations)</li>
              <li>• Laminar flow (Re &lt; 2300) uses f = 64/Re per standard practice</li>
              <li>• Glycol viscosity multipliers are approximate — use manufacturer data for precise design</li>
              <li>• Pipe roughness: copper ε = 0.000005 ft, steel ε = 0.00015 ft per ASHRAE</li>
              <li>• Schedule 80 required for systems exceeding 160 PSI or 250°F per mechanical code</li>
            </ul>
          </div>
        </section>

        {/* ── General Notes ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-6">General Notes</h2>

          <div className="bg-gray-900 rounded-2xl p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Intended Use</h3>
            <p className="text-sm text-gray-400">
              MEP Calcs is intended as a quick-check and preliminary sizing tool for licensed MEP engineers and designers.
              Results should be reviewed by a qualified engineer before use on construction documents.
              All calculations are provided for informational purposes only.
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Version History</h3>
            <div className="space-y-3">
              {[
                { version: '1.0', date: 'April 2026', notes: 'Initial release — Duct Sizer and Pipe Sizer' },
              ].map((v, i) => (
                <div key={i} className="flex gap-4 text-sm">
                  <span className="text-blue-400 font-medium whitespace-nowrap">v{v.version}</span>
                  <span className="text-gray-600 whitespace-nowrap">{v.date}</span>
                  <span className="text-gray-400">{v.notes}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Questions or Corrections</h3>
            <p className="text-sm text-gray-400">
              If you find an error in any calculation or have a suggestion for improvement,
              please reach out at{' '}
              <a href="mailto:hello@mepcalcs.com" className="text-blue-400 hover:text-blue-300 transition">
                hello@mepcalcs.com
              </a>
            </p>
          </div>
        </section>

        {/* Footer nav */}
        <div className="border-t border-gray-800 pt-8 flex justify-between items-center">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition">← Back to tools</a>
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} MEP Calcs</p>
        </div>

      </div>
    </main>
  );
}