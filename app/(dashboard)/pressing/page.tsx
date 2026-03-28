'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import DashboardNav from '@/components/ui/DashboardNav';
import ZonePitchCanvas from '@/components/pressing/ZonePitchCanvas';
import RolePitchCanvas from '@/components/pressing/RolePitchCanvas';
import TriggerGrid from '@/components/pressing/TriggerGrid';
import PostPressPanel from '@/components/pressing/PostPressPanel';
import PressSchemaList from '@/components/pressing/PressSchemaList';
import SharePressModal from '@/components/pressing/SharePressModal';
import { usePressStore } from '@/lib/press-store';
import { usePressSchemas } from '@/hooks/usePressSchemas';

const AnimPitchCanvas = dynamic(() => import('@/components/pressing/AnimPitchCanvas'), { ssr: false });

interface Section {
  number: 1 | 2 | 3 | 4 | 5;
  title: string;
  subtitle: string;
}

const SECTIONS: Section[] = [
  { number: 1, title: 'WHERE', subtitle: 'Define your pressing zones' },
  { number: 2, title: 'WHO', subtitle: 'Assign player roles' },
  { number: 3, title: 'WHEN', subtitle: 'Select triggering situations' },
  { number: 4, title: 'WHAT DOES IT LOOK LIKE', subtitle: 'Show the press movement' },
  { number: 5, title: 'POST-PRESS', subtitle: 'Recovery strategy' },
];

export default function PressingPage() {
  const { name, sport, setName, setSport, currentSection, selectSection, reset } = usePressStore();
  const { saveSchema, loading: saving } = usePressSchemas();
  const [showShare, setShowShare] = useState(false);

  async function handleSave() {
    try {
      const state = usePressStore.getState();
      await saveSchema({
        name: state.name || 'Untitled Schema',
        sport: state.sport,
        zoneConfig: state.zoneConfig,
        playerRoles: state.playerRoles,
        activeTriggers: state.activeTriggers,
        pressPhases: state.pressPhases,
        postPress: state.postPress,
      });
      // Toast: saved successfully
    } catch (err) {
      console.error('Failed to save schema:', err);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <DashboardNav />

      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--txt)' }}>
            Pressing System
          </h1>

          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="text-xs" style={{ color: 'var(--txt2)' }}>Schema name</label>
              <input
                type="text"
                placeholder="e.g., High Press vs Kickouts"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg2)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
              />
            </div>
            <div className="w-32">
              <label className="text-xs" style={{ color: 'var(--txt2)' }}>Sport</label>
              <select
                value={sport}
                onChange={e => setSport(e.target.value as 'gaa' | 'hurling' | 'soccer')}
                className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg2)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
              >
                <option value="gaa">GAA</option>
                <option value="hurling">Hurling</option>
                <option value="soccer">Soccer</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
              style={{ background: 'var(--acc)', color: '#0b0f18' }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setShowShare(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: '#25d366', color: '#ffffff' }}
            >
              Share
            </button>
            <button
              onClick={() => reset(sport)}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ background: 'var(--bg2)', color: 'var(--txt2)' }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Accordion stepper */}
        <div className="flex flex-col gap-3 mb-8">
          {SECTIONS.map(section => (
            <div
              key={section.number}
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--bdr)' }}
            >
              <button
                onClick={() => selectSection(section.number)}
                className="w-full flex items-center justify-between p-4 text-left font-medium transition-all"
                style={{
                  background: currentSection === section.number ? 'var(--acc)' : 'var(--bg2)',
                  color: currentSection === section.number ? '#0b0f18' : 'var(--txt)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: currentSection === section.number ? '#0b0f18' : 'var(--bdr)',
                      color: currentSection === section.number ? 'var(--acc)' : 'var(--txt)',
                    }}
                  >
                    {section.number}
                  </div>
                  <div>
                    <div className="font-semibold">{section.title}</div>
                    <div className="text-xs" style={{ color: currentSection === section.number ? 'rgba(11,15,24,0.7)' : 'var(--txt2)' }}>
                      {section.subtitle}
                    </div>
                  </div>
                </div>
                <span style={{ color: currentSection === section.number ? '#0b0f18' : 'var(--txt2)' }}>
                  {currentSection === section.number ? '▼' : '▶'}
                </span>
              </button>

              {currentSection === section.number && (
                <div className="p-4 border-t" style={{ borderColor: 'var(--bdr)', background: 'var(--bg)' }}>
                  {section.number === 1 && <ZonePitchCanvas />}
                  {section.number === 2 && <RolePitchCanvas />}
                  {section.number === 3 && <TriggerGrid />}
                  {section.number === 4 && <AnimPitchCanvas />}
                  {section.number === 5 && <PostPressPanel />}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Saved schemas */}
        <div className="mb-6">
          <PressSchemaList />
        </div>
      </div>

      {showShare && (
        <SharePressModal onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
