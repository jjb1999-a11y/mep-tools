'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useTheme } from './ThemeProvider';

const TOOLS = [
  { name: 'Duct Sizer',                href: '/duct-sizer' },
  { name: 'Pipe Sizer',                href: '/pipe-sizer' },
  { name: 'Hydronic Head Loss',        href: '/hydronic-head-loss' },
  { name: 'Domestic Water Pipe Sizer', href: '/domestic-water-sizer' },
  { name: 'Water Service Sizer',       href: '/water-service-sizer' },
];

export default function Nav() {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav style={{
        background: 'var(--bg-primary)',
        borderBottom: '0.5px solid var(--border-primary)',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          {/* Hamburger button */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              width: '28px',
              height: '28px',
              background: menuOpen ? 'var(--bg-tertiary)' : 'var(--brand)',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3.5px',
              flexShrink: 0,
              transition: 'background 0.15s',
              zIndex: 60,
              position: 'relative',
            }}
          >
            {menuOpen ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2 L12 12M12 2 L2 12" stroke="var(--text-primary)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            ) : (
              <>
                <div style={{ width: '13px', height: '1.8px', background: 'white', borderRadius: '1px' }} />
                <div style={{ width: '13px', height: '1.8px', background: 'white', borderRadius: '1px' }} />
                <div style={{ width: '13px', height: '1.8px', background: 'white', borderRadius: '1px' }} />
              </>
            )}
          </button>

          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontSize: '17px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              letterSpacing: '-0.2px',
            }}>MEP Calcs</span>
          </Link>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/methodology" style={{
            fontSize: '12px',
            color: 'var(--text-tertiary)',
            textDecoration: 'none',
          }}>Methodology</Link>

          <a href="mailto:hello@mepcalcs.com" style={{
            fontSize: '12px',
            color: 'var(--text-tertiary)',
            textDecoration: 'none',
          }}>Contact</a>

          {/* Theme toggle */}
          <button onClick={toggle} style={{
            width: '36px',
            height: '20px',
            background: 'var(--bg-accent)',
            border: '0.5px solid var(--border-primary)',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '0 3px',
            transition: 'background 0.2s',
          }}>
            <div style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: 'var(--brand)',
              marginLeft: theme === 'dark' ? 'auto' : '0',
              transition: 'margin 0.2s',
            }} />
          </button>
        </div>

      </nav>

      {/* Backdrop */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 45,
            background: 'transparent',
            cursor: 'default',
          }}
        />
      )}

      {/* Dropdown menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: '60px',
          left: '16px',
          zIndex: 55,
          background: 'var(--bg-primary)',
          border: '0.5px solid var(--border-primary)',
          borderRadius: '12px',
          padding: '8px',
          minWidth: '220px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}>

          <p style={{
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            padding: '6px 10px 4px',
            margin: 0,
          }}>Tools</p>

          {TOOLS.map(tool => (
            <Link
              key={tool.href}
              href={tool.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block',
                padding: '8px 10px',
                fontSize: '13px',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                borderRadius: '7px',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-accent)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {tool.name}
            </Link>
          ))}

          <div style={{
            height: '0.5px',
            background: 'var(--border-primary)',
            margin: '6px 0',
          }} />

          <Link
            href="/methodology"
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'block',
              padding: '8px 10px',
              fontSize: '13px',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              borderRadius: '7px',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-accent)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Methodology
          </Link>

        </div>
      )}
    </>
  );
}