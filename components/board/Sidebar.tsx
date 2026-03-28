'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useBoardStore } from '@/lib/store';
import SquadPanel from './SquadPanel';

type SidebarTab = 'squad' | 'items' | 'zones' | 'notes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('squad');
  const { phases, currentPhase, setPhaseNotes } = useBoardStore();
  const phase = phases[currentPhase];
  const notes = phase.notes ?? '';

  const tabs: Array<{ id: SidebarTab; label: string; icon: string }> = [
    { id: 'squad', label: 'Squad', icon: '👥' },
    { id: 'items', label: 'Items', icon: '🏮' },
    { id: 'zones', label: 'Zones', icon: '📍' },
    { id: 'notes', label: 'Notes', icon: '📝' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
          style={{ top: '56px' }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative md:flex md:w-80 flex-col
          h-screen md:h-auto
          bg-transparent md:bg-transparent
          z-40
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:translate-x-0 md:border-l md:border-solid
        `}
        style={{
          borderColor: isOpen ? 'var(--bdr)' : 'transparent',
          background: isOpen ? 'var(--bg2)' : 'transparent',
          top: '0',
          left: '0',
          width: isOpen ? '100%' : 'auto',
        }}
      >
        {/* Close button (mobile only) */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 p-2 rounded-lg z-50"
          style={{ background: 'var(--bg3)', color: 'var(--txt2)' }}
        >
          <X size={20} />
        </button>

        {/* Desktop sidebar */}
        <div className="hidden md:flex flex-col flex-1 border-l border-solid p-4 overflow-hidden"
          style={{ borderColor: 'var(--bdr)', background: 'var(--bg2)' }}>
          {/* Tab buttons */}
          <div className="flex gap-2 mb-4 border-b border-solid pb-3" style={{ borderColor: 'var(--bdr)' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: activeTab === tab.id ? 'var(--acc)' : 'var(--bg3)',
                  color: activeTab === tab.id ? '#0b0f18' : 'var(--txt2)',
                }}
                title={tab.label}
              >
                <span className="block text-sm mb-1">{tab.icon}</span>
                <span className="text-xs">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'squad' && <SquadPanel />}
            {activeTab === 'items' && (
              <div className="text-sm" style={{ color: 'var(--txt2)' }}>
                <p>Training items coming soon</p>
              </div>
            )}
            {activeTab === 'zones' && (
              <div className="text-sm" style={{ color: 'var(--txt2)' }}>
                <p>Zone tools coming soon</p>
              </div>
            )}
            {activeTab === 'notes' && (
              <textarea
                placeholder="Add coaching notes for this phase..."
                value={notes}
                onChange={e => setPhaseNotes(currentPhase, e.target.value)}
                className="textarea w-full"
              />
            )}
          </div>
        </div>

        {/* Mobile bottom sheet */}
        {isOpen && (
          <div className="md:hidden flex flex-col flex-1 p-6 pt-12 overflow-y-auto"
            style={{ background: 'var(--bg2)' }}>
            {/* Tab buttons */}
            <div className="flex gap-2 mb-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 py-3 px-3 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: activeTab === tab.id ? 'var(--acc)' : 'var(--bg3)',
                    color: activeTab === tab.id ? '#0b0f18' : 'var(--txt2)',
                  }}
                >
                  <span className="block text-lg mb-1">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            {activeTab === 'squad' && <SquadPanel />}
            {activeTab === 'items' && <div>Items coming soon</div>}
            {activeTab === 'zones' && <div>Zones coming soon</div>}
            {activeTab === 'notes' && (
              <textarea
                placeholder="Add coaching notes..."
                value={notes}
                onChange={e => setPhaseNotes(currentPhase, e.target.value)}
                className="textarea w-full"
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
