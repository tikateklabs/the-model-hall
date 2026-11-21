import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  LayoutGrid,
  Lock,
  LockOpen,
  Scale,
  Share2,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import {
  BenchmarkSourceId,
  Candidate,
  CandidateMatchResult,
  ModalityKey,
  ViewMode,
} from '../types';
import { BENCHMARK_BY_ID } from '../data/roster';
import { CandidatePortrait } from './AvatarSvg';
import { LAB_META, LabCrestIcon, ModalityLoadoutGrid, WING_META } from './LabBadge';
import { getZoneArchetypeLabel } from '../utils/intuitionRules';

interface ResumeCardProps {
  candidate: Candidate;
  matchResult: CandidateMatchResult;
  requiredModalities: ModalityKey[];
  totalModelsCount: number;
  viewMode: ViewMode;
  linkCopied: boolean;
  onOpenTrialShift: () => void;
  onOpenShareCard: () => void;
  onCopyLink: () => void;
  onOpenBenchmarkHub: (sourceId?: BenchmarkSourceId) => void;
  onOpenRosterModal: () => void;
}

const STAT_ROWS: Array<{ key: keyof Candidate['traits']; label: string }> = [
  { key: 'thinking', label: 'Thinking' },
  { key: 'honesty', label: 'Honesty' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'creativity', label: 'Creativity' },
  { key: 'speed', label: 'Speed' },
];

export const ResumeCard: React.FC<ResumeCardProps> = ({
  candidate,
  matchResult,
  requiredModalities,
  totalModelsCount,
  viewMode,
  linkCopied,
  onOpenTrialShift,
  onOpenShareCard,
  onCopyLink,
  onOpenBenchmarkHub,
  onOpenRosterModal,
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const isBlueprint = viewMode === 'blueprint';
  const labMeta = LAB_META[candidate.labId];
  const wingMeta = WING_META[candidate.specialtyWing];
  const archetype = getZoneArchetypeLabel(candidate);

  const getVerdictClasses = () => {
    if (isBlueprint) {
      switch (matchResult.status) {
        case 'disqualified_modality':
          return 'bg-[#3F161D] border-[#F87171] text-[#FCA5A5]';
        case 'in_sync':
        case 'secondary_sync':
          return 'bg-[#0C3547] border-[#38BDF8] text-[#BAE6FD]';
        case 'stretch':
          return 'bg-[#3B2A14] border-[#F59E0B] text-[#FDE68A]';
        case 'overqualified':
          return 'bg-[#1E293B] border-[#64748B] text-[#CBD5E1]';
        default:
          return 'bg-[#102136] border-[#1E3A5F] text-[#94A3B8]';
      }
    }
    switch (matchResult.status) {
      case 'disqualified_modality':
        return 'bg-[#FEE2E2] border-[#DC2626] text-[#991B1B]';
      case 'in_sync':
        return 'bg-[#E1F2EE] border-[#1F7A73] text-[#115E59]';
      case 'secondary_sync':
        return 'bg-[#ECF6F3] border-[#5E9E94] text-[#115E59]';
      case 'stretch':
        return 'bg-[#FDF0D5] border-[#D99B43] text-[#784A0C]';
      case 'overqualified':
        return 'bg-[#E2E8F0] border-[#64748B] text-[#334155]';
      default:
        return 'bg-[#F5EFE6] border-[#111827]/20 text-[#334155]';
    }
  };

  return (
    <aside
      className={`rounded-2xl border-[1.5px] flex flex-col justify-between overflow-hidden transition-colors duration-300 ${
        isBlueprint
          ? 'bg-[#112036] border-[#38BDF8]/80 text-[#E2E8F0]'
          : 'bg-[#FFFDF9] border-[#111827] text-[#111827] shadow-[4px_4px_0px_rgba(17,24,39,0.1)]'
      }`}
    >
      {/* Clean Parent Company Crest Top Bar */}
      <div
        className="px-5 py-2.5 flex items-center justify-between gap-2 text-white border-b-[1.5px] border-[#111827]"
        style={{ backgroundColor: isBlueprint ? '#0D223B' : labMeta.color }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <LabCrestIcon labId={candidate.labId} className="w-4 h-4 shrink-0" />
          <span className="text-[11px] font-extrabold tracking-widest uppercase truncate">
            {labMeta.name}
          </span>
        </div>
        <span className="text-[10.5px] font-semibold bg-black/20 px-2 py-0.5 rounded whitespace-nowrap">
          {archetype}
        </span>
      </div>

      <div className="p-5 space-y-3.5">
        {/* Clean Identity Header */}
        <div className="flex items-start gap-3.5">
          <div className="shrink-0">
            <CandidatePortrait
              candidate={candidate}
              blueprint={isBlueprint}
              className="w-[70px] h-[70px]"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h2
                className={`font-serif text-xl font-semibold leading-tight ${
                  isBlueprint ? 'text-[#F8FAFC]' : 'text-[#111827]'
                }`}
              >
                {candidate.name}
              </h2>
              <span
                title={`Approx. $${candidate.costPerTaskUsd.toFixed(2)} per typical task`}
                className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                  isBlueprint
                    ? 'bg-[#1E3A5F] text-[#7DD3FC] border border-[#38BDF8]/50'
                    : 'bg-[#EFE8DC] text-[#111827] border border-[#111827]/25'
                }`}
              >
                {candidate.feeTier}
              </span>
            </div>

            <p
              className={`text-xs font-medium mt-0.5 ${
                isBlueprint ? 'text-[#7DD3FC]' : 'text-[#475569]'
              }`}
            >
              {candidate.title}
            </p>

            <div
              className={`text-[11px] mt-1.5 font-mono tabular-nums ${
                isBlueprint ? 'text-[#94A3B8]' : 'text-[#64748B]'
              }`}
            >
              ~${candidate.costPerTaskUsd.toFixed(2)}/task · {candidate.firstTokenSec}s reply ·{' '}
              {candidate.contextWindow}
            </div>
          </div>
        </div>

        {/* 1-Sentence Plain-English Fit Verdict */}
        <div className={`rounded-xl border px-3.5 py-2.5 transition-colors ${getVerdictClasses()}`}>
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-[11px] font-extrabold tracking-wide uppercase">
              {matchResult.verdictTitle}
            </span>
            {matchResult.status !== 'idle' && (
              <span className="text-[10.5px] font-bold tabular-nums opacity-90">
                {matchResult.statusLabel}
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed opacity-95">{matchResult.verdictReason}</p>
        </div>

        {/* 5 Clean Horizontal Trait Bars */}
        <div className="space-y-2">
          {STAT_ROWS.map((row) => {
            const value = candidate.traits[row.key];
            return (
              <div key={row.key} className="grid grid-cols-[74px_1fr_26px] items-center gap-2.5">
                <span
                  className={`text-xs font-semibold ${
                    isBlueprint ? 'text-[#CBD5E1]' : 'text-[#111827]'
                  }`}
                >
                  {row.label}
                </span>
                <div
                  className={`h-2.5 rounded-full overflow-hidden border ${
                    isBlueprint
                      ? 'bg-[#0B172A] border-[#38BDF8]/60'
                      : 'bg-[#FAF5EC] border-[#111827]'
                  }`}
                >
                  <motion.div
                    key={`${candidate.id}-${row.key}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: value / 100 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    style={{ transformOrigin: 'left center' }}
                    className={`h-full w-full ${
                      isBlueprint ? 'bg-[#38BDF8]' : 'bg-[#1F7A73]'
                    }`}
                  />
                </div>
                <span
                  className={`text-xs text-right tabular-nums font-semibold ${
                    isBlueprint ? 'text-[#7DD3FC] font-mono' : 'text-[#475569]'
                  }`}
                >
                  {value}
                </span>
              </div>
            );
          })}
        </div>

        {/* Watch Out For Editorial Callout Box */}
        <div
          className={`rounded-xl border px-3.5 py-2.5 ${
            isBlueprint
              ? 'bg-[#1A2639] border-[#F59E0B]/70 text-[#FDE68A]'
              : 'bg-[#F8E4D6] border-[#E85D4A] text-[#111827]'
          }`}
        >
          <div
            className={`text-center font-serif text-sm font-bold mb-0.5 ${
              isBlueprint ? 'text-[#FBBF24]' : 'text-[#111827]'
            }`}
          >
            Watch Out For
          </div>
          <p
            className={`text-xs leading-relaxed italic ${
              isBlueprint ? 'text-[#E2E8F0]' : 'text-[#334155]'
            }`}
          >
            {candidate.watchOutFor}
          </p>
        </div>

        {/* TUCKED DEEP DIVE: Capabilities & 8 Real Benchmarks Accordion (Closed by Default) */}
        <div
          className={`rounded-xl border overflow-hidden ${
            isBlueprint
              ? 'bg-[#0B172A] border-[#1E3A5F]'
              : 'bg-[#FAF5EC] border-[#111827]/20'
          }`}
        >
          <button
            type="button"
            onClick={() => setDetailsOpen((o) => !o)}
            aria-expanded={detailsOpen}
            className={`w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs font-bold cursor-pointer transition-colors ${
              isBlueprint ? 'hover:bg-[#11223A]' : 'hover:bg-[#EFE8DC]'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck
                className={`w-3.5 h-3.5 ${isBlueprint ? 'text-[#38BDF8]' : 'text-[#1F7A73]'}`}
              />
              <span>Capabilities &amp; Real Benchmarks ({candidate.verifiedBenchmarkIds.length})</span>
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence initial={false}>
            {detailsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div
                  className={`px-3.5 pb-3.5 pt-2.5 border-t space-y-3 ${
                    isBlueprint ? 'border-[#1E3A5F]' : 'border-[#111827]/12'
                  }`}
                >
                  {/* License + Wing Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                        candidate.license === 'open_weight'
                          ? isBlueprint
                            ? 'bg-[#2E1065] border-[#A78BFA] text-[#DDD6FE]'
                            : 'bg-[#EDE9FE] border-[#6D28D9]/40 text-[#5B21B6]'
                          : isBlueprint
                          ? 'bg-[#0F243E] border-[#38BDF8]/40 text-[#BAE6FD]'
                          : 'bg-[#FFFDF9] border-[#111827]/20 text-[#334155]'
                      }`}
                    >
                      {candidate.license === 'open_weight' ? (
                        <>
                          <LockOpen className="w-2.5 h-2.5" />
                          <span>Open-Weight</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-2.5 h-2.5" />
                          <span>Cloud API</span>
                        </>
                      )}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        isBlueprint
                          ? 'bg-[#0F243E] border-[#1E3A5F] text-[#7DD3FC]'
                          : 'bg-[#E5F2EE] border-[#1F7A73]/30 text-[#115E59]'
                      }`}
                    >
                      {wingMeta.shortLabel}
                    </span>
                    <span className="text-[10px] font-mono opacity-70 ml-auto">
                      AA Index {candidate.aaIndex}
                    </span>
                  </div>

                  {/* 6-Modality Loadout Grid */}
                  <ModalityLoadoutGrid
                    modalities={candidate.modalities}
                    requiredModalities={requiredModalities}
                    blueprint={isBlueprint}
                  />

                  {/* Hire For / Skip For */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          isBlueprint ? 'text-[#34D399]' : 'text-[#1F7A73]'
                        }`}
                      />
                      <span>
                        <strong>Best for:</strong> {candidate.bestFor[0]}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <XCircle
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          isBlueprint ? 'text-[#F87171]' : 'text-[#E85D4A]'
                        }`}
                      />
                      <span>
                        <strong>Skip for:</strong> {candidate.avoidFor[0]}
                      </span>
                    </div>
                  </div>

                  {/* Verified Benchmark Links */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className="font-bold uppercase tracking-wider opacity-75">
                        Verified on Real Leaderboards
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenBenchmarkHub()}
                        className={`font-bold underline underline-offset-2 cursor-pointer ${
                          isBlueprint ? 'text-[#7DD3FC]' : 'text-[#1F7A73]'
                        }`}
                      >
                        All 8 sites →
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.verifiedBenchmarkIds.map((srcId) => {
                        const src = BENCHMARK_BY_ID[srcId];
                        if (!src) return null;
                        return (
                          <button
                            key={srcId}
                            type="button"
                            onClick={() => onOpenBenchmarkHub(srcId)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer transition-colors ${
                              isBlueprint
                                ? 'bg-[#0F243E] border-[#38BDF8]/40 text-[#BAE6FD] hover:border-[#38BDF8]'
                                : 'bg-[#FFFDF9] border-[#111827]/25 text-[#111827] hover:bg-[#111827] hover:text-white'
                            }`}
                          >
                            {src.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tucked 42-Model Grouped Roster Button */}
        <button
          type="button"
          onClick={onOpenRosterModal}
          className={`w-full py-2 px-3.5 rounded-xl border text-xs font-bold inline-flex items-center justify-between gap-2 transition-colors cursor-pointer ${
            isBlueprint
              ? 'bg-[#0D1E35] border-[#38BDF8]/50 text-[#BAE6FD] hover:bg-[#163455]'
              : 'bg-[#F5EFE6] border-[#111827]/25 text-[#111827] hover:border-[#111827] hover:bg-[#EFE8DC]'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <LayoutGrid className="w-3.5 h-3.5 text-[#1F7A73]" />
            <span>Browse all {totalModelsCount} Specialists (11 Labs)</span>
          </span>
          <span className="opacity-70">→</span>
        </button>
      </div>

      {/* Bottom Folder-Tab Trial Shift + Share Card & Copy Link Dock */}
      <div className="pt-1">
        <div className="px-5 flex items-end">
          <button
            type="button"
            onClick={onOpenTrialShift}
            className={`relative -mb-[1.5px] z-10 inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-t-xl border-[1.5px] border-b-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F7A73] ${
              isBlueprint
                ? 'bg-[#162B47] border-[#38BDF8] text-[#E0F2FE] hover:bg-[#1E3A5F]'
                : 'bg-[#FAF5EC] border-[#111827] text-[#111827] hover:bg-[#EFE8DC]'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Trial Shift</span>
          </button>
          <span
            className={`ml-3 pb-2 text-[11px] truncate ${
              isBlueprint ? 'text-[#7DD3FC]/80 font-mono' : 'text-[#64748B]'
            }`}
          >
            Compare 3 answers live
          </span>
        </div>

        <div
          className={`border-t-[1.5px] px-5 py-3 grid grid-cols-2 gap-2 ${
            isBlueprint
              ? 'bg-[#0D1A2D] border-[#38BDF8]'
              : 'bg-[#FAF5EC] border-[#111827]'
          }`}
        >
          <button
            type="button"
            onClick={onOpenShareCard}
            className={`py-2 px-3 rounded-xl border-[1.5px] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isBlueprint
                ? 'bg-[#163455] border-[#38BDF8] text-[#E0F2FE] hover:bg-[#1E4570]'
                : 'bg-[#E85D4A] border-[#111827] text-white hover:bg-[#D44B39]'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Card</span>
          </button>

          <button
            type="button"
            onClick={onCopyLink}
            className={`py-2 px-3 rounded-xl border-[1.5px] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              linkCopied
                ? isBlueprint
                  ? 'bg-[#0C4A6E] border-[#38BDF8] text-[#E0F2FE]'
                  : 'bg-[#1F7A73] border-[#111827] text-white'
                : isBlueprint
                ? 'bg-[#132640] border-[#38BDF8]/80 text-[#E0F2FE] hover:bg-[#1E3A5F]'
                : 'bg-[#FFFDF9] border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-[#FAF5EC]'
            }`}
          >
            {linkCopied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
