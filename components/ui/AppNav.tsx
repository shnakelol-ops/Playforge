'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AppNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    { href: '/board', label: 'Board', icon: '🎯' },
    { href: '/playbook', label: 'Playbook', icon: '📚' },
    { href: '/pressing', label: 'Press', icon: '🛡️' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex sticky top-0 z-40 h-14 items-center justify-between px-6 border-b" style={{ background: 'var(--bg2)', borderColor: 'var(--bdr)' }}>
        {/* Logo */}
        <Link href="/board" className="flex items-center gap-2 font-display text-lg tracking-widest" style={{ color: 'var(--acc)' }}>
          PF
        </Link>

        {/* Nav tabs */}
        <div className="flex gap-8">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium pb-3 border-b-2 transition-colors"
              style={{
                color: isActive(item.href) ? 'var(--acc)' : 'var(--txt2)',
                borderColor: isActive(item.href) ? 'var(--acc)' : 'transparent',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: 'var(--txt2)' }}>
            {user?.email?.split('@')[0]}
          </span>
          <button
            onClick={() => signOut()}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'var(--bg3)', color: 'var(--txt2)' }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t" style={{ background: 'var(--bg2)', borderColor: 'var(--bdr)' }}>
        <div className="flex items-center justify-around h-full px-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-xs font-medium transition-colors"
              style={{
                color: isActive(item.href) ? 'var(--acc)' : 'var(--txt2)',
              }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={() => signOut()}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-xs font-medium transition-colors"
            style={{ color: 'var(--txt2)' }}
          >
            <LogOut size={20} />
            <span>Exit</span>
          </button>
        </div>
      </nav>

      {/* Mobile bottom safe area spacer */}
      <div className="md:hidden h-16 safe-area-inset" />
    </>
  );
}
