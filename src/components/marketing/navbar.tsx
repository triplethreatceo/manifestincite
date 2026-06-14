'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Growth Formula', href: '#platform' },
  { label: 'Compliance Intel', href: '#intelligence' },
  { label: 'Benchmarks', href: '#benchmarks' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ background: '#0F1B2D', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-0.5">
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ color: '#C41E3A', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em' }}
          >
            Manifest
          </span>
          <span
            className="text-2xl font-bold tracking-tight text-white"
            style={{ fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em' }}
          >
            Incite
          </span>
          <span className="ml-2 text-[11px] font-light" style={{ color: '#8FA8C0' }}>
            by GrowthIncite
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors"
              style={{ color: '#8FA8C0', fontFamily: 'var(--font-sans)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#8FA8C0')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="rounded-md border px-4 py-2 text-sm font-medium transition-colors"
            style={{ borderColor: '#C41E3A', color: '#C41E3A' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#C41E3A';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#C41E3A';
            }}
          >
            Log In
          </Link>
          <a
            href="#access"
            className="rounded-md px-5 py-2 text-sm font-semibold text-white transition-colors"
            style={{ background: '#C41E3A' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#A51830')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#C41E3A')}
          >
            Get Started
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="text-white lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div
          className="flex flex-col gap-4 px-6 pb-6 lg:hidden"
          style={{ background: '#0F1B2D' }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium"
              style={{ color: '#8FA8C0' }}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/login"
              className="rounded-md border px-4 py-2 text-center text-sm font-medium"
              style={{ borderColor: '#C41E3A', color: '#C41E3A' }}
            >
              Log In
            </Link>
            <a
              href="#access"
              className="rounded-md px-4 py-2 text-center text-sm font-semibold text-white"
              style={{ background: '#C41E3A' }}
              onClick={() => setOpen(false)}
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}