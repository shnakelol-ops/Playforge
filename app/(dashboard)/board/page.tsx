'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import AppNav from '@/components/ui/AppNav';
import Toolbar from '@/components/ui/Toolbar';
import PhaseBar from '@/components/ui/PhaseBar';
import Sidebar from '@/components/board/Sidebar';
import SaveModal from '@/components/ui/SaveModal';
import ShareModal from '@/components/ui/ShareModal';
import TrainingPanel from '@/components/ui/TrainingPanel';
import SubstitutionsPanel from '@/components/ui/SubstitutionsPanel';
import { usePlaybook } from '@/hooks/usePlaybook';
import { useBoardStore } from '@/lib/store';

const TacticsBoard = dynamic(() => import('@/components/board/TacticsBoard'), { ssr: false });

export default function BoardPage() {
  const [showSave, setShowSave] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showBench, setShowBench] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentPlayName, setCurrentPlayName] = useState('');
  const { phases, sport, mode, playerNames } = useBoardStore();
  const { savePlay } = usePlaybook();

  async function handleSave(name: string, category: string, notes?: string) {
    try {
      await savePlay(name, category, sport, phases as unknown[], notes, playerNames as Record<string, Record<string, string>>);
      setCurrentPlayName(name);
    } catch (err) {
      if (err instanceof Error && err.message === 'FREE_LIMIT') {
        setShowUpgrade(true);
        return; // SaveModal closes normally; upgrade modal takes over
      }
      throw err; // Re-throw Supabase/other errors so SaveModal can display them
    }
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg)' }}>
      <AppNav />
      <Toolbar
        onSave={() => setShowSave(true)}
        onShare={() => setShowShare(true)}
        onBench={() => setShowBench(v => !v)}
        onSidebar={() => setShowSidebar(v => !v)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop sidebar */}
        <div className="hidden md:flex md:w-80 flex-col border-l border-solid" style={{ borderColor: 'var(--bdr)' }}>
          <Sidebar isOpen={true} onClose={() => {}} />
        </div>

        {/* Main canvas area */}
        <div className="flex-1 overflow-hidden relative md:border-l" style={{ borderColor: 'var(--bdr)' }}>
          <TacticsBoard />
          {mode === 'training' && <TrainingPanel />}
          {showBench && <SubstitutionsPanel />}
        </div>

        {/* Mobile sidebar */}
        <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
      </div>

      <PhaseBar />

      {showSave && (
        <SaveModal
          onClose={() => setShowSave(false)}
          onSave={handleSave}
        />
      )}

      {showShare && (
        <ShareModal
          playName={currentPlayName}
          onClose={() => setShowShare(false)}
        />
      )}

      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)' }}>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--acc)' }}>Upgrade to Pro</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--txt2)' }}>
              Free plan allows up to 3 saved plays. Upgrade to Pro for unlimited plays, all sports, and multi-phase tactics.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowUpgrade(false)}
                className="flex-1 py-2.5 rounded-lg text-sm"
                style={{ background: 'var(--bg3)', color: 'var(--txt)' }}
              >
                Maybe later
              </button>
              <button
                onClick={() => { setShowUpgrade(false); window.location.href = '/pricing'; }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: 'var(--acc)', color: '#0b0f18' }}
              >
                See plans
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
