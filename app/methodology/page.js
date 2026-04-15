'use client';
import { useState } from 'react';

function Section({ title, label, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      border: '0.5px solid var(--border-primary)',
      borderRadius: '10px',
      overflow: 'hidden',
      marginBottom: '8px',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px',
            background: 'var(--bg-accent)',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--brand)',
            flexShrink: 0,
          }}>
            {label}
          </div>
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{title}</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{
          padding: '16px 18px',
          background: 'var(--bg-card)',
          borderTop: '0.5px solid var(--border-primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{
      background: 'var(--bg-tertiary)',
      border: '0.5px solid var(--border-primary)',
      borderRadius: '8px',
      padding: '14px 16px',
    }}>
      {title && (
        <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>{title}</p>
      )}
      {children}
    </div>
  );
}

function Formula({ children }) {
  return (
    <div style={{
      background: 'var(--bg-primary)',
      border: '0.5px solid var(--border-primary)',
      borderRadius: '6px',
      padding: '10px 14px',
      fontFamily: 'monospace',
      fontSize: '13px',
      color: 'var(--text-accent)',
      margin: '6px 0',
    }}>
      {children}
    </div>
  );
}

function MTable({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ borderBottom: '0.5px solid var(--border-primary)' }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                textAlign: 'left',
                padding: '6px 8px',
                color: 'var(--text-muted)',
                fontWeight: 500,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '0.5px solid var(--border-primary)' }}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: '6px 8px',
                  color: j === 0 ? 'var(--text-accent)' : 'var(--text-secondary)',
                }}>
                  {cell === '✓' ? <span style={{ color: '#22c55e' }}>✓</span> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const DuctIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="9" width="14" height="9" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M3 9 L7 5 L21 5 L17 9" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M17 9 L21 5 L21 14 L17 18" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M7 13.5h5M10.5 11.5l2 2-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
  </svg>
);

const PipeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 30 30" fill="none">
    <circle cx="15" cy="15" r="13" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M15 2 A13 13 0 0 0 15 28 A6.5 6.5 0 0 0 15 15 A6.5 6.5 0 0 1 15 2 Z" fill="currentColor"/>
  </svg>
);

const HeadLossIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="5" cy="12" r="3" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M8 12 h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M13 9 h6 a2 2 0 0 1 0 6 h-6 a2 2 0 0 1 0-6 Z" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M13 12 h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
    <path d="M5 9 v-3 M5 6 h14 M19 6 v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
  </svg>
);

const FaucetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M3 10 h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 7.5 v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7"/>
    <path d="M5.5 8.5 h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7"/>
    <path d="M11 10 Q13 10 13 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M13 12 v3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M11.5 15 h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12.3 16.5 v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
    <path d="M12.3 19 C12.3 19 11.5 20.3 11.5 21 a0.9 0.9 0 001.8 0 C13.3 20.3 12.3 19 12.3 19z" fill="currentColor"/>
  </svg>
);

const MeterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M1 12 h3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M19.5 12 h3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
    <path d="M7.5 16 A6 6 0 1 1 16.5 16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6"/>
    <path d="M12 7.2 v1.2M16.8 12 h-1.2M7.2 12 h1.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
    <path d="M12 12 L14.2 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
  </svg>
);

const NotesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Methodology() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '6px',
            letterSpacing: '-0.2px',
          }}>Methodology & Validation</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', lineHeight: 1.65 }}>
            All calculations are based on published ASHRAE, SMACNA, IPC, UPC, and Crane standards.
            This page documents the exact formulas, assumptions, and validation examples used in each tool.
          </p>
        </div>

        {/* Meta bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          background: 'var(--bg-tertiary)',
          border: '0.5px solid var(--border-primary)',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '20px',
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Last updated: April 2026</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Version 1.3</span>
        </div>

        {/* ── Duct Sizer ── */}
        <Section title="Duct Sizer" label={<DuctIcon />}>
          <Card title="Reference Standards">
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              ASHRAE Handbook — Fundamentals, Chapter 21: Duct Design (2021 Edition)
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '4px' }}>
              SMACNA HVAC Systems Duct Design Manual, 4th Edition
            </p>
          </Card>

          <Card title="Sizing Method">
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Uses the <strong style={{ color: 'var(--text-primary)' }}>Equal Friction Method</strong> — the most widely used method for commercial duct system design. Friction loss per unit length is held constant throughout the system.
            </p>
          </Card>

          <Card title="Round Duct Diameter Formula">
            <Formula>D = [0.109 × Q¹·⁹ / fr]^0.199</Formula>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {[['D','Duct diameter (inches)'],['Q','Airflow rate (CFM)'],['fr','Friction rate (in. w.g. per 100 ft)']].map(([v,d]) => (
                <p key={v} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</span> = {d}
                </p>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Source: ASHRAE Handbook — Fundamentals 2021, Chapter 21</p>
          </Card>

          <Card title="Rectangular & Flat Oval Sizing">
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
              Rectangular ducts are sized to match the round duct cross-sectional area, then rounded up to the nearest 2" increment per SMACNA. Aspect ratio is flagged when it exceeds 4:1.
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Flat oval area formula:</p>
            <Formula>Area = (π/4) × A² + A × (B − A)</Formula>
          </Card>

          <Card title="Assumptions">
            <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '16px' }}>
              <li>Standard air at 70°F, 0.075 lb/ft³, sea level pressure</li>
              <li>Galvanized steel ductwork, ε = 0.0003 ft</li>
              <li>Straight duct only — fitting losses not included</li>
              <li>Results snapped to nearest standard duct size</li>
            </ul>
          </Card>

          <Card title="Validation">
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Verified against ASHRAE friction chart and physical ductulator:
            </p>
            <MTable
              headers={['CFM', 'Fr (in/100ft)', 'ASHRAE Chart', 'MEP Calcs', 'Match']}
              rows={[
                ['1000','0.1','14"','14"','✓'],
                ['2000','0.1','18"','18"','✓'],
                ['500', '0.1','10"','10"','✓'],
                ['4000','0.1','24"','24"','✓'],
                ['2000','0.08','18"','18"','✓'],
              ]}
            />
          </Card>
        </Section>

        {/* ── Pipe Sizer ── */}
        <Section title="Pipe Sizer (Hydronic)" label={<PipeIcon />}>
          <Card title="Reference Standards">
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>ASHRAE Handbook — Fundamentals, Chapter 22: Pipe Sizing (2021 Edition)</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '4px' }}>ASME B36.10M — Welded and Seamless Wrought Steel Pipe</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '4px' }}>ASTM B88 — Standard Specification for Seamless Copper Water Tube</p>
          </Card>

          <Card title="Sizing Method">
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Uses the <strong style={{ color: 'var(--text-primary)' }}>Darcy-Weisbach equation</strong> with the <strong style={{ color: 'var(--text-primary)' }}>Colebrook-White equation</strong> for friction factor — the industry standard for pressure drop in HVAC piping per ASHRAE Chapter 22.
            </p>
          </Card>

          <Card title="Formulas">
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Darcy-Weisbach</p>
            <Formula>ΔP = f × (L/D) × (V²/2g)</Formula>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '10px 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Colebrook-White</p>
            <Formula>1/√f = −2 log₁₀(ε/3.7D + 2.51/Re√f)</Formula>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '10px 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reynolds Number</p>
            <Formula>Re = V × D / ν</Formula>
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {[['f','Darcy friction factor'],['D','Internal diameter (ft)'],['V','Flow velocity (ft/s)'],['ε','Absolute roughness (ft)'],['ν','Kinematic viscosity (ft²/s)']].map(([v,d]) => (
                <p key={v} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</span> = {d}
                </p>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Source: ASHRAE Handbook — Fundamentals 2021, Chapter 22</p>
          </Card>

          <Card title="Pipe Internal Diameters">
            <MTable
              headers={['Nominal Size', 'Material', 'ID (in)', 'Standard']}
              rows={[
                ['½"','Type L Copper','0.545','ASTM B88'],
                ['¾"','Type L Copper','0.785','ASTM B88'],
                ['1"','Type L Copper','1.025','ASTM B88'],
                ['1¼"','Type L Copper','1.265','ASTM B88'],
                ['1½"','Type L Copper','1.505','ASTM B88'],
                ['2"','Type L Copper','1.985','ASTM B88'],
                ['2½"','Sch 40 Black Steel','2.469','ASME B36.10M'],
                ['3"','Sch 40 Black Steel','3.068','ASME B36.10M'],
                ['4"','Sch 40 Black Steel','4.026','ASME B36.10M'],
                ['6"','Sch 40 Black Steel','6.065','ASME B36.10M'],
                ['8"','Sch 40 Black Steel','7.981','ASME B36.10M'],
                ['10"','Sch 40 Black Steel','10.020','ASME B36.10M'],
                ['12"','Sch 40 Black Steel','11.938','ASME B36.10M'],
              ]}
            />
          </Card>

          <Card title="Fluid Properties by System Type">
            <MTable
              headers={['System Type', 'Temperature', 'ν (ft²/s)']}
              rows={[
                ['Chilled Water','44°F / 54°F','0.0000141'],
                ['Heating Hot Water','140°F / 120°F','0.0000052'],
                ['High Temp Hot Water','180°F / 160°F','0.0000038'],
                ['Condenser Water','85°F / 95°F','0.0000083'],
              ]}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Source: CRC Handbook of Chemistry and Physics, 97th Edition</p>
          </Card>

          <Card title="Glycol Correction">
            <MTable
              headers={['Glycol %', 'Viscosity Multiplier', 'Typical Use']}
              rows={[
                ['0%','1.0×','Interior systems'],
                ['20%','1.4×','Mild climates'],
                ['30%','1.8×','Most common commercial'],
                ['40%','2.5×','Cold climates'],
                ['50%','3.5×','Extreme cold / outdoor'],
              ]}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Source: Dow Chemical DOWFROST data / ASHRAE HVAC Systems and Equipment</p>
          </Card>

          <Card title="Assumptions & Limitations">
            <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '16px' }}>
              <li>Straight pipe only — fitting losses not included</li>
              <li>Colebrook-White solved iteratively (20 iterations)</li>
              <li>Laminar flow (Re &lt; 2300) uses f = 64/Re</li>
              <li>Glycol multipliers are approximate — use manufacturer data for precise design</li>
              <li>Copper ε = 0.000005 ft, steel ε = 0.00015 ft</li>
              <li>Sch 80 required for systems exceeding 160 PSI or 250°F</li>
            </ul>
          </Card>
        </Section>

        {/* ── Hydronic Head Loss ── */}
        <Section title="Hydronic Head Loss Calculator" label={<HeadLossIcon />}>
          <Card title="Reference Standards">
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              ASHRAE Handbook — Fundamentals, 2021 I-P Edition, Chapter 22: Pipe Design
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '4px' }}>
              Crane Co. — Flow of Fluids Through Valves, Fittings and Pipe, Technical Paper No. 410 (1988)
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '4px' }}>
              ASME B36.10M — Welded and Seamless Wrought Steel Pipe, Schedule 40
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '4px' }}>
              ASTM B88 — Standard Specification for Seamless Copper Water Tube, Type L
            </p>
          </Card>

          <Card title="Pipe Friction">
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Darcy-Weisbach — ASHRAE HoF 2021 Ch.22 Eq. 2</p>
            <Formula>Δh = f · (L/D) · (V²/2g)</Formula>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '10px 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Flow Velocity</p>
            <Formula>V = GPM × 0.002228 / A(ft²)</Formula>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '10px 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Colebrook-White Friction Factor — ASHRAE HoF 2021 Ch.22 Eq. 4 (50-iteration)</p>
            <Formula>1/√f = 1.74 − 2·log(2ε/D + 18.7 / Re·√f)</Formula>
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {[
                ['ε','0.00015 ft (carbon steel) · 0.000005 ft (copper Type L)'],
                ['g','32.174 ft/s²'],
                ['Re','Reynolds number = V·D/ν'],
              ].map(([v,d]) => (
                <p key={v} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</span> = {d}
                </p>
              ))}
            </div>
          </Card>

          <Card title="Fitting Losses">
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>K-Factor Method — ASHRAE HoF 2021 Ch.22 Eq. 7</p>
            <Formula>Δh = K · (V²/2g)</Formula>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px' }}>
              Velocity V is referenced to the upstream pipe for reducers and expansions per ASHRAE HoF 2021 Ch.22 Table 6.
            </p>
          </Card>

          <Card title="K-Factor Sources">
            <MTable
              headers={['Fitting Type', 'Pipe Size Range', 'Source']}
              rows={[
                ['All threaded fittings','NPS < 2½"','ASHRAE HoF 2021 Ch.22 Table 3'],
                ['Flanged/welded elbows (90° std, 45°, return)','NPS 1"–12"','ASHRAE HoF 2021 Ch.22 Table 4'],
                ['Welded LR elbows (R/D=1.5)','NPS 4"–24"','ASHRAE HoF 2021 Ch.22 Table 6 (ASHRAE RP-968)'],
                ['Welded tees (line & branch)','NPS 4"–16"','ASHRAE HoF 2021 Ch.22 Table 7 (ASHRAE RP-1034)'],
                ['Reducers & expansions','Various','ASHRAE HoF 2021 Ch.22 Table 6 (ASHRAE RP-968)'],
                ['90° std elbows > 12"','NPS > 12"','Crane TP-410 A-29: K = 30·fT'],
                ['45° elbows > 12"','NPS > 12"','Crane TP-410 A-29: K = 16·fT'],
                ['Tees (line) > 16"','NPS > 16"','Crane TP-410 A-29: K = 20·fT'],
                ['Tees (branch) > 16"','NPS > 16"','Crane TP-410 A-29: K = 60·fT'],
                ['Gate valve','All sizes','Crane TP-410 A-27: K = 8·fT'],
                ['Globe valve','All sizes','Crane TP-410 A-27: K = 340·fT'],
                ['Swing check valve','All sizes','Crane TP-410 A-27: K = 100·fT'],
                ['Ball valve (fully open)','All sizes','Industry standard: K = 0.05'],
                ['Butterfly valve (fully open)','All sizes','Generic: K = 0.30 (override with mfr. Cv)'],
                ['Butterfly valve from mfr. data','All sizes','ASHRAE HoF 2021 Ch.22 Eq. 8: K = 894·d⁴/Cv²'],
              ]}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
              fT = fully turbulent friction factor from Crane TP-410 Table A-26. Connection type auto-selected: threaded for NPS &lt; 2½", flanged/welded for NPS ≥ 2½".
            </p>
          </Card>

          <Card title="Crane TP-410 fT Values (Table A-26)">
            <MTable
              headers={['Nominal Pipe Size', 'fT']}
              rows={[
                ['½"','0.027'],
                ['¾"','0.025'],
                ['1"','0.023'],
                ['1¼"','0.022'],
                ['1½"','0.021'],
                ['2"','0.019'],
                ['2½"–3"','0.018'],
                ['4"','0.017'],
                ['5"','0.016'],
                ['6"','0.015'],
                ['8"–10"','0.014'],
                ['12"–16"','0.013'],
                ['18"–24"','0.012'],
              ]}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Source: Crane Co., Flow of Fluids Through Valves, Fittings and Pipe, Technical Paper No. 410 (1988), Appendix A, Table A-26.
            </p>
          </Card>

          <Card title="Fluid Properties">
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
              Water density and kinematic viscosity are computed from a polynomial curve fit vs. temperature, valid from 32°F to 250°F:
            </p>
            <Formula>ρ = 62.56 − 0.00289·T − 0.0000378·T²  (lb/ft³)</Formula>
            <Formula>μ = exp(−11.0318 + 1057.51/(T + 214.624)) / 32.174</Formula>
            <Formula>ν = μ / ρ  (ft²/s)</Formula>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>T in °F. Source: CRC Handbook of Chemistry and Physics, as cited in ASHRAE HoF 2021 Ch.22.</p>
          </Card>

          <Card title="Validation">
            <MTable
              headers={['Metric', 'PE-Stamped Calc', 'MEP Calcs', 'Difference']}
              rows={[
                ['Total friction + fittings','3.626 ft','3.468 ft','−4.4%'],
                ['Design TDH (×1.15 SF)','4.952 ft','4.770 ft','−3.7%'],
                ['8" LR ell K (7.1 fps)','0.200','0.200','0.0%'],
                ['10" LR ell K (4.5 fps)','0.200','0.200','0.0%'],
                ['8" tee line K','0.080','0.080','0.0%'],
                ['BFV K (Cv=3316, 8")','0.330','0.309','−6.4%'],
              ]}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Remaining 4.4% gap attributable to fluid property rounding (ν at 85°F: stamped calc uses 0.000008 ft²/s flat; tool computes 0.0000083 ft²/s from polynomial fit). Within ±20–35% K-factor tolerance per ASHRAE HoF 2021 Ch.22 Table 5.
            </p>
          </Card>

          <Card title="Assumptions & Limitations">
            <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '16px' }}>
              <li>Single design temperature for entire loop — fluid properties constant throughout</li>
              <li>Closed loop systems only — static head cancels and is not included (except open cooling tower static lift)</li>
              <li>Threaded fittings NPS &lt; 2½", flanged/welded NPS ≥ 2½" per standard HVAC practice</li>
              <li>LR elbow K values (Table 6) are velocity-interpolated across 4 / 8 / 12 fps columns</li>
              <li>Tee K values (Table 7) are at 8 fps — velocity dependence not accounted for</li>
              <li>Large pipe K values (tees &gt; 16", std. elbows &gt; 12") from Crane TP-410 — not yet validated against PE-stamped calcs at those sizes</li>
              <li>K-factor tolerance ±20–35% per ASHRAE HoF 2021 Ch.22 Table 5</li>
              <li>Safety factor default 1.15 — adjustable by user</li>
            </ul>
          </Card>
        </Section>

        {/* ── Domestic Water Pipe Sizer ── */}
        <Section title="Domestic Water Pipe Sizer" label={<FaucetIcon />}>
          <Card title="Reference Standards">
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>International Plumbing Code (IPC) 2021 — Appendix E: Sizing of Water Piping System</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '4px' }}>Uniform Plumbing Code (UPC) 2021 — Chapter 6: Water Supply and Distribution</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '4px' }}>ASTM B88 — Standard Specification for Seamless Copper Water Tube (Type L)</p>
          </Card>

          <Card title="Sizing Method">
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Uses <strong style={{ color: 'var(--text-primary)' }}>Water Supply Fixture Units (WSFU)</strong> to estimate peak demand, converted to GPM using the Hunter's Curve method per IPC Appendix E / UPC Chapter 6. Pipe size is selected to keep velocity within code limits and maintain adequate residual pressure at the most demanding fixture.
            </p>
          </Card>

          <Card title="Pressure Drop Formula">
            <Formula>ΔP (PSI) = f × (L/D) × (V²/2g) × 0.4335</Formula>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {[['0.4335','Conversion factor from ft w.g. to PSI'],['ν','0.00001059 ft²/s (water at 60°F)'],['ε','0.000005 ft (Type L Copper)']].map(([v,d]) => (
                <p key={v} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</span> = {d}
                </p>
              ))}
            </div>
          </Card>

          <Card title="Pressure Budget">
            <Formula>P_fixture = P_available − P_elevation − P_system − P_friction</Formula>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {[['P_elevation','Height × 0.433 PSI/ft'],['P_system','Meter + backflow preventer + valves (default 10 PSI)'],['P_friction','Darcy-Weisbach loss over pipe run length']].map(([v,d]) => (
                <p key={v} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</span> = {d}
                </p>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Source: IPC 2021 Table 604.3</p>
          </Card>

          <Card title="IPC 2021 Fixture Unit Values">
            <MTable
              headers={['Fixture', 'WSFU', 'Min Pipe', 'Min PSI']}
              rows={[
                ['Water Closet (Flushometer)','10','1"','35'],
                ['Water Closet (Flush Tank)','2.5','3/8"','8'],
                ['Urinal (Flushometer)','5','¾"','25'],
                ['Lavatory (Public)','1.5','½"','8'],
                ['Lavatory (Private)','1.0','½"','8'],
                ['Shower','2.0','½"','8'],
                ['Bathtub','2.0','½"','8'],
                ['Kitchen Sink','1.5','½"','8'],
                ['Service Sink','3.0','½"','8'],
                ['Hose Bibb','2.5','½"','8'],
              ]}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Source: IPC 2021 Table E103.3(2) and Table 604.3</p>
          </Card>

          <Card title="Assumptions & Limitations">
            <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '16px' }}>
              <li>Type L Copper used for all domestic water sizing</li>
              <li>Water properties at 60°F — cold water sizing only</li>
              <li>Straight pipe only — fitting losses not included</li>
              <li>System losses default of 10 PSI covers most commercial meter + BFP installations</li>
              <li>IPC and UPC WSFU values differ — select correct code for your jurisdiction</li>
              <li>IPC max velocity 8 FPS — 5 FPS recommended for noise-sensitive spaces</li>
            </ul>
          </Card>
        </Section>

        {/* ── Water Service Sizer ── */}
        <Section title="Water Service Sizer" label={<MeterIcon />}>
          <Card title="Reference Standards">
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>International Plumbing Code (IPC) 2021 — Appendix E</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '4px' }}>Uniform Plumbing Code (UPC) 2021 — Chapter 6</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '4px' }}>AWWA Manual M22 — Sizing Water Service Lines and Meters, 4th Edition</p>
          </Card>

          <Card title="Sizing Method">
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Fixture counts are multiplied by their <strong style={{ color: 'var(--text-primary)' }}>WSFU values</strong> per IPC / UPC tables, totaled, and converted to peak GPM using the Hunter's Curve (IPC Table E103.3(3)). Continuous loads (irrigation, cooling tower makeup, etc.) are added directly. The service pipe is sized for velocity ≤ 8 FPS and the meter is sized per AWWA M22 peak flow capacity.
            </p>
          </Card>

          <Card title="Flush Type Auto-Detection">
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              The tool automatically detects whether the system uses flushometer valves or flush tanks based on the fixture selection. If any flushometer water closets or urinals are entered, the flushometer GPM conversion table is used. Otherwise the flush tank table applies.
            </p>
          </Card>

          <Card title="AWWA M22 Meter Capacities">
            <MTable
              headers={['Meter Size', 'Max Continuous (GPM)', 'Max Peak (GPM)']}
              rows={[
                ['⅝"','20','30'],
                ['¾"','30','50'],
                ['1"','50','75'],
                ['1½"','100','150'],
                ['2"','160','200'],
                ['3"','315','450'],
                ['4"','500','700'],
                ['6"','1000','1500'],
              ]}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Source: AWWA Manual M22, 4th Edition</p>
          </Card>

          <Card title="Pressure Budget">
            <Formula>P_entry = P_street − P_elevation − P_pipe_friction − P_meter</Formula>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {[
                ['P_elevation','Elevation × 0.433 PSI/ft'],
                ['P_pipe_friction','Darcy-Weisbach loss over service line length'],
                ['P_meter','Estimated meter loss — proportional to flow vs. meter capacity'],
              ].map(([v,d]) => (
                <p key={v} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</span> = {d}
                </p>
              ))}
            </div>
          </Card>

          <Card title="Assumptions & Limitations">
            <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '16px' }}>
              <li>Service pipe sized as Type L Copper, velocity ≤ 8 FPS</li>
              <li>Meter sized to peak GPM per AWWA M22 — verify with local water utility</li>
              <li>Emergency shower ANSI Z358.1 minimum 20 GPM — add to continuous load if simultaneous operation required</li>
              <li>Eyewash station ANSI Z358.1 minimum 0.4 GPM — sized as lavatory equivalent</li>
              <li>Ice maker, coffee maker — unlisted in IPC/UPC, sized as drinking fountain equivalent</li>
              <li>Continuous loads added directly to fixture GPM before service sizing</li>
            </ul>
          </Card>
        </Section>

        {/* ── General Notes ── */}
        <Section title="General Notes" label={<NotesIcon />}>
          <Card title="Intended Use">
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              MEP Calcs is intended as a quick-check and preliminary sizing tool for licensed MEP engineers and designers. Results should be reviewed by a qualified engineer before use on construction documents. All calculations are provided for informational purposes only.
            </p>
          </Card>

          <Card title="Version History">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                ['1.3', 'April 2026', 'Added Hydronic Head Loss Calculator — Darcy-Weisbach, ASHRAE Tables 3/4/6/7, Crane TP-410'],
                ['1.2', 'April 2026', 'Added Water Service Sizer, updated methodology'],
                ['1.1', 'April 2026', 'Added Domestic Water Pipe Sizer, collapsible sections'],
                ['1.0', 'April 2026', 'Initial release — Duct Sizer and Hydronic Pipe Sizer'],
              ].map(([v,d,n]) => (
                <div key={v} style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-accent)', fontWeight: 500, whiteSpace: 'nowrap' }}>v{v}</span>
                  <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{d}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{n}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Questions or Corrections">
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              If you find an error in any calculation or have a suggestion, please reach out at{' '}
              <a href="mailto:hello@mepcalcs.com" style={{ color: 'var(--text-accent)' }}>
                hello@mepcalcs.com
              </a>
            </p>
          </Card>
        </Section>

        {/* Footer */}
        <div style={{
          borderTop: '0.5px solid var(--border-primary)',
          paddingTop: '20px',
          marginTop: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>© {new Date().getFullYear()} MEP Calcs</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Version 1.3</span>
        </div>

      </div>
    </main>
  );
}