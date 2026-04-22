'use client';
import { useState, useEffect } from 'react';

const STANDARD_ROUND = [4,5,6,7,8,9,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48];

const VELOCITY_GUIDE = [
  { application: 'Low Pressure Mains',        velocity: '800–1200',  pressure: '½" – 1" w.g.' },
  { application: 'Low Pressure Branches',     velocity: '600–1000',  pressure: '½" – 1" w.g.' },
  { application: 'Branch to Diffuser/Grille', velocity: '400–600',   pressure: '½" w.g.' },
  { application: 'Medium Pressure Mains',     velocity: '1500–2500', pressure: '2" – 3" w.g.' },
  { application: 'High Pressure Mains',       velocity: '2500–3500', pressure: '3" – 6" w.g.' },
  { application: 'VAV Upstream of Box',       velocity: '1500–2500', pressure: '2" w.g. min' },
  { application: 'Kitchen Exhaust (Grease)',  velocity: '1500–2500', pressure: '1" – 2" w.g.' },
  { application: 'Toilet / General Exhaust',  velocity: '1000–1500', pressure: '½" – 1" w.g.' },
];

const PRESSURE_CLASSES = [
  { class: '½" w.g.',  operating: 'Up to ½" w.g.' },
  { class: '1" w.g.',  operating: 'Over ½" up to 1"' },
  { class: '2" w.g.',  operating: 'Over 1" up to 2"' },
  { class: '3" w.g.',  operating: 'Over 2" up to 3"' },
  { class: '4" w.g.',  operating: 'Over 3" up to 4"' },
  { class: '6" w.g.',  operating: 'Over 4" up to 6"' },
  { class: '10" w.g.', operating: 'Over 6" up to 10"' },
];

// ── Sizing formulas (ASHRAE HoF 2021 Ch.21) ──────────────────────────────────
function calcDiameter(cfm, fr) {
  return Math.pow((0.109 * Math.pow(cfm, 1.9)) / fr, 0.199);
}
function calcFriction(cfm, dIn) {
  return (0.109 * Math.pow(cfm, 1.9)) / Math.pow(dIn, 1 / 0.199);
}
function calcVelocity(cfm, dIn) {
  return cfm / (Math.PI * Math.pow(dIn / 24, 2));
}
function nearestStd(d) {
  return STANDARD_ROUND.reduce((prev, curr) =>
    Math.abs(curr - d) < Math.abs(prev - d) ? curr : prev);
}
function nextStdUp(dIn) {
  return STANDARD_ROUND.find(s => s > dIn) || STANDARD_ROUND[STANDARD_ROUND.length - 1];
}
function ceil2(v) { return Math.ceil(v / 2) * 2; }

// ── Equivalent round diameter (ASHRAE HoF 2021 Ch.21 Eq. 24-25) ───────────────
// Rectangular: De = 1.30 × (a·b)^0.625 / (a+b)^0.25
function rectEquivRound(w, h) {
  return 1.30 * Math.pow(w * h, 0.625) / Math.pow(w + h, 0.25);
}
// Flat oval: De = 1.55 × A^0.625 / P^0.25
// A = π·a²/4 + a·(B−a)  ·  P = π·a + 2·(B−a)
// where a = minor axis, B = major axis
function ovalEquivRound(minor, major) {
  const a = minor, B = major;
  const A = (Math.PI * a * a / 4) + a * (B - a);
  const P = (Math.PI * a) + 2 * (B - a);
  return 1.55 * Math.pow(A, 0.625) / Math.pow(P, 0.25);
}

function rectDuct(cfm, vel, maxW, maxH) {
  const areaIn2 = (cfm / vel) * 144;
  let w, h;
  if (maxH > 0)      { h = maxH; w = areaIn2 / h; }
  else if (maxW > 0) { w = maxW; h = areaIn2 / w; }
  else               { h = Math.sqrt(areaIn2 / 2); w = h * 2; }
  w = ceil2(w); h = ceil2(h);
  return { w, h, ar: (Math.max(w, h) / Math.min(w, h)).toFixed(1) };
}

function ovalDuct(cfm, vel, constrainMinor, constrainMajor) {
  const areaIn2 = (cfm / vel) * 144;
  const equivD  = Math.sqrt(areaIn2 * 4 / Math.PI);
  let A, B;
  if (constrainMinor > 0) {
    A = constrainMinor;
    B = ceil2((areaIn2 - (Math.PI / 4) * Math.pow(A, 2)) / A + A);
  } else if (constrainMajor > 0) {
    B = constrainMajor;
    const a = (Math.PI / 4) - 1, b = B, c = -areaIn2;
    A = ceil2((-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a));
  } else {
    A = Math.max(6, ceil2(equivD * 0.55));
    B = ceil2((areaIn2 - (Math.PI / 4) * Math.pow(A, 2)) / A + A);
  }
  return { minor: A, major: B };
}

function velStatus(V) {
  return V > 2000 ? 'high' : V < 400 ? 'low' : 'ok';
}

export default function Home() {
  const [tab,                 setTab]                 = useState('round');
  const [cfm,                 setCfm]                 = useState('');
  const [method,              setMethod]              = useState('friction');
  const [fr,                  setFr]                  = useState('0.1');
  const [velTarget,           setVelTarget]           = useState('1000');
  const [maxW,                setMaxW]                = useState('');
  const [maxH,                setMaxH]                = useState('');
  const [ovalMinorConstraint, setOvalMinorConstraint] = useState('');
  const [ovalMajorConstraint, setOvalMajorConstraint] = useState('');
  const [results,             setResults]             = useState(null);
  const [warning,             setWarning]             = useState('');

  // ── Manual mode state ───────────────────────────────────────────────────────
  const [manualShape,   setManualShape]   = useState('round'); // round | rect | oval
  const [manualDia,     setManualDia]     = useState('');
  const [manualW,       setManualW]       = useState('');
  const [manualH,       setManualH]       = useState('');
  const [manualMinor,   setManualMinor]   = useState('');
  const [manualMajor,   setManualMajor]   = useState('');
  const [manualResults, setManualResults] = useState(null);

  useEffect(() => { compute(); }, [cfm, method, fr, velTarget, maxW, maxH, tab, ovalMinorConstraint, ovalMajorConstraint]);

  useEffect(() => { computeManual(); }, [cfm, manualShape, manualDia, manualW, manualH, manualMinor, manualMajor, tab]);

  function compute() {
    setWarning('');
    if (tab === 'manual') { setResults(null); return; }
    const Q      = parseFloat(cfm);
    const frVal  = parseFloat(fr);
    const velVal = parseFloat(velTarget);
    const mw     = parseFloat(maxW) || 0;
    const mh     = parseFloat(maxH) || 0;
    const oMinor = parseFloat(ovalMinorConstraint) || 0;
    const oMajor = parseFloat(ovalMajorConstraint) || 0;

    if (!Q || Q <= 0) { setResults(null); return; }

    let stdD, originalStd;

    if (method === 'friction') {
      if (!frVal || frVal <= 0) return;
      stdD = nearestStd(calcDiameter(Q, frVal));
    } else if (method === 'velocity') {
      if (!velVal || velVal <= 0) return;
      stdD = nearestStd(Math.sqrt((Q / velVal) / Math.PI) * 24);
    } else {
      if (!frVal || frVal <= 0 || !velVal || velVal <= 0) return;
      stdD = nearestStd(calcDiameter(Q, frVal));
      originalStd = stdD;
      while (calcVelocity(Q, stdD) > velVal) {
        const next = nextStdUp(stdD);
        if (next === stdD) break;
        stdD = next;
      }
      if (stdD !== originalStd)
        setWarning(`Upsized from ${originalStd}" to ${stdD}" to satisfy max velocity of ${velVal} FPM`);
    }

    const V        = calcVelocity(Q, stdD);
    const frActual = calcFriction(Q, stdD);
    const rect     = rectDuct(Q, V, mw, mh);
    const oval     = ovalDuct(Q, V, oMinor, oMajor);

    setResults({
      stdD, V: Math.round(V), fr: frActual.toFixed(4),
      rectW: rect.w, rectH: rect.h, ar: rect.ar,
      arWarn: parseFloat(rect.ar) > 4,
      ovalMinor: oval.minor, ovalMajor: oval.major,
      vStatus: velStatus(V),
    });
  }

  function computeManual() {
    if (tab !== 'manual') { setManualResults(null); return; }
    const Q = parseFloat(cfm);
    if (!Q || Q <= 0) { setManualResults(null); return; }

    let dEq = 0; // equivalent round diameter in inches
    let areaIn2 = 0;
    let shapeLabel = '';

    if (manualShape === 'round') {
      const d = parseFloat(manualDia);
      if (!d || d <= 0) { setManualResults(null); return; }
      dEq = d;
      areaIn2 = Math.PI * Math.pow(d / 2, 2);
      shapeLabel = `${d}" round`;
    } else if (manualShape === 'rect') {
      const w = parseFloat(manualW);
      const h = parseFloat(manualH);
      if (!w || !h || w <= 0 || h <= 0) { setManualResults(null); return; }
      dEq = rectEquivRound(w, h);
      areaIn2 = w * h;
      shapeLabel = `${w}" × ${h}" rect`;
    } else {
      const minor = parseFloat(manualMinor);
      const major = parseFloat(manualMajor);
      if (!minor || !major || minor <= 0 || major <= 0) { setManualResults(null); return; }
      if (minor >= major) { setManualResults({ error: 'Minor axis must be less than major axis' }); return; }
      dEq = ovalEquivRound(minor, major);
      areaIn2 = (Math.PI * minor * minor / 4) + minor * (major - minor);
      shapeLabel = `${major}" × ${minor}" flat oval`;
    }

    const V = Q * 144 / areaIn2;
    const fr = calcFriction(Q, dEq);
    const vs = velStatus(V);

    // Aspect ratio warning for rectangular
    let arWarn = false, ar = null;
    if (manualShape === 'rect') {
      const w = parseFloat(manualW), h = parseFloat(manualH);
      ar = (Math.max(w, h) / Math.min(w, h)).toFixed(1);
      arWarn = parseFloat(ar) > 4;
    }

    setManualResults({
      shapeLabel,
      V: Math.round(V),
      fr: fr.toFixed(4),
      dEq: dEq.toFixed(1),
      areaFt2: (areaIn2 / 144).toFixed(2),
      vStatus: vs,
      ar, arWarn,
    });
  }

  const vColor = results?.vStatus === 'high' ? 'text-red-400' : results?.vStatus === 'low' ? 'text-yellow-400' : 'text-blue-400';
  const vLabel = results?.vStatus === 'high' ? '⚠️ Too fast' : results?.vStatus === 'low' ? '⚠️ Too slow' : '✓ Good';

  const mvColor = manualResults?.vStatus === 'high' ? 'text-red-400' : manualResults?.vStatus === 'low' ? 'text-yellow-400' : 'text-blue-400';
  const mvLabel = manualResults?.vStatus === 'high' ? '⚠️ Too fast' : manualResults?.vStatus === 'low' ? '⚠️ Too slow' : '✓ Good';

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Header */}
        <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition mb-4 inline-block">← Back to tools</a>
        <h1 className="text-3xl font-bold text-blue-400 mb-8">Duct Sizer</h1>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT: Calculator ── */}
          <div className="w-full lg:w-1/2 space-y-4">

            {/* Shape / Mode Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-gray-900 rounded-2xl p-2">
              {[['round','⬤  Round & Rect'],['oval','▬  Flat Oval'],['manual','✎  Manual']].map(([k,l]) => (
                <button key={k} onClick={() => setTab(k)}
                  className={`py-3 rounded-xl text-sm font-medium transition
                    ${tab === k ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                  {l}
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div className="bg-gray-900 rounded-2xl p-6 space-y-5">

              <div>
                <label className="block text-sm text-gray-400 mb-1">Airflow (CFM)</label>
                <input type="number" value={cfm} autoFocus
                  onChange={e => setCfm(e.target.value)}
                  placeholder="e.g. 2000"
                  className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white text-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* ── Sizing mode inputs (round/oval tabs) ── */}
              {tab !== 'manual' && (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Sizing Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[['friction','Friction Rate'],['velocity','Velocity'],['both','Both']].map(([k,l]) => (
                        <button key={k} onClick={() => setMethod(k)}
                          className={`py-2 rounded-lg text-sm font-medium transition
                            ${method === k ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(method === 'friction' || method === 'both') && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Friction Rate (in. w.g. / 100 ft)</label>
                      <input type="number" value={fr} onChange={e => setFr(e.target.value)}
                        placeholder="e.g. 0.1"
                        className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  )}

                  {(method === 'velocity' || method === 'both') && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        {method === 'both' ? 'Max Velocity (FPM)' : 'Target Velocity (FPM)'}
                      </label>
                      <input type="number" value={velTarget} onChange={e => setVelTarget(e.target.value)}
                        placeholder="e.g. 1000"
                        className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  )}

                  {tab === 'round' && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Rectangular Constraint (optional)</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Max Width (in)</label>
                          <input type="number" value={maxW}
                            onChange={e => { setMaxW(e.target.value); if (e.target.value) setMaxH(''); }}
                            placeholder="e.g. 24"
                            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Max Height (in)</label>
                          <input type="number" value={maxH}
                            onChange={e => { setMaxH(e.target.value); if (e.target.value) setMaxW(''); }}
                            placeholder="e.g. 12"
                            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Set one — the other calculates automatically</p>
                    </div>
                  )}

                  {tab === 'oval' && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Oval Constraint (optional)</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Max Major Axis (in)</label>
                          <input type="number" value={ovalMajorConstraint}
                            onChange={e => { setOvalMajorConstraint(e.target.value); if (e.target.value) setOvalMinorConstraint(''); }}
                            placeholder="e.g. 36"
                            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Max Minor Axis (in)</label>
                          <input type="number" value={ovalMinorConstraint}
                            onChange={e => { setOvalMinorConstraint(e.target.value); if (e.target.value) setOvalMajorConstraint(''); }}
                            placeholder="e.g. 12"
                            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Set one — the other calculates automatically</p>
                    </div>
                  )}
                </>
              )}

              {/* ── Manual mode inputs ── */}
              {tab === 'manual' && (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Duct Shape</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[['round','Round'],['rect','Rectangular'],['oval','Flat Oval']].map(([k,l]) => (
                        <button key={k} onClick={() => setManualShape(k)}
                          className={`py-2 rounded-lg text-sm font-medium transition
                            ${manualShape === k ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {manualShape === 'round' && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Diameter (in)</label>
                      <input type="number" value={manualDia} onChange={e => setManualDia(e.target.value)}
                        placeholder="e.g. 14"
                        className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  )}

                  {manualShape === 'rect' && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Rectangular Dimensions</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Width (in)</label>
                          <input type="number" value={manualW} onChange={e => setManualW(e.target.value)}
                            placeholder="e.g. 24"
                            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Height (in)</label>
                          <input type="number" value={manualH} onChange={e => setManualH(e.target.value)}
                            placeholder="e.g. 12"
                            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {manualShape === 'oval' && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Flat Oval Dimensions</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Major Axis (in)</label>
                          <input type="number" value={manualMajor} onChange={e => setManualMajor(e.target.value)}
                            placeholder="e.g. 36"
                            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Minor Axis (in)</label>
                          <input type="number" value={manualMinor} onChange={e => setManualMinor(e.target.value)}
                            placeholder="e.g. 12"
                            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-600">Enter the known duct size — the tool will calculate velocity and friction rate at the given airflow.</p>
                </>
              )}

            </div>

            {warning && tab !== 'manual' && (
              <div className="bg-blue-900/40 border border-blue-700 rounded-xl px-4 py-3">
                <p className="text-blue-300 text-sm">ℹ️ {warning}</p>
              </div>
            )}

            {/* ── Sizing Results ── */}
            {results && tab !== 'manual' && (
              <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-200">Results</h2>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Velocity</p>
                    <p className={`text-2xl font-bold ${vColor}`}>{results.V}</p>
                    <p className="text-sm text-gray-400">FPM {vLabel}</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Actual Friction</p>
                    <p className="text-2xl font-bold text-blue-400">{results.fr}</p>
                    <p className="text-sm text-gray-400">in. w.g. / 100 ft</p>
                  </div>
                </div>

                {tab === 'round' && (
                  <>
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Round Duct</p>
                      <p className="text-2xl font-bold text-blue-400">{results.stdD}"</p>
                      <p className="text-sm text-gray-500">Standard size</p>
                    </div>
                    <div className={`rounded-xl p-4 ${results.arWarn ? 'bg-yellow-900/40 border border-yellow-700' : 'bg-gray-800'}`}>
                      <p className="text-xs text-gray-400 mb-1">Rectangular Duct</p>
                      <p className="text-2xl font-bold text-blue-400">{results.rectW}" × {results.rectH}"</p>
                      <p className="text-sm text-gray-500">Aspect ratio {results.ar}:1</p>
                      {results.arWarn && (
                        <p className="text-yellow-400 text-xs mt-2">⚠️ Exceeds 4:1 — not recommended per SMACNA</p>
                      )}
                    </div>
                  </>
                )}

                {tab === 'oval' && (
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Flat Oval Duct</p>
                    <p className="text-2xl font-bold text-blue-400">{results.ovalMajor}" × {results.ovalMinor}"</p>
                    <p className="text-sm text-gray-500">Major × Minor axis</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Manual Results ── */}
            {manualResults && tab === 'manual' && (
              <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-200">Performance at {manualResults.shapeLabel || 'given size'}</h2>

                {manualResults.error ? (
                  <div className="bg-red-900/40 border border-red-700 rounded-xl px-4 py-3">
                    <p className="text-red-300 text-sm">⚠️ {manualResults.error}</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-800 rounded-xl p-4">
                        <p className="text-xs text-gray-400 mb-1">Velocity</p>
                        <p className={`text-2xl font-bold ${mvColor}`}>{manualResults.V}</p>
                        <p className="text-sm text-gray-400">FPM {mvLabel}</p>
                      </div>
                      <div className="bg-gray-800 rounded-xl p-4">
                        <p className="text-xs text-gray-400 mb-1">Friction Rate</p>
                        <p className="text-2xl font-bold text-blue-400">{manualResults.fr}</p>
                        <p className="text-sm text-gray-400">in. w.g. / 100 ft</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-800 rounded-xl p-4">
                        <p className="text-xs text-gray-400 mb-1">Equivalent Round Ø</p>
                        <p className="text-xl font-bold text-blue-400">{manualResults.dEq}"</p>
                        <p className="text-xs text-gray-500">Per ASHRAE Eq. 24-25</p>
                      </div>
                      <div className="bg-gray-800 rounded-xl p-4">
                        <p className="text-xs text-gray-400 mb-1">Cross-Section Area</p>
                        <p className="text-xl font-bold text-blue-400">{manualResults.areaFt2} ft²</p>
                      </div>
                    </div>

                    {manualResults.ar && (
                      <div className={`rounded-xl p-4 ${manualResults.arWarn ? 'bg-yellow-900/40 border border-yellow-700' : 'bg-gray-800'}`}>
                        <p className="text-xs text-gray-400 mb-1">Aspect Ratio</p>
                        <p className="text-lg font-semibold text-blue-400">{manualResults.ar}:1</p>
                        {manualResults.arWarn && (
                          <p className="text-yellow-400 text-xs mt-2">⚠️ Exceeds 4:1 — not recommended per SMACNA</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

          </div>

          {/* ── RIGHT: Reference Tables ── */}
          <div className="w-full lg:w-1/2 space-y-4 lg:sticky lg:top-8">

            <div className="bg-gray-900 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-200 mb-4">Industry Velocity & Pressure Guide</h2>
              <div className="grid grid-cols-3 gap-1 mb-2">
                <span className="text-xs text-gray-500 font-medium">Application</span>
                <span className="text-xs text-gray-500 font-medium text-center">Velocity (FPM)</span>
                <span className="text-xs text-gray-500 font-medium text-right">Pressure</span>
              </div>
              {VELOCITY_GUIDE.map((g, i) => (
                <div key={i} className="grid grid-cols-3 gap-1 py-2 border-b border-gray-800 last:border-0 items-center">
                  <span className="text-xs text-gray-400">{g.application}</span>
                  <span className="text-xs font-medium text-blue-400 text-center">{g.velocity}</span>
                  <span className="text-xs text-gray-300 text-right">{g.pressure}</span>
                </div>
              ))}
              <p className="text-xs text-gray-600 mt-3">Based on industry practice & SMACNA HVAC Duct Construction Standards</p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-200 mb-4">SMACNA Pressure Classes</h2>
              <div className="grid grid-cols-2 gap-1 mb-2">
                <span className="text-xs text-gray-500 font-medium">Pressure Class</span>
                <span className="text-xs text-gray-500 font-medium text-right">Operating Pressure</span>
              </div>
              {PRESSURE_CLASSES.map((p, i) => (
                <div key={i} className="grid grid-cols-2 gap-1 py-2 border-b border-gray-800 last:border-0">
                  <span className="text-xs font-medium text-blue-400">{p.class}</span>
                  <span className="text-xs text-gray-400 text-right">{p.operating}</span>
                </div>
              ))}
              <p className="text-xs text-gray-600 mt-3">Source: SMACNA HVAC Duct Construction Standards, 4th Edition</p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}