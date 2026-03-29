'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AppNav from '@/components/ui/AppNav';
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
  { number: 1, title: 'WHERE', subtitle: 'Define your pressing zone' },
  { number: 2, title: 'WHO', subtitle: 'Assign player roles' },
  { number: 3, title: 'WHEN', subtitle: 'Select triggering situations' },
  { number: 4, title: 'ANIMATION', subtitle: 'Show the press movement' },
  { number: 5, title: 'AFTER', subtitle: 'Post-press recovery strategy' },
];

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function PressingPage() {
  const {
    name, sport, setName, setSport, currentSection, selectSection, reset,
    playerRoles, activeTriggers, pressPhases,
  } = usePressStore();
  const { saveSchema } = usePressSchemas();
  const [showShare, setShowShare] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [schemaRefreshKey, setSchemaRefreshKey] = useState(0);

  /** Returns true when a section has been meaningfully configured */
  function isSectionComplete(num: 1 | 2 | 3 | 4 | 5): boolean {
    switch (num) {
      case 1: return true; // Zone always has a selection
      case 2: return Object.keys(playerRoles).length > 0;
      case 3: return activeTriggers.length > 0;
      case 4: return pressPhases.some(phase =>
        phase.playerTargets.some(t => t.endRx !== t.startRx || t.endRy !== t.startRy));
      case 5: return true; // Always has a post-press option
      default: return false;
    }
  }

  useEffect(() => {
    if (saveStatus !== 'saved') return;
    const t = setTimeout(() => setSaveStatus('idle'), 2000);
    return () => clearTimeout(t);
  }, [saveStatus]);

  async function handleSave() {
    setSaveStatus('saving');
    setSaveError(null);
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
      setSaveStatus('saved');
      setSchemaRefreshKey(k => k + 1);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save schema');
      setSaveStatus('error');
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:pb-0 pb-20" style={{ background: 'var(--bg)' }}>
      <AppNav />

      <div className="max-w-2xl mx-auto w-full p-6 flex-1">
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

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 transition-all"
              style={{
                background: saveStatus === 'saved' ? 'var(--green)' : saveStatus === 'error' ? 'var(--red)' : 'var(--acc)',
                color: '#0b0f18',
              }}
            >
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved ✓' : 'Save'}
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

          {saveStatus === 'error' && saveError && (
            <p className="mt-2 text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.3)' }}>
              {saveError}
            </p>
          )}
        </div>

        {/* Accordion stepper */}
        <div className="flex flex-col gap-3 mb-8">
          {SECTIONS.map(section => {
            const isActive = currentSection === section.number;
            const isDone = !isActive && isSectionComplete(section.number);

            return (
              <div
                key={section.number}
                className="rounded-lg overflow-hidden"
                style={{ border: `1px solid ${isActive ? 'var(--acc)' : 'var(--bdr)'}` }}
              >
                <button
                  onClick={() => selectSection(section.number)}
                  className="w-full flex items-center justify-between p-4 text-left font-medium transition-all"
                  style={{
                    background: isActive ? 'var(--acc)' : 'var(--bg2)',
                    color: isActive ? '#0b0f18' : 'var(--txt)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Step indicator circle */}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: isActive
                          ? '#0b0f18'
                          : isDone
                          ? 'var(--acc)'
                          : 'var(--bdr)',
                        color: isActive
                          ? 'var(--acc)'
                          : isDone
                          ? '#0b0f18'
                          : 'var(--txt)',
                      }}
                    >
                      {isDone ? '✓' : section.number}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{section.title}</div>
                      <div
                        className="text-xs"
                        style={{ color: isActive ? 'rgba(11,15,24,0.65)' : 'var(--txt2)' }}
                      >
                        {section.subtitle}
                      </div>
                    </div>
                  </div>
                  <span style={{ color: isActive ? '#0b0f18' : 'var(--txt2)', fontSize: '10px' }}>
                    {isActive ? '▼' : '▶'}
                  </span>
                </button>

                {isActive && (
                  <div className="p-4 border-t" style={{ borderColor: 'var(--bdr)', background: 'var(--bg)' }}>
                    {section.number === 1 && <ZonePitchCanvas />}
                    {section.number === 2 && <RolePitchCanvas />}
                    {section.number === 3 && <TriggerGrid />}
                    {section.number === 4 && <AnimPitchCanvas />}
                    {section.number === 5 && <PostPressPanel />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Saved schemas */}
        <div className="mb-6">
          <PressSchemaList refreshTrigger={schemaRefreshKey} />
        </div>
      </div>

      {showShare && (
        <SharePressModal onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
