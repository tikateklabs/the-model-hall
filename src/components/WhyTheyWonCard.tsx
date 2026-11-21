import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  Compass,
  Share2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { BenchmarkSourceId, Candidate, HallMatchEvaluation, ViewMode } from '../types';
import { MODALITY_META } from '../engine/matcher';
import { LabBrandPill } from './LabBadge';
import { buildIntuitionInsight } from '../utils/intuitionRules';

interface WhyTheyWonCardProps {
  evaluation: HallMatchEvaluation;
  candidates: Candidate[];
  viewMode: ViewMode;
  onInspectCandidate: (candidateId: string) => void;
  onOpenBenchmarkHub: (sourceId?: BenchmarkSourceId) => void;
  onOpenShareCard: () => void;
}

export const WhyTheyWonCard: React.FC<WhyTheyWonCardProps> = ({
  evaluation,
  candidates,
  viewMode,
  onInspectCandidate,
  onOpenBenchmarkHub,
  onOpenShareCard,
}) => {
  const isBlueprint = viewMode === 'blueprint';

  const winner = useMemo(() => {
    if (!evaluation.winnerId) return null;
    return candidates.find((c) => c.id === evaluation.winnerId) ?? null;
  }, [candidates, evaluation.winnerId]);

  const insight = useMemo(() => {
    if (!winner) return null;
    return buildIntuitionInsight(winner, evaluation);
  }, [winner, evaluation]);

  if (!evaluation.hasActiveTask) {
    return null;
  }

  // Edge case: user combined incompatible modalities or narrow filters
  if (!winner || !evaluation.winnerReasoning || !insight) {
    const reqLabels = evaluation.requiredModalities.map((m) => MODALITY_META[m].label).join(' + ');
    return (
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border-[1.5px] p-4 sm:p-5 ${
          isBlueprint
            ? 'bg-[#2B1D14] border-[#F59E0B] text-[#FDE68A]'
            : 'bg-[#FFF3E6] border-[#E85D4A] text-[#111827]'
        }`}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#E85D4A]" />
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-semibold">
              No Single Specialist Covers {reqLabels || 'Every Active Filter'} Solo
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed opacity-90">
              That&rsquo;s a helpful AI intuition rule in action: use{' '}
              <strong>Google Gemini 4</strong> to analyze Video + Audio,{' '}
              <strong>Veo 3 / Sora 2</strong> to generate video clips, or open{' '}
              <strong>Filters</strong> and reset narrow constraints to see the full studio.
            </p>
          </div>
        </div>
      </motion.section>
    );
  }

  const reasoning = evaluation.winnerReasoning;

  return (
    <motion.section
      key={`${winner.id}-${evaluation.taskProfile.bucket}-${evaluation.requiredModalities.join('-')}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Build your AI picking intuition"
      className={`rounded-2xl border-[1.5px] overflow-hidden transition-colors ${
        isBlueprint
          ? 'bg-[#0E1E34] border-[#38BDF8]/80 text-[#E2E8F0]'
          : 'bg-[#FFFDF9] border-[#111827] text-[#111827] shadow-[4px_4px_0px_rgba(17,24,39,0.1)]'
      }`}
    >
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-[1.1fr_1.15fr_0.75fr] gap-4 items-stretch">
        {/* Column 1: Why [Winner] Fits */}
        <div className="flex flex-col justify-between space-y-2.5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 text-[10.5px] font-extrabold uppercase tracking-wider ${
                  isBlueprint ? 'text-[#7DD3FC]' : 'text-[#1F7A73]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Why {winner.shortName} Fits
              </span>
              <LabBrandPill labId={winner.labId} blueprint={isBlueprint} size="sm" />
            </div>

            <p className="text-xs sm:text-[13px] leading-relaxed">
              <strong className="font-semibold">{winner.name}</strong> ({insight.archetypeLabel},{' '}
              <span className="font-mono">{winner.feeTier}</span>) — {insight.whyItFits}
            </p>
          </div>

          {reasoning.runnerUpId && reasoning.runnerUpName && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onInspectCandidate(reasoning.runnerUpId!)}
                className={`text-xs font-bold underline underline-offset-2 cursor-pointer transition-colors ${
                  isBlueprint
                    ? 'text-[#7DD3FC] hover:text-white'
                    : 'text-[#475569] hover:text-[#E85D4A]'
                }`}
              >
                Compare #2 close runner-up: {reasoning.runnerUpName} →
              </button>
            </div>
          )}
        </div>

        {/* Column 2: Intuition Rule to Remember */}
        <div
          className={`rounded-xl border px-3.5 py-3 flex flex-col justify-center space-y-1 ${
            isBlueprint
              ? 'bg-[#122640] border-[#38BDF8]/40'
              : 'bg-[#FDF1E8] border-[#E85D4A]/45'
          }`}
        >
          <span
            className={`inline-flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-wider ${
              isBlueprint ? 'text-[#FBBF24]' : 'text-[#C2412D]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Intuition Rule to Remember
          </span>
          <div className="font-serif text-sm sm:text-[15px] font-bold leading-snug">
            {insight.ruleHeadline}
          </div>
          <p className="text-xs leading-relaxed opacity-85">{insight.ruleBody}</p>
        </div>

        {/* Column 3: Verify & Share */}
        <div className="flex flex-col justify-between gap-2">
          <div className="text-[10.5px] font-extrabold uppercase tracking-wider opacity-65">
            Verify &amp; Share
          </div>

          <div className="space-y-2 flex-1 flex flex-col justify-center">
            <button
              type="button"
              onClick={() => onOpenBenchmarkHub()}
              className={`w-full px-3 py-2 rounded-xl border-[1.5px] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                isBlueprint
                  ? 'bg-[#11223A] border-[#38BDF8]/70 text-[#BAE6FD] hover:bg-[#1E3A5F]'
                  : 'bg-[#E5F2EE] border-[#111827] text-[#115E59] hover:bg-[#1F7A73] hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Check 8 real benchmarks →</span>
            </button>

            <button
              type="button"
              onClick={onOpenShareCard}
              className={`w-full px-3 py-2 rounded-xl border-[1.5px] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                isBlueprint
                  ? 'bg-[#163455] border-[#38BDF8] text-white hover:bg-[#1E4570]'
                  : 'bg-[#FFFDF9] border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-[#FAF5EC]'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 shrink-0" />
              <span>Download Share Card</span>
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
