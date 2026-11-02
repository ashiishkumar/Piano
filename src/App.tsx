import React, { useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { TodayView } from './components/TodayView';
import { PathView } from './components/PathView';
import { GuidedLessonView } from './components/GuidedLessonView';
import { PracticeTransportBar } from './components/PracticeTransportBar';
import { GrandStaffView } from './components/GrandStaffView';
import { FallingNotesCanvas } from './components/FallingNotesCanvas';
import { InteractiveKeyboard61 } from './components/InteractiveKeyboard61';
import { LiveTelemetryPanel } from './components/LiveTelemetryPanel';
import { SongImporterView } from './components/SongImporterView';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { SessionReportModal } from './components/SessionReportModal';
import { TeacherLessonModals } from './components/TeacherLessonModals';
import { LessonLabView } from './components/LessonLabView';
import { FirstRunFlow } from './components/FirstRunFlow';
import { LessonPlayer } from './components/lessons/LessonPlayer';
import { LessonResultModal } from './components/lessons/LessonFrame';
import { useStudioStore } from './store/useStudioStore';
import { midiManager } from './services/MIDIManager';

/** The original workstation layout: transport bar, staff + highway, telemetry sidebar. */
const ProLessonView: React.FC<{ viewportLayout: 'split' | 'highway' | 'sheet' }> = ({ viewportLayout }) => (
  <>
    <PracticeTransportBar />
    <div className="flex-1 flex min-h-0 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {(viewportLayout === 'split' || viewportLayout === 'sheet') && (
          <div className={viewportLayout === 'split' ? 'h-[220px] shrink-0' : 'flex-1 min-h-0'}>
            <GrandStaffView />
          </div>
        )}
        {(viewportLayout === 'split' || viewportLayout === 'highway') && (
          <div className="flex-1 min-h-0 relative">
            <FallingNotesCanvas />
          </div>
        )}
      </div>
      <LiveTelemetryPanel />
    </div>
  </>
);

export const App: React.FC = () => {
  const { activeTab, viewportLayout, uiComplexityMode, showFirstRun, activeLesson, activeLessonNonce, handleIncomingMidiEvent, loadPersistedData } =
    useStudioStore();

  useEffect(() => {
    loadPersistedData();
    midiManager.init();

    const unsubMidi = midiManager.subscribe((ev) => {
      handleIncomingMidiEvent(ev.type, ev.midi, ev.velocity, ev.channel, ev.latencyMs, ev.source);
    });

    const unsubDevices = midiManager.subscribeDevices((inputs, outputs, activeInputId, activeOutputId, webMidiSupported) => {
      useStudioStore.setState({ midiInputs: inputs, midiOutputs: outputs, activeInputId, activeOutputId, webMidiSupported });
    });

    return () => {
      unsubMidi();
      unsubDevices();
    };
  }, [handleIncomingMidiEvent, loadPersistedData]);

  const guided = uiComplexityMode === 'guided';

  return (
    <div className="h-screen w-screen flex flex-col bg-studio-950 text-slate-100 overflow-hidden">
      <TopBar />

      {activeTab === 'today' && <TodayView />}

      {activeTab === 'path' && <PathView />}

      {activeTab === 'lesson' && (
        <>
          {activeLesson ? (
            <LessonPlayer key={`${activeLesson.id}-${activeLessonNonce}`} lesson={activeLesson} />
          ) : guided ? (
            <GuidedLessonView />
          ) : (
            <ProLessonView viewportLayout={viewportLayout} />
          )}
          <InteractiveKeyboard61 />
        </>
      )}

      {activeTab === 'songs' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <SongImporterView />
          <InteractiveKeyboard61 />
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <AnalyticsDashboardView />
          <InteractiveKeyboard61 />
        </div>
      )}

      {activeTab === 'lab' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <LessonLabView />
          <InteractiveKeyboard61 />
        </div>
      )}

      <SessionReportModal />
      <TeacherLessonModals />
      <LessonResultModal />
      {showFirstRun && <FirstRunFlow />}
    </div>
  );
};

export default App;
