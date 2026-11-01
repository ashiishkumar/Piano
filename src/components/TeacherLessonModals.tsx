import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Hand,
  HelpCircle,
  Play,
  Sparkles,
  X,
  ArrowRight,
  Piano,
} from 'lucide-react';
import { useStudioStore } from '../store/useStudioStore';
import {
  getTeacherGuideForSong,
  STUDIO_FEATURE_EXPLANATIONS,
} from '../utils/teacherGuidance';
import { getWesternName } from '../utils/notation';
import { midiManager } from '../services/MIDIManager';

export const TeacherLessonModals: React.FC = () => {
  const {
    currentSong,
    activeLessonStep,
    applyLessonStep,
    showLessonBriefingModal,
    setShowLessonBriefingModal,
    showOnboardingWizard,
    setShowOnboardingWizard,
    showFeatureGuideModal,
    setShowFeatureGuideModal,
    activeNotes,
  } = useStudioStore();

  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const guide = getTeacherGuideForSong(currentSong);

  // Check if user is pressing Middle C (MIDI 60) or any key during the interactive onboarding wizard
  const heldMidis = Object.keys(activeNotes).map(Number);
  const pressedMiddleC = heldMidis.includes(60);
  const lastPressedKeyName = heldMidis.length > 0 ? getWesternName(heldMidis[0], true) : null;

  return (
    <>
      {/* 1. PRE-LESSON TEACHER BRIEFING MODAL */}
      {showLessonBriefingModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="glass-panel rounded-2xl max-w-2xl w-full p-6 border border-emerald-500/40 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                    Your Piano Teacher • Lesson Briefing
                  </span>
                  <h2 className="text-xl font-bold text-white">{currentSong.title}</h2>
                  <p className="text-xs text-slate-400">{currentSong.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setShowLessonBriefingModal(false)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Why we learn this */}
            <div className="glass-card rounded-xl p-4 space-y-1.5 border border-emerald-500/20">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Why We Are Learning This Lesson</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {guide.whyLearnThis}
              </p>
            </div>

            {/* Where to put your hands on the keyboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="glass-card rounded-xl p-3.5 border border-emerald-500/30 space-y-1">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Hand className="w-3.5 h-3.5" />
                  <span>Right Hand Position (Green Notes)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {guide.handPlacement.rightHand}
                </p>
              </div>

              <div className="glass-card rounded-xl p-3.5 border border-sky-500/30 space-y-1">
                <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <Hand className="w-3.5 h-3.5" />
                  <span>Left Hand Position (Blue Notes)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {guide.handPlacement.leftHand}
                </p>
              </div>
            </div>

            {/* What Your Teacher Expects */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-amber-300">
                What Your Teacher Expects From You:
              </div>
              <ul className="space-y-1.5">
                {guide.whatTeacherExpects.map((exp, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Choose Your Step-by-Step Practice Stage */}
            <div className="space-y-2.5 pt-2 border-t border-white/10">
              <div className="text-xs font-bold text-white">
                Choose Your Step-by-Step Practice Phase (Start with Step 1!):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {guide.steps.map((st) => {
                  const isSelected = activeLessonStep === st.stepNumber;
                  return (
                    <button
                      key={st.stepNumber}
                      onClick={() => {
                        applyLessonStep(st.stepNumber);
                        setShowLessonBriefingModal(false);
                      }}
                      className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                          : 'bg-studio-950/90 border-white/10 text-slate-300 hover:border-emerald-500/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold">
                          Step {st.stepNumber}
                        </span>
                        <div className="text-xs font-bold text-white pt-0.5">
                          {st.title.replace(/^Step \d:\s*/, '')}
                        </div>
                        <div className="text-[11px] text-emerald-300 font-medium">
                          {st.subtitle}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug pt-1">
                          {st.whatToExpect}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 pt-1">
                        <Play className="w-3 h-3 fill-current" />
                        <span>Start Step {st.stepNumber}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. INTERACTIVE FIRST-TIME ONBOARDING & FIND MIDDLE C WIZARD */}
      {showOnboardingWizard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="glass-panel rounded-2xl max-w-xl w-full p-6 border border-emerald-500/40 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Piano className="w-6 h-6 text-emerald-400" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                    Interactive Setup • Step {wizardStep} of 3
                  </span>
                  <h2 className="text-lg font-bold text-white">
                    {wizardStep === 1 && 'Step 1: Find Middle C (Sa) on Your Keyboard'}
                    {wizardStep === 2 && 'Step 2: Meet Your Finger Numbers (1 to 5)'}
                    {wizardStep === 3 && 'Step 3: How "Wait-for-Me" Guided Practice Works'}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setShowOnboardingWizard(false)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {wizardStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Look at your <strong>61-key Yamaha PSR-E373</strong>. Notice that the black keys are grouped in alternating sets of <strong>2 black keys</strong> and <strong>3 black keys</strong>.
                </p>
                <div className="glass-card rounded-xl p-4 border border-amber-500/30 space-y-2">
                  <div className="text-xs font-bold text-amber-300">
                    🎯 Try It Right Now on Your Keyboard:
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Count to the <strong>3rd C key from the left</strong> (right in the middle of your keyboard, just to the left of the 2 black keys). That is <strong>Middle C (C4)</strong>—your <strong>Madhya Sa (सा)</strong>!
                  </p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-300">
                      {pressedMiddleC ? (
                        <span className="text-emerald-400 font-bold">
                          ✓ Awesome! You pressed Middle C (C4 / Sa)!
                        </span>
                      ) : lastPressedKeyName ? (
                        <span className="text-amber-300">
                          You pressed {lastPressedKeyName} — try finding C4 in the middle!
                        </span>
                      ) : (
                        'Press Middle C (C4) on your keyboard (or click below)...'
                      )}
                    </span>
                    <button
                      onClick={() => {
                        midiManager.triggerVirtualNoteOn(60, 85, 'mouse');
                        setTimeout(() => midiManager.triggerVirtualNoteOff(60, 'mouse'), 400);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/30"
                    >
                      Hear Middle C4
                    </button>
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  In piano lessons, we number our fingers from <strong>1 to 5</strong> on both hands so you always know which finger should press each key:
                </p>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {[
                    { num: 1, name: 'Thumb' },
                    { num: 2, name: 'Index' },
                    { num: 3, name: 'Middle' },
                    { num: 4, name: 'Ring' },
                    { num: 5, name: 'Pinky' },
                  ].map((f) => (
                    <div
                      key={f.num}
                      className="glass-card rounded-xl p-3 border border-emerald-500/30"
                    >
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-mono font-bold text-sm flex items-center justify-center mx-auto mb-1">
                        {f.num}
                      </div>
                      <div className="text-xs font-semibold text-white">{f.name}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-300 bg-studio-950 p-3 rounded-xl border border-white/10">
                  💡 <strong>Posture Tip:</strong> Keep your fingers gently curved (like holding a small orange or tennis ball) and keep your wrists relaxed!
                </p>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  We have set up <strong>Guided Beginner Mode</strong> so you never feel overwhelmed:
                </p>
                <div className="space-y-2.5 text-xs text-slate-200">
                  <div className="glass-card rounded-xl p-3 border border-white/10">
                    <strong className="text-emerald-400">1. Start With 1 Hand (Step 1):</strong> Every lesson starts with just your <strong>Right Hand</strong> and <strong>1 note at a time</strong>.
                  </div>
                  <div className="glass-card rounded-xl p-3 border border-white/10">
                    <strong className="text-cyan-400">2. Wait-for-Me Mode:</strong> The falling note stops at the bottom line and waits patiently for you to press the glowing key. Take all the time you need!
                  </div>
                  <div className="glass-card rounded-xl p-3 border border-white/10">
                    <strong className="text-amber-300">3. Grow at Your Own Pace:</strong> When Step 1 feels easy, click <strong>Step 2</strong> to add your Left Hand, and <strong>Step 3</strong> to play in rhythm!
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                onClick={() => setShowOnboardingWizard(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Skip Orientation
              </button>
              <div className="flex items-center gap-2">
                {wizardStep > 1 && (
                  <button
                    onClick={() => setWizardStep((wizardStep - 1) as 1 | 2 | 3)}
                    className="px-3 py-1.5 rounded-xl bg-studio-900 border border-white/15 text-xs text-slate-200"
                  >
                    Back
                  </button>
                )}
                {wizardStep < 3 ? (
                  <button
                    onClick={() => setWizardStep((wizardStep + 1) as 1 | 2 | 3)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      applyLessonStep(1);
                      setShowOnboardingWizard(false);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Lesson 1 (Right Hand Only!)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PLAIN-ENGLISH FEATURE EXPLANATION MODAL */}
      {showFeatureGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="glass-panel rounded-2xl max-w-2xl w-full p-6 border border-cyan-500/30 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-6 h-6 text-cyan-400" />
                <div>
                  <h2 className="text-lg font-bold text-white">
                    How VirtuosoStudio Works — Plain-English Feature Guide
                  </h2>
                  <p className="text-xs text-slate-400">
                    What every button and mode does, explained simply.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFeatureGuideModal(false)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STUDIO_FEATURE_EXPLANATIONS.map((item) => (
                <div
                  key={item.title}
                  className="glass-card rounded-xl p-3.5 border border-white/10 space-y-1.5"
                >
                  <span className="inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
                    {item.badge}
                  </span>
                  <h3 className="text-xs font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setShowFeatureGuideModal(false)}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
