'use client';

import { usePressStore } from '@/lib/press-store';
import { getTriggersByCategory, PRESS_TRIGGERS } from '@/lib/press-triggers';

export default function TriggerGrid() {
  const { sport, activeTriggers, toggleTrigger } = usePressStore();

  const sportCategory = sport as 'gaa' | 'hurling' | 'soccer';
  const availableTriggers = getTriggersByCategory(sportCategory);

  // Group triggers by category for display
  const universalTriggers = availableTriggers.filter(t => t.category === 'universal');
  const kickoutTriggers = availableTriggers.filter(t => t.isKickout);
  const otherTriggers = availableTriggers.filter(t => !t.isKickout && t.category !== 'universal');

  const renderTrigger = (trigger: typeof PRESS_TRIGGERS[0]) => {
    const isActive = activeTriggers.includes(trigger.id);
    const isKickout = trigger.isKickout;

    return (
      <button
        key={trigger.id}
        onClick={() => toggleTrigger(trigger.id)}
        className={`p-3 rounded-lg text-sm font-medium transition-all ${
          isKickout ? 'col-span-2' : ''
        }`}
        style={{
          background: isActive
            ? isKickout
              ? 'rgba(239, 68, 68, 0.15)'
              : 'rgba(0, 212, 110, 0.15)'
            : 'var(--bg3)',
          border: `1px solid ${isActive ? 'var(--acc)' : 'var(--bdr)'}`,
          color: isActive ? 'var(--acc)' : 'var(--txt2)',
        }}
        title={trigger.description}
      >
        {trigger.label}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Kickout triggers section */}
      {kickoutTriggers.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--txt2)' }}>
            Kickout/Restart
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {kickoutTriggers.map(renderTrigger)}
          </div>
        </div>
      )}

      {/* Universal triggers section */}
      {universalTriggers.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--txt2)' }}>
            General Play
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {universalTriggers.map(renderTrigger)}
          </div>
        </div>
      )}

      {/* Sport-specific triggers section */}
      {otherTriggers.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--txt2)' }}>
            {sportCategory.charAt(0).toUpperCase() + sportCategory.slice(1)} Specific
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {otherTriggers.map(renderTrigger)}
          </div>
        </div>
      )}
    </div>
  );
}
