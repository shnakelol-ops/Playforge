'use client';

import { useBoardStore } from '@/lib/store';
import type { Phase } from '@/lib/store';

interface Props {
  playName: string;
  onClose: () => void;
}

function generateWhatsAppMessage(playName: string, sport: string, phases: Phase[]): string {
  const sportLabel: Record<string, string> = {
    gaa: 'GAA Football',
    hurling: 'GAA Hurling',
    soccer: 'Soccer',
  };
  let msg = `*PlayForge* — ${sportLabel[sport] ?? sport}\n\n`;
  msg += `*Play: ${playName}*\n`;
  msg += `Phases: ${phases.length}\n\n`;

  phases.forEach((phase, i) => {
    msg += `*Phase ${i + 1}:*\n`;
    if (phase.runs.length === 0) {
      msg += '  No runs drawn\n';
    } else {
      phase.runs.forEach(run => {
        const allPlayers = [...phase.playerPositions.home, ...phase.playerPositions.away];
        const player = allPlayers.find(p => p.id === run.playerId);
        if (player) {
          msg += `• #${player.num} ${player.pos} (${run.team}) — ${run.style}\n`;
        }
      });
    }
    msg += '\n';
  });

  msg += `_Shared via PlayForge — playforge.app_`;
  return msg;
}

export default function ShareModal({ playName, onClose }: Props) {
  const { phases, sport } = useBoardStore();

  function shareWhatsApp() {
    const message = generateWhatsAppMessage(playName || 'Untitled play', sport, phases);
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  function copyLink() {
    navigator.clipboard.writeText('https://playforge.app');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)' }}>
        <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--txt)' }}>Share play</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--txt2)' }}>{playName || 'Current board'}</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
            style={{ background: '#25D366', color: '#fff' }}
          >
            <span className="text-lg">💬</span>
            Share on WhatsApp
          </button>
          <button
            onClick={copyLink}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
            style={{ background: 'var(--bg3)', color: 'var(--txt)' }}
          >
            <span className="text-lg">🔗</span>
            Copy link
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-lg text-sm"
          style={{ color: 'var(--txt2)' }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
