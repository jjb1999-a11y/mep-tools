'use client';
import { useState, useEffect } from 'react';

// ── Data ──────────────────────────────────────────────────────────────────────

const IPC_FIXTURES = [
  { key: 'wc_flushvalve',  label: 'Water Closet (Flushometer)',  wsfu: 10,  cold: 10,   hot: 0    },
  { key: 'wc_flushtank',   label: 'Water Closet (Flush Tank)',   wsfu: 2.5, cold: 2.5,  hot: 0    },
  { key: 'urinal_fv',      label: 'Urinal (Flushometer)',        wsfu: 5,   cold: 5,    hot: 0    },
  { key: 'lav_public',     label: 'Lavatory (Public)',           wsfu: 1.5, cold: 1.1,  hot: 1.1  },
  { key: 'lav_private',    label: 'Lavatory (Private)',          wsfu: 1.0, cold: 0.75, hot: 0.75 },
  { key: 'shower',         label: 'Shower',                      wsfu: 2.0, cold: 1.5,  hot: 1.5  },
  { key: 'bathtub',        label: 'Bathtub',                     wsfu: 2.0, cold: 1.5,  hot: 1.5  },
  { key: 'kitchen_sink',   label: 'Kitchen Sink',                wsfu: 1.5, cold: 1.1,  hot: 1.1  },
  { key: 'service_sink',   label: 'Service Sink',                wsfu: 3.0, cold: 2.25, hot: 2.25 },
  { key: 'wash_machine',   label: 'Washing Machine',             wsfu: 2.0, cold: 1.5,  hot: 1.5  },
  { key: 'dishwasher',     label: 'Dishwasher',                  wsfu: 1.5, cold: 0,    hot: 1.5  },
  { key: 'drinking_fount', label: 'Drinking Fountain',           wsfu: 0.5, cold: 0.5,  hot: 0    },
  { key: 'hose_bibb',      label: 'Hose Bibb',                   wsfu: 2.5, cold: 2.5,  hot: 0    },
];

const UPC_FIXTURES = [
  { key: 'wc_flushvalve',  label: 'Water Closet (Flushometer)',  wsfu: 6,   cold: 6,    hot: 0    },
  { key: 'wc_flushtank',   label: 'Water Closet (Flush Tank)',   wsfu: 3,   cold: 3,    hot: 0    },
  { key: 'urinal_fv',      label: 'Urinal (Flushometer)',        wsfu: 5,   cold: 5,    hot: 0    },
  { key: 'lav_public',     label: 'Lavatory (Public)',           wsfu: 2,   cold: 1.5,  hot: 1.5  },
  { key: 'lav_private',    label: 'Lavatory (Private)',          wsfu: 1,   cold: 0.75, hot: 0.75 },
  { key: 'shower',         label: 'Shower',                      wsfu: 2,   cold: 1.5,  hot: 1.5  },
  { key: 'bathtub',        label: 'Bathtub',                     wsfu: 2,   cold: 1.5,  hot: 1.5  },
  { key: 'kitchen_sink',   label: 'Kitchen Sink',                wsfu: 2,   cold: 1.5,  hot: 1.5  },
  { key: 'service_sink',   label: 'Service Sink',                wsfu: 3,   cold: 2.25, hot: 2.25 },
  { key: 'wash_machine',   label: 'Washing Machine',             wsfu: 2,   cold: 1.5,  hot: 1.5  },
  { key: 'dishwasher',     label: 'Dishwasher',                  wsfu: 2,   cold: 0,    hot: 2    },
  { key: 'drinking_fount', label: 'Drinking Fountain',           wsfu: 1,   cold: 1,    hot: 0    },
  { key: 'hose_bibb',      label: 'Hose Bibb',                   wsfu: 3,   cold: 3,    hot: 0    },
];

// Service pipe sizes — Type L Copper internal diameters
const SERVICE_PIPES = [
  { label: '¾"',  id: 0.785 },
  { label: '1"',  id: 1.025 },
  { label: '1¼"', id: 1.265 },
  { label: '1½"', id: 1.505 },
  { label: '2"',  id: 1.985 },
  { label: '2½"', id: 2.465 },
  { label: '3"',  id: 2.945 },
  { label: '4"',  id: 3.905 },
];

// AWWA M22 meter capacities
const METERS = [
  { label: '⅝"',  maxContinuous: 20,   maxPeak: 30   },
  { label: '¾"',  maxContinuous: 30,   maxPeak: 50   },
  { label: '1"',  maxContinuous: 50,   maxPeak: 75   },
  { label: '1½"', maxContinuous: 100,  maxPeak: 150  },
  { label: '2"',  maxContinuous: 160,  maxPeak: 200  },
  { label: '3"',  maxContinuous: 315,  maxPeak: 450  },
  { label: '4"',  maxContinuous: 500,  maxPeak: 700  },
  { label: '6"',  maxContinuous: 1000, maxPeak: 1500 },
];

// IPC Table E103.3(3) WSFU → GPM
const WSFU_TO_GPM_FV = [
  [1,1],[2,2],[3,3],[4,4],[5,5],[6,5.5],[8,6.5],[10,8],[15,11],[20,14],
  [25,17],[30,19.5],[40,22],[50,25],[75,32],[100,42],[150,65],[180,85.5],
  [200,95],[300,130],[400,160],[500,185],
];
const WSFU_TO_GPM_FT = [
  [1,1],[2,2],[3,3],[4,4],[5,5],[6,5.5],[8,6.5],[10,7.5],[15,9.5],[20,11.5],
  [25,13],[30,14.5],[40,17],[50,19.5],[75,25],[100,29],[150,35],[200,40],
  [300,50],[400,60],[500,70],
];

function wsfu2gpm(wsfu, fv) {
  const t = fv ? WSFU_TO_GPM_FV : WSFU_TO_GPM_FT;
  if (wsfu <= 0) return 0;
  if (wsfu <= t[0][0]) return t[0][1];
  if (wsfu >= t[t.length-1][0]) return t[t.length-1][1];
  for (let i = 0; i < t.length-1; i++) {
    if (wsfu >= t[i][0] && wsfu <= t[i+1][0]) {
      const r = (wsfu - t[i][0]) / (t[i+1][0] - t[i][0]);
      return t[i][1] + r * (t[i+1][1] - t[i][1]);
    }
  }
  return 0;
}

function calcVelocity(gpm, idIn) {
  const area = Math.PI * Math.pow(idIn / 24, 2);
  return (gpm / 7.48052 / 60) / area;
}

function calcPD(gpm, idIn, lengthFt) {
  const V = calcVelocity(gpm, idIn);
  const D = idIn / 12;
  const Re = V * D / 0.00001059;
  if (Re < 100) return 0;
  let f;
  if (Re < 2300) { f = 64 / Re; }
  else {
    const rr = 0.000005 / D;
    f = 0.02;
    for (let i = 0; i < 20; i++)
      f = Math.pow(-2 * Math.log10(rr / 3.7 + 2.51 / (Re * Math.sqrt(f))), -2);
  }
  return f * (100 / D) * V * V / (2 * 32.174) * 0.4335 * (lengthFt / 100);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function WaterServiceSizer() {
  const [code,         setCode]         = useState('IPC');
  const [flushValve,   setFlushValve]   = useState(true);
  const [counts,       setCounts]       = useState({});
  const [contLoad,     setContLoad]     = useState('');
  const [streetPSI,    setStreetPSI]    = useState('60');
  const [elevation,    setElevation]    = useState('0');
  const [serviceLen,   setServiceLen]   = useState('50');
  const [results,      setResults]      = useState(null);

  const fixtures = code === 'IPC' ? IPC_FIXTURES : UPC_FIXTURES;

  useEffect(() => { compute(); }, [code, flushValve, counts, contLoad, streetPSI, elevation, serviceLen]);

  function compute() {
    // Total WSFU
    let totalWsfu = 0, coldWsfu = 0, hotWsfu = 0;
    fixtures.forEach(f => {
      const qty = parseInt(counts[f.key] || 0);
      if (qty > 0) {
        totalWsfu += f.wsfu * qty;
        coldWsfu  += f.cold  * qty;
        hotWsfu   += f.hot   * qty;
      }
    });

    if (totalWsfu === 0 && !contLoad) { setResults(null); return; }

    // Convert to GPM
    const fixtureGPM = wsfu2gpm(totalWsfu, flushValve);
    const contGPM    = parseFloat(contLoad) || 0;
    const totalGPM   = fixtureGPM + contGPM;

    const coldGPM = wsfu2gpm(coldWsfu, flushValve) + contGPM;
    const hotGPM  = wsfu2gpm(hotWsfu, flushValve);

    // Size service pipe — velocity ≤ 8 FPS
    const pipe = SERVICE_PIPES.find(p => calcVelocity(totalGPM, p.id) <= 8);

    // Size meter — peak GPM ≤ maxPeak
    const meter = METERS.find(m => totalGPM <= m.maxPeak);

    // Pressure budget
    const len      = parseFloat(serviceLen) || 50;
    const elev     = parseFloat(elevation)  || 0;
    const elevLoss = elev * 0.433;
    const pipePD   = pipe ? calcPD(totalGPM, pipe.id, len) : 0;
    const meterPD  = meter ? Math.min(totalGPM / meter.maxPeak * 15, 15) : 0; // approx meter loss
    const remaining = parseFloat(streetPSI) - elevLoss - pipePD - meterPD;

    setResults({
      totalWsfu, coldWsfu, hotWsfu,
      fixtureGPM, contGPM, totalGPM,
      coldGPM, hotGPM,
      pipe, meter,
      elevLoss, pipePD, meterPD, remaining,
    });
  }

  function updateCount(key, val) {
    setCounts(prev => ({ ...prev, [key]: val }));
  }

  const totalFixtures = Object.values(counts).reduce((s, v) => s + (parseInt(v) || 0), 0);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">

        <div className="mb-8">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition mb-4 inline-block">← Back to tools</a>
          <h1 className="text-3xl font-bold text-blue-400">Water Service Sizer</h1>
          <p className="text-gray-400 mt-1">Size building water service and meter from fixture counts per IPC / UPC & AWWA M22</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT: Inputs ── */}
          <div className="w-full lg:w-1/2 space-y-4">

            {/* Code & Flush Type */}
            <div className="bg-gray-900 rounded-2xl p-6 space-y-5">

              <div>
                <label className="block text-sm text-gray-400 mb-2">Plumbing Code</label>
                <div className="grid grid-cols-2 gap-2">
                  {['IPC', 'UPC'].map(c => (
                    <button key={c} onClick={() => { setCode(c); setCounts({}); }}
                      className={`py-2 rounded-lg text-sm font-medium transition
                        ${code === c ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      {c === 'IPC' ? 'IPC — Most States' : 'UPC — West Coast'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Flush Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[[true,'Flushometer Valve'],[false,'Flush Tank']].map(([v,l]) => (
                    <button key={String(v)} onClick={() => setFlushValve(v)}
                      className={`py-2 rounded-lg text-sm font-medium transition
                        ${flushValve === v ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      {l}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1">Most commercial buildings use flushometer valves</p>
              </div>

            </div>

            {/* Fixture Counts */}
            <div className="bg-gray-900 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-200">Fixture Count</h2>
                {totalFixtures > 0 && (
                  <span className="text-xs text-blue-400 bg-blue-950 px-2 py-1 rounded-full">
                    {totalFixtures} fixtures
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {fixtures.map(f => (
                  <div key={f.key} className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{f.label}</p>
                      <p className="text-xs text-gray-600">{f.wsfu} WSFU each</p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={counts[f.key] || ''}
                      onChange={e => updateCount(f.key, e.target.value)}
                      placeholder="0"
                      className="w-20 bg-gray-800 rounded-lg px-3 py-2 text-white text-right outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Continuous Loads & Pressure */}
            <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-200 mb-2">Additional Loads & Pressure</h2>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Continuous Load (GPM) — irrigation, cooling tower makeup, etc.</label>
                <input type="number" value={contLoad}
                  onChange={e => setContLoad(e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Street Pressure (PSI)</label>
                  <input type="number" value={streetPSI}
                    onChange={e => setStreetPSI(e.target.value)}
                    className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Building Entry Elevation (ft)</label>
                  <input type="number" value={elevation}
                    onChange={e => setElevation(e.target.value)}
                    className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Service Line Length (ft)</label>
                  <input type="number" value={serviceLen}
                    onChange={e => setServiceLen(e.target.value)}
                    className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT: Results ── */}
          <div className="w-full lg:w-1/2 space-y-4 lg:sticky lg:top-8">

            {results ? (
              <>
                {/* Demand Summary */}
                <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-gray-200">Demand Summary</h2>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-800 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400 mb-1">Total WSFU</p>
                      <p className="text-2xl font-bold text-blue-400">{results.totalWsfu.toFixed(1)}</p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400 mb-1">Fixture GPM</p>
                      <p className="text-2xl font-bold text-blue-400">{results.fixtureGPM.toFixed(1)}</p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400 mb-1">Total GPM</p>
                      <p className="text-2xl font-bold text-blue-400">{results.totalGPM.toFixed(1)}</p>
                    </div>
                  </div>

                  {results.contGPM > 0 && (
                    <p className="text-xs text-gray-500">Includes {results.contGPM} GPM continuous load</p>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">Cold Water Demand</p>
                      <p className="text-lg font-bold text-blue-400">{results.coldGPM.toFixed(1)} GPM</p>
                      <p className="text-xs text-gray-600">{results.coldWsfu.toFixed(1)} WSFU cold</p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">Hot Water Demand</p>
                      <p className="text-lg font-bold text-blue-400">{results.hotGPM.toFixed(1)} GPM</p>
                      <p className="text-xs text-gray-600">{results.hotWsfu.toFixed(1)} WSFU hot</p>
                    </div>
                  </div>
                </div>

                {/* Service & Meter */}
                <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-gray-200">Recommended Service</h2>

                  {results.pipe ? (
                    <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Water Service Size</p>
                      <p className="text-3xl font-bold text-blue-400">{results.pipe.label}</p>
                      <p className="text-sm text-gray-400 mt-1">Type L Copper</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Velocity: {calcVelocity(results.totalGPM, results.pipe.id).toFixed(2)} FPS
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-900/40 border border-yellow-700 rounded-xl p-4">
                      <p className="text-yellow-400 text-sm">⚠️ Flow exceeds 4" service pipe — consult a plumbing engineer</p>
                    </div>
                  )}

                  {results.meter ? (
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Meter Size</p>
                      <p className="text-3xl font-bold text-blue-400">{results.meter.label}</p>
                      <p className="text-sm text-gray-400 mt-1">Per AWWA M22</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Max continuous: {results.meter.maxContinuous} GPM · Max peak: {results.meter.maxPeak} GPM
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-900/40 border border-yellow-700 rounded-xl p-4">
                      <p className="text-yellow-400 text-sm">⚠️ Flow exceeds 6" meter capacity — consult water utility</p>
                    </div>
                  )}
                </div>

                {/* Pressure Budget */}
                <div className={`bg-gray-900 rounded-2xl p-6 space-y-3 ${results.remaining < 35 ? 'border border-yellow-700' : ''}`}>
                  <h2 className="text-lg font-semibold text-gray-200">Pressure at Building Entry</h2>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Street pressure</span>
                      <span className="text-white">{streetPSI} PSI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Elevation loss ({elevation} ft)</span>
                      <span className="text-gray-400">− {results.elevLoss.toFixed(1)} PSI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Service pipe friction ({serviceLen} ft)</span>
                      <span className="text-gray-400">− {results.pipePD.toFixed(1)} PSI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Meter pressure loss (est.)</span>
                      <span className="text-gray-400">− {results.meterPD.toFixed(1)} PSI</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-700 font-medium">
                      <span className="text-gray-300">Available at building entry</span>
                      <span className={results.remaining >= 40 ? 'text-blue-400' : results.remaining >= 25 ? 'text-yellow-400' : 'text-red-400'}>
                        {results.remaining.toFixed(1)} PSI
                        {results.remaining >= 40 ? ' ✓' : results.remaining >= 25 ? ' ⚠️ Low' : ' ✗ Insufficient'}
                      </span>
                    </div>
                  </div>

                  {results.remaining < 40 && results.remaining >= 25 && (
                    <p className="text-xs text-yellow-400">⚠️ Pressure is adequate but tight — verify with water utility and consider pressure booster pump</p>
                  )}
                  {results.remaining < 25 && (
                    <p className="text-xs text-red-400">✗ Insufficient pressure — a booster pump will likely be required</p>
                  )}
                </div>

              </>
            ) : (
              <div className="bg-gray-900 rounded-2xl p-8 text-center">
                <p className="text-gray-500 text-sm">Enter fixture counts to see service sizing results</p>
              </div>
            )}

            {/* Reference */}
            <div className="bg-gray-900 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-200 mb-4">AWWA M22 Meter Capacities</h2>
              <div className="grid grid-cols-3 gap-1 mb-2">
                <span className="text-xs text-gray-500 font-medium">Meter</span>
                <span className="text-xs text-gray-500 font-medium text-center">Max Cont.</span>
                <span className="text-xs text-gray-500 font-medium text-right">Max Peak</span>
              </div>
              {METERS.map((m, i) => (
                <div key={i} className="grid grid-cols-3 gap-1 py-1.5 border-b border-gray-800 last:border-0">
                  <span className="text-xs font-medium text-blue-400">{m.label}</span>
                  <span className="text-xs text-gray-400 text-center">{m.maxContinuous} GPM</span>
                  <span className="text-xs text-gray-400 text-right">{m.maxPeak} GPM</span>
                </div>
              ))}
              <p className="text-xs text-gray-600 mt-3">Source: AWWA Manual M22, 4th Edition</p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}