import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BudgetLevel, Candidate, HallMatchEvaluation, StakesLevel } from '../types';
import { LAB_META } from './LabBadge';

interface BlueprintOverlayProps {
  candidates: Candidate[];
  evaluation: HallMatchEvaluation;
  selectedCandidateId: string;
  budget: BudgetLevel;
  stakes: StakesLevel;
  onSelectCandidate: (id: string) => void;
}

export const BlueprintOverlay: React.FC<BlueprintOverlayProps> = ({
  candidates,
  evaluation,
  selectedCandidateId,
  budget,
  stakes,
  onSelectCandidate,
}) => {
  const [scope, setScope] = useState<'floor' | 'all'>('floor');
  const { taskProfile, resultsById, hasActiveTask, requiredModalities } = evaluation;
  const w = taskProfile.weights;

  const displayedIds =
    scope === 'floor'
      ? evaluation.floorCast.map((s) => s.candidate.id)
      : evaluation.rankedIds;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.25 }}
      className="font-mono text-[#BAE6FD] space-y-3"
    >
      {/* CAD Formula & Modality Gate Block */}
      <div className="rounded-xl border border-[#38BDF8]/50 bg-[#0B172A]/95 px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] tracking-wider">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[#38BDF8] font-semibold">
              CAD SCHEMATIC · {evaluation.totalCatalogCount}-MODEL CATALOG
            </span>
            <span className="text-[#64748B]">|</span>
            <span className="text-[#E0F2FE]">
              BUCKET: {taskProfile.label.toUpperCase()} ({taskProfile.complexity.toUpperCase()})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#7DD3FC] tabular-nums">
              BUDGET={budget.toUpperCase()} · STAKES={stakes.toUpperCase()}
            </span>
            <div className="inline-flex rounded border border-[#38BDF8]/50 overflow-hidden text-[10px]">
              <button
                type="button"
                onClick={() => setScope('floor')}
                className={`px-2 py-0.5 cursor-pointer ${
                  scope === 'floor' ? 'bg-[#0284C7] text-white' : 'text-[#7DD3FC]'
                }`}
              >
                FLOOR (8)
              </button>
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`px-2 py-0.5 cursor-pointer ${
                  scope === 'all' ? 'bg-[#0284C7] text-white' : 'text-[#7DD3FC]'
                }`}
              >
                POOL ({evaluation.rankedIds.length})
              </button>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-[#7DD3FC] bg-[#0F2138] border border-[#1E3A5F] rounded-lg px-3 py-2 overflow-x-auto whitespace-nowrap tabular-nums">
          <span className="text-[#94A3B8]">MATCHER_FORMULA: </span>
          <span>
            ModalityGate[{requiredModalities.length > 0 ? requiredModalities.join('+') : 'text'}] ×
            [({Math.round(w.thinking * 100)}%·T) + ({Math.round(w.honesty * 100)}%·H) + (
            {Math.round(w.clarity * 100)}%·Cl) + ({Math.round(w.creativity * 100)}%·Cr) + (
            {Math.round(w.speed * 100)}%·Sp) + BudgetMod + StakesMod]
          </span>
        </div>
      </div>

      {/* Live Benchmark & Modality Matrix Table */}
      <div className="rounded-xl border border-[#38BDF8]/40 bg-[#0B172A]/95 overflow-hidden">
        <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-[11px] tabular-nums">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[#1E3A5F] text-[#7DD3FC] bg-[#0F2138]">
                <th className="py-2 px-3 font-semibold">SPECIALIST &amp; LAB</th>
                <th className="py-2 px-2 font-semibold">LIC</th>
                <th className="py-2 px-2.5 font-semibold">MODALITIES</th>
                <th className="py-2 px-2 font-semibold text-right">AA</th>
                <th className="py-2 px-2 font-semibold text-right">$/TASK</th>
                <th className="py-2 px-2 font-semibold text-right">1ST TOK</th>
                <th className="py-2 px-2 font-semibold text-right">SCORE</th>
                <th className="py-2 px-3 font-semibold text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3A5F]/70">
              {displayedIds.map((id) => {
                const c = candidates.find((item) => item.id === id);
                if (!c) return null;
                const res = resultsById[id];
                const isSelected = id === selectedCandidateId;
                const lab = LAB_META[c.labId];
                const statusColor =
                  res.status === 'disqualified_modality'
                    ? 'text-[#F87171]'
                    : res.status === 'in_sync' || res.status === 'secondary_sync'
                    ? 'text-[#34D399]'
                    : res.status === 'stretch'
                    ? 'text-[#FBBF24]'
                    : res.status === 'overqualified'
                    ? 'text-[#94A3B8]'
                    : 'text-[#7DD3FC]';

                const modList = [
                  c.modalities.vision ? 'VIS' : null,
                  c.modalities.video ? 'VID' : null,
                  c.modalities.audio ? 'AUD' : null,
                  c.modalities.code ? 'COD' : null,
                  c.modalities.imageGen ? 'IMG' : null,
                  c.modalities.videoGen ? 'VGN' : null,
                ]
                  .filter(Boolean)
                  .join('·');

                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCandidate(c.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#173355] text-white' : 'hover:bg-[#10243D] text-[#CBD5E1]'
                    }`}
                  >
                    <td className="py-2 px-3 font-medium whitespace-nowrap">
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: lab.color === '#111827' ? '#94A3B8' : lab.color }}
                      />
                      <span className="text-[#E0F2FE]">{c.shortName}</span>
                      <span className="text-[#7DD3FC]/70 ml-1.5 text-[10px]">[{lab.shortName}]</span>
                    </td>
                    <td className="py-2 px-2 text-[10px] whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          c.license === 'open_weight'
                            ? 'bg-[#2E1065] text-[#DDD6FE]'
                            : 'bg-[#0F243E] text-[#94A3B8]'
                        }`}
                      >
                        {c.license === 'open_weight' ? 'OPEN' : 'API'}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-[10px] text-[#94A3B8] whitespace-nowrap">
                      {modList || 'TEXT'}
                    </td>
                    <td className="py-2 px-2 text-right font-semibold text-[#7DD3FC]">
                      {c.aaIndex}
                    </td>
                    <td className="py-2 px-2 text-right">${c.costPerTaskUsd.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right">{c.firstTokenSec}s</td>
                    <td className="py-2 px-2 text-right font-semibold">
                      {hasActiveTask ? res.finalScore.toFixed(1) : res.rawTraitScore.toFixed(0)}
                    </td>
                    <td className={`py-2 px-3 text-right font-semibold whitespace-nowrap ${statusColor}`}>
                      {res.statusLabel}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
