'use client';
import { useState, useEffect } from 'react';

const PIPE_DATA = [
  { label: '½"',  material: 'Type L Copper', id: 0.545, roughness: 0.000005 },
  { label: '¾"',  material: 'Type L Copper', id: 0.785, roughness: 0.000005 },
  { label: '1"',  material: 'Type L Copper', id: 1.025, roughness: 0.000005 },
  { label: '1¼"', material: 'Type L Copper', id: 1.265, roughness: 0.000005 },
  { label: '1½"', material: 'Type L Copper', id: 1.505, roughness: 0.000005 },
  { label: '2"',  material: 'Type L Copper', id: 1.985, roughness: 0.000005 },
  { label: '2½"', material: 'Type L Copper', id: 2.465, roughness: 0.000005 },
  { label: '3"',  material: 'Type L Copper', id: 2.945, roughness: 0.000005 },
  { label: '4"',  material: 'Type L Copper', id: 3.905, roughness: 0.000005 },
];

const IPC_FIXTURES = [
  { key: 'wc_flushvalve',  label: 'Water Closet (Flushometer Valve)', wsfu: 10,  cold: 10,  hot: 0,    minPipe: '1"',   flowGPM: 3.0, minPSI: 35 },
  { key: 'wc_flushtank',   label: 'Water Closet (Flush Tank)',        wsfu: 2.5, cold: 2.5, hot: 0,    minPipe: '3/8"', flowGPM: 3.0, minPSI: 8  },
  { key: 'urinal_fv',      label: 'Urinal (Flushometer Valve)',       wsfu: 5,   cold: 5,   hot: 0,    minPipe: '¾"',   flowGPM: 1.5, minPSI: 25 },
  { key: 'lav_public',     label: 'Lavatory (Public)',                wsfu: 1.5, cold: 1.1, hot: 1.1,  minPipe: '½"',   flowGPM: 0.5, minPSI: 8  },
  { key: 'lav_private',    label: 'Lavatory (Private)',               wsfu: 1.0, cold: 0.75,hot: 0.75, minPipe: '½"',   flowGPM: 0.5, minPSI: 8  },
  { key: 'shower',         label: 'Shower',                          wsfu: 2.0, cold: 1.5, hot: 1.5,  minPipe: '½"',   flowGPM: 2.0, minPSI: 8  },
  { key: 'bathtub',        label: 'Bathtub',                         wsfu: 2.0, cold: 1.5, hot: 1.5,  minPipe: '½"',   flowGPM: 4.0, minPSI: 8  },
  { key: 'kitchen_sink',   label: 'Kitchen Sink',                    wsfu: 1.5, cold: 1.1, hot: 1.1,  minPipe: '½"',   flowGPM: 2.2, minPSI: 8  },
  { key: 'service_sink',   label: 'Service Sink',                    wsfu: 3.0, cold: 2.25,hot: 2.25, minPipe: '½"',   flowGPM: 3.0, minPSI: 8  },
  { key: 'wash_machine',   label: 'Washing Machine',                 wsfu: 2.0, cold: 1.5, hot: 1.5,  minPipe: '½"',   flowGPM: 5.0, minPSI: 8  },
  { key: 'dishwasher',     label: 'Dishwasher',                      wsfu: 1.5, cold: 0,   hot: 1.5,  minPipe: '½"',   flowGPM: 1.5, minPSI: 8  },
  { key: 'drinking_fount', label: 'Drinking Fountain',               wsfu: 0.5, cold: 0.5, hot: 0,    minPipe: '3/8"', flowGPM: 0.75,minPSI: 8  },
  { key: 'hose_bibb',      label: 'Hose Bibb',                       wsfu: 2.5, cold: 2.5, hot: 0,    minPipe: '½"',   flowGPM: 5.0, minPSI: 8  },
];

const UPC_FIXTURES = [
  { key: 'wc_flushvalve',  label: 'Water Closet (Flushometer Valve)', wsfu: 6,   cold: 6,   hot: 0,    minPipe: '1"',   flowGPM: 3.0, minPSI: 35 },
  { key: 'wc_flushtank',   label: 'Water Closet (Flush Tank)',        wsfu: 3,   cold: 3,   hot: 0,    minPipe: '3/8"', flowGPM: 3.0, minPSI: 8  },
  { key: 'urinal_fv',      label: 'Urinal (Flushometer Valve)',       wsfu: 5,   cold: 5,   hot: 0,    minPipe: '¾"',   flowGPM: 1.5, minPSI: 25 },
  { key: 'lav_public',     label: 'Lavatory (Public)',                wsfu: 2,   cold: 1.5, hot: 1.5,  minPipe: '½"',   flowGPM: 0.5, minPSI: 8  },
  { key: 'lav_private',    label: 'Lavatory (Private)',               wsfu: 1,   cold: 0.75,hot: 0.75, minPipe: '½"',   flowGPM: 0.5, minPSI: 8  },
  { key: 'shower',         label: 'Shower',                          wsfu: 2,   cold: 1.5, hot: 1.5,  minPipe: '½"',   flowGPM: 2.0, minPSI: 8  },
  { key: 'bathtub',        label: 'Bathtub',                         wsfu: 2,   cold: 1.5, hot: 1.5,  minPipe: '½"',   flowGPM: 4.0, minPSI: 8  },
  { key: 'kitchen_sink',   label: 'Kitchen Sink',                    wsfu: 2,   cold: 1.5, hot: 1.5,  minPipe: '½"',   flowGPM: 2.2, minPSI: 8  },
  { key: 'service_sink',   label: 'Service Sink',                    wsfu: 3,   cold: 2.25,hot: 2.25, minPipe: '½"',   flowGPM: 3.0, minPSI: 8  },
  { key: 'wash_machine',   label: 'Washing Machine',                 wsfu: 2,   cold: 1.5, hot: 1.5,  minPipe: '½"',   flowGPM: 5.0, minPSI: 8  },
  { key: 'dishwasher',     label: 'Dishwasher',                      wsfu: 2,   cold: 0,   hot: 2,    minPipe: '½"',   flowGPM: 1.5, minPSI: 8  },
  { key: 'drinking_fount', label: 'Drinking Fountain',               wsfu: 1,   cold: 1,   hot: 0,    minPipe: '3/8"', flowGPM: 0.75,minPSI: 8  },
  { key: 'hose_bibb',      label: 'Hose Bibb',                       wsfu: 3,   cold: 3,   hot: 0,    minPipe: '½"',   flowGPM: 5.0, minPSI: 8  },
];

const WSFU_TO_GPM_FLUSHVALVE = [
  { wsfu: 1,   gpm: 1.0  }, { wsfu: 2,   gpm: 2.0  }, { wsfu: 3,   gpm: 3.0  },
  { wsfu: 4,   gpm: 4.0  }, { wsfu: 5,   gpm: 5.0  }, { wsfu: 6,   gpm: 5.5  },
  { wsfu: 8,   gpm: 6.5  }, { wsfu: 10,  gpm: 8.0  }, { wsfu: 15,  gpm: 11.0 },
  { wsfu: 20,  gpm: 14.0 }, { wsfu: 25,  gpm: 17.0 }, { wsfu: 30,  gpm: 19.5 },
  { wsfu: 40,  gpm: 22.0 }, { wsfu: 50,  gpm: 25.0 }, { wsfu: 75,  gpm: 32.0 },
  { wsfu: 100, gpm: 42.0 }, { wsfu: 150, gpm: 65.0 }, { wsfu: 180, gpm: 85.5 },
  { wsfu: 200, gpm: 95.0 }, { wsfu: 300, gpm: 130.0 },{ wsfu: 400, gpm: 160.0 },
  { wsfu: 500, gpm: 185.0 },
];

const WSFU_TO_GPM_FLUSHTANK = [
  { wsfu: 1,   gpm: 1.0  }, { wsfu: 2,   gpm: 2.0  }, { wsfu: 3,   gpm: 3.0  },
  { wsfu: 4,   gpm: 4.0  }, { wsfu: 5,   gpm: 5.0  }, { wsfu: 6,   gpm: 5.5  },
  { wsfu: 8,   gpm: 6.5  }, { wsfu: 10,  gpm: 7.5  }, { wsfu: 15,  gpm: 9.5  },
  { wsfu: 20,  gpm: 11.5 }, { wsfu: 25,  gpm: 13.0 }, { wsfu: 30,  gpm: 14.5 },
  { wsfu: 40,  gpm: 17.0 }, { wsfu: 50,  gpm: 19.5 }, { wsfu: 75,  gpm: 25.0 },
  { wsfu: 100, gpm: 29.0 }, { wsfu: 150, gpm: 35.0 }, { wsfu: 200, gpm: 40.0 },
  { wsfu: 300, gpm: 50.0 }, { wsfu: 400, gpm: 60.0 }, { wsfu: 500, gpm: 70.0 },
];

function wsfu2gpm(wsfu, flushValve) {
  const table = flushValve ? WSFU_TO_GPM_FLUSHVALVE : WSFU_TO_GPM_FLUSHTANK;
  if (wsfu <= 0) return 0;
  if (wsfu <= table[0].wsfu) return table[0].gpm;
  if (wsfu >= table[table.length - 1].wsfu) return table[table.length - 1].gpm;
  for (let i = 0; i < table.length - 1; i++) {
    if (wsfu >= table[i].wsfu && wsfu <= table[i + 1].wsfu) {
      const t = (wsfu - table[i].wsfu) / (table[i + 1].wsfu - table[i].wsfu);
      return table[i].gpm + t * (table[i + 1].gpm - table[i].gpm);
    }
  }
  return 0;
}

function calcVelocity(gpm, idIn) {
  const areaFt2 = Math.PI * Math.pow(idIn / 24, 2);
  return (gpm / 7.48052 / 60) / areaFt2;
}

function calcPressureDropPSI(gpm, idIn, roughness, lengthFt) {
  const V = calcVelocity(gpm, idIn);
  const D = idIn / 12;
  const nu = 0.00001059;
  const Re = V * D / nu;
  if (Re < 100) return 0;
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
  const pdPer100ft = f * (100 / D) * (V * V) / (2 * 32.174) * 0.4335;
  return pdPer100ft * (lengthFt / 100);
}

export default function DomesticWaterSizer() {
  const [code,          setCode]          = useState('IPC');
  const [inputMode,     setInputMode]     = useState('gpm');
  const [flushValve,    setFlushValve]    = useState(true);
  const [gpmInput,      setGpmInput]      = useState('');
  const [wsfu,          setWsfu]          = useState('');
  const [maxVelocity,   setMaxVelocity]   = useState('5');
  const [pipeLength,    setPipeLength]    = useState('100');
  const [availPressure, setAvailPressure] = useState('60');
  const [elevation,     setElevation]     = useState('0');
  const [systemLosses,  setSystemLosses]  = useState('10');
  const [fixtureType,   setFixtureType]   = useState('wc_flushvalve');
  const [method,        setMethod]        = useState('auto');
  const [checkSize,     setCheckSize]     = useState('');
  const [results,       setResults]       = useState(null);

  const fixtures = code === 'IPC' ? IPC_FIXTURES : UPC_FIXTURES;
  const selectedFixture = fixtures.find(f => f.key === fixtureType) || fixtures[0];

  useEffect(() => { compute(); }, [
    gpmInput, wsfu, inputMode, flushValve, maxVelocity,
    pipeLength, availPressure, elevation, systemLosses,
    method, checkSize, code, fixtureType
  ]);

  function compute() {
    const maxV    = parseFloat(maxVelocity)   || 5;
    const len     = parseFloat(pipeLength)    || 100;
    const avail   = parseFloat(availPressure) || 60;
    const elev    = parseFloat(elevation)     || 0;
    const sysLoss = parseFloat(systemLosses)  || 10;
    let gpm = 0;
    let totalWsfu = 0;

    if (inputMode === 'gpm') {
      gpm = parseFloat(gpmInput) || 0;
    } else {
      totalWsfu = parseFloat(wsfu) || 0;
      gpm = wsfu2gpm(totalWsfu, flushValve);
    }

    if (gpm <= 0) { setResults(null); return; }

    // Pressure budget
    const elevLoss   = elev * 0.433; // 0.433 PSI per foot of elevation
    const availForFriction = avail - elevLoss - sysLoss;

    const rows = PIPE_DATA.map(p => {
      const V        = calcVelocity(gpm, p.id);
      const pdTotal  = calcPressureDropPSI(gpm, p.id, p.roughness, len);
      const pdPer100 = calcPressureDropPSI(gpm, p.id, p.roughness, 100);
      const remaining = availForFriction - pdTotal;
      const vOk      = V <= maxV && V >= 0.5;
      const pOk      = remaining >= selectedFixture.minPSI;
      const ok       = vOk && pOk;
      return { ...p, V, pdTotal, pdPer100, remaining, vOk, pOk, ok };
    });

    if (method === 'auto') {
      const recommended = rows.find(r => r.ok);
      setResults({
        mode: 'auto', rows, recommended, gpm, totalWsfu,
        elevLoss, availForFriction, sysLoss,
      });
    } else {
      const selected = rows.find(r => r.label === checkSize) || null;
      setResults({
        mode: 'check', rows, selected, gpm, totalWsfu,
        elevLoss, availForFriction, sysLoss,
      });
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">

        <div className="mb-8">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition mb-4 inline-block">← Back to tools</a>
          <h1 className="text-3xl font-bold text-blue-400">Domestic Water Pipe Sizer</h1>
          <p className="text-gray-400 mt-1">Size cold & hot water supply piping per IPC / UPC</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT ── */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="bg-gray-900 rounded-2xl p-6 space-y-5">

              {/* Code */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Plumbing Code</label>
                <div className="grid grid-cols-2 gap-2">
                  {['IPC', 'UPC'].map(c => (
                    <button key={c} onClick={() => setCode(c)}
                      className={`py-2 rounded-lg text-sm font-medium transition
                        ${code === c ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      {c === 'IPC' ? 'IPC — Most States' : 'UPC — West Coast'}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {code === 'IPC' ? 'International Plumbing Code 2021' : 'Uniform Plumbing Code 2021'}
                </p>
              </div>

              {/* Input Mode */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Input Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {[['gpm', 'Enter GPM'], ['wsfu', 'Enter Fixture Units']].map(([k, l]) => (
                    <button key={k} onClick={() => setInputMode(k)}
                      className={`py-2 rounded-lg text-sm font-medium transition
                        ${inputMode === k ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {inputMode === 'gpm' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Flow Rate (GPM)</label>
                  <input type="number" value={gpmInput} autoFocus
                    onChange={e => setGpmInput(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white text-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}

              {inputMode === 'wsfu' && (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Total Fixture Units (WSFU)</label>
                    <input type="number" value={wsfu} autoFocus
                      onChange={e => setWsfu(e.target.value)}
                      placeholder="e.g. 40"
                      className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white text-lg outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Flush Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[[true, 'Flushometer Valve'], [false, 'Flush Tank']].map(([v, l]) => (
                        <button key={String(v)} onClick={() => setFlushValve(v)}
                          className={`py-2 rounded-lg text-sm font-medium transition
                            ${flushValve === v ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Most commercial buildings use flushometer valves</p>
                  </div>
                </>
              )}

              {/* Fixture type for pressure check */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Most Demanding Fixture (for pressure check)</label>
                <select value={fixtureType} onChange={e => setFixtureType(e.target.value)}
                  className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                  {fixtures.map(f => (
                    <option key={f.key} value={f.key}>{f.label} — min {f.minPSI} PSI</option>
                  ))}
                </select>
              </div>

              {/* Pressure Budget */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Pressure Budget</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Available Pressure (PSI)</label>
                    <input type="number" value={availPressure}
                      onChange={e => setAvailPressure(e.target.value)}
                      className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Elevation to Fixture (ft)</label>
                    <input type="number" value={elevation}
                      onChange={e => setElevation(e.target.value)}
                      className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">System Losses (PSI)</label>
                    <input type="number" value={systemLosses}
                      onChange={e => setSystemLosses(e.target.value)}
                      className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Pipe Run Length (ft)</label>
                    <input type="number" value={pipeLength}
                      onChange={e => setPipeLength(e.target.value)}
                      className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">System losses include meter, backflow preventer, valves — default 10 PSI covers most commercial systems</p>
              </div>

              {/* Velocity & Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Max Velocity (FPS)</label>
                  <input type="number" value={maxVelocity}
                    onChange={e => setMaxVelocity(e.target.value)}
                    className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  <p className="text-xs text-gray-600 mt-1">IPC max 8 FPS</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Mode</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[['auto', 'Auto Size'], ['check', 'Check Size']].map(([k, l]) => (
                      <button key={k} onClick={() => setMethod(k)}
                        className={`py-1.5 rounded-lg text-sm font-medium transition
                          ${method === k ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
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

            </div>

            {/* Auto Results */}
            {results?.mode === 'auto' && results.recommended && (
              <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-200">Recommended</h2>

                {results.totalWsfu > 0 && (
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Converted Flow Rate</p>
                    <p className="text-2xl font-bold text-blue-400">{results.gpm.toFixed(1)} GPM</p>
                    <p className="text-sm text-gray-500">from {results.totalWsfu} WSFU · {flushValve ? 'Flushometer' : 'Flush Tank'} · {code} 2021</p>
                  </div>
                )}

                <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Pipe Size</p>
                  <p className="text-3xl font-bold text-blue-400">{results.recommended.label}</p>
                  <p className="text-sm text-gray-400 mt-1">{results.recommended.material}</p>
                  <p className="text-xs text-gray-600 mt-1">ID: {results.recommended.id}"</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Velocity</p>
                    <p className="text-2xl font-bold text-blue-400">{results.recommended.V.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">FPS ✓ Good</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Friction Loss</p>
                    <p className="text-2xl font-bold text-blue-400">{results.recommended.pdPer100.toFixed(3)}</p>
                    <p className="text-sm text-gray-400">PSI / 100 ft</p>
                  </div>
                </div>

                {/* Pressure Budget */}
                <div className={`rounded-xl p-4 ${results.recommended.pOk ? 'bg-gray-800' : 'bg-red-900/40 border border-red-700'}`}>
                  <p className="text-xs text-gray-400 mb-3">Pressure Budget</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Available pressure</span>
                      <span className="text-white">{availPressure} PSI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Elevation loss ({elevation} ft)</span>
                      <span className="text-gray-400">− {results.elevLoss.toFixed(1)} PSI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">System losses (meter, BFP, valves)</span>
                      <span className="text-gray-400">− {systemLosses} PSI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pipe friction ({pipeLength} ft run)</span>
                      <span className="text-gray-400">− {results.recommended.pdTotal.toFixed(1)} PSI</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-700 font-medium">
                      <span className="text-gray-300">Remaining at fixture</span>
                      <span className={results.recommended.pOk ? 'text-blue-400' : 'text-red-400'}>
                        {results.recommended.remaining.toFixed(1)} PSI
                        {results.recommended.pOk ? ' ✓' : ` ✗ (need ${selectedFixture.minPSI} PSI)`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* All sizes table */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">All sizes for reference</p>
                  <div className="grid grid-cols-4 gap-1 mb-1 px-1">
                    <span className="text-xs text-gray-600">Size</span>
                    <span className="text-xs text-gray-600 text-center">FPS</span>
                    <span className="text-xs text-gray-600 text-center">PSI/100ft</span>
                    <span className="text-xs text-gray-600 text-right">At Fixture</span>
                  </div>
                  {results.rows.map(r => (
                    <div key={r.label}
                      className={`grid grid-cols-4 gap-1 py-2 px-1 border-b border-gray-800 last:border-0
                        ${r.label === results.recommended.label ? 'bg-blue-900/20 rounded' : ''}`}>
                      <span className={`text-xs font-medium ${r.label === results.recommended.label ? 'text-blue-400' : 'text-gray-400'}`}>
                        {r.label}{r.label === results.recommended.label ? ' ✓' : ''}
                      </span>
                      <span className={`text-xs text-center ${r.V > (parseFloat(maxVelocity) || 5) ? 'text-red-400' : 'text-gray-300'}`}>
                        {r.V.toFixed(2)}
                      </span>
                      <span className="text-xs text-center text-gray-300">{r.pdPer100.toFixed(3)}</span>
                      <span className={`text-xs text-right ${r.pOk ? 'text-gray-300' : 'text-red-400'}`}>
                        {r.remaining.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results?.mode === 'auto' && !results.recommended && results.gpm > 0 && (
              <div className="bg-yellow-900/40 border border-yellow-700 rounded-xl px-4 py-3">
                <p className="text-yellow-400 text-sm">⚠️ No suitable pipe size found. Check velocity limit, available pressure, or consider a booster pump.</p>
              </div>
            )}

            {/* Check Results */}
            {results?.mode === 'check' && results.selected && (
              <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-200">
                  {results.selected.label} {results.selected.material}
                </h2>

                {results.totalWsfu > 0 && (
                  <div className="bg-gray-800 rounded-xl p-3">
                    <p className="text-xs text-gray-500">{results.totalWsfu} WSFU → {results.gpm.toFixed(1)} GPM · {code} 2021</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Velocity</p>
                    <p className={`text-2xl font-bold ${results.selected.V > (parseFloat(maxVelocity) || 5) ? 'text-red-400' : 'text-blue-400'}`}>
                      {results.selected.V.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400">FPS {results.selected.V > (parseFloat(maxVelocity) || 5) ? '⚠️ Too fast' : '✓ Good'}</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Friction Loss</p>
                    <p className="text-2xl font-bold text-blue-400">{results.selected.pdPer100.toFixed(3)}</p>
                    <p className="text-sm text-gray-400">PSI / 100 ft</p>
                  </div>
                </div>

                {/* Pressure Budget */}
                <div className={`rounded-xl p-4 ${results.selected.pOk ? 'bg-gray-800' : 'bg-red-900/40 border border-red-700'}`}>
                  <p className="text-xs text-gray-400 mb-3">Pressure Budget</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Available pressure</span>
                      <span className="text-white">{availPressure} PSI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Elevation loss ({elevation} ft)</span>
                      <span className="text-gray-400">− {results.elevLoss.toFixed(1)} PSI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">System losses</span>
                      <span className="text-gray-400">− {systemLosses} PSI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pipe friction ({pipeLength} ft)</span>
                      <span className="text-gray-400">− {results.selected.pdTotal.toFixed(1)} PSI</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-700 font-medium">
                      <span className="text-gray-300">Remaining at fixture</span>
                      <span className={results.selected.pOk ? 'text-blue-400' : 'text-red-400'}>
                        {results.selected.remaining.toFixed(1)} PSI
                        {results.selected.pOk ? ' ✓' : ` ✗ (need ${selectedFixture.minPSI} PSI)`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Internal Diameter</p>
                  <p className="text-2xl font-bold text-blue-400">{results.selected.id}"</p>
                  <p className="text-sm text-gray-500">Per ASTM B88 (Type L Copper)</p>
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT ── */}
          <div className="w-full lg:w-1/2 space-y-4 lg:sticky lg:top-8">

            <div className="bg-gray-900 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-200 mb-1">
                {code} 2021 — Fixture Unit Values (WSFU)
              </h2>
              <p className="text-xs text-gray-600 mb-4">
                {code === 'IPC' ? 'Table E103.3(2)' : 'Table 610.3'}
              </p>
              <div className="grid grid-cols-4 gap-1 mb-2">
                <span className="text-xs text-gray-500 font-medium col-span-2">Fixture</span>
                <span className="text-xs text-gray-500 font-medium text-center">WSFU</span>
                <span className="text-xs text-gray-500 font-medium text-right">Min PSI</span>
              </div>
              {fixtures.map((f, i) => (
                <div key={i} className="grid grid-cols-4 gap-1 py-1.5 border-b border-gray-800 last:border-0">
                  <span className="text-xs text-gray-400 col-span-2">{f.label}</span>
                  <span className="text-xs font-medium text-blue-400 text-center">{f.wsfu}</span>
                  <span className="text-xs text-gray-500 text-right">{f.minPSI}</span>
                </div>
              ))}
              <p className="text-xs text-gray-600 mt-3">
                Source: {code === 'IPC' ? 'IPC 2021 Appendix E / Table 604.3' : 'UPC 2021 Chapter 6'}
              </p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-200 mb-4">Velocity Guidelines</h2>
              {[
                { label: 'IPC Code Maximum',     value: '8 FPS',   note: 'Hard limit' },
                { label: 'Recommended',          value: '4–5 FPS', note: 'Noise & erosion control' },
                { label: 'Minimum recommended',  value: '0.5 FPS', note: 'Avoid stagnation' },
              ].map((g, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-xs text-gray-400">{g.label}</p>
                    <p className="text-xs text-gray-600">{g.note}</p>
                  </div>
                  <span className="text-xs font-medium text-blue-400 ml-4 self-center">{g.value}</span>
                </div>
              ))}
              <p className="text-xs text-gray-600 mt-3">Source: IPC 2021 Section 604.3</p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-200 mb-4">Pressure Guidelines</h2>
              {[
                { label: 'Typical street pressure',      value: '40–80 PSI' },
                { label: 'IPC maximum at fixture',       value: '80 PSI' },
                { label: 'Elevation loss',               value: '0.433 PSI/ft' },
                { label: 'Typical meter loss',           value: '4–8 PSI' },
                { label: 'Typical BFP loss',             value: '5–10 PSI' },
                { label: 'Min (flush tank)',              value: '8 PSI' },
                { label: 'Min (flushometer valve)',      value: '35 PSI' },
              ].map((g, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-gray-800 last:border-0">
                  <span className="text-xs text-gray-400">{g.label}</span>
                  <span className="text-xs font-medium text-blue-400 ml-4 text-right">{g.value}</span>
                </div>
              ))}
              <p className="text-xs text-gray-600 mt-3">Source: IPC 2021 Tables 604.3 & 604.4</p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}