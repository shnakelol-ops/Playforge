'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { drawPitch } from '@/components/board/PitchRenderer';

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const w = canvas.width;
    const h = canvas.height;

    // Demo animation: players moving along simple paths
    const players = [
      { rx: 0.5, ry: 0.9, team: 'home', targetRx: 0.5, targetRy: 0.6 },
      { rx: 0.3, ry: 0.7, team: 'home', targetRx: 0.4, targetRy: 0.45 },
      { rx: 0.7, ry: 0.7, team: 'home', targetRx: 0.6, targetRy: 0.45 },
      { rx: 0.5, ry: 0.1, team: 'away', targetRx: 0.5, targetRy: 0.4 },
    ];

    let t = 0;
    function tick() {
      t += 0.003;
      const progress = Math.abs(Math.sin(t));
      ctx!.clearRect(0, 0, w, h);
      drawPitch(ctx!, w, h, 'gaa');

      for (const p of players) {
        const rx = p.rx + (p.targetRx - p.rx) * progress;
        const ry = p.ry + (p.targetRy - p.ry) * progress;
        const x = rx * w;
        const y = ry * h;
        const fill = p.team === 'home' ? '#00e07a' : '#f5a623';
        const stroke = p.team === 'home' ? '#00b862' : '#c47d0a';
        ctx!.beginPath();
        ctx!.arc(x, y, 10, 0, Math.PI * 2);
        ctx!.fillStyle = fill;
        ctx!.fill();
        ctx!.strokeStyle = stroke;
        ctx!.lineWidth = 2;
        ctx!.stroke();
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 py-24" style={{ background: 'var(--bg)' }}>
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <p className="text-sm font-medium mb-4 tracking-widest uppercase" style={{ color: 'var(--acc)' }}>
          Professional Tactics Platform
        </p>
        <h1 className="text-6xl md:text-8xl mb-6" style={{ fontFamily: 'Bebas Neue, sans-serif', color: 'var(--txt)', lineHeight: 1.05 }}>
          Forge your game plan
        </h1>
        <p className="text-lg mb-10" style={{ color: 'var(--txt2)' }}>
          The professional tactics platform for Gaelic and Soccer coaches. Draw plays, animate movements, share with your team.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/register"
            className="px-8 py-4 rounded-xl text-base font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--acc)', color: '#0b0f18' }}
          >
            Start free
          </Link>
          <a
            href="#features"
            className="px-8 py-4 rounded-xl text-base font-medium transition-all"
            style={{ background: 'var(--bg2)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
          >
            See how it works
          </a>
        </div>
      </div>

      {/* Demo canvas */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </section>
  );
}
