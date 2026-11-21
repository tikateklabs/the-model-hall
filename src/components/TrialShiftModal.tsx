import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Clock, Coins, X } from 'lucide-react';
import { Candidate, DilemmaId, ViewMode } from '../types';
import { CandidatePortrait } from './AvatarSvg';
import { LabBrandPill } from './LabBadge';

interface TrialShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCandidate: Candidate;
  allCandidates: Candidate[];
  viewMode: ViewMode;
  onSelectCandidate: (candidateId: string) => void;
}

const DILEMMAS: Record<
  DilemmaId,
  {
    title: string;
    shortLabel: string;
    promptContext: string;
    whatToWatch: string;
  }
> = {
  sunday_overtime: {
    title: 'Politely decline Sunday overtime',
    shortLabel: 'Decline Sunday overtime',
    promptContext:
      'Brief: "My manager just asked our team to work Sunday to ship early. Write a polite, firm message saying no without sounding defensive or jeopardizing Monday."',
    whatToWatch:
      'Notice how Principals set crisp boundaries + de-risk Monday, Specialists strike a practical daily balance, and Associates either sound breezy or overly apologetic.',
  },
  lease_clause: {
    title: 'Flag the sneaky clause in a lease',
    shortLabel: 'Flag sneaky lease clause',
    promptContext:
      'Excerpt — Section 14(b): "Lease renews automatically for 12 months unless Tenant sends certified mail 90 days prior. Tenant assumes pro-rata operating costs including unscheduled capital improvements without annual cap."',
    whatToWatch:
      'Notice the real-world stakes gap: Principals catch both the 90-day lock-in AND the uncapped roof/HVAC capital-repair trap, while Front-Desk Associates miss or soft-pedal the hidden cost liability.',
  },
};

export const TrialShiftModal: React.FC<TrialShiftModalProps> = ({
  isOpen,
  onClose,
  selectedCandidate,
  allCandidates,
  viewMode,
  onSelectCandidate,
}) => {
  const [activeDilemma, setActiveDilemma] = useState<DilemmaId>('sunday_overtime');
  const isBlueprint = viewMode === 'blueprint';

  // Pick 2 contrasting peers from different seniority tiers so the user sees the full studio spectrum
  const comparisonTrio = useMemo(() => {
    const pickFromZone = (zone: Candidate['zone'], preferredId: string) => {
      const preferred = allCandidates.find((c) => c.id === preferredId && c.id !== selectedCandidate.id);
      if (preferred) return preferred;
      return allCandidates.find((c) => c.zone === zone && c.id !== selectedCandidate.id);
    };

    const peers: Candidate[] = [];
    if (selectedCandidate.zone === 'corner_office') {
      const mid = pickFromZone('mid_level', 'gpt-6-2-sol');
      const front = pickFromZone('front_desk', 'muse-ember');
      if (mid) peers.push(mid);
      if (front) peers.push(front);
    } else if (selectedCandidate.zone === 'mid_level') {
      const principal = pickFromZone('corner_office', 'claude-fable-5-2');
      const front = pickFromZone('front_desk', 'muse-ember');
      if (principal) peers.push(principal);
      if (front) peers.push(front);
    } else {
      const mid = pickFromZone('mid_level', 'gpt-6-2-sol');
      const principal = pickFromZone('corner_office', 'claude-fable-5-2');
      if (mid) peers.push(mid);
      if (principal) peers.push(principal);
    }

    return [selectedCandidate, ...peers];
  }, [selectedCandidate, allCandidates]);

  const dilemma = DILEMMAS[activeDilemma];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="trial-shift-heading"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]/65 backdrop-blur-[2px]"
          />

          {/* Wide Side-by-Side Drawer/Modal */}
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`relative z-10 w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border-2 overflow-hidden shadow-2xl ${
              isBlueprint
                ? 'bg-[#0F172A] border-[#38BDF8] text-[#E2E8F0]'
                : 'bg-[#FAF6F0] border-[#1E293B] text-[#1E293B]'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`px-6 py-4 border-b flex items-center justify-between gap-4 flex-wrap ${
                isBlueprint ? 'border-[#1E3A5F] bg-[#112036]' : 'border-[#1E293B]/20 bg-[#FFFDF9]'
              }`}
            >
              <div>
                <h2
                  id="trial-shift-heading"
                  className="font-serif text-2xl font-semibold tracking-tight"
                >
                  Trial Shift — Side-by-Side Comparison
                </h2>
                <p className={`text-xs mt-0.5 ${isBlueprint ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
                  Comparing <strong>{selectedCandidate.shortName}</strong> against two contrasting
                  studio tiers on the exact same brief.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Switchable Dilemma Tabs */}
                <div
                  className={`inline-flex p-1 rounded-xl border ${
                    isBlueprint
                      ? 'bg-[#0B172A] border-[#1E3A5F]'
                      : 'bg-[#F2EBE0] border-[#1E293B]/25'
                  }`}
                >
                  {(Object.keys(DILEMMAS) as DilemmaId[]).map((id) => {
                    const active = activeDilemma === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setActiveDilemma(id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                          active
                            ? isBlueprint
                              ? 'bg-[#1E3A5F] text-[#7DD3FC]'
                              : 'bg-[#1E293B] text-[#FAF6F0]'
                            : isBlueprint
                            ? 'text-[#94A3B8] hover:text-white'
                            : 'text-[#475569] hover:text-[#1E293B]'
                        }`}
                      >
                        {DILEMMAS[id].shortLabel}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close Trial Shift comparison"
                  className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                    isBlueprint
                      ? 'border-[#1E3A5F] text-[#94A3B8] hover:text-white hover:bg-[#1E3A5F]'
                      : 'border-[#1E293B]/25 text-[#475569] hover:text-[#1E293B] hover:bg-[#EFE8DC]'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Shared Dilemma Brief Box */}
              <div
                className={`rounded-xl border px-4 py-3.5 ${
                  isBlueprint
                    ? 'bg-[#132238] border-[#38BDF8]/40'
                    : 'bg-[#FFFDF9] border-[#1E293B]/30'
                }`}
              >
                <p className="text-sm font-medium leading-relaxed">{dilemma.promptContext}</p>
                <p
                  className={`text-xs mt-1.5 ${
                    isBlueprint ? 'text-[#7DD3FC]' : 'text-[#64748B]'
                  }`}
                >
                  {dilemma.whatToWatch}
                </p>
              </div>

              {/* 3-Column Side-by-Side Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                {comparisonTrio.map((person, index) => {
                  const sample = person.trialShifts[activeDilemma];
                  const isCurrent = index === 0;
                  const isWarning = sample.editorialNote.startsWith('WARNING:');

                  return (
                    <div
                      key={person.id}
                      className={`rounded-xl border-[1.5px] flex flex-col justify-between p-4 transition-colors ${
                        isCurrent
                          ? isBlueprint
                            ? 'bg-[#132944] border-[#38BDF8]'
                            : 'bg-[#FFFDF9] border-[#1E293B] shadow-[3px_3px_0px_#8FA89B]'
                          : isBlueprint
                          ? 'bg-[#0D1A2D] border-[#1E3A5F]'
                          : 'bg-[#FFFDF9]/85 border-[#1E293B]/45'
                      }`}
                    >
                      <div className="space-y-3.5">
                        {/* Candidate Header */}
                        <div className="flex items-start gap-3">
                          <CandidatePortrait
                            candidate={person}
                            blueprint={isBlueprint}
                            className="w-12 h-12 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-serif text-base font-semibold truncate">
                                {person.shortName}
                              </h3>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                                  isCurrent
                                    ? isBlueprint
                                      ? 'bg-[#38BDF8]/20 text-[#7DD3FC]'
                                      : 'bg-[#DCE6E0] text-[#1E3A2F]'
                                    : isBlueprint
                                    ? 'bg-[#1E293B] text-[#94A3B8]'
                                    : 'bg-[#F2EBE0] text-[#475569]'
                                }`}
                              >
                                {isCurrent ? 'Selected' : person.seniorityLabel}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <LabBrandPill labId={person.labId} blueprint={isBlueprint} />
                              <span
                                className={`text-[10.5px] font-medium truncate ${
                                  isBlueprint ? 'text-[#94A3B8]' : 'text-[#64748B]'
                                }`}
                              >
                                {person.codename}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[11px] tabular-nums opacity-85">
                              <span className="inline-flex items-center gap-1">
                                <Coins className="w-3 h-3" />${person.costPerTaskUsd.toFixed(2)} ({person.feeTier})
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {person.firstTokenSec}s
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Approach Style Header */}
                        <div
                          className={`text-[11px] font-semibold uppercase tracking-wide pt-2 border-t ${
                            isBlueprint
                              ? 'border-[#1E3A5F] text-[#7DD3FC]'
                              : 'border-[#1E293B]/15 text-[#4E6E5E]'
                          }`}
                        >
                          {sample.approachTag}
                        </div>

                        {/* Verbatim Sample Answer */}
                        <blockquote
                          className={`text-[13px] leading-relaxed rounded-lg p-3.5 border ${
                            isBlueprint
                              ? 'bg-[#091322] border-[#1E3A5F] text-[#E2E8F0]'
                              : 'bg-[#FAF6F0] border-[#1E293B]/15 text-[#1E293B]'
                          }`}
                        >
                          “{sample.response}”
                        </blockquote>
                      </div>

                      {/* Editorial Verdict Footer */}
                      <div className="mt-4 space-y-3">
                        <div
                          className={`rounded-lg p-3 text-xs leading-relaxed border flex items-start gap-2 ${
                            isWarning
                              ? isBlueprint
                                ? 'bg-[#3B2610] border-[#F59E0B]/70 text-[#FDE68A]'
                                : 'bg-[#F9EEDB] border-[#D99B43] text-[#784A0C]'
                              : isBlueprint
                              ? 'bg-[#102238] border-[#1E3A5F] text-[#CBD5E1]'
                              : 'bg-[#F5EFE6] border-[#1E293B]/15 text-[#334155]'
                          }`}
                        >
                          {isWarning && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                          <span>{sample.editorialNote}</span>
                        </div>

                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => onSelectCandidate(person.id)}
                            className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                              isBlueprint
                                ? 'border-[#38BDF8]/50 text-[#7DD3FC] hover:bg-[#1E3A5F]'
                                : 'border-[#1E293B]/30 text-[#1E293B] hover:bg-[#EFE8DC]'
                            }`}
                          >
                            Inspect {person.shortName}&rsquo;s full resume
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
