'use client';
import { useState, useEffect } from 'react';

const PIPE_DATA = [
  { label: '½"',  material: 'Type L Copper',      id: 0.545,  roughness: 0.000005 },
  { label: '¾"',  material: 'Type L Copper',      id: 0.785,  roughness: 0.000005 },
  { label: '1"',  material: 'Type L Copper',      id: 1.025,  roughness: 0.000005 },
  { label: '1¼"', material: 'Type L Copper',      id: 1.265,  roughness: 0.000005 },
  { label: '1½"', material: 'Type L Copper',      id: 1.505,  roughness: 0.000005 },
  { label: '2"',  material: 'Type L Copper',      id: 1.985,  roughness: 0.000005 },
  { label: '2½"', material: 'Sch 40 Black Steel', id: 2.469,  roughness: 0.00015  },
  { label: '3"',  material: 'Sch 40 Black Steel', id: 3.068,  roughness: 0.00015  },
  { label: '4"',  material: 'Sch 40 Black Steel', id: 4.026,  roughness: 0.00015  },
  { label: '6"',  material: 'Sch 40 Black Steel', id: 6.065,  roughness: 0.00015  },
  { label: '8"',  material: 'Sch 40 Black Steel', id: 7.981,  roughness: 0.00015  },
  { label: '10"', material: 'Sch 40 Black Steel', id: 10.020, roughness: 0.00015  },
  { label: '12"', material: 'Sch 40 Black Steel', id: 11.938, roughness: 0.00015  },
];

const SYSTEM_TYPES = [
  { key: 'chw',  label: 'Chilled Water',      temp: '44°F supply / 54°F return',   nu: 0.0000141 },
  { key: 'hhw',  label: 'Heating Hot Water',  temp: '140°F supply / 120°F return', nu: 0.0000052 },
  { key: 'hhwh', label: 'High Temp Hot Water', temp: '180°F supply / 160°F return', nu: 0.0000038 },
  { key: 'cw',   label: 'Condenser Water',    temp: '85°F supply / 95°F return',   nu: 0.0000083 },
];

const GLYCOL_OPTIONS = [
  { pct: 0,  label: 'None (water only)',       multiplier: 1.0 },
  { pct: 20, label: '20% Propylene Glycol',    multiplier: 1.4 },
  { pct: 30, label: '30% Propylene Glycol',    multiplier: 1.8 },
  { pct: 40, label: '40% Propylene Glycol',    multiplier: 2.5 },
  { pct: 50, label: '50% Propylene Glycol',    multiplier: 3.5 },
];

const VELOCITY_GUIDE = [
  { application: 'Small Bore (≤ 2")',      range: '1 – 4 FPS',  note: 'Max 4 FPS per ASHRAE' },
  { application: 'Medium Bore (2½" – 4")', range: '2 – 6 FPS',  note: 'Typical commercial range' },
  { application: 'Large Bore (6"+)',        range: '4 – 10 FPS', note: 'Max 10 FPS, erosion limit' },
];

const PRESSURE_DROP_GUIDE = [
  { label: 'General Design Range',      value: '1 – 4 ft w.g. / 100 ft' },
  { label: 'Typical Design Target',     value: '2.5 ft w.g. / 100 ft' },
  { label: 'High Pressure (> 160 PSI)', value: 'Sch 80 required per code' },
];

function calcVelocity(gpm, idIn) {
  const areaFt2 = Math.PI * Math.pow(idIn / 24, 2);
  const gps = gpm / 7.48052 / 60;
  return gps / areaFt2;
}

function calcPressureDrop(gpm, idIn, roughness, nu) {
  const V = calcVelocity(gpm, idIn);
  const D = idIn / 12;
  const Re = V * D / nu;
  let f;
  if (Re < 2300) {
    f = 64 / Re;
  } else {
    const rr = roughness / D;
    f = 0.02;
    for (let i = 0; i < 20; i++) {
      f = Math.pow(-2 * Math.log10(rr / 3.7 + 2.51 / (Re * Math.sqrt(f))), -2);
    }
  }
  return f * (100 / D) * (V * V) / (2 * 32.174);
}

function velocityStatus(V, idIn) {
  const maxV = idIn <= 2 ? 4 : 10;
  if (V > maxV) return 'high';
  if (V < 1)   return 'low';
  return 'ok';
}

function pdStatus(pd) {
  if (pd > 4) return 'high';
  if (pd < 1) return 'low';
  return 'ok';
}

export default function PipeSizer() {
  const [gpm,       setGpm]       = useState('');
  const [systemKey, setSystemKey] = useState('chw');
  const [glycolPct, setGlycolPct] = useState(0);
  const [method,    setMethod]    = useState('auto');
  const [checkSize, setCheckSize] = useState('');
  const [results,   setResults]   = useState(null);

  const system = SYSTEM_TYPES.find(s => s.key === systemKey);
  const glycol = GLYCOL_OPTIONS.find(g => g.pct === glycolPct);

  useEffect(() => { compute(); }, [gpm, systemKey, glycolPct, method, checkSize]);

  function compute() {
    const Q = parseFloat(gpm);
    if (!Q || Q <= 0) { setResults(null); return; }

    const nu = system.nu * glycol.multiplier;

    const rows = PIPE_DATA.map(p => {
      const V   = calcVelocity(Q, p.id);
      const pd  = calcPressureDrop(Q, p.id, p.roughness, nu);
      const vSt = velocityStatus(V, p.id);
      const pSt = pdStatus(pd);
      const ok  = vSt === 'ok' && pSt === 'ok';
      return { ...p, V, pd, vSt, pSt, ok };
    });

    if (method === 'auto') {
      const recommended = rows.find(r => r.ok);
      setResults({ mode: 'auto', rows, recommended });
    } else {
      const selected = rows.find(r => r.label === checkSize) || null;
      setResults({ mode: 'check', rows, selected });
    }
  }

  const statusColor = (s) => s === 'high' ? 'text-red-400' : s === 'low' ? 'text-yellow-400' : 'text-blue-400';
  const statusLabel = (s) => s === 'high' ? '⚠️ High' : s === 'low' ? '⚠️ Low' : '✓ Good';

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">

        <div className="mb-8">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition mb-4 inline-block">← Back to tools</a>
          <h1 className="text-3xl font-bold text-blue-400">Pipe Sizer</h1>
          <p className="text-gray-400 mt-1">Hydronic pipe sizing per ASHRAE Fundamentals</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT ── */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="bg-gray-900 rounded-2xl p-6 space-y-5">

              <div>
                <label className="block text-sm text-gray-400 mb-1">Flow Rate (GPM)</label>
                <input type="number" value={gpm} autoFocus
                  onChange={e => setGpm(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white text-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">System Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {SYSTEM_TYPES.map(s => (
                    <button key={s.key} onClick={() => setSystemKey(s.key)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition text-left
                        ${systemKey === s.key ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      <div>{s.label}</div>
                      <div className={`text-xs mt-0.5 ${systemKey === s.key ? 'text-blue-200' : 'text-gray-600'}`}>{s.temp}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Glycol Mix</label>
                <div className="grid grid-cols-1 gap-2">
                  {GLYCOL_OPTIONS.map(g => (
                    <button key={g.pct} onClick={() => setGlycolPct(g.pct)}
                      className={`py-2 px-4 rounded-lg text-sm font-medium transition text-left flex justify-between items-center
                        ${glycolPct === g.pct ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      <span>{g.label}</span>
                      {g.pct > 0 && (
                        <span className={`text-xs ${glycolPct === g.pct ? 'text-blue-200' : 'text-gray-600'}`}>
                          ×{g.multiplier} viscosity
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {glycolPct > 0 && (
                  <p className="text-xs text-yellow-400 mt-2">⚠️ Glycol increases viscosity — pressure drop will be higher than water only</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {[['auto', 'Auto Size'], ['check', 'Check a Size']].map(([k, l]) => (
                    <button key={k} onClick={() => setMethod(k)}
                      className={`py-2 rounded-lg text-sm font-medium transition
                        ${method === k ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {method === 'check' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Select Pipe Size</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PIPE_DATA.map(p => (
                      <button key={p.label} onClick={() => setCheckSize(p.label)}
                        className={`py-2 rounded-lg text-sm font-medium transition
                          ${checkSize === p.label ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-800 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500">
                  ℹ️ <span className="text-gray-400">Schedule 80 required for systems exceeding 160 PSI or 250°F</span> — consult project specifications
                </p>
              </div>

            </div>

            {/* Auto results */}
            {results?.mode === 'auto' && results.recommended && (
              <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-200">Recommended</h2>

                <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Pipe Size</p>
                  <p className="text-3xl font-bold text-blue-400">{results.recommended.label}</p>
                  <p className="text-sm text-gray-400 mt-1">{results.recommended.material}</p>
                  <p className="text-xs text-gray-600 mt-1">ID: {results.recommended.id}" · {system.label} · {glycol.label}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Velocity</p>
                    <p className="text-2xl font-bold text-blue-400">{results.recommended.V.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">FPS ✓ Good</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Pressure Drop</p>
                    <p className="text-2xl font-bold text-blue-400">{results.recommended.pd.toFixed(3)}</p>
                    <p className="text-sm text-gray-400">ft w.g. / 100 ft</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2">All sizes for reference</p>
                  <div className="grid grid-cols-4 gap-1 mb-1 px-1">
                    <span className="text-xs text-gray-600">Size</span>
                    <span className="text-xs text-gray-600">Material</span>
                    <span className="text-xs text-gray-600 text-center">FPS</span>
                    <span className="text-xs text-gray-600 text-right">ft/100ft</span>
                  </div>
                  {results.rows.map(r => (
                    <div key={r.label}
                      className={`grid grid-cols-4 gap-1 py-2 px-1 border-b border-gray-800 last:border-0
                        ${r.label === results.recommended.label ? 'bg-blue-900/20 rounded' : ''}`}>
                      <span className={`text-xs font-medium ${r.label === results.recommended.label ? 'text-blue-400' : 'text-gray-400'}`}>
                        {r.label}{r.label === results.recommended.label ? ' ✓' : ''}
                      </span>
                      <span className="text-xs text-gray-500 truncate">{r.material.split(' ')[0]} {r.material.split(' ')[1]}</span>
                      <span className={`text-xs text-center ${statusColor(r.vSt)}`}>{r.V.toFixed(2)}</span>
                      <span className={`text-xs text-right ${statusColor(r.pSt)}`}>{r.pd.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results?.mode === 'auto' && !results.recommended && gpm && (
              <div className="bg-yellow-900/40 border border-yellow-700 rounded-xl px-4 py-3">
                <p className="text-yellow-400 text-sm">⚠️ No suitable size found for this flow rate. May exceed 12" pipe capacity.</p>
              </div>
            )}

            {/* Check results */}
            {results?.mode === 'check' && results.selected && (
              <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-200">
                  {results.selected.label} {results.selected.material}
                </h2>
                <p className="text-xs text-gray-500">{system.label} · {glycol.label}</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Velocity</p>
                    <p className={`text-2xl font-bold ${statusColor(results.selected.vSt)}`}>
                      {results.selected.V.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400">FPS {statusLabel(results.selected.vSt)}</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Pressure Drop</p>
                    <p className={`text-2xl font-bold ${statusColor(results.selected.pSt)}`}>
                      {results.selected.pd.toFixed(3)}
                    </p>
                    <p className="text-sm text-gray-400">ft w.g./100ft {statusLabel(results.selected.pSt)}</p>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Internal Diameter</p>
                  <p className="text-2xl font-bold text-blue-400">{results.selected.id}"</p>
                  <p className="text-sm text-gray-500">Per ASTM B88 / ASME B36.10M</p>
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT ── */}
          <div className="w-full lg:w-1/2 space-y-4 lg:sticky lg:top-8">

            <div className="bg-gray-900 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-200 mb-4">ASHRAE Velocity Guidelines</h2>
              <div className="grid grid-cols-3 gap-1 mb-2">
                <span className="text-xs text-gray-500 font-medium">Application</span>
                <span className="text-xs text-gray-500 font-medium text-center">Range</span>
                <span className="text-xs text-gray-500 font-medium text-right">Note</span>
              </div>
              {VELOCITY_GUIDE.map((g, i) => (
                <div key={i} className="grid grid-cols-3 gap-1 py-2 border-b border-gray-800 last:border-0">
                  <span className="text-xs text-gray-400">{g.application}</span>
                  <span className="text-xs font-medium text-blue-400 text-center">{g.range}</span>
                  <span className="text-xs text-gray-500 text-right">{g.note}</span>
                </div>
              ))}
              <p className="text-xs text-gray-600 mt-3">Source: ASHRAE Handbook of Fundamentals, Chapter 22</p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-200 mb-4">Pressure Drop Guidelines</h2>
              {PRESSURE_DROP_GUIDE.map((g, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-gray-800 last:border-0">
                  <span className="text-xs text-gray-400">{g.label}</span>
                  <span className="text-xs font-medium text-blue-400 ml-4 text-right">{g.value}</span>
                </div>
              ))}
              <p className="text-xs text-gray-600 mt-3">Source: ASHRAE Handbook of Fundamentals, Chapter 22</p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-200 mb-4">Standard Material by Size</h2>
              <div className="space-y-3">
                <div className="py-2 border-b border-gray-800">
                  <p className="text-xs font-medium text-blue-400 mb-1">Type L Copper — ½" to 2"</p>
                  <p className="text-xs text-gray-500">Standard small bore hydronic. Lead-free solder or press fittings. ASTM B88.</p>
                </div>
                <div className="py-2 border-b border-gray-800">
                  <p className="text-xs font-medium text-blue-400 mb-1">Sch 40 Black Steel — 2½" to 12"</p>
                  <p className="text-xs text-gray-500">Standard large bore hydronic mains. Grooved or welded connections. ASTM A53.</p>
                </div>
                <div className="py-2">
                  <p className="text-xs font-medium text-blue-400 mb-1">Sch 80 — High Pressure Systems</p>
                  <p className="text-xs text-gray-500">Required for systems exceeding 160 PSI or 250°F. Consult project specifications.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-200 mb-4">Glycol Selection Guide</h2>
              <div className="space-y-2">
                {[
                  { pct: '0%',  note: 'Interior systems, no freeze risk' },
                  { pct: '20%', note: 'Mild climates, light freeze protection' },
                  { pct: '30%', note: 'Most common commercial — down to ~0°F' },
                  { pct: '40%', note: 'Cold climates — down to ~-10°F' },
                  { pct: '50%', note: 'Extreme cold / outdoor equipment' },
                ].map((g, i) => (
                  <div key={i} className="flex justify-between py-1.5 border-b border-gray-800 last:border-0">
                    <span className="text-xs font-medium text-blue-400">{g.pct}</span>
                    <span className="text-xs text-gray-500 text-right ml-4">{g.note}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-3">Propylene glycol — lower toxicity, preferred for most commercial HVAC</p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}