import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Building2,
  Coins,
  Layers,
  LockOpen,
  Search,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import {
  Candidate,
  CandidateMatchResult,
  FeeTier,
  LabId,
  ModalityKey,
  SpecialtyWingId,
} from '../types';
import {
  LAB_META,
  LabBrandPill,
  LabCrestIcon,
  MODALITY_ITEMS,
  WING_META,
} from './LabBadge';
import { PortraitSvg } from './AvatarSvg';

type GroupByAxis = 'wing' | 'lab' | 'tier';

interface RosterDirectoryProps {
  candidates: Candidate[];
  resultsById: Record<string, CandidateMatchResult>;
  hasActiveTask: boolean;
  selectedId: string;
  pinnedCandidateId: string | null;
  floorCastIds: string[];
  requiredModalities: ModalityKey[];
  specialtyWing: SpecialtyWingId;
  openWeightOnly: boolean;
  onSelectCandidate: (id: string) => void;
  onCastToFloor: (id: string) => void;
  onOpenBenchmarkHub: () => void;
}

const TIER_ORDER: Array<{
  key: string;
  label: string;
  description: string;
  match: (c: Candidate) => boolean;
}> = [
  {
    key: 'open_weight',
    label: 'Open-Weight & Self-Hostable (VPC / Local)',
    description: 'Downloadable weights from DeepSeek, Meta Llama 4, Alibaba Qwen, Mistral, Cohere & Black Forest Labs.',
    match: (c) => c.license === 'open_weight',
  },
  {
    key: 'tier_cents',
    label: '¢ Penny Sprinters (< $0.30 / task)',
    description: 'High-volume bulk triage, instant replies, and edge routing.',
    match: (c) => c.license !== 'open_weight' && c.feeTier === '¢',
  },
  {
    key: 'tier_single',
    label: '$ Workhorses ($0.30 – $1.05 / task)',
    description: 'Everyday clarity, RAG citations, voice dubbing, and dedicated image/video studios.',
    match: (c) => c.license !== 'open_weight' && c.feeTier === '$',
  },
  {
    key: 'tier_double',
    label: '$$ Mid-Tier Specialists ($1.06 – $2.10 / task)',
    description: 'Coding agents, long-video analysts, live voice, and cinema generation.',
    match: (c) => c.license !== 'open_weight' && c.feeTier === '$$',
  },
  {
    key: 'tier_exec',
    label: '$$$ – $$$$ Corner-Office Principals ($2.11+ / task)',
    description: 'Frontier reasoning, high-stakes legal redlines, and PhD-level scientific proofs.',
    match: (c) =>
      c.license !== 'open_weight' && (c.feeTier === '$$$' || c.feeTier === '$$$$'),
  },
];

const WING_ORDER: Array<Exclude<SpecialtyWingId, 'all'>> = [
  'reasoning_audit',
  'coding_agents',
  'multimodal_vision_video',
  'creative_media_gen',
  'voice_audio',
  'bulk_triage',
  'enterprise_rag',
];

const LAB_ORDER: LabId[] = [
  'anthropic',
  'google',
  'openai',
  'deepseek',
  'meta',
  'xai',
  'mistral',
  'qwen',
  'cohere',
  'amazon',
  'media_labs',
];

export const RosterDirectory: React.FC<RosterDirectoryProps> = ({
  candidates,
  resultsById,
  hasActiveTask,
  selectedId,
  pinnedCandidateId,
  floorCastIds,
  requiredModalities,
  specialtyWing,
  openWeightOnly,
  onSelectCandidate,
  onCastToFloor,
  onOpenBenchmarkHub,
}) => {
  const [groupBy, setGroupBy] = useState<GroupByAxis>('wing');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCandidates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return candidates.filter((c) => {
      if (specialtyWing !== 'all' && c.specialtyWing !== specialtyWing) return false;
      if (openWeightOnly && c.license !== 'open_weight') return false;
      if (q) {
        const hay = `${c.name} ${c.shortName} ${c.provider} ${c.codename} ${c.title} ${c.bestFor.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [candidates, specialtyWing, openWeightOnly, searchQuery]);

  const groups = useMemo(() => {
    const sortWithinGroup = (list: Candidate[]) =>
      [...list].sort((a, b) => {
        if (hasActiveTask) {
          const ra = resultsById[a.id];
          const rb = resultsById[b.id];
          const ta = ra?.status === 'disqualified_modality' ? 1 : 0;
          const tb = rb?.status === 'disqualified_modality' ? 1 : 0;
          if (ta !== tb) return ta - tb;
          return (rb?.finalScore ?? 0) - (ra?.finalScore ?? 0);
        }
        return b.aaIndex - a.aaIndex;
      });

    if (groupBy === 'wing') {
      return WING_ORDER.map((wingId) => {
        const items = sortWithinGroup(
          filteredCandidates.filter((c) => c.specialtyWing === wingId)
        );
        return {
          key: wingId,
          title: WING_META[wingId].label,
          subtitle: WING_META[wingId].description,
          labId: null as LabId | null,
          items,
        };
      }).filter((g) => g.items.length > 0);
    }

    if (groupBy === 'lab') {
      return LAB_ORDER.map((labId) => {
        const items = sortWithinGroup(
          filteredCandidates.filter((c) => c.labId === labId)
        );
        return {
          key: labId,
          title: LAB_META[labId].name,
          subtitle: `${items.length} major specialist${items.length === 1 ? '' : 's'} tracked across independent leaderboards.`,
          labId,
          items,
        };
      }).filter((g) => g.items.length > 0);
    }

    return TIER_ORDER.map((tier) => {
      const items = sortWithinGroup(filteredCandidates.filter(tier.match));
      return {
        key: tier.key,
        title: tier.label,
        subtitle: tier.description,
        labId: null as LabId | null,
        items,
      };
    }).filter((g) => g.items.length > 0);
  }, [filteredCandidates, groupBy, hasActiveTask, resultsById]);

  const formatSpread = (items: Candidate[]) => {
    const costs = items.map((c) => c.costPerTaskUsd);
    const min = Math.min(...costs);
    const max = Math.max(...costs);
    if (min === max) return `$${min.toFixed(2)}/task`;
    return `$${min.toFixed(2)} – $${max.toFixed(2)}/task`;
  };

  return (
    <div className="bg-[#FFFDF9] border-2 border-[#111827] rounded-2xl shadow-[5px_5px_0px_#111827] overflow-hidden">
      {/* Directory Header & 3-Axis Grouping Bar */}
      <div className="px-4 sm:px-5 sm:pr-14 py-3.5 bg-[#F4EFE6] border-b-2 border-[#111827] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-[#111827] text-white">
              Full Roster Directory
            </span>
            <span className="text-xs font-bold text-[#1F7A73]">
              Showing {filteredCandidates.length} of {candidates.length} Models · 11 Labs
            </span>
          </div>
          <p className="text-xs text-[#57534E] mt-0.5">
            Instead of cramming 42+ agents onto one map, browse every specialist grouped cleanly by work, company, or price—and cast any model onto the live 8-seat floor.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Group-By Switcher */}
          <div
            className="inline-flex rounded-xl border-2 border-[#111827] bg-white p-0.5"
            role="group"
            aria-label="Group models by"
          >
            {(
              [
                { id: 'wing', label: 'Kind of Work', icon: Layers },
                { id: 'lab', label: 'Company Lab', icon: Building2 },
                { id: 'tier', label: 'Price & License', icon: Coins },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon;
              const active = groupBy === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGroupBy(opt.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                    active
                      ? 'bg-[#111827] text-white'
                      : 'text-[#475569] hover:text-[#111827]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter model or lab..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border-2 border-[#111827] bg-white text-[#111827] placeholder:text-[#94A3B8] focus:outline-none w-44"
            />
          </div>
        </div>
      </div>

      {/* Grouped Roster Body */}
      <div className="p-4 sm:p-5 space-y-5 max-h-[680px] overflow-y-auto">
        {groups.length === 0 && (
          <div className="text-center py-12 text-sm text-[#57534E]">
            No specialists match your current search &amp; filter combination. Try clearing the search box or switching Department Wings.
          </div>
        )}

        {groups.map((group) => (
          <section key={group.key} className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b-2 border-[#111827]/12">
              <div className="flex items-center gap-2">
                {group.labId && (
                  <span
                    className="w-6 h-6 rounded-lg border border-[#111827] flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: LAB_META[group.labId].color }}
                  >
                    <LabCrestIcon labId={group.labId} className="w-3.5 h-3.5" />
                  </span>
                )}
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#111827] leading-tight">
                    {group.title}
                  </h3>
                  <p className="text-[11px] text-[#57534E]">{group.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold">
                <span className="px-2 py-0.5 rounded-md bg-[#F3ECE0] border border-[#111827]/20 text-[#111827]">
                  {group.items.length} model{group.items.length === 1 ? '' : 's'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#E6F4F1] border border-[#1F7A73]/30 text-[#115E59] tabular-nums">
                  {formatSpread(group.items)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.items.map((c) => {
                const res = resultsById[c.id];
                const isSelected = selectedId === c.id;
                const isOnFloor = floorCastIds.includes(c.id);
                const isPinned = pinnedCandidateId === c.id;
                const isDisq = hasActiveTask && res?.status === 'disqualified_modality';
                const isWin = hasActiveTask && res?.status === 'in_sync';

                return (
                  <div
                    key={c.id}
                    onClick={() => onSelectCandidate(c.id)}
                    className={`rounded-xl border-2 p-3 cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-[#FFFDF9] border-[#E85D4A] shadow-[4px_4px_0px_#E85D4A]'
                        : isWin
                        ? 'bg-[#ECFDF5] border-[#1F7A73] shadow-[3px_3px_0px_#1F7A73]'
                        : isDisq
                        ? 'bg-[#F8F5F0] border-[#111827]/25 opacity-70 hover:opacity-100'
                        : 'bg-[#FFFDF9] border-[#111827]/75 hover:border-[#111827] hover:shadow-[3px_3px_0px_#111827]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-12 h-12 rounded-lg border-2 border-[#111827] overflow-hidden bg-[#F4EFE6] shrink-0">
                        <PortraitSvg candidate={c} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <LabBrandPill labId={c.labId} size="sm" />
                            {c.license === 'open_weight' && (
                              <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded border border-[#111827] bg-[#EDE9FE] text-[#5B21B6]">
                                <LockOpen className="w-2.5 h-2.5" />
                                Open
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-extrabold tabular-nums text-[#111827] bg-[#F3ECE0] border border-[#111827]/25 px-1.5 py-0.5 rounded">
                            ${c.costPerTaskUsd.toFixed(2)} · {c.feeTier}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <h4 className="font-serif text-base font-bold text-[#111827] leading-tight">
                            {c.name}
                          </h4>
                          {isWin && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#1F7A73] text-white">
                              #1 WINNER
                            </span>
                          )}
                          {isDisq && res && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#DC2626] text-white">
                              {res.statusLabel}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#57534E] leading-snug mt-0.5">
                          {c.title} · <span className="font-semibold text-[#111827]">{c.contextWindow}</span>
                        </p>
                      </div>
                    </div>

                    {/* Modality pips + Benchmark quick line */}
                    <div className="flex items-center justify-between gap-2 flex-wrap pt-1.5 border-t border-[#111827]/10">
                      <div className="flex items-center gap-1 flex-wrap">
                        {MODALITY_ITEMS.map((m) => {
                          const has = c.modalities[m.key];
                          const req = requiredModalities.includes(m.key);
                          if (!has && !req) return null;
                          return (
                            <span
                              key={m.key}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                req && !has
                                  ? 'bg-[#FEE2E2] border-[#DC2626] text-[#991B1B]'
                                  : req && has
                                  ? 'bg-[#1F7A73] border-[#111827] text-white'
                                  : 'bg-[#F3ECE0] border-[#111827]/20 text-[#334155]'
                              }`}
                            >
                              {m.pip}
                            </span>
                          );
                        })}
                        <span className="text-[10px] font-semibold text-[#64748B] ml-1 tabular-nums">
                          AA {c.aaIndex} · {c.firstTokenSec}s
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCastToFloor(c.id);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 text-[10.5px] font-bold cursor-pointer transition-colors ${
                          isPinned
                            ? 'bg-[#E85D4A] border-[#111827] text-white'
                            : isOnFloor
                            ? 'bg-[#E6F4F1] border-[#1F7A73] text-[#115E59] hover:bg-[#1F7A73] hover:text-white'
                            : 'bg-[#111827] border-[#111827] text-white hover:bg-[#E85D4A]'
                        }`}
                      >
                        {isOnFloor ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>On Floor → View</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            <span>Cast to Floor</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Footer Credibility Bar */}
      <div className="px-5 py-2.5 bg-[#F4EFE6] border-t border-[#111827]/15 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#57534E]">
        <span>
          Click any card to open its full Dossier on the right, or click <strong>Cast to Floor</strong> to pull that model into the live 8-seat studio.
        </span>
        <button
          type="button"
          onClick={onOpenBenchmarkHub}
          className="inline-flex items-center gap-1 font-bold text-[#1F7A73] hover:text-[#111827] cursor-pointer"
        >
          <span>Inspect 8 Verification Leaderboards</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
