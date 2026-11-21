import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  X,
} from 'lucide-react';
import { BENCHMARK_SOURCES } from '../data/roster';
import { BenchmarkSourceId } from '../types';

interface BenchmarkHubModalProps {
  highlightSourceId?: BenchmarkSourceId | null;
  blueprint?: boolean;
  onClose: () => void;
}

export const BenchmarkHubModal: React.FC<BenchmarkHubModalProps> = ({
  highlightSourceId = null,
  blueprint = false,
  onClose,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#111827]/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Independent Benchmark Sources & Methodology"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border-2 overflow-hidden shadow-2xl ${
          blueprint
            ? 'bg-[#0F172A] border-[#38BDF8] text-[#E0F2FE]'
            : 'bg-[#FAF5EC] border-[#111827] text-[#111827] shadow-[8px_8px_0px_#111827]'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b-2 flex items-start justify-between gap-4 ${
            blueprint
              ? 'border-[#1E3A5F] bg-[#0B1324]'
              : 'border-[#111827] bg-[#FFFDF9]'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                  blueprint
                    ? 'bg-[#0C4A6E] border-[#38BDF8] text-[#BAE6FD]'
                    : 'bg-[#1F7A73] border-[#111827] text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Independent Evidence · 8 Real Sources
              </span>
              <span
                className={`text-[11px] font-semibold ${
                  blueprint ? 'text-[#7DD3FC]' : 'text-[#57534E]'
                }`}
              >
                Zero Vendor Marketing Claims
              </span>
            </div>
            <h2
              className={`text-2xl sm:text-3xl font-bold leading-tight ${
                blueprint ? 'font-mono text-[#E0F2FE]' : 'font-serif text-[#111827]'
              }`}
            >
              How We Verify Every Specialist
            </h2>
            <p
              className={`text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed ${
                blueprint ? 'text-[#93C5FD]' : 'text-[#57534E]'
              }`}
            >
              No single leaderboard tells the whole truth. We cross-reference <strong>8 independent evaluation platforms</strong>—combining live API pricing &amp; speed, blind human voting, real GitHub bug fixes, multimodal perception, open-weight reproducibility, and safety audits—and link straight to every live leaderboard so you can verify every claim yourself.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close benchmark hub"
            className={`p-2 rounded-xl border-2 cursor-pointer transition-colors shrink-0 ${
              blueprint
                ? 'border-[#38BDF8]/50 text-[#BAE6FD] hover:bg-[#1E3A5F]'
                : 'border-[#111827] bg-white hover:bg-[#F3ECE0] text-[#111827]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layman-friendly 3-step credibility explainer */}
        <div
          className={`px-6 py-3 border-b grid grid-cols-1 md:grid-cols-3 gap-3 text-xs ${
            blueprint
              ? 'border-[#1E3A5F] bg-[#132238]/60 text-[#BAE6FD]'
              : 'border-[#111827]/12 bg-[#F4EFE6] text-[#334155]'
          }`}
        >
          <div className="flex items-start gap-2">
            <Award className="w-4 h-4 text-[#E85D4A] shrink-0 mt-0.5" />
            <div>
              <strong className={blueprint ? 'text-white' : 'text-[#111827]'}>
                1. Modality Gate First:
              </strong>{' '}
              A text-only model can’t “guess” a video or voice memo—unsupported specialists are visibly ruled out before scoring.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1F7A73] shrink-0 mt-0.5" />
            <div>
              <strong className={blueprint ? 'text-white' : 'text-[#111827]'}>
                2. Task-Weighted Traits:
              </strong>{' '}
              Legal audits weight Honesty &amp; Thinking (74%); bulk email triage weights Speed &amp; penny pricing (50%+).
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <strong className={blueprint ? 'text-white' : 'text-[#111827]'}>
                3. Every Benchmark Has Blind Spots:
              </strong>{' '}
              We list each leaderboard’s exact weakness below so both non-technical buyers and engineers know what to trust.
            </div>
          </div>
        </div>

        {/* 8 Sources Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {BENCHMARK_SOURCES.map((source) => {
            const isHighlighted = highlightSourceId === source.id;
            return (
              <div
                key={source.id}
                className={`rounded-xl border-2 p-4 flex flex-col justify-between gap-3 transition-all ${
                  isHighlighted
                    ? blueprint
                      ? 'bg-[#0C4A6E]/60 border-[#38BDF8] ring-2 ring-[#38BDF8]/40'
                      : 'bg-[#FFFDF9] border-[#E85D4A] shadow-[4px_4px_0px_#E85D4A]'
                    : blueprint
                    ? 'bg-[#101E33] border-[#1E3A5F]'
                    : 'bg-[#FFFDF9] border-[#111827] shadow-[3px_3px_0px_#111827]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider block ${
                          blueprint ? 'text-[#7DD3FC]' : 'text-[#1F7A73]'
                        }`}
                      >
                        {source.organization}
                      </span>
                      <h3
                        className={`text-lg font-bold leading-snug ${
                          blueprint ? 'font-mono text-[#E0F2FE]' : 'font-serif text-[#111827]'
                        }`}
                      >
                        {source.name}
                      </h3>
                    </div>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 text-[11px] font-bold whitespace-nowrap transition-transform hover:-translate-y-0.5 ${
                        blueprint
                          ? 'bg-[#0C4A6E] border-[#38BDF8] text-[#E0F2FE] hover:bg-[#075985]'
                          : 'bg-[#111827] border-[#111827] text-white hover:bg-[#1F7A73]'
                      }`}
                    >
                      <span>Open Live Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div
                    className={`inline-block text-[10.5px] font-bold px-2 py-0.5 rounded border mb-2.5 ${
                      blueprint
                        ? 'bg-[#0F243E] border-[#38BDF8]/40 text-[#BAE6FD]'
                        : 'bg-[#F3ECE0] border-[#111827]/20 text-[#111827]'
                    }`}
                  >
                    Measures: {source.metricFocus}
                  </div>

                  <p
                    className={`text-xs leading-relaxed mb-2.5 ${
                      blueprint ? 'text-[#E0F2FE]/90' : 'text-[#334155]'
                    }`}
                  >
                    {source.whatItMeasures}
                  </p>

                  <div className="space-y-1.5 text-[11.5px] leading-snug">
                    <div
                      className={`rounded-lg px-2.5 py-1.5 border ${
                        blueprint
                          ? 'bg-[#0D2E2A]/60 border-[#34D399]/35 text-[#A7F3D0]'
                          : 'bg-[#ECFDF5] border-[#1F7A73]/30 text-[#065F46]'
                      }`}
                    >
                      <strong>Why trust it:</strong> {source.whyTrustIt}
                    </div>
                    <div
                      className={`rounded-lg px-2.5 py-1.5 border ${
                        blueprint
                          ? 'bg-[#2B1F0F]/70 border-[#F59E0B]/40 text-[#FDE68A]'
                          : 'bg-[#FEF3C7]/80 border-[#D97706]/35 text-[#92400E]'
                      }`}
                    >
                      <strong>Known blind spot:</strong> {source.knownBlindSpot}
                    </div>
                  </div>
                </div>

                <div
                  className={`pt-2 border-t text-[11px] flex items-center justify-between gap-2 ${
                    blueprint
                      ? 'border-[#1E3A5F] text-[#7DD3FC]'
                      : 'border-[#111827]/10 text-[#57534E]'
                  }`}
                >
                  <span>
                    <strong>Best for:</strong> {source.bestForTasks}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
