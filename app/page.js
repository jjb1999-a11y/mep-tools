'use client';
import Link from 'next/link';

const TOOLS = [
  {
    name: 'Duct Sizer',
    description: 'Round, rectangular & flat oval sizing using the ASHRAE equal friction method. Includes velocity and pressure drop validation.',
    href: '/duct-sizer',
    standard: 'ASHRAE Ch. 21',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="9" width="14" height="9" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M3 9 L7 5 L21 5 L17 9" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M17 9 L21 5 L21 14 L17 18" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M7 13.5h5M10.5 11.5l2 2-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
      </svg>
    ),
  },
  {
    name: 'Pipe Sizer',
    description: 'Hydronic pipe sizing with system type, glycol correction, and temperature corrections per ASHRAE Chapter 22.',
    href: '/pipe-sizer',
    standard: 'ASHRAE Ch. 22',
    icon: (
      <svg width="22" height="22" viewBox="0 0 30 30" fill="none">
        <circle cx="15" cy="15" r="13" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M15 2 A13 13 0 0 0 15 28 A6.5 6.5 0 0 0 15 15 A6.5 6.5 0 0 1 15 2 Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    name: 'Hydronic Head Loss',
    description: 'Total Dynamic Head (TDH) for closed hydronic loops. Darcy-Weisbach pipe friction, K-factor fittings, velocity-interpolated LR ell data, and Crane TP-410 for large pipe sizes.',
    href: '/hydronic-head-loss',
    standard: 'ASHRAE Ch. 22 + Crane TP-410',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="5" cy="12" r="3" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8 12 h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M13 9 h6 a2 2 0 0 1 0 6 h-6 a2 2 0 0 1 0-6 Z" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M13 12 h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
        <path d="M5 9 v-3 M5 6 h14 M19 6 v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
      </svg>
    ),
  },
  {
    name: 'Domestic Water Pipe Sizer',
    description: 'Size domestic cold and hot water piping using fixture units, velocity limits, and pressure budget per IPC / UPC.',
    href: '/domestic-water-sizer',
    standard: 'IPC / UPC 2021',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 10 h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M7 7.5 v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7"/>
        <path d="M5.5 8.5 h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7"/>
        <path d="M11 10 Q13 10 13 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M13 12 v3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M11.5 15 h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12.3 16.5 v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
        <path d="M13.7 16.5 v1.7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
        <path d="M12.3 19 C12.3 19 11.5 20.3 11.5 21 a0.9 0.9 0 001.8 0 C13.3 20.3 12.3 19 12.3 19z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    name: 'Water Service Sizer',
    description: 'Size building water service and meter from fixture counts per IPC / UPC and AWWA M22.',
    href: '/water-service-sizer',
    standard: 'IPC / UPC / AWWA M22',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M1 12 h3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M19.5 12 h3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        <path d="M7.5 16 A6 6 0 1 1 16.5 16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6"/>
        <path d="M12 7.2 v1.2M16.8 12 h-1.2M7.2 12 h1.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
        <path d="M12 12 L14.2 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="1" fill="currentColor"/>
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* ── Hero ── */}
      <section style={{
        borderBottom: '0.5px solid var(--border-primary)',
        padding: '40px 24px 36px',
        maxWidth: '860px',
        margin: '0 auto',
      }}>
        <h1 style={{
          fontSize: '26px',
          fontWeight: 500,
          letterSpacing: '-0.3px',
          marginBottom: '8px',
          lineHeight: 1.2,
        }}>
          <span style={{ color: 'var(--brand)' }}>Sizing tools</span>
          <span style={{ color: 'var(--text-secondary)' }}> for MEP engineers</span>
        </h1>
        <p style={{
          fontSize: '13px',
          color: 'var(--text-tertiary)',
          lineHeight: 1.65,
          maxWidth: '440px',
        }}>
          Accurate duct and pipe calculations for commercial design work, grounded in published engineering standards.
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
          {['ASHRAE Fundamentals', 'SMACNA', 'IPC 2021', 'UPC 2021', 'AWWA M22', 'Crane TP-410'].map(code => (
            <span key={code} style={{
              fontSize: '10px',
              fontWeight: 500,
              color: 'var(--text-muted)',
              background: 'var(--bg-tertiary)',
              border: '0.5px solid var(--border-primary)',
              padding: '3px 8px',
              borderRadius: '4px',
            }}>{code}</span>
          ))}
        </div>
      </section>

      {/* ── Tools Grid ── */}
      <section style={{ maxWidth: '860px', margin: '0 auto', padding: '24px' }}>
        <p style={{
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '14px',
        }}>Tools</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
        }}>
          {TOOLS.map(tool => (
            <Link key={tool.name} href={tool.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '0.5px solid var(--border-primary)',
                  borderRadius: '10px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                  height: '100%',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-primary)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px',
                    background: 'var(--bg-accent)',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--brand)',
                    flexShrink: 0,
                  }}>
                    {tool.icon}
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 500,
                    color: 'var(--brand)',
                    background: 'var(--bg-accent)',
                    padding: '2px 7px',
                    borderRadius: '10px',
                  }}>Live</span>
                </div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {tool.name}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '10px' }}>
                  {tool.description}
                </p>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {tool.standard}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '0.5px solid var(--border-primary)',
        maxWidth: '860px',
        margin: '0 auto',
        padding: '20px 24px',
      }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '12px', maxWidth: '400px' }}>
          Accurate sizing tools for duct and pipe systems, built for commercial MEP engineers. All calculations based on ASHRAE Fundamentals, SMACNA, IPC 2021, UPC 2021, AWWA M22, and Crane TP-410.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>© {new Date().getFullYear()} MEP Calcs</span>
          <a href="mailto:hello@mepcalcs.com" style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none' }}>hello@mepcalcs.com</a>
        </div>
      </footer>

    </main>
  );
}