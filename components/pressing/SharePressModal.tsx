'use client';

import { usePressStore } from '@/lib/press-store';
import { getTriggerById } from '@/lib/press-triggers';

interface Props {
  onClose: () => void;
}

const ZONE_LABELS = {
  high: 'High Press',
  mid: 'Mid Press',
  low: 'Low Block',
};

const POST_PRESS_LABELS = {
  playForward: 'Play Forward',
  recycleWide: 'Recycle Wide',
  switchPlay: 'Switch Play',
  holdAndBuild: 'Hold & Build',
};

const ROLE_LABELS = {
  firstPresser: 'First Presser',
  coverShadow: 'Cover Shadow',
  holdShape: 'Hold Shape',
  pressTrigger: 'Press Trigger',
};

export default function SharePressModal({ onClose }: Props) {
  const { name, sport, zoneConfig, playerRoles, activeTriggers, postPress } = usePressStore();

  // Generate WhatsApp text
  const generateShareText = () => {
    const lines: string[] = [];

    lines.push('*PlayForge — Pressing System*');
    lines.push(`Schema: ${name || 'Unnamed'} | Sport: ${sport.toUpperCase()}`);
    lines.push('');

    // Zone
    lines.push(`PRESS ZONE: ${ZONE_LABELS[zoneConfig.zone]}`);
    lines.push('');

    // Triggers
    lines.push(`TRIGGERS (${activeTriggers.length} active):`);
    activeTriggers.forEach(triggerId => {
      const trigger = getTriggerById(triggerId);
      if (trigger) {
        lines.push(`  • ${trigger.label}${trigger.description ? ` — ${trigger.description}` : ''}`);
      }
    });
    lines.push('');

    // Roles
    const rolesWithAssignments = Object.entries(playerRoles);
    if (rolesWithAssignments.length > 0) {
      lines.push('ROLES:');
      rolesWithAssignments.forEach(([playerId, role]) => {
        lines.push(`  #${playerId} — ${ROLE_LABELS[role as keyof typeof ROLE_LABELS]}`);
      });
      lines.push('');
    }

    // Post-press
    lines.push(`POST-PRESS: ${POST_PRESS_LABELS[postPress.option]}`);
    if (postPress.notes) {
      lines.push(`Notes: ${postPress.notes}`);
    }
    lines.push('');

    lines.push('Created with PlayForge');

    return lines.join('\n');
  };

  const shareText = generateShareText();

  const handleShare = async () => {
    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({
          title: `PlayForge — ${name || 'Pressing Schema'}`,
          text: shareText,
        });
        onClose();
        return;
      } catch {
        // User cancelled, fall through to WhatsApp
      }
    }

    // Fallback to WhatsApp
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--txt)' }}>
          Share Pressing System
        </h2>

        <textarea
          value={shareText}
          readOnly
          className="w-full p-3 rounded-lg text-xs outline-none resize-none mb-4"
          rows={10}
          style={{ background: 'var(--bg3)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: 'var(--bg3)', color: 'var(--txt)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: '#25d366', color: '#ffffff' }}
          >
            Share on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
