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

// Equivalent round diameter (ASHRAE HoF 2021 Ch.21 Eq. 24-25)
function rectEquivRound(w, h) {
  return 1.30 * Math.pow(w * h, 0.625) / Math.pow(w + h, 0.25);
}
function ovalEquivRound(minor, major) {
  const a = minor, B = major;
  const A = (Math.PI * a * a / 4) + a * (B - a);
  const P = (Math.PI * a) + 2 * (B - a);
  return 1.55 * Math.pow(A, 0.625) / Math.pow(P, 0.25);
}

// Solve rect dimensions for a target velocity at given CFM, with optional max constraints.
function rectFromVelocity(cfm, vel, maxW, maxH) {
  const areaIn2 = (cfm / vel) * 144;
  let w, h;
  if (maxH > 0)      { h = maxH; w = areaIn2 / h; }
  else if (maxW > 0) { w = maxW; h = areaIn2 / w; }
  else               { h = Math.sqrt(areaIn2 / 2); w = h * 2; }
  w = ceil2(w); h = ceil2(h);
  return { w, h };
}

// Solve oval dimensions for a target velocity at given CFM, with optional constraints.
function ovalFromVelocity(cfm, vel, constrainMinor, constrainMajor) {
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

// Target equivalent-round diameter for explorer suggestions.
function targetEquivDia(cfm, mode, maxFr, maxVel) {
  if (mode === 'friction') return calcDiameter(cfm, maxFr);
  if (mode === 'velocity') return Math.sqrt((cfm / maxVel) / Math.PI) * 24;
  const dFr  = calcDiameter(cfm, maxFr);
  const dVel = Math.sqrt((cfm / maxVel) / Math.PI) * 24;
  return Math.max(dFr, dVel);
}

// Spread of rectangular candidates across common aspect ratios.
function initialRects(cfm, maxFr, maxVel) {
  const dEq = targetEquivDia(cfm, 'both', maxFr, maxVel);
  const ARs = [1.0, 1.6, 2.0, 2.5, 4.0];
  const out = [];
  const seen = new Set();
  for (const ar of ARs) {
    const h = dEq * Math.pow(ar + 1, 0.25) / (1.30 * Math.pow(ar, 0.625));
    const w = ar * h;
    const wR = Math.max(4, ceil2(w));
    const hR = Math.max(4, ceil2(h));
    const key = `${wR}x${hR}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ w: wR, h: hR });
  }
  return out;
}

// Spread of flat-oval candidates at different minor:major ratios.
function initialOvals(cfm, maxFr, maxVel) {
  const dEq = targetEquivDia(cfm, 'both', maxFr, maxVel);
  const areaIn2 = Math.PI * Math.pow(dEq, 2) / 4;
  // pick three minor axes: aggressive, balanced, tall
  const minors = [
    Math.max(6, ceil2(dEq * 0.45)),
    Math.max(6, ceil2(dEq * 0.65)),
    Math.max(6, ceil2(dEq * 0.85)),
  ];
  const out = [];
  const seen = new Set();
  for (const m of minors) {
    const major = ceil2((areaIn2 - (Math.PI / 4) * m * m) / m + m);
    if (major <= m) continue;
    const key = `${major}x${m}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ minor: m, major });
  }
  return out;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function Home() {
  const [cfm,           setCfm]           = useState('');
  const [shape,         setShape]         = useState('rect');   // 'rect' | 'oval'
  const [mode,          setMode]          = useState('both');   // 'both' | 'friction' | 'velocity'

  // Single-result mode inputs
  const [targetFr,      setTargetFr]      = useState('0.1');
  const [targetVel,     setTargetVel]     = useState('1000');
  const [maxW,          setMaxW]          = useState('');
  const [maxH,          setMaxH]          = useState('');
  const [maxMinor,      setMaxMinor]      = useState('');
  const [maxMajor,      setMaxMajor]      = useState('');

  // Explorer (Both) mode inputs
  const [explMaxFr,     setExplMaxFr]     = useState('0.08');
  const [explMaxVel,    setExplMaxVel]    = useState('800');
  const [roundDia,      setRoundDia]      = useState(null);
  const [rects,         setRects]         = useState([]);
  const [ovals,         setOvals]         = useState([]);

  const [refOpen,       setRefOpen]       = useState(false);

  const Q       = parseFloat(cfm)        || 0;
  const fFr     = parseFloat(explMaxFr)  || 0;
  const fVel    = parseFloat(explMaxVel) || 0;
  const tFr     = parseFloat(targetFr)   || 0;
  const tVel    = parseFloat(targetVel)  || 0;
  const cW      = parseFloat(maxW)       || 0;
  const cH      = parseFloat(maxH)       || 0;
  const cMinor  = parseFloat(maxMinor)   || 0;
  const cMajor  = parseFloat(maxMajor)   || 0;

  // Auto-initialize explorer suggestions on first valid input.
  useEffect(() => {
    if (mode !== 'both' || !Q || !fFr || !fVel) return;
    if (roundDia === null) setRoundDia(nextStdUp(targetEquivDia(Q, 'both', fFr, fVel)));
    if (shape === 'rect' && rects.length === 0) setRects(initialRects(Q, fFr, fVel));
    if (shape === 'oval' && ovals.length === 0) setOvals(initialOvals(Q, fFr, fVel));
  }, [mode, shape, Q, fFr, fVel]);

  function regenerate() {
    if (!Q || !fFr || !fVel) return;
    setRoundDia(nextStdUp(targetEquivDia(Q, 'both', fFr, fVel)));
    setRects(initialRects(Q, fFr, fVel));
    setOvals(initialOvals(Q, fFr, fVel));
  }

  function stepRound(dir) {
    if (roundDia === null) return;
    const idx = STANDARD_ROUND.indexOf(roundDia);
    if (idx < 0) return setRoundDia(nearestStd(roundDia + dir * 2));
    const next = Math.max(0, Math.min(STANDARD_ROUND.length - 1, idx + dir));
    setRoundDia(STANDARD_ROUND[next]);
  }
  function stepRect(i, field, dir) {
    setRects(r => r.map((row, j) => j === i ? { ...row, [field]: Math.max(4, row[field] + dir * 2) } : row));
  }
  function stepOval(i, field, dir) {
    setOvals(o => o.map((row, j) => {
      if (j !== i) return row;
      const next = { ...row, [field]: Math.max(field === 'minor' ? 6 : 8, row[field] + dir * 2) };
      if (next.major <= next.minor) next.major = next.minor + 2;
      return next;
    }));
  }

  // Single-result computations ───────────────────────────────────────────────
  const singleResult = (() => {
    if (mode === 'both' || !Q) return null;

    // Required equivalent diameter from the active target.
    let dReq;
    if (mode === 'friction') {
      if (!tFr) return null;
      dReq = calcDiameter(Q, tFr);
    } else {
      if (!tVel) return null;
      dReq = Math.sqrt((Q / tVel) / Math.PI) * 24;
    }
    const dia = nearestStd(dReq);
    // For velocity-only, upsize if rounding caused exceedance.
    let finalDia = dia;
    if (mode === 'velocity' && calcVelocity(Q, finalDia) > tVel) {
      const up = nextStdUp(finalDia);
      if (up > finalDia) finalDia = up;
    }
    const Vround = calcVelocity(Q, finalDia);
    const Fround = calcFriction(Q, finalDia);

    if (shape === 'rect') {
      const targetV = mode === 'velocity' ? tVel : Vround;
      const { w, h } = rectFromVelocity(Q, targetV, cW, cH);
      const dEqR = rectEquivRound(w, h);
      const Vr = Q * 144 / (w * h);
      const Fr = calcFriction(Q, dEqR);
      const ar = Math.max(w, h) / Math.min(w, h);
      return { kind: 'rect', dia: finalDia, Vround, Fround, w, h, Vr, Fr, ar };
    } else {
      const targetV = mode === 'velocity' ? tVel : Vround;
      const { minor, major } = ovalFromVelocity(Q, targetV, cMinor, cMajor);
      const dEqO = ovalEquivRound(minor, major);
      const areaIn2 = (Math.PI * minor * minor / 4) + minor * (major - minor);
      const Vo = Q * 144 / areaIn2;
      const Fo = calcFriction(Q, dEqO);
      return { kind: 'oval', dia: finalDia, Vround, Fround, minor, major, Vo, Fo };
    }
  })();

  // Live metrics for explorer rows
  function roundMetrics() {
    if (!Q || !roundDia) return null;
    return { dia: roundDia, V: calcVelocity(Q, roundDia), fr: calcFriction(Q, roundDia) };
  }
  function rectMetrics(r) {
    if (!Q) return null;
    const dEq = rectEquivRound(r.w, r.h);
    return { V: Q * 144 / (r.w * r.h), fr: calcFriction(Q, dEq), ar: Math.max(r.w, r.h) / Math.min(r.w, r.h) };
  }
  function ovalMetrics(o) {
    if (!Q) return null;
    const dEq = ovalEquivRound(o.minor, o.major);
    const areaIn2 = (Math.PI * o.minor * o.minor / 4) + o.minor * (o.major - o.minor);
    return { V: Q * 144 / areaIn2, fr: calcFriction(Q, dEq) };
  }
  const overVel = v => fVel > 0 && v > fVel;
  const overFr  = f => fFr  > 0 && f > fFr;

  // ── Styles (CSS variables for light/dark) ──────────────────────────────────
  const inp = { background: 'var(--bg-input)', border: '0.5px solid var(--border-primary)', borderRadius: '6px', padding: '7px 10px', fontSize: '13px', color: 'var(--text-primary)', outline: 'none', width: '100%' };
  const lbl = { fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '4px' };
  const card = { background: 'var(--bg-card)', border: '0.5px solid var(--border-primary)', borderRadius: '10px', padding: '18px', marginBottom: '12px' };
  const secH = { fontSize: '11px', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' };
  const cite = { fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '10px', fontStyle: 'italic' };
  const stepperBtn = { background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '9px', lineHeight: 1, padding: '2px 4px' };
  const tabBtn = (active) => ({
    flex: 1, padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', border: 'none',
    background: active ? 'var(--brand)' : 'transparent',
    color: active ? 'white' : 'var(--text-secondary)',
    transition: 'background 0.15s, color 0.15s',
  });
  const pillBtn = (active) => ({
    padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
    border: '0.5px solid var(--border-primary)',
    background: active ? 'var(--bg-accent)' : 'var(--bg-tertiary)',
    color: active ? 'var(--brand)' : 'var(--text-secondary)',
  });

  const numStr = (v, d=0) => v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

  function Stepper({ onUp, onDown }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
        <button style={stepperBtn} onClick={onUp} aria-label="Increase">▲</button>
        <button style={stepperBtn} onClick={onDown} aria-label="Decrease">▼</button>
      </div>
    );
  }
  function MetricCell({ value, unit, over }) {
    return (
      <span style={{ fontSize: '13px', fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: over ? '#d97706' : 'var(--text-primary)' }}>
        {value}
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '3px' }}>{unit}</span>
      </span>
    );
  }

  const rowStyle = { display: 'grid', alignItems: 'center', gap: '12px', padding: '9px 4px', borderBottom: '0.5px solid var(--border-primary)' };
  const sectionBar = (color) => ({ borderLeft: `3px solid ${color}`, paddingLeft: '14px', marginTop: '4px', marginBottom: '18px' });

  const COLOR_ROUND = 'var(--brand)';
  const COLOR_RECT  = '#10b981';
  const COLOR_OVAL  = '#f59e0b';

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '24px 20px 48px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        <a href="/" style={{ fontSize: '12px', color: 'var(--text-tertiary)', textDecoration: 'none', marginBottom: '14px', display: 'inline-block' }}>← Back to tools</a>

        <div style={{ marginBottom: '18px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 500, letterSpacing: '-0.2px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--brand)' }}>Duct</span>
            <span style={{ color: 'var(--text-secondary)' }}> Sizer</span>
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            Equal-friction sizing · ASHRAE HoF 2021 Ch. 21 · SMACNA HVAC Duct Construction Standards
          </p>
        </div>

        {/* Shape tabs */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '10px', border: '0.5px solid var(--border-primary)', marginBottom: '10px' }}>
          <button style={tabBtn(shape === 'rect')} onClick={() => setShape('rect')}>Round &amp; Rectangular</button>
          <button style={tabBtn(shape === 'oval')} onClick={() => setShape('oval')}>Flat Oval</button>
        </div>

        {/* Sub-mode pills */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <button style={pillBtn(mode === 'both')}     onClick={() => setMode('both')}>Both Constraints</button>
          <button style={pillBtn(mode === 'friction')} onClick={() => setMode('friction')}>Friction Rate Only</button>
          <button style={pillBtn(mode === 'velocity')} onClick={() => setMode('velocity')}>Velocity Only</button>
        </div>

        {/* Inputs card */}
        <div style={card}>
          <p style={secH}>Inputs</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 140px' }}>
              <label style={lbl}>Airflow (CFM)</label>
              <input style={inp} type="number" value={cfm} autoFocus onChange={e => setCfm(e.target.value)} placeholder="e.g. 2000" />
            </div>

            {mode === 'both' && (
              <>
                <div style={{ flex: '1 1 140px' }}>
                  <label style={lbl}>Max Velocity (FPM)</label>
                  <input style={inp} type="number" value={explMaxVel} onChange={e => setExplMaxVel(e.target.value)} placeholder="e.g. 800" />
                </div>
                <div style={{ flex: '1 1 140px' }}>
                  <label style={lbl}>Max Static Loss (in. w.g./100 ft)</label>
                  <input style={inp} type="number" step="0.01" value={explMaxFr} onChange={e => setExplMaxFr(e.target.value)} placeholder="e.g. 0.08" />
                </div>
              </>
            )}

            {mode === 'friction' && (
              <div style={{ flex: '1 1 140px' }}>
                <label style={lbl}>Friction Rate (in. w.g./100 ft)</label>
                <input style={inp} type="number" step="0.01" value={targetFr} onChange={e => setTargetFr(e.target.value)} placeholder="e.g. 0.1" />
              </div>
            )}

            {mode === 'velocity' && (
              <div style={{ flex: '1 1 140px' }}>
                <label style={lbl}>Target Velocity (FPM)</label>
                <input style={inp} type="number" value={targetVel} onChange={e => setTargetVel(e.target.value)} placeholder="e.g. 1000" />
              </div>
            )}
          </div>

          {/* Constraints (single-result modes only) */}
          {mode !== 'both' && (
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '0.5px solid var(--border-primary)' }}>
              <p style={{ ...lbl, marginBottom: '8px' }}>Override Constraints (optional)</p>
              {shape === 'rect' && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 140px' }}>
                    <label style={lbl}>Max Width (in)</label>
                    <input style={inp} type="number" value={maxW}
                      onChange={e => { setMaxW(e.target.value); if (e.target.value) setMaxH(''); }}
                      placeholder="e.g. 24" />
                  </div>
                  <div style={{ flex: '1 1 140px' }}>
                    <label style={lbl}>Max Height (in)</label>
                    <input style={inp} type="number" value={maxH}
                      onChange={e => { setMaxH(e.target.value); if (e.target.value) setMaxW(''); }}
                      placeholder="e.g. 12" />
                  </div>
                </div>
              )}
              {shape === 'oval' && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 140px' }}>
                    <label style={lbl}>Max Major Axis (in)</label>
                    <input style={inp} type="number" value={maxMajor}
                      onChange={e => { setMaxMajor(e.target.value); if (e.target.value) setMaxMinor(''); }}
                      placeholder="e.g. 36" />
                  </div>
                  <div style={{ flex: '1 1 140px' }}>
                    <label style={lbl}>Max Minor Axis (in)</label>
                    <input style={inp} type="number" value={maxMinor}
                      onChange={e => { setMaxMinor(e.target.value); if (e.target.value) setMaxMajor(''); }}
                      placeholder="e.g. 12" />
                  </div>
                </div>
              )}
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                Set one — the other dimension is computed automatically.
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        {!Q ? (
          <div style={{ ...card, textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '32px' }}>
            Enter an airflow to see results.
          </div>
        ) : mode === 'both' ? (
          /* ── Both mode: explorer ── */
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p style={{ ...secH, marginBottom: 0 }}>Candidate Sizes</p>
              <button onClick={regenerate} style={{ background: 'transparent', border: '0.5px solid var(--border-primary)', color: 'var(--text-secondary)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}>
                ↻ Reset
              </button>
            </div>

            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: shape === 'rect' ? '24px 1fr 24px 64px 100px 120px' : '24px 1fr 24px 100px 120px', gap: '12px', padding: '0 4px 6px', borderBottom: '0.5px solid var(--border-primary)' }}>
              <span></span>
              <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Size</span>
              <span></span>
              {shape === 'rect' && <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AR</span>}
              <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Velocity</span>
              <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Friction</span>
            </div>

            {/* Round row */}
            {(() => {
              const m = roundMetrics();
              if (!m) return null;
              const cols = shape === 'rect' ? '24px 1fr 24px 64px 100px 120px' : '24px 1fr 24px 100px 120px';
              return (
                <div style={sectionBar(COLOR_ROUND)}>
                  <p style={{ fontSize: '10px', fontWeight: 500, color: COLOR_ROUND, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '8px 0 4px' }}>Round Duct</p>
                  <div style={{ ...rowStyle, gridTemplateColumns: cols, borderBottom: 'none' }}>
                    <Stepper onUp={() => stepRound(1)} onDown={() => stepRound(-1)} />
                    <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>{m.dia}<span style={{ color: 'var(--text-muted)', marginLeft: '6px', fontSize: '14px' }}>Ø</span></span>
                    <span></span>
                    {shape === 'rect' && <span></span>}
                    <span style={{ textAlign: 'right' }}><MetricCell value={numStr(m.V, 0)} unit="FPM" over={overVel(m.V)} /></span>
                    <span style={{ textAlign: 'right' }}><MetricCell value={m.fr.toFixed(2)} unit="in.wg/100ft" over={overFr(m.fr)} /></span>
                  </div>
                </div>
              );
            })()}

            {/* Rect rows */}
            {shape === 'rect' && rects.length > 0 && (
              <div style={sectionBar(COLOR_RECT)}>
                <p style={{ fontSize: '10px', fontWeight: 500, color: COLOR_RECT, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '8px 0 4px' }}>Rectangular Duct</p>
                {rects.map((r, i) => {
                  const m = rectMetrics(r);
                  if (!m) return null;
                  const arWarn = m.ar > 4;
                  return (
                    <div key={i} style={{ ...rowStyle, gridTemplateColumns: '24px 1fr 24px 64px 100px 120px', borderBottom: i === rects.length - 1 ? 'none' : '0.5px solid var(--border-primary)' }}>
                      <Stepper onUp={() => stepRect(i, 'w',  1)} onDown={() => stepRect(i, 'w', -1)} />
                      <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {r.w}<span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>×</span>{r.h}
                      </span>
                      <Stepper onUp={() => stepRect(i, 'h',  1)} onDown={() => stepRect(i, 'h', -1)} />
                      <span style={{ fontSize: '11px', color: arWarn ? '#d97706' : 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                        {m.ar.toFixed(1)}:1{arWarn ? ' ⚠' : ''}
                      </span>
                      <span style={{ textAlign: 'right' }}><MetricCell value={numStr(m.V, 0)} unit="FPM" over={overVel(m.V)} /></span>
                      <span style={{ textAlign: 'right' }}><MetricCell value={m.fr.toFixed(2)} unit="in.wg/100ft" over={overFr(m.fr)} /></span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Oval rows */}
            {shape === 'oval' && ovals.length > 0 && (
              <div style={sectionBar(COLOR_OVAL)}>
                <p style={{ fontSize: '10px', fontWeight: 500, color: COLOR_OVAL, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '8px 0 4px' }}>Flat Oval Duct (Major × Minor)</p>
                {ovals.map((o, i) => {
                  const m = ovalMetrics(o);
                  if (!m) return null;
                  return (
                    <div key={i} style={{ ...rowStyle, gridTemplateColumns: '24px 1fr 24px 100px 120px', borderBottom: i === ovals.length - 1 ? 'none' : '0.5px solid var(--border-primary)' }}>
                      <Stepper onUp={() => stepOval(i, 'major',  1)} onDown={() => stepOval(i, 'major', -1)} />
                      <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {o.major}<span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>×</span>{o.minor}
                      </span>
                      <Stepper onUp={() => stepOval(i, 'minor',  1)} onDown={() => stepOval(i, 'minor', -1)} />
                      <span style={{ textAlign: 'right' }}><MetricCell value={numStr(m.V, 0)} unit="FPM" over={overVel(m.V)} /></span>
                      <span style={{ textAlign: 'right' }}><MetricCell value={m.fr.toFixed(2)} unit="in.wg/100ft" over={overFr(m.fr)} /></span>
                    </div>
                  );
                })}
              </div>
            )}

            <p style={cite}>
              Equal-friction method · Round diameter from ASHRAE HoF 2021 Ch. 21 Eq. 11 ·
              Rectangular equivalent De = 1.30·(ab)^0.625 / (a+b)^0.25 (Eq. 24) ·
              Flat-oval equivalent De = 1.55·A^0.625 / P^0.25 (Eq. 25). Values shown in
              <span style={{ color: '#d97706' }}> orange</span> exceed the active constraint.
            </p>
          </div>
        ) : (
          /* ── Friction Only / Velocity Only: single result ── */
          singleResult && (
            <div style={card}>
              <p style={secH}>Recommended Size</p>

              {/* Round */}
              <div style={sectionBar(COLOR_ROUND)}>
                <p style={{ fontSize: '10px', fontWeight: 500, color: COLOR_ROUND, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '8px 0 4px' }}>Round Duct</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '6px 0' }}>
                  <span style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>{singleResult.dia}<span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '16px' }}>Ø in</span></span>
                  <div style={{ textAlign: 'right' }}>
                    <div><MetricCell value={numStr(singleResult.Vround, 0)} unit="FPM" /></div>
                    <div style={{ marginTop: '2px' }}><MetricCell value={singleResult.Fround.toFixed(2)} unit="in.wg/100ft" /></div>
                  </div>
                </div>
              </div>

              {/* Rect or Oval equivalent */}
              {singleResult.kind === 'rect' && (
                <div style={sectionBar(COLOR_RECT)}>
                  <p style={{ fontSize: '10px', fontWeight: 500, color: COLOR_RECT, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '8px 0 4px' }}>Rectangular Equivalent</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '6px 0' }}>
                    <span style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {singleResult.w}<span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>×</span>{singleResult.h}
                      <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '16px' }}>in</span>
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <div><MetricCell value={numStr(singleResult.Vr, 0)} unit="FPM" /></div>
                      <div style={{ marginTop: '2px' }}><MetricCell value={singleResult.Fr.toFixed(2)} unit="in.wg/100ft" /></div>
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: singleResult.ar > 4 ? '#d97706' : 'var(--text-tertiary)', marginTop: '4px' }}>
                    Aspect ratio {singleResult.ar.toFixed(1)}:1{singleResult.ar > 4 ? ' — exceeds 4:1, not recommended per SMACNA' : ''}
                  </p>
                </div>
              )}

              {singleResult.kind === 'oval' && (
                <div style={sectionBar(COLOR_OVAL)}>
                  <p style={{ fontSize: '10px', fontWeight: 500, color: COLOR_OVAL, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '8px 0 4px' }}>Flat Oval (Major × Minor)</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '6px 0' }}>
                    <span style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {singleResult.major}<span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>×</span>{singleResult.minor}
                      <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '16px' }}>in</span>
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <div><MetricCell value={numStr(singleResult.Vo, 0)} unit="FPM" /></div>
                      <div style={{ marginTop: '2px' }}><MetricCell value={singleResult.Fo.toFixed(2)} unit="in.wg/100ft" /></div>
                    </div>
                  </div>
                </div>
              )}

              <p style={cite}>
                {mode === 'friction'
                  ? 'Equal-friction sizing · D = (0.109·Q^1.9 / Δp)^0.199 · ASHRAE HoF 2021 Ch. 21 Eq. 11'
                  : 'Velocity sizing · D = √(Q/V·144/π) · ASHRAE HoF 2021 Ch. 21'}
                {singleResult.kind === 'rect' ? ' · Rect De = 1.30·(ab)^0.625 / (a+b)^0.25 (Eq. 24)' : ' · Oval De = 1.55·A^0.625 / P^0.25 (Eq. 25)'}
              </p>
            </div>
          )
        )}

        {/* Collapsible reference */}
        <div style={card}>
          <button onClick={() => setRefOpen(o => !o)}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <span style={{ ...secH, marginBottom: 0 }}>Reference — Velocity &amp; Pressure Guides</span>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{refOpen ? '−' : '+'}</span>
          </button>

          {refOpen && (
            <div style={{ marginTop: '14px' }}>
              <p style={{ ...lbl, marginBottom: '6px' }}>Industry Velocity &amp; Pressure</p>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '4px', padding: '4px 6px', borderBottom: '0.5px solid var(--border-primary)' }}>
                <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Application</span>
                <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Velocity (FPM)</span>
                <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Pressure</span>
              </div>
              {VELOCITY_GUIDE.map((g, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '4px', padding: '6px', borderBottom: i === VELOCITY_GUIDE.length - 1 ? 'none' : '0.5px solid var(--border-primary)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{g.application}</span>
                  <span style={{ fontSize: '12px', color: 'var(--brand)', fontWeight: 500, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{g.velocity}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right' }}>{g.pressure}</span>
                </div>
              ))}

              <p style={{ ...lbl, marginTop: '18px', marginBottom: '6px' }}>SMACNA Pressure Classes</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4px', padding: '4px 6px', borderBottom: '0.5px solid var(--border-primary)' }}>
                <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class</span>
                <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Operating Pressure</span>
              </div>
              {PRESSURE_CLASSES.map((p, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4px', padding: '6px', borderBottom: i === PRESSURE_CLASSES.length - 1 ? 'none' : '0.5px solid var(--border-primary)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--brand)', fontWeight: 500 }}>{p.class}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right' }}>{p.operating}</span>
                </div>
              ))}

              <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '12px' }}>
                Sources: SMACNA HVAC Duct Construction Standards (4th ed.) · ASHRAE Handbook — Fundamentals 2021, Ch. 21.
              </p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
