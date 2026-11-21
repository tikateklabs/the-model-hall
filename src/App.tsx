import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronDown,
  Mail,
  Search,
  SlidersHorizontal,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import rolesRaw from './data/roles.json';
import { ALL_CANDIDATES } from './data/roster';
import { evaluateHall } from './engine/matcher';
import {
  BenchmarkSourceId,
  BudgetLevel,
  ModalityKey,
  RoleDefinition,
  SpecialtyWingId,
  StakesLevel,
  ViewMode,
} from './types';
import { ReceptionDesk } from './components/ReceptionDesk';
import { IsometricHall } from './components/IsometricHall';
import { ResumeCard } from './components/ResumeCard';
import { BlueprintOverlay } from './components/BlueprintOverlay';
import { TrialShiftModal } from './components/TrialShiftModal';
import { WhyTheyWonCard } from './components/WhyTheyWonCard';
import { LaunchDispatchModal } from './components/LaunchDispatchModal';
import { BenchmarkHubModal } from './components/BenchmarkHubModal';
import { RosterDirectory } from './components/RosterDirectory';
import { FiltersPopover } from './components/FiltersPopover';
import { ShareCardModal } from './components/ShareCardModal';
import { WING_META } from './components/LabBadge';
import { playCrewLockSound, playFilterClickSound } from './utils/soundFx';

const CANDIDATES = ALL_CANDIDATES;
const ROLES = rolesRaw as RoleDefinition[];
const VALID_MODALITIES: ModalityKey[] = [
  'vision',
  'video',
  'audio',
  'code',
  'imageGen',
  'videoGen',
];
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

function parseInitialStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const roleParam = params.get('role');
  const taskParam = params.get('task') ?? '';
  const budgetParam = params.get('budget');
  const stakesParam = params.get('stakes');
  const selectedParam = params.get('selected');
  const modParam = params.get('mod') ?? '';
  const wingParam = params.get('wing');
  const openParam = params.get('open');
  const viewParam = params.get('view');

  const validRole = ROLES.some((r) => r.id === roleParam) ? (roleParam as string) : 'engineer';
  const validBudget: BudgetLevel =
    budgetParam === 'economical' || budgetParam === 'balanced' || budgetParam === 'max'
      ? budgetParam
      : 'balanced';
  const validStakes: StakesLevel =
    stakesParam === 'double_check' || stakesParam === 'right_first_try'
      ? stakesParam
      : 'right_first_try';
  const validSelected = CANDIDATES.some((c) => c.id === selectedParam)
    ? (selectedParam as string)
    : 'gpt-6-2-sol';
  const validModalities = modParam
    .split(',')
    .filter((m): m is ModalityKey => VALID_MODALITIES.includes(m as ModalityKey));
  const validWing: SpecialtyWingId = VALID_WINGS.includes(wingParam as SpecialtyWingId)
    ? (wingParam as SpecialtyWingId)
    : 'all';
  const openWeightOnly = openParam === '1' || openParam === 'true';
  const validView: ViewMode = viewParam === 'blueprint' ? 'blueprint' : 'normal';
  const openRosterInitially = viewParam === 'directory';

  const startInHall =
    taskParam.trim().length > 0 ||
    validModalities.length > 0 ||
    validWing !== 'all' ||
    openWeightOnly ||
    validView !== 'normal' ||
    openRosterInitially;

  return {
    startInHall,
    roleId: validRole,
    task: taskParam,
    budget: validBudget,
    stakes: validStakes,
    selectedCandidateId: validSelected,
    selectedModalities: validModalities,
    specialtyWing: validWing,
    openWeightOnly,
    viewMode: validView,
    openRosterInitially,
  };
}

export default function App() {
  const initial = useMemo(() => parseInitialStateFromUrl(), []);

  const [screen, setScreen] = useState<'reception' | 'hall'>(
    initial.startInHall ? 'hall' : 'reception'
  );
  const [roleId, setRoleId] = useState<string>(initial.roleId);
  const [taskInput, setTaskInput] = useState<string>(initial.task);
  const [debouncedTask, setDebouncedTask] = useState<string>(initial.task);
  const [selectedModalities, setSelectedModalities] = useState<ModalityKey[]>(
    initial.selectedModalities
  );
  const [specialtyWing, setSpecialtyWing] = useState<SpecialtyWingId>(initial.specialtyWing);
  const [openWeightOnly, setOpenWeightOnly] = useState<boolean>(initial.openWeightOnly);
  const [pinnedCandidateId, setPinnedCandidateId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [budget, setBudget] = useState<BudgetLevel>(initial.budget);
  const [stakes, setStakes] = useState<StakesLevel>(initial.stakes);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    initial.selectedCandidateId
  );
  const [viewMode, setViewMode] = useState<ViewMode>(initial.viewMode);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [roleMenuOpen, setRoleMenuOpen] = useState<boolean>(false);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [rosterModalOpen, setRosterModalOpen] = useState<boolean>(initial.openRosterInitially);
  const [shareCardOpen, setShareCardOpen] = useState<boolean>(false);
  const [trialShiftOpen, setTrialShiftOpen] = useState<boolean>(false);
  const [newsletterOpen, setNewsletterOpen] = useState<boolean>(false);
  const [benchmarkHubState, setBenchmarkHubState] = useState<{
    open: boolean;
    highlightId: BenchmarkSourceId | null;
  }>({ open: false, highlightId: null });
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const filterAnchorRef = useRef<HTMLDivElement>(null);
  const userManuallySelectedRef = useRef<boolean>(false);
  const prevWinnerRef = useRef<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close Roster Modal on Escape
  useEffect(() => {
    if (!rosterModalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setRosterModalOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [rosterModalOpen]);

  useEffect(() => {
    if (taskInput === debouncedTask) {
      setIsListening(false);
      return;
    }

    if (taskInput.trim().length > 0) {
      setIsListening(true);
    }

    const timer = window.setTimeout(() => {
      setDebouncedTask(taskInput);
      setIsListening(false);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [taskInput, debouncedTask]);

  const evaluation = useMemo(
    () =>
      evaluateHall(
        CANDIDATES,
        debouncedTask,
        budget,
        stakes,
        selectedModalities,
        specialtyWing,
        openWeightOnly,
        pinnedCandidateId
      ),
    [
      debouncedTask,
      budget,
      stakes,
      selectedModalities,
      specialtyWing,
      openWeightOnly,
      pinnedCandidateId,
    ]
  );

  // Auto-focus Resume Card onto #1 winner & trigger subtle stamp sound
  useEffect(() => {
    if (evaluation.hasActiveTask && evaluation.winnerId && !userManuallySelectedRef.current) {
      setSelectedCandidateId(evaluation.winnerId);
    }
    if (
      screen === 'hall' &&
      evaluation.hasActiveTask &&
      evaluation.winnerId &&
      evaluation.winnerId !== prevWinnerRef.current
    ) {
      playCrewLockSound(soundEnabled);
    }
    prevWinnerRef.current = evaluation.winnerId;
  }, [screen, evaluation.hasActiveTask, evaluation.winnerId, soundEnabled]);

  useEffect(() => {
    userManuallySelectedRef.current = false;
  }, [debouncedTask, budget, stakes, selectedModalities, specialtyWing, openWeightOnly]);

  // Sync URL query parameters (100% GitHub Pages safe)
  useEffect(() => {
    if (screen !== 'hall') return;
    const params = new URLSearchParams();
    params.set('role', roleId);
    if (debouncedTask.trim()) params.set('task', debouncedTask.trim());
    if (selectedModalities.length > 0) params.set('mod', selectedModalities.join(','));
    if (specialtyWing !== 'all') params.set('wing', specialtyWing);
    if (openWeightOnly) params.set('open', '1');
    if (viewMode !== 'normal') params.set('view', viewMode);
    params.set('budget', budget);
    params.set('stakes', stakes);
    params.set('selected', selectedCandidateId);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [
    screen,
    roleId,
    debouncedTask,
    selectedModalities,
    specialtyWing,
    openWeightOnly,
    viewMode,
    budget,
    stakes,
    selectedCandidateId,
  ]);

  const activeRole = useMemo(
    () => ROLES.find((r) => r.id === roleId) ?? ROLES[0],
    [roleId]
  );

  const selectedCandidate = useMemo(
    () => CANDIDATES.find((c) => c.id === selectedCandidateId) ?? CANDIDATES[3],
    [selectedCandidateId]
  );

  const selectedMatchResult = evaluation.resultsById[selectedCandidate.id];
  const isBlueprint = viewMode === 'blueprint';
  const floorCastIds = useMemo(
    () => evaluation.floorCast.map((s) => s.candidate.id),
    [evaluation.floorCast]
  );

  const activeFilterCount =
    (budget !== 'balanced' ? 1 : 0) +
    (stakes !== 'right_first_try' ? 1 : 0) +
    selectedModalities.length +
    (specialtyWing !== 'all' ? 1 : 0) +
    (openWeightOnly ? 1 : 0);

  const openBenchmarkHub = (sourceId?: BenchmarkSourceId) => {
    setBenchmarkHubState({ open: true, highlightId: sourceId ?? null });
  };

  const handleResetFilters = () => {
    playFilterClickSound(soundEnabled);
    setBudget('balanced');
    setStakes('right_first_try');
    setSelectedModalities([]);
    setSpecialtyWing('all');
    setOpenWeightOnly(false);
    setPinnedCandidateId(null);
  };

  const handleSelectRoleFromReception = (pickedRoleId: string) => {
    playFilterClickSound(soundEnabled);
    setRoleId(pickedRoleId);
    setTaskInput('');
    setDebouncedTask('');
    setSelectedModalities([]);
    setSpecialtyWing('all');
    setOpenWeightOnly(false);
    setScreen('hall');
  };

  const handleSkipToHall = () => {
    playFilterClickSound(soundEnabled);
    setTaskInput('');
    setDebouncedTask('');
    setSelectedModalities([]);
    setScreen('hall');
  };

  const handleChipClick = (chipText: string) => {
    playFilterClickSound(soundEnabled);
    userManuallySelectedRef.current = false;
    setTaskInput(chipText);
    setDebouncedTask(chipText);
    setIsListening(false);
  };

  const handleToggleModality = (mod: ModalityKey) => {
    playFilterClickSound(soundEnabled);
    userManuallySelectedRef.current = false;
    setSelectedModalities((prev) =>
      prev.includes(mod) ? prev.filter((item) => item !== mod) : [...prev, mod]
    );
  };

  const handleManualSelectCandidate = (candidateId: string) => {
    playFilterClickSound(soundEnabled);
    userManuallySelectedRef.current = true;
    setSelectedCandidateId(candidateId);
  };

  const handleCastToFloor = (candidateId: string) => {
    playCrewLockSound(soundEnabled);
    userManuallySelectedRef.current = true;
    setPinnedCandidateId(candidateId);
    setSelectedCandidateId(candidateId);
    setRosterModalOpen(false);
  };

  const handleCopyLink = async () => {
    const params = new URLSearchParams();
    params.set('role', roleId);
    if (taskInput.trim()) params.set('task', taskInput.trim());
    if (selectedModalities.length > 0) params.set('mod', selectedModalities.join(','));
    if (specialtyWing !== 'all') params.set('wing', specialtyWing);
    if (openWeightOnly) params.set('open', '1');
    if (viewMode !== 'normal') params.set('view', viewMode);
    params.set('budget', budget);
    params.set('stakes', stakes);
    params.set('selected', selectedCandidateId);

    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 2400);
  };

  if (screen === 'reception') {
    return (
      <>
        <ReceptionDesk
          roles={ROLES}
          totalModelsCount={CANDIDATES.length}
          onSelectRole={handleSelectRoleFromReception}
          onSkipToHall={handleSkipToHall}
          onOpenNewsletter={() => setNewsletterOpen(true)}
        />
        <LaunchDispatchModal
          isOpen={newsletterOpen}
          onClose={() => setNewsletterOpen(false)}
          candidates={CANDIDATES}
          viewMode="normal"
          onInspectCandidate={(id) => {
            setPinnedCandidateId(id);
            setSelectedCandidateId(id);
            setScreen('hall');
          }}
        />
      </>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex flex-col ${
        isBlueprint ? 'bg-[#0B1526] text-[#E2E8F0]' : 'bg-[#FAF5EC] text-[#111827]'
      }`}
    >
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-6 flex-1">
        {/* ===================== CALM MINIMAL HEADER ===================== */}
        <header
          className={`flex items-center justify-between gap-3 py-3.5 border-b-[1.5px] transition-colors flex-wrap ${
            isBlueprint ? 'border-[#1E3A5F]' : 'border-[#111827]'
          }`}
        >
          {/* Left: Brand Title + Role Switcher Dropdown */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => setScreen('reception')}
              title="Back to Reception Desk"
              className={`font-serif text-2xl sm:text-[26px] font-bold tracking-tight whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                isBlueprint
                  ? 'text-[#F8FAFC] hover:text-[#7DD3FC]'
                  : 'text-[#111827] hover:text-[#E85D4A]'
              }`}
            >
              The Model Hall
            </button>

            <div className="relative" ref={roleMenuRef}>
              <button
                type="button"
                onClick={() => setRoleMenuOpen((open) => !open)}
                aria-expanded={roleMenuOpen}
                aria-haspopup="listbox"
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-[1.5px] text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isBlueprint
                    ? 'bg-[#112036] border-[#38BDF8]/70 text-[#E0F2FE] hover:bg-[#1A3354]'
                    : 'bg-[#FFFDF9] border-[#111827] text-[#111827] hover:bg-[#EFE8DC]'
                }`}
              >
                <span>Role: {activeRole.shortLabel}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    roleMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {roleMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    role="listbox"
                    className={`absolute left-0 mt-2 w-64 rounded-xl border-[1.5px] shadow-xl z-40 overflow-hidden ${
                      isBlueprint
                        ? 'bg-[#112036] border-[#38BDF8] text-[#E2E8F0]'
                        : 'bg-[#FFFDF9] border-[#111827] text-[#111827]'
                    }`}
                  >
                    {ROLES.map((role) => {
                      const active = role.id === roleId;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => {
                            playFilterClickSound(soundEnabled);
                            setRoleId(role.id);
                            setRoleMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex flex-col cursor-pointer ${
                            active
                              ? isBlueprint
                                ? 'bg-[#1E3A5F] text-[#7DD3FC] font-semibold'
                                : 'bg-[#E5F2EE] text-[#111827] font-semibold'
                              : isBlueprint
                              ? 'hover:bg-[#172B47]'
                              : 'hover:bg-[#F5EFE6]'
                          }`}
                        >
                          <span>{role.label}</span>
                          <span
                            className={`text-[11px] font-normal truncate ${
                              isBlueprint ? 'text-[#94A3B8]' : 'text-[#64748B]'
                            }`}
                          >
                            {role.tagline}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: 2-Option View Toggle + Free Friday Newsletter + Mute */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div
              role="group"
              aria-label="Studio Display Mode"
              className={`inline-flex items-center p-0.5 rounded-full border-[1.5px] ${
                isBlueprint
                  ? 'bg-[#0F1E33] border-[#38BDF8]/70'
                  : 'bg-[#EFE8DC] border-[#111827]'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  playFilterClickSound(soundEnabled);
                  setViewMode('normal');
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  !isBlueprint
                    ? 'bg-[#111827] text-[#FAF5EC]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Normal View
              </button>
              <button
                type="button"
                onClick={() => {
                  playFilterClickSound(soundEnabled);
                  setViewMode('blueprint');
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isBlueprint
                    ? 'bg-[#38BDF8] text-[#0B1526] font-bold'
                    : 'text-[#475569] hover:text-[#111827]'
                }`}
              >
                Blueprint View
              </button>
            </div>

            <button
              type="button"
              onClick={() => setNewsletterOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-[1.5px] text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                isBlueprint
                  ? 'bg-[#162C4A] border-[#38BDF8] text-[#7DD3FC] hover:bg-[#1E3A5F]'
                  : 'bg-[#FFFDF9] border-[#111827] text-[#111827] hover:bg-[#E85D4A] hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Friday Newsletter (Free)</span>
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
              title={soundEnabled ? 'Mute tactile SFX' : 'Enable tactile SFX'}
              className={`p-1.5 rounded-full border-[1.5px] transition-colors cursor-pointer ${
                isBlueprint
                  ? 'border-[#1E3A5F] text-[#94A3B8] hover:text-white hover:border-[#38BDF8]'
                  : 'border-[#111827]/25 text-[#475569] hover:text-[#111827] hover:border-[#111827]'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* ===================== ULTRA-MINIMAL 2-LINE FRONT DESK ===================== */}
        <section className="py-3.5 space-y-2.5">
          {/* Line 1: Plain-English Task Bar + Single Optional Filters Popover Button */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 max-w-2xl">
              <Search
                className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isBlueprint ? 'text-[#7DD3FC]' : 'text-[#64748B]'
                }`}
              />
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="What do you need help with today? (try 'review a lease', 'debug Python', 'generate video'...)"
                aria-label="What do you need help with today?"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border-[1.5px] text-sm transition-colors focus:outline-none focus:ring-2 ${
                  isBlueprint
                    ? 'bg-[#112036] border-[#38BDF8]/70 text-[#F8FAFC] placeholder:text-[#64748B] focus:ring-[#38BDF8]/40'
                    : 'bg-[#FFFDF9] border-[#111827] text-[#111827] placeholder:text-[#64748B] focus:ring-[#1F7A73]/50'
                }`}
              />
              {taskInput.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setTaskInput('');
                    setDebouncedTask('');
                    setIsListening(false);
                  }}
                  aria-label="Clear task"
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors cursor-pointer ${
                    isBlueprint
                      ? 'text-[#94A3B8] hover:text-white hover:bg-[#1E3A5F]'
                      : 'text-[#64748B] hover:text-[#111827] hover:bg-[#F2EBE0]'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Single Anchored Optional Filters Button */}
            <div className="relative shrink-0" ref={filterAnchorRef}>
              <button
                type="button"
                onClick={() => {
                  playFilterClickSound(soundEnabled);
                  setFiltersOpen((prev) => !prev);
                }}
                aria-expanded={filtersOpen}
                aria-haspopup="dialog"
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-[1.5px] text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filtersOpen || activeFilterCount > 0
                    ? isBlueprint
                      ? 'bg-[#163455] border-[#38BDF8] text-[#E0F2FE]'
                      : 'bg-[#111827] border-[#111827] text-[#FAF5EC]'
                    : isBlueprint
                    ? 'bg-[#112036] border-[#38BDF8]/60 text-[#CBD5E1] hover:border-[#38BDF8]'
                    : 'bg-[#FFFDF9] border-[#111827] text-[#111827] hover:bg-[#EFE8DC]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#E85D4A] text-white text-[10px] font-extrabold tabular-nums">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <FiltersPopover
                isOpen={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                anchorRef={filterAnchorRef}
                budget={budget}
                stakes={stakes}
                selectedModalities={selectedModalities}
                detectedModalities={evaluation.taskProfile.detectedModalities}
                specialtyWing={specialtyWing}
                openWeightOnly={openWeightOnly}
                isBlueprint={isBlueprint}
                activeFilterCount={activeFilterCount}
                onChangeBudget={(b) => {
                  playFilterClickSound(soundEnabled);
                  setBudget(b);
                }}
                onChangeStakes={(s) => {
                  playFilterClickSound(soundEnabled);
                  setStakes(s);
                }}
                onToggleModality={handleToggleModality}
                onChangeWing={(w) => {
                  playFilterClickSound(soundEnabled);
                  setSpecialtyWing(w);
                }}
                onToggleOpenWeight={() => {
                  playFilterClickSound(soundEnabled);
                  setOpenWeightOnly((prev) => !prev);
                }}
                onResetAll={handleResetFilters}
              />
            </div>

            {/* Quiet Weekly Cadence Cue on Wide Screens */}
            <div
              className={`hidden xl:flex items-center gap-1.5 ml-auto text-xs font-medium whitespace-nowrap ${
                isBlueprint ? 'text-[#7DD3FC]/80' : 'text-[#64748B]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A73]" />
              <span>Refreshed every Friday · Always Free</span>
            </div>
          </div>

          {/* Line 2: 4 Role-Tailored Starter Chips (+ tiny Reset pill ONLY if filters customized) */}
          <div className="flex items-center gap-2 flex-wrap">
            {activeRole.starterChips.map((chip) => {
              const isSelectedChip = taskInput.trim().toLowerCase() === chip.toLowerCase();
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                    isSelectedChip
                      ? isBlueprint
                        ? 'bg-[#38BDF8] border-[#7DD3FC] text-[#0B1526] font-bold'
                        : 'bg-[#E85D4A] border-[#111827] text-white font-semibold'
                      : isBlueprint
                      ? 'bg-[#112036] border-[#1E3A5F] text-[#CBD5E1] hover:border-[#38BDF8] hover:text-white'
                      : 'bg-[#EFE8DC] border-[#111827]/18 text-[#111827] hover:border-[#111827] hover:bg-[#E6DDD0]'
                  }`}
                >
                  {chip}
                </button>
              );
            })}

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className={`ml-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer transition-colors ${
                  isBlueprint
                    ? 'bg-[#163455] border-[#38BDF8]/60 text-[#7DD3FC] hover:text-white'
                    : 'bg-[#FDF1E8] border-[#E85D4A]/50 text-[#C2412D] hover:bg-[#E85D4A] hover:text-white'
                }`}
              >
                <span>
                  {specialtyWing !== 'all' ? `${WING_META[specialtyWing].shortLabel} · ` : ''}
                  {openWeightOnly ? 'Open-Weight · ' : ''}
                  Reset {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'}
                </span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </section>

        {/* ===================== MAIN TWO-COLUMN STUDIO WORKSPACE ===================== */}
        <main className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_375px] xl:grid-cols-[minmax(0,1fr)_395px] gap-6 items-start">
          {/* Left/Center Stage */}
          <div className="space-y-4 min-w-0">
            <AnimatePresence>
              {isBlueprint && (
                <BlueprintOverlay
                  candidates={CANDIDATES}
                  evaluation={evaluation}
                  selectedCandidateId={selectedCandidate.id}
                  budget={budget}
                  stakes={stakes}
                  onSelectCandidate={handleManualSelectCandidate}
                />
              )}
            </AnimatePresence>

            <IsometricHall
              evaluation={evaluation}
              selectedCandidateId={selectedCandidate.id}
              isListening={isListening}
              viewMode={viewMode}
              specialtyWing={specialtyWing}
              openWeightOnly={openWeightOnly}
              onSelectCandidate={handleManualSelectCandidate}
            />

            {/* 3-Second "Build Your Intuition" Strip (Shown when a task is active) */}
            <WhyTheyWonCard
              evaluation={evaluation}
              candidates={CANDIDATES}
              viewMode={viewMode}
              onInspectCandidate={handleManualSelectCandidate}
              onOpenBenchmarkHub={openBenchmarkHub}
              onOpenShareCard={() => setShareCardOpen(true)}
            />

            {/* Smart 2-Person Team Split Banner */}
            <div
              className={`rounded-xl border-[1.5px] px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                isBlueprint
                  ? 'bg-[#0F2740] border-[#38BDF8]/70 text-[#E0F2FE]'
                  : 'bg-[#DCECE7] border-[#111827] text-[#111827]'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    isBlueprint
                      ? 'bg-[#163B5E] border-[#38BDF8] text-[#7DD3FC]'
                      : 'bg-[#FFFDF9] border-[#111827]/35 text-[#1F7A73]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-xs sm:text-sm leading-snug">
                  <strong className="font-serif text-sm sm:text-[15px] font-bold">
                    Smart 2-Model Habit:
                  </strong>{' '}
                  Let{' '}
                  <button
                    type="button"
                    onClick={() => handleManualSelectCandidate(evaluation.teamSplit.associate.id)}
                    className="underline decoration-current/50 underline-offset-2 font-bold hover:opacity-80 cursor-pointer"
                  >
                    {evaluation.teamSplit.associate.shortName}
                  </button>{' '}
                  handle the {evaluation.teamSplit.associateSharePct}% first pass +{' '}
                  <button
                    type="button"
                    onClick={() => handleManualSelectCandidate(evaluation.teamSplit.principal.id)}
                    className="underline decoration-current/50 underline-offset-2 font-bold hover:opacity-80 cursor-pointer"
                  >
                    {evaluation.teamSplit.principal.shortName}
                  </button>{' '}
                  check the final {evaluation.teamSplit.principalSharePct}% —{' '}
                  <strong className="tabular-nums">
                    save {evaluation.teamSplit.savingsPct}%
                  </strong>{' '}
                  vs. using a Deep Thinker solo.
                </p>
              </div>

              <div
                className={`text-xs font-mono tabular-nums whitespace-nowrap shrink-0 px-2.5 py-1 rounded-lg border ${
                  isBlueprint
                    ? 'bg-[#0B172A] border-[#38BDF8]/50 text-[#7DD3FC]'
                    : 'bg-[#FFFDF9] border-[#111827]/25 text-[#111827]'
                }`}
              >
                ~${evaluation.teamSplit.blendedCostUsd.toFixed(2)}/task
              </div>
            </div>
          </div>

          {/* Right-Hand Human Resume Card */}
          <div className="lg:sticky lg:top-5">
            <ResumeCard
              candidate={selectedCandidate}
              matchResult={selectedMatchResult}
              requiredModalities={evaluation.requiredModalities}
              totalModelsCount={CANDIDATES.length}
              viewMode={viewMode}
              linkCopied={linkCopied}
              onOpenTrialShift={() => setTrialShiftOpen(true)}
              onOpenShareCard={() => setShareCardOpen(true)}
              onCopyLink={handleCopyLink}
              onOpenBenchmarkHub={openBenchmarkHub}
              onOpenRosterModal={() => setRosterModalOpen(true)}
            />
          </div>
        </main>
      </div>

      {/* ===================== CLEAN PRODUCT-ONLY EDITORIAL FOOTER ===================== */}
      <footer
        className={`border-t mt-4 transition-colors ${
          isBlueprint
            ? 'border-[#1E3A5F] bg-[#08101E] text-[#94A3B8]'
            : 'border-[#111827]/15 bg-[#F4EFE6] text-[#57534E]'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span>
            <strong className={isBlueprint ? 'text-[#E2E8F0]' : 'text-[#111827]'}>
              The Model Hall
            </strong>{' '}
            · Refreshed every Friday with newly launched AI models · Always 100% Free
          </span>
          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => setRosterModalOpen(true)}
              className="font-semibold hover:underline underline-offset-2 cursor-pointer"
            >
              All {CANDIDATES.length} Specialists
            </button>
            <button
              type="button"
              onClick={() => openBenchmarkHub()}
              className="font-semibold hover:underline underline-offset-2 cursor-pointer"
            >
              8 Independent Benchmark Sources
            </button>
            <button
              type="button"
              onClick={() => setNewsletterOpen(true)}
              className={`font-bold hover:underline underline-offset-2 cursor-pointer ${
                isBlueprint ? 'text-[#7DD3FC]' : 'text-[#1F7A73]'
              }`}
            >
              Free Friday Newsletter →
            </button>
          </div>
        </div>
      </footer>

      {/* ===================== ON-DEMAND 42-MODEL GROUPED ROSTER MODAL ===================== */}
      <AnimatePresence>
        {rosterModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Browse all 42 AI Specialists"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRosterModalOpen(false)}
              className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-5xl max-h-[90vh] flex flex-col"
            >
              <button
                type="button"
                onClick={() => setRosterModalOpen(false)}
                aria-label="Close Roster Directory"
                className="absolute -top-3 -right-2 sm:top-3 sm:right-3 z-20 p-2 rounded-full bg-[#111827] text-white border-2 border-white shadow-lg hover:bg-[#E85D4A] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <RosterDirectory
                candidates={CANDIDATES}
                resultsById={evaluation.resultsById}
                hasActiveTask={evaluation.hasActiveTask}
                selectedId={selectedCandidate.id}
                pinnedCandidateId={pinnedCandidateId}
                floorCastIds={floorCastIds}
                requiredModalities={evaluation.requiredModalities}
                specialtyWing={specialtyWing}
                openWeightOnly={openWeightOnly}
                onSelectCandidate={(id) => {
                  handleManualSelectCandidate(id);
                }}
                onCastToFloor={handleCastToFloor}
                onOpenBenchmarkHub={() => {
                  setRosterModalOpen(false);
                  openBenchmarkHub();
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product-Branded Shareable Card PNG Studio */}
      <ShareCardModal
        isOpen={shareCardOpen}
        onClose={() => setShareCardOpen(false)}
        candidate={selectedCandidate}
        evaluation={evaluation}
        taskText={taskInput}
        viewMode={viewMode}
      />

      {/* Wide Side-by-Side Trial Shift Comparison Modal */}
      <TrialShiftModal
        isOpen={trialShiftOpen}
        onClose={() => setTrialShiftOpen(false)}
        selectedCandidate={selectedCandidate}
        allCandidates={CANDIDATES}
        viewMode={viewMode}
        onSelectCandidate={(id) => {
          handleManualSelectCandidate(id);
          setTrialShiftOpen(false);
        }}
      />

      {/* Always-Free Friday Newsletter & RSS Modal */}
      <LaunchDispatchModal
        isOpen={newsletterOpen}
        onClose={() => setNewsletterOpen(false)}
        candidates={CANDIDATES}
        viewMode={viewMode}
        onInspectCandidate={handleCastToFloor}
      />

      {/* 8-Source Independent Benchmark Credibility Hub Modal */}
      <AnimatePresence>
        {benchmarkHubState.open && (
          <BenchmarkHubModal
            highlightSourceId={benchmarkHubState.highlightId}
            blueprint={isBlueprint}
            onClose={() => setBenchmarkHubState({ open: false, highlightId: null })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
