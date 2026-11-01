import React, { useEffect } from 'react';
import { TopDiagnosticsBar } from './components/TopDiagnosticsBar';
import { PracticeTransportBar } from './components/PracticeTransportBar';
import { GrandStaffView } from './components/GrandStaffView';
import { FallingNotesCanvas } from './components/FallingNotesCanvas';
import { InteractiveKeyboard61 } from './components/InteractiveKeyboard61';
import { LiveTelemetryPanel } from './components/LiveTelemetryPanel';
import { CurriculumView } from './components/CurriculumView';
import { SongImporterView } from './components/SongImporterView';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { SessionReportModal } from './components/SessionReportModal';
import { TeacherLessonModals } from './components/TeacherLessonModals';
import { useStudioStore } from './store/useStudioStore';
import { midiManager } from './services/MIDIManager';

export const App: React.FC = () => {
  const {
    activeTab,
    viewportLayout,
    handleIncomingMidiEvent,
    loadPersistedData,
  } = useStudioStore();

  useEffect(() => {
    loadPersistedData();
    midiManager.init();

    const unsubMidi = midiManager.subscribe((ev) => {
      handleIncomingMidiEvent(
        ev.type,
        ev.midi,
        ev.velocity,
        ev.channel,
        ev.latencyMs,
        ev.source
      );
    });

    const unsubDevices = midiManager.subscribeDevices(
      (inputs, outputs, activeInputId, activeOutputId, webMidiSupported) => {
        useStudioStore.setState({
          midiInputs: inputs,
          midiOutputs: outputs,
          activeInputId,
          activeOutputId,
          webMidiSupported,
        });
      }
    );

    return () => {
      unsubMidi();
      unsubDevices();
    };
  }, [handleIncomingMidiEvent, loadPersistedData]);

  return (
    <div className="h-screen w-screen flex flex-col bg-studio-950 text-slate-100 overflow-hidden">
      {/* Module A.1: Auto-Discovery & Live Hardware Diagnostics Bar */}
      <TopDiagnosticsBar />

      {activeTab === 'studio' ? (
        <>
          {/* Module B.2: Smart Practice Modes, Looper, Speed Trainer & Notation Bridge Bar */}
          <PracticeTransportBar />

          {/* Main Dual-Visualizer + Right-Side Live Telemetry Workspace */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
              {/* Top Half: Synchronized Scrolling Grand Staff Sheet Music */}
              {(viewportLayout === 'split' || viewportLayout === 'sheet') && (
                <div
                  className={
                    viewportLayout === 'split'
                      ? 'h-[220px] shrink-0'
                      : 'flex-1 min-h-0'
                  }
                >
                  <GrandStaffView />
                </div>
              )}

              {/* Bottom Half: 60 FPS Falling-Notes Highway */}
              {(viewportLayout === 'split' || viewportLayout === 'highway') && (
                <div className="flex-1 min-h-0 relative">
                  <FallingNotesCanvas />
                </div>
              )}
            </div>

            {/* Module C: Real-Time Performance Monitoring & Feedback Sidebar */}
            <LiveTelemetryPanel />
          </div>

          {/* Module A.2: 61-Key Interactive Virtual Keyboard (Yamaha PSR-E373 C1–C6) */}
          <InteractiveKeyboard61 />
        </>
      ) : activeTab === 'curriculum' ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <CurriculumView />
          <InteractiveKeyboard61 />
        </div>
      ) : activeTab === 'importer' ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <SongImporterView />
          <InteractiveKeyboard61 />
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <AnalyticsDashboardView />
          <InteractiveKeyboard61 />
        </div>
      )}

      {/* Module F.1: Post-Session Report Card & Automated Prescriptions Modal */}
      <SessionReportModal />

      {/* Guided Piano Teacher Modals: Pre-Lesson Briefing, Find Middle C Wizard, and Plain-English Feature Guide */}
      <TeacherLessonModals />
    </div>
  );
};

export default App;
