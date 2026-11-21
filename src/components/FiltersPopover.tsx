import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LockOpen, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import {
  BudgetLevel,
  ModalityKey,
  SpecialtyWingId,
  StakesLevel,
} from '../types';
import { MODALITY_ITEMS, WING_META } from './LabBadge';

interface FiltersPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  budget: BudgetLevel;
  stakes: StakesLevel;
  selectedModalities: ModalityKey[];
  detectedModalities: ModalityKey[];
  specialtyWing: SpecialtyWingId;
  openWeightOnly: boolean;
  isBlueprint: boolean;
  activeFilterCount: number;
  onChangeBudget: (b: BudgetLevel) => void;
  onChangeStakes: (s: StakesLevel) => void;
  onToggleModality: (m: ModalityKey) => void;
  onChangeWing: (w: SpecialtyWingId) => void;
  onToggleOpenWeight: () => void;
  onResetAll: () => void;
}

const VALID_WINGS: SpecialtyWingId[] = [
  'all',
  'reasoning_audit',
  'coding_agents',
  'multimodal_vision_video',
  'creative_media_gen',
  'voice_audio',
  'bulk_triage',
  'enterprise_rag',
];

export const FiltersPopover: React.FC<FiltersPopoverProps> = ({
  isOpen,
  onClose,
  anchorRef,
  budget,
  stakes,
  selectedModalities,
  detectedModalities,
  specialtyWing,
  openWeightOnly,
  isBlueprint,
  activeFilterCount,
  onChangeBudget,
  onChangeStakes,
  onToggleModality,
  onChangeWing,
  onToggleOpenWeight,
  onResetAll,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        (!anchorRef.current || !anchorRef.current.contains(target))
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, anchorRef]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label="Optional task filters"
          className={`absolute right-0 mt-2 w-[min(92vw,460px)] rounded-2xl border-[1.5px] shadow-2xl z-40 overflow-hidden ${
            isBlueprint
              ? 'bg-[#0F1E34] border-[#38BDF8] text-[#E2E8F0]'
              : 'bg-[#FFFDF9] border-[#111827] text-[#111827] shadow-[5px_5px_0px_rgba(17,24,39,0.16)]'
          }`}
        >
          {/* Header */}
          <div
            className={`px-4 py-3 border-b flex items-center justify-between gap-2 ${
              isBlueprint
                ? 'bg-[#132945] border-[#1E3A5F]'
                : 'bg-[#F5EFE6] border-[#111827]/15'
            }`}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal
                className={`w-4 h-4 ${isBlueprint ? 'text-[#38BDF8]' : 'text-[#1F7A73]'}`}
              />
              <span className="font-serif text-base font-bold">Optional Studio Filters</span>
            </div>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={onResetAll}
                  className={`inline-flex items-center gap-1 text-xs font-bold cursor-pointer transition-colors ${
                    isBlueprint
                      ? 'text-[#7DD3FC] hover:text-white'
                      : 'text-[#E85D4A] hover:text-[#111827]'
                  }`}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className={`p-1 rounded-lg cursor-pointer transition-colors ${
                  isBlueprint
                    ? 'text-[#94A3B8] hover:text-white hover:bg-[#1E3A5F]'
                    : 'text-[#64748B] hover:text-[#111827] hover:bg-[#E7DFD1]'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Row 1: Budget & Stakes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
                  Budget Priority
                </label>
                <div
                  role="group"
                  aria-label="Budget level"
                  className={`grid grid-cols-3 rounded-xl border-[1.5px] overflow-hidden ${
                    isBlueprint
                      ? 'border-[#38BDF8]/60 bg-[#0B172A]'
                      : 'border-[#111827] bg-[#FAF5EC]'
                  }`}
                >
                  {(
                    [
                      { id: 'economical', label: 'Save $' },
                      { id: 'balanced', label: 'Balanced' },
                      { id: 'max', label: 'Max' },
                    ] as const
                  ).map((opt, idx) => {
                    const active = budget === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChangeBudget(opt.id)}
                        className={`py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          idx > 0
                            ? isBlueprint
                              ? 'border-l border-[#38BDF8]/35'
                              : 'border-l border-[#111827]/20'
                            : ''
                        } ${
                          active
                            ? isBlueprint
                              ? 'bg-[#0284C7] text-white'
                              : 'bg-[#1F7A73] text-white'
                            : isBlueprint
                            ? 'text-[#94A3B8] hover:text-white'
                            : 'text-[#334155] hover:bg-[#EFE8DC]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
                  How Important Is Accuracy?
                </label>
                <div
                  role="group"
                  aria-label="Task stakes"
                  className={`grid grid-cols-2 rounded-xl border-[1.5px] overflow-hidden ${
                    isBlueprint
                      ? 'border-[#38BDF8]/60 bg-[#0B172A]'
                      : 'border-[#111827] bg-[#FAF5EC]'
                  }`}
                >
                  {(
                    [
                      { id: 'double_check', label: 'Draft / Check' },
                      { id: 'right_first_try', label: 'Right 1st Try' },
                    ] as const
                  ).map((opt, idx) => {
                    const active = stakes === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChangeStakes(opt.id)}
                        className={`py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          idx > 0
                            ? isBlueprint
                              ? 'border-l border-[#38BDF8]/35'
                              : 'border-l border-[#111827]/20'
                            : ''
                        } ${
                          active
                            ? isBlueprint
                              ? 'bg-[#0284C7] text-white'
                              : 'bg-[#1F7A73] text-white'
                            : isBlueprint
                            ? 'text-[#94A3B8] hover:text-white'
                            : 'text-[#334155] hover:bg-[#EFE8DC]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 2: 6 Native Modalities */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                  Needs Native Media / Tools
                </span>
                <span className="text-[10.5px] opacity-60">Auto-detected from your task too</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {MODALITY_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isManual = selectedModalities.includes(item.key);
                  const isAuto = !isManual && detectedModalities.includes(item.key);
                  const active = isManual || isAuto;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onToggleModality(item.key)}
                      className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? isBlueprint
                            ? 'bg-[#0C4A6E] border-[#38BDF8] text-[#E0F2FE]'
                            : 'bg-[#111827] border-[#111827] text-[#FAF5EC]'
                          : isBlueprint
                          ? 'bg-[#0B172A] border-[#1E3A5F] text-[#94A3B8] hover:border-[#38BDF8] hover:text-white'
                          : 'bg-[#FAF5EC] border-[#111827]/20 text-[#334155] hover:border-[#111827]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.short}</span>
                      {isAuto && <span className="text-[9px] font-mono opacity-75">(auto)</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Department Wing */}
            <div className="space-y-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
                Department Wing (42 Specialists)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {VALID_WINGS.map((wingId) => {
                  const active = specialtyWing === wingId;
                  return (
                    <button
                      key={wingId}
                      type="button"
                      onClick={() => onChangeWing(wingId)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? isBlueprint
                            ? 'bg-[#0284C7] border-[#7DD3FC] text-white'
                            : 'bg-[#111827] border-[#111827] text-[#FAF5EC]'
                          : isBlueprint
                          ? 'bg-[#0B172A] border-[#1E3A5F] text-[#94A3B8] hover:border-[#38BDF8] hover:text-white'
                          : 'bg-[#FAF5EC] border-[#111827]/20 text-[#334155] hover:border-[#111827]'
                      }`}
                    >
                      {WING_META[wingId].shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 4: Open-Weight Toggle */}
            <div
              className={`rounded-xl border p-3 flex items-center justify-between gap-3 ${
                isBlueprint
                  ? 'bg-[#0B172A] border-[#1E3A5F]'
                  : 'bg-[#FAF5EC] border-[#111827]/15'
              }`}
            >
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <LockOpen className="w-3.5 h-3.5 text-[#6D28D9]" />
                  <span>Open-Weight Models Only</span>
                </div>
                <p className="text-[11px] opacity-75 mt-0.5">
                  Show only downloadable models you can self-host (DeepSeek, Llama 4, Qwen, Mistral).
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={openWeightOnly}
                onClick={onToggleOpenWeight}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-[1.5px] transition-colors cursor-pointer ${
                  openWeightOnly
                    ? 'bg-[#6D28D9] border-[#111827]'
                    : isBlueprint
                    ? 'bg-[#1E3A5F] border-[#38BDF8]/50'
                    : 'bg-[#E2DDD3] border-[#111827]/40'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform ${
                    openWeightOnly ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
