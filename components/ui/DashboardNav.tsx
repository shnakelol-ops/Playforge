'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex gap-6 border-b" style={{ borderColor: 'var(--bdr)' }}>
      <Link
        href="/board"
        className="px-4 py-3 text-sm font-medium transition-colors"
        style={{
          color: isActive('/board') ? 'var(--acc)' : 'var(--txt2)',
          borderBottom: isActive('/board') ? '2px solid var(--acc)' : '2px solid transparent',
          marginBottom: '-1px',
        }}
      >
        Board
      </Link>
      <Link
        href="/playbook"
        className="px-4 py-3 text-sm font-medium transition-colors"
        style={{
          color: isActive('/playbook') ? 'var(--acc)' : 'var(--txt2)',
          borderBottom: isActive('/playbook') ? '2px solid var(--acc)' : '2px solid transparent',
          marginBottom: '-1px',
        }}
      >
        Playbook
      </Link>
      <Link
        href="/pressing"
        className="px-4 py-3 text-sm font-medium transition-colors"
        style={{
          color: isActive('/pressing') ? 'var(--acc)' : 'var(--txt2)',
          borderBottom: isActive('/pressing') ? '2px solid var(--acc)' : '2px solid transparent',
          marginBottom: '-1px',
        }}
      >
        Press
      </Link>
    </div>
  );
}
