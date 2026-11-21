import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AmbientPose,
  Candidate,
  HallMatchEvaluation,
  SpecialtyWingId,
  ViewMode,
} from '../types';
import { NpcSprite } from './AvatarSvg';
import { LAB_META, WING_META } from './LabBadge';

interface IsometricHallProps {
  evaluation: HallMatchEvaluation;
  selectedCandidateId: string;
  isListening: boolean;
  viewMode: ViewMode;
  specialtyWing: SpecialtyWingId;
  openWeightOnly: boolean;
  onSelectCandidate: (candidateId: string) => void;
}

const SEAT_COORDS_BY_KEY: Record<string, { x: number; y: number }> = {
  // Corner-Office Principals (Upper-right glass & brass suites)
  co_0: { x: 472, y: 176 },
  co_1: { x: 584, y: 240 },
  co_2: { x: 696, y: 304 },
  // Mid-Level Specialists (Center drafting tables)
  mid_0: { x: 374, y: 340 },
  mid_1: { x: 462, y: 392 },
  mid_2: { x: 548, y: 444 },
  // Front-Desk Associates (Left curved walnut counter)
  fd_0: { x: 184, y: 400 },
  fd_1: { x: 268, y: 444 },
};

const RUG_CENTER = { x: 368, y: 506 };
const COFFEE_BAR_SPOT = { x: 304, y: 302 };

function getBubbleAnchor(
  x: number,
  y: number
): { bx: number; by: number; align: 'left' | 'center' | 'right' } {
  if (x < 240) return { bx: x + 12, by: y - 94, align: 'left' };
  if (x > 640) return { bx: x - 12, by: y - 94, align: 'right' };
  return { bx: x, by: y - 98, align: 'center' };
}

function getDefaultDeskPose(c: Candidate): AmbientPose {
  if (c.appearance.prop === 'drafting_pen' || c.appearance.prop === 'fountain_pen') {
    return 'sketching';
  }
  if (c.appearance.prop === 'stopwatch') {
    return 'checking_watch';
  }
  return 'typing';
}

interface AmbientSceneState {
  coffeeWalkerId: string | null;
  coffeePhase: 'walking' | 'sipping';
  deskSipperId: string | null;
  nodAId: string | null;
  nodBId: string | null;
}

export const IsometricHall: React.FC<IsometricHallProps> = ({
  evaluation,
  selectedCandidateId,
  isListening,
  viewMode,
  specialtyWing,
  openWeightOnly,
  onSelectCandidate,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [clickedBubbleId, setClickedBubbleId] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ambientTick, setAmbientTick] = useState(0);
  const [ambientPhase, setAmbientPhase] = useState<'early' | 'late'>('early');

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Clear clicked speech bubble whenever the task or winner changes so nothing pops up uninvited
  useEffect(() => {
    setClickedBubbleId(null);
  }, [evaluation.hasActiveTask, evaluation.winnerId, evaluation.taskProfile.bucket]);

  const isBlueprint = viewMode === 'blueprint';
  const isIdleLive = !evaluation.hasActiveTask && !isListening && !reducedMotion;

  // Silent Living Studio Director: drives quiet coffee strolls, espresso sips & desk gestures (ZERO auto-popups!)
  useEffect(() => {
    if (!isIdleLive) return;
    setAmbientPhase('early');
    let lateTimer = window.setTimeout(() => setAmbientPhase('late'), 2200);
    const tickTimer = window.setInterval(() => {
      setAmbientTick((t) => t + 1);
      setAmbientPhase('early');
      window.clearTimeout(lateTimer);
      lateTimer = window.setTimeout(() => setAmbientPhase('late'), 2200);
    }, 5200);

    return () => {
      window.clearTimeout(lateTimer);
      window.clearInterval(tickTimer);
    };
  }, [isIdleLive, evaluation.floorCast.length]);

  const castCandidates = useMemo(
    () => evaluation.floorCast.map((slot) => slot.candidate),
    [evaluation.floorCast]
  );

  // Purely physical silent choreography: Espresso Bar strolls, desk sips, subtle silent nods
  const ambientScene: AmbientSceneState = useMemo(() => {
    const empty: AmbientSceneState = {
      coffeeWalkerId: null,
      coffeePhase: 'sipping',
      deskSipperId: null,
      nodAId: null,
      nodBId: null,
    };
    if (!isIdleLive || castCandidates.length < 3) return empty;

    const walkerPool = evaluation.floorCast.filter((s) => s.seatZone !== 'corner_office');
    const walkerSlot =
      walkerPool.length > 0
        ? walkerPool[ambientTick % walkerPool.length]
        : evaluation.floorCast[ambientTick % evaluation.floorCast.length];
    const coffeeWalkerId = walkerSlot.candidate.id;

    const coPool = evaluation.floorCast.filter(
      (s) => s.seatZone === 'corner_office' && s.candidate.id !== coffeeWalkerId
    );
    const deskSipperId =
      coPool.length > 0 ? coPool[(ambientTick + 1) % coPool.length].candidate.id : null;

    const others = castCandidates.filter(
      (c) => c.id !== coffeeWalkerId && c.id !== deskSipperId
    );
    const nodAId = others.length >= 2 ? others[ambientTick % others.length].id : null;
    const nodBId = others.length >= 2 ? others[(ambientTick + 1) % others.length].id : null;

    return {
      coffeeWalkerId,
      coffeePhase: ambientPhase === 'early' ? 'walking' : 'sipping',
      deskSipperId,
      nodAId,
      nodBId,
    };
  }, [isIdleLive, castCandidates, evaluation.floorCast, ambientTick, ambientPhase]);

  const ink = isBlueprint ? '#38BDF8' : '#111827';
  const wallOuter = isBlueprint ? '#0D1E35' : '#FAF5EC';
  const wallLeft = isBlueprint ? '#112540' : '#F6ECE0';
  const wallRight = isBlueprint ? '#0E1F36' : '#F0E4D4';
  const woodTop = isBlueprint ? '#142B47' : '#B57B52';
  const woodSide = isBlueprint ? '#0E2038' : '#8C5835';
  const woodLight = isBlueprint ? '#183454' : '#D9B68C';
  const glassFill = isBlueprint ? 'rgba(56, 189, 248, 0.10)' : 'rgba(195, 224, 220, 0.48)';
  const glassFrame = isBlueprint ? '#38BDF8' : '#1F7A73';
  const plantLeaf = isBlueprint ? '#0E7490' : '#1F7A73';
  const plantPot = isBlueprint ? '#1E3A5F' : '#E85D4A';
  const rugBase = isBlueprint ? '#123850' : '#8FA89B';
  const rugRing = isBlueprint ? '#38BDF8' : '#1F5E57';

  const getSeatState = (seatKey: string, candidate: Candidate) => {
    const isWinnerOnRug =
      evaluation.hasActiveTask && evaluation.winnerId === candidate.id && !isListening;
    if (isWinnerOnRug) {
      return {
        x: RUG_CENTER.x,
        y: RUG_CENTER.y - 16,
        isOnRug: true,
        ambientPose: 'waving_rug' as AmbientPose,
        facing: 'right' as const,
      };
    }

    const home = SEAT_COORDS_BY_KEY[seatKey] ?? { x: 400, y: 360 };

    // Pause a walking sprite softly if hovered so inspecting feels effortless
    if (isIdleLive && ambientScene.coffeeWalkerId === candidate.id && hoveredId !== candidate.id) {
      return {
        x: COFFEE_BAR_SPOT.x,
        y: COFFEE_BAR_SPOT.y,
        isOnRug: false,
        ambientPose:
          ambientScene.coffeePhase === 'walking'
            ? ('walking_to_coffee' as AmbientPose)
            : ('sipping_coffee' as AmbientPose),
        facing: 'left' as const,
      };
    }

    if (isIdleLive && ambientScene.deskSipperId === candidate.id) {
      return {
        x: home.x,
        y: home.y,
        isOnRug: false,
        ambientPose: 'sipping_coffee' as AmbientPose,
        facing: 'right' as const,
      };
    }

    if (isIdleLive && ambientScene.nodAId === candidate.id) {
      return {
        x: home.x,
        y: home.y,
        isOnRug: false,
        ambientPose: 'chatting' as AmbientPose,
        facing: 'right' as const,
      };
    }

    if (isIdleLive && ambientScene.nodBId === candidate.id) {
      return {
        x: home.x,
        y: home.y,
        isOnRug: false,
        ambientPose: 'chatting' as AmbientPose,
        facing: 'left' as const,
      };
    }

    return {
      x: home.x,
      y: home.y,
      isOnRug: false,
      ambientPose: getDefaultDeskPose(candidate),
      facing: 'right' as const,
    };
  };

  // STRICT USER-INTENT SPEECH BUBBLES ONLY:
  // Opens ONLY on explicit hover (`hoveredId`) or intentional click (`clickedBubbleId`).
  // Zero autonomous or uninvited popups!
  const activeBubble: {
    candidate: Candidate;
    seatKey: string;
    message: string;
    tag: string;
  } | null = useMemo(() => {
    const targetId = hoveredId ?? clickedBubbleId;
    if (!targetId) return null;

    const slot = evaluation.floorCast.find((s) => s.candidate.id === targetId);
    if (!slot) return null;

    const res = evaluation.resultsById[slot.candidate.id];
    return {
      candidate: slot.candidate,
      seatKey: slot.seatKey,
      message: evaluation.hasActiveTask ? res.dynamicSpeech : slot.candidate.speechBubble,
      tag:
        evaluation.hasActiveTask && evaluation.winnerId === slot.candidate.id
          ? 'TOP PICK'
          : slot.candidate.feeTier,
    };
  }, [hoveredId, clickedBubbleId, evaluation]);

  const cornerSuiteColors = [
    LAB_META[evaluation.floorCast[0]?.candidate.labId ?? 'google'].color,
    LAB_META[evaluation.floorCast[1]?.candidate.labId ?? 'openai'].color,
    LAB_META[evaluation.floorCast[2]?.candidate.labId ?? 'anthropic'].color,
  ];

  return (
    <div
      className={`relative rounded-2xl border-[1.5px] overflow-hidden transition-colors duration-300 ${
        isBlueprint
          ? 'blueprint-grid-bg border-[#38BDF8]/70'
          : 'bg-[#FAF5EC] border-[#111827] shadow-[4px_4px_0px_rgba(17,24,39,0.1)]'
      }`}
    >
      {/* Calm Top-Left Studio Indicator */}
      <div className="pointer-events-none absolute top-3 left-4 z-10 flex items-center gap-2 flex-wrap">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
            isBlueprint
              ? 'bg-[#0B172A]/90 border-[#38BDF8]/60 text-[#7DD3FC] font-mono'
              : 'bg-[#FFFDF9]/95 border-[#111827]/25 text-[#334155]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              evaluation.hasActiveTask
                ? 'bg-[#1F7A73]'
                : 'bg-[#E6A23C]'
            }`}
          />
          {evaluation.hasActiveTask
            ? evaluation.winnerId
              ? `Top Match Ready · 8 of ${evaluation.filteredPoolCount} on Floor`
              : 'No Solo Match — Check Note Below'
            : `8 of ${evaluation.totalCatalogCount} Specialists on Floor · Hover or Click Any`}
        </span>

        {(specialtyWing !== 'all' || openWeightOnly) && (
          <span
            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
              isBlueprint
                ? 'bg-[#0C4A6E]/90 border-[#38BDF8] text-[#E0F2FE]'
                : 'bg-[#E85D4A] border-[#111827] text-white'
            }`}
          >
            {specialtyWing !== 'all' ? WING_META[specialtyWing].shortLabel : ''}
            {specialtyWing !== 'all' && openWeightOnly ? ' · ' : ''}
            {openWeightOnly ? 'Open-Weight Only' : ''}
          </span>
        )}
      </div>

      {/* Blueprint Corner Reticles */}
      {isBlueprint && (
        <div className="pointer-events-none absolute inset-3 flex flex-col justify-between font-mono text-[10px] text-[#38BDF8]/65 select-none">
          <div className="flex justify-end">
            <span>DWG MH-42-LABS · ISO-30° ┐</span>
          </div>
          <div className="flex justify-between">
            <span>└ REF: 8 INDEPENDENT BENCHMARK SOURCES</span>
            <span>DYNAMIC 8-SEAT CAST ENGINE ┘</span>
          </div>
        </div>
      )}

      <svg
        viewBox="0 0 920 620"
        className="w-full h-auto block select-none"
        role="region"
        aria-label="Living Interactive Isometric Studio Floor of The Model Hall"
        onClick={() => setClickedBubbleId(null)}
      >
        <defs>
          <pattern
            id="herringbone-oak"
            width="36"
            height="24"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(28)"
          >
            <rect width="36" height="24" fill="#E7C89E" />
            <path d="M0 0 L18 0 L18 8 L0 8 Z" fill="#DDB98A" stroke="#B78D5A" strokeWidth="0.7" />
            <path d="M18 0 L36 0 L36 8 L18 8 Z" fill="#E9CBA0" stroke="#B78D5A" strokeWidth="0.7" />
            <path d="M0 8 L18 8 L18 16 L0 16 Z" fill="#EACEA1" stroke="#B78D5A" strokeWidth="0.7" />
            <path d="M18 8 L36 8 L36 16 L18 16 Z" fill="#D5AE7D" stroke="#B78D5A" strokeWidth="0.7" />
            <path d="M0 16 L18 16 L18 24 L0 24 Z" fill="#DCB786" stroke="#B78D5A" strokeWidth="0.7" />
            <path d="M18 16 L36 16 L36 24 L18 24 Z" fill="#E7C89E" stroke="#B78D5A" strokeWidth="0.7" />
          </pattern>

          <pattern id="blueprint-floor" width="32" height="18.5" patternUnits="userSpaceOnUse">
            <rect width="32" height="18.5" fill="#0D1E35" />
            <path
              d="M0 9.25 L16 0 L32 9.25 L16 18.5 Z"
              fill="none"
              stroke="#1E3A5F"
              strokeWidth="0.9"
            />
          </pattern>

          <linearGradient id="vice-sunbeam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE1C6" stopOpacity="0.52" />
            <stop offset="55%" stopColor="#FFF4DC" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FFF7DF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ===================== ARCHITECTURAL SHELL ===================== */}
        <polygon
          points="445,32 856,268 856,392 432,608 50,392 50,262"
          fill={wallOuter}
          stroke={ink}
          strokeWidth="4.5"
          strokeLinejoin="round"
        />

        {/* Floor Slab */}
        <polygon
          points="445,128 848,358 432,598 58,384"
          fill={isBlueprint ? 'url(#blueprint-floor)' : 'url(#herringbone-oak)'}
          stroke={ink}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Back Walls */}
        <polygon
          points="58,266 445,42 445,134 58,384"
          fill={wallLeft}
          stroke={ink}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <polygon
          points="445,42 848,274 848,358 445,134"
          fill={wallRight}
          stroke={ink}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Sunlit Arched Window + Wall Decor + Ticking Clock */}
        <g>
          <path
            d="M198 206 L198 158 C198 142 222 128 228 142 L228 189 Z"
            fill={isBlueprint ? '#0F2A47' : '#FFF1DF'}
            stroke={ink}
            strokeWidth="1.6"
          />
          <line x1="213" y1="142" x2="213" y2="197" stroke={ink} strokeWidth="1.1" />
          <line x1="198" y1="172" x2="228" y2="155" stroke={ink} strokeWidth="1.1" />

          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${86 + i * 32}, ${276 - i * 18})`}>
              <polygon
                points="0,0 22,-13 22,18 0,31"
                fill={isBlueprint ? '#112945' : '#FFFDF9'}
                stroke={ink}
                strokeWidth="1.4"
              />
              <polygon
                points="4,4 18,-4 18,14 4,22"
                fill={
                  isBlueprint
                    ? '#1E3A5F'
                    : i === 0
                    ? '#F4B8A8'
                    : i === 1
                    ? '#A8D5CE'
                    : '#F2D69B'
                }
                stroke={ink}
                strokeWidth="0.9"
              />
            </g>
          ))}

          {/* Live Ticking Wall Clock */}
          <g transform="translate(188, 240)">
            <ellipse
              cx="0"
              cy="0"
              rx="7.5"
              ry="10"
              fill={isBlueprint ? '#0B172A' : '#FFFDF9'}
              stroke={ink}
              strokeWidth="1.4"
            />
            <line x1="0" y1="0" x2="0" y2="-4.5" stroke={ink} strokeWidth="1.3" strokeLinecap="round" />
            <motion.line
              x1="0"
              y1="0"
              x2="4"
              y2="0"
              stroke="#E85D4A"
              strokeWidth="1.2"
              strokeLinecap="round"
              style={{ transformOrigin: '0px 0px' }}
              animate={reducedMotion ? undefined : { rotate: [0, 360] }}
              transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            />
          </g>

          {/* Studio Walnut Door */}
          <polygon
            points="232,202 268,181 268,262 232,283"
            fill={woodTop}
            stroke={ink}
            strokeWidth="1.6"
          />
          <polygon
            points="238,208 262,194 262,256 238,270"
            fill={woodLight}
            stroke={ink}
            strokeWidth="1.2"
          />
          <circle cx="258" cy="233" r="2.2" fill={ink} />

          {/* Tall Bookshelf */}
          <g transform="translate(302, 114)">
            <polygon points="0,24 64,-13 64,62 0,99" fill={woodSide} stroke={ink} strokeWidth="1.6" />
            <polygon points="0,24 14,32 78,-5 64,-13" fill={woodTop} stroke={ink} strokeWidth="1.5" />
            <polygon points="14,32 78,-5 78,70 14,107" fill={woodLight} stroke={ink} strokeWidth="1.5" />
            {[0, 1, 2].map((row) => (
              <g key={row}>
                <line
                  x1="15"
                  y1={56 + row * 19}
                  x2="77"
                  y2={19 + row * 19}
                  stroke={ink}
                  strokeWidth="1.4"
                />
                {[0, 1, 2, 3, 4].map((b) => (
                  <polygon
                    key={b}
                    points={`${20 + b * 10},${52 + row * 19 - b * 5.8} ${27 + b * 10},${48 + row * 19 - b * 5.8} ${27 + b * 10},${36 + row * 19 - b * 5.8} ${20 + b * 10},${40 + row * 19 - b * 5.8}`}
                    fill={
                      isBlueprint
                        ? '#1E3A5F'
                        : ['#1F7A73', '#E85D4A', '#E6A23C', '#2563EB', '#6D28D9'][(row + b) % 5]
                    }
                    stroke={ink}
                    strokeWidth="0.9"
                  />
                ))}
              </g>
            ))}
          </g>

          {/* ===================== ARCHITECTURAL ESPRESSO / COFFEE BAR ===================== */}
          <g transform="translate(260, 250)">
            <polygon points="0,16 40,-6 62,7 22,29" fill={woodTop} stroke={ink} strokeWidth="1.5" />
            <polygon points="0,16 22,29 22,52 0,39" fill={woodSide} stroke={ink} strokeWidth="1.5" />
            <polygon points="22,29 62,7 62,30 22,52" fill={woodLight} stroke={ink} strokeWidth="1.5" />
            <polygon
              points="18,12 34,3 44,9 28,18"
              fill={isBlueprint ? '#1E3A5F' : '#E2E8F0'}
              stroke={ink}
              strokeWidth="1.3"
            />
            <polygon
              points="18,12 28,18 28,6 18,0"
              fill={isBlueprint ? '#0F2A47' : '#CBD5E1'}
              stroke={ink}
              strokeWidth="1.2"
            />
            <polygon
              points="28,18 44,9 44,-3 28,6"
              fill={isBlueprint ? '#164E63' : '#94A3B8'}
              stroke={ink}
              strokeWidth="1.2"
            />
            <polygon
              points="18,0 34,-9 44,-3 28,6"
              fill={isBlueprint ? '#38BDF8' : '#E85D4A'}
              stroke={ink}
              strokeWidth="1.2"
            />
            <motion.circle
              cx="35"
              cy="6"
              r="1.8"
              fill="#F59E0B"
              animate={reducedMotion ? undefined : { opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <rect x="46" y="3" width="6" height="6" rx="1" fill={isBlueprint ? '#38BDF8' : '#FFFDF9'} stroke={ink} strokeWidth="1.1" />
            <rect x="10" y="13" width="6" height="6" rx="1" fill={isBlueprint ? '#7DD3FC' : '#FDE68A'} stroke={ink} strokeWidth="1.1" />
            {!reducedMotion && (
              <g>
                <motion.path
                  d="M27 -8 Q24 -14 29 -19"
                  fill="none"
                  stroke={isBlueprint ? '#7DD3FC' : '#78716C'}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  animate={{ opacity: [0, 0.75, 0], y: [0, -6, -12] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.path
                  d="M35 -10 Q38 -16 33 -22"
                  fill="none"
                  stroke={isBlueprint ? '#7DD3FC' : '#78716C'}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  animate={{ opacity: [0, 0.7, 0], y: [0, -6, -12] }}
                  transition={{ duration: 2.2, delay: 0.9, repeat: Infinity, ease: 'easeOut' }}
                />
              </g>
            )}
            <text
              x="31"
              y="62"
              textAnchor="middle"
              fontSize="6.8"
              fontWeight="800"
              letterSpacing="0.8"
              fill={isBlueprint ? '#7DD3FC' : '#78350F'}
              opacity="0.72"
              fontFamily="var(--font-sans)"
            >
              ESPRESSO BAR
            </text>
          </g>

          {/* Golden-hour Sunbeam + Drifting Motes */}
          {!isBlueprint && (
            <g pointerEvents="none">
              <polygon points="198,206 228,189 332,276 268,312" fill="url(#vice-sunbeam)" />
              {!reducedMotion &&
                [
                  { cx: 230, cy: 215, d: 0 },
                  { cx: 262, cy: 242, d: 1.4 },
                  { cx: 288, cy: 268, d: 2.6 },
                ].map((mote, i) => (
                  <motion.circle
                    key={i}
                    cx={mote.cx}
                    cy={mote.cy}
                    r="1.7"
                    fill="#FFF7ED"
                    animate={{
                      opacity: [0, 0.85, 0],
                      x: [0, 12, 22],
                      y: [0, 8, 16],
                    }}
                    transition={{
                      duration: 4.5,
                      delay: mote.d,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
            </g>
          )}
        </g>

        {/* ===================== ZONE 3: CORNER-OFFICE PRINCIPALS ===================== */}
        {[
          { ox: 422, oy: 122, labColor: cornerSuiteColors[0] },
          { ox: 534, oy: 186, labColor: cornerSuiteColors[1] },
          { ox: 646, oy: 250, labColor: cornerSuiteColors[2] },
        ].map((suite, idx) => (
          <g key={idx} transform={`translate(${suite.ox}, ${suite.oy})`}>
            <polygon
              points="18,64 106,14 148,38 60,88"
              fill={isBlueprint ? 'rgba(56,189,248,0.06)' : 'rgba(220,234,230,0.52)'}
              stroke={isBlueprint ? '#1E3A5F' : 'rgba(31,122,115,0.28)'}
              strokeWidth="1"
            />
            <polygon
              points="76,-8 118,16 118,46 76,22"
              fill={isBlueprint ? '#0F223B' : '#FFFDF9'}
              stroke={ink}
              strokeWidth="1.3"
            />
            <polygon
              points="81,16 94,10 103,24 113,20 113,38 81,20"
              fill={isBlueprint ? '#1E3A5F' : suite.labColor}
              opacity={isBlueprint ? 1 : 0.76}
              stroke={ink}
              strokeWidth="0.9"
            />
            <polygon points="18,52 68,24 96,40 46,68" fill={woodTop} stroke={ink} strokeWidth="1.6" />
            <polygon points="18,52 46,68 46,94 18,78" fill={woodSide} stroke={ink} strokeWidth="1.6" />
            <polygon points="46,68 96,40 96,66 46,94" fill={woodLight} stroke={ink} strokeWidth="1.5" />
            <motion.polygon
              points="46,46 62,37 72,43 56,52"
              fill={isBlueprint ? '#38BDF8' : '#E0F2FE'}
              stroke={ink}
              strokeWidth="1.1"
              animate={reducedMotion ? undefined : { opacity: [0.78, 1, 0.78] }}
              transition={{ duration: 2.6 + idx * 0.5, repeat: Infinity }}
            />
            <polygon
              points="-2,48 92,102 92,164 -2,110"
              fill={glassFill}
              stroke={glassFrame}
              strokeWidth="2"
            />
            <line x1="29" y1="66" x2="29" y2="128" stroke={glassFrame} strokeWidth="1.6" />
            <line x1="60" y1="84" x2="60" y2="146" stroke={glassFrame} strokeWidth="1.6" />
            <line
              x1="10"
              y1="72"
              x2="20"
              y2="86"
              stroke={isBlueprint ? '#7DD3FC' : '#FFFFFF'}
              strokeWidth="1.4"
              opacity="0.65"
            />
            <line
              x1="40"
              y1="90"
              x2="52"
              y2="108"
              stroke={isBlueprint ? '#7DD3FC' : '#FFFFFF'}
              strokeWidth="1.4"
              opacity="0.65"
            />
          </g>
        ))}

        {/* ===================== ZONE 1: FRONT-DESK ASSOCIATES ===================== */}
        <g transform="translate(86, 306)">
          <polygon points="8,42 86,-2 110,12 32,56" fill={woodTop} stroke={ink} strokeWidth="1.6" />
          <polygon points="32,56 110,12 110,44 32,88" fill={woodLight} stroke={ink} strokeWidth="1.5" />
          <polygon points="0,78 72,119 144,78 72,37" fill={woodTop} stroke={ink} strokeWidth="1.7" />
          <polygon points="0,78 72,119 72,158 0,117" fill={woodSide} stroke={ink} strokeWidth="1.7" />
          <polygon points="72,119 144,78 144,117 72,158" fill={woodLight} stroke={ink} strokeWidth="1.7" />
          <motion.polygon
            points="92,70 116,56 116,78 92,92"
            fill={isBlueprint ? '#0F2A47' : '#E0F2FE'}
            stroke={ink}
            strokeWidth="1.4"
            animate={reducedMotion ? undefined : { opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
          <line x1="104" y1="84" x2="104" y2="94" stroke={ink} strokeWidth="2" />
          <polygon
            points="22,68 38,59 50,66 34,75"
            fill={isBlueprint ? '#1E3A5F' : '#FFFDF9'}
            stroke={ink}
            strokeWidth="1.2"
          />
        </g>

        {/* Gently Swaying Tropical Potted Palms */}
        {[
          { px: 204, py: 320, scale: 1 },
          { px: 392, py: 184, scale: 0.92 },
        ].map((p, idx) => (
          <g key={idx} transform={`translate(${p.px}, ${p.py}) scale(${p.scale})`}>
            <ellipse cx="0" cy="4" rx="10" ry="5" fill={plantPot} stroke={ink} strokeWidth="1.4" />
            <path d="M-9 4 L-6 18 C-2 21 2 21 6 18 L9 4 Z" fill={plantPot} stroke={ink} strokeWidth="1.4" />
            <motion.g
              style={{ transformOrigin: '0px 3px' }}
              animate={reducedMotion ? undefined : { rotate: [-2.5, 2.5, -2.5] }}
              transition={{ duration: 4.4 + idx * 0.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d="M0 3 C-8 -12 -14 -16 -10 -24 C-4 -18 -2 -10 0 3 Z" fill={plantLeaf} stroke={ink} strokeWidth="1.3" />
              <path d="M0 3 C8 -12 15 -18 11 -26 C4 -18 2 -10 0 3 Z" fill={plantLeaf} stroke={ink} strokeWidth="1.3" />
              <path d="M0 3 C-3 -16 2 -28 0 -32 C-4 -24 -4 -12 0 3 Z" fill={plantLeaf} stroke={ink} strokeWidth="1.3" />
            </motion.g>
          </g>
        ))}

        {/* ===================== ZONE 2: MID-LEVEL SPECIALISTS ===================== */}
        <polygon
          points="336,368 418,320 622,438 540,486"
          fill={isBlueprint ? 'rgba(56, 189, 248, 0.08)' : 'rgba(176, 212, 203, 0.52)'}
          stroke={isBlueprint ? '#38BDF8' : '#1F7A73'}
          strokeWidth="1.4"
          strokeDasharray={isBlueprint ? '5 4' : undefined}
        />

        {[
          { dx: 344, dy: 314 },
          { dx: 428, dy: 364 },
          { dx: 512, dy: 416 },
        ].map((desk, i) => (
          <g key={i} transform={`translate(${desk.dx}, ${desk.dy})`}>
            <line x1="8" y1="36" x2="2" y2="66" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
            <line x1="32" y1="50" x2="26" y2="80" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
            <line x1="66" y1="30" x2="60" y2="58" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
            <polygon
              points="0,24 48,-2 82,18 34,44"
              fill={woodLight}
              stroke={ink}
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <polygon
              points="10,23 46,4 70,18 34,37"
              fill={isBlueprint ? '#0F2A47' : '#FFFDF9'}
              stroke={ink}
              strokeWidth="1.1"
            />
            <line x1="22" y1="22" x2="46" y2="10" stroke={ink} strokeWidth="0.9" opacity="0.6" />
            <line x1="28" y1="26" x2="54" y2="14" stroke={ink} strokeWidth="0.9" opacity="0.6" />
          </g>
        ))}

        {/* ===================== CENTRAL ROUND SELECTION RUG ===================== */}
        <g transform={`translate(${RUG_CENTER.x}, ${RUG_CENTER.y})`}>
          <ellipse cx="0" cy="0" rx="70" ry="38" fill={rugBase} stroke={ink} strokeWidth="2.2" />
          <ellipse cx="0" cy="0" rx="56" ry="30" fill="none" stroke={rugRing} strokeWidth="1.4" strokeDasharray="6 3" />
          <ellipse cx="0" cy="0" rx="40" ry="21.5" fill="none" stroke={rugRing} strokeWidth="1.2" />
          <ellipse cx="0" cy="0" rx="24" ry="13" fill="none" stroke={rugRing} strokeWidth="1.1" strokeDasharray="4 3" />

          {evaluation.hasActiveTask && evaluation.winnerId && !isListening && (
            <>
              <motion.ellipse
                cx="0"
                cy="0"
                rx="76"
                ry="42"
                fill="none"
                stroke={isBlueprint ? '#38BDF8' : '#E85D4A'}
                strokeWidth="2.4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={
                  reducedMotion
                    ? { opacity: 0.9, scale: 1 }
                    : { opacity: [0.45, 1, 0.45], scale: [0.98, 1.03, 0.98] }
                }
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.g
                key={evaluation.winnerId}
                initial={{ opacity: 0, scale: 1.25 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                transform="translate(0, 39)"
              >
                <rect
                  x="-50"
                  y="-9"
                  width="100"
                  height="17"
                  rx="4"
                  fill={isBlueprint ? '#0284C7' : '#E85D4A'}
                  stroke={isBlueprint ? '#BAE6FD' : '#111827'}
                  strokeWidth="1.4"
                />
                <text
                  x="0"
                  y="2.5"
                  textAnchor="middle"
                  fontSize="8.8"
                  fontWeight="800"
                  letterSpacing="1.1"
                  fill="#FFFFFF"
                  fontFamily="var(--font-sans)"
                >
                  BEST FIT PICK
                </text>
              </motion.g>
            </>
          )}

          {!evaluation.hasActiveTask && (
            <text
              x="0"
              y="3.5"
              textAnchor="middle"
              fontSize="8.6"
              fontWeight="700"
              letterSpacing="1"
              fill={isBlueprint ? '#7DD3FC' : '#111827'}
              opacity="0.72"
              fontFamily="var(--font-sans)"
            >
              PICK A TASK ABOVE
            </text>
          )}
        </g>

        {/* ===================== SILENT LIVING 8-SEAT DYNAMIC CAST ===================== */}
        {[...evaluation.floorCast]
          .map((slot) => ({
            slot,
            state: getSeatState(slot.seatKey, slot.candidate),
          }))
          .sort((a, b) => a.state.y - b.state.y)
          .map(({ slot, state }) => {
            const candidate = slot.candidate;
            const result = evaluation.resultsById[candidate.id];
            const isSelected = candidate.id === selectedCandidateId;
            const isHovered = candidate.id === hoveredId;
            const labMeta = LAB_META[candidate.labId];
            const isDimmed =
              result.status === 'overqualified' || result.status === 'disqualified_modality';

            // Show status pill ONLY when a task is active (never uninvited idle pills!)
            let badgeText: string | null = null;
            let badgeBg = '#1F7A73';
            let badgeTextCol = '#FFFFFF';

            if (evaluation.hasActiveTask && !isListening) {
              if (result.status === 'disqualified_modality') {
                badgeText = result.statusLabel;
                badgeBg = '#DC2626';
                badgeTextCol = '#FFFFFF';
              } else if (result.status === 'in_sync' || result.status === 'secondary_sync') {
                badgeText = result.status === 'in_sync' ? '#1 MATCH' : 'GOOD FIT';
                badgeBg = isBlueprint ? '#0284C7' : '#1F7A73';
                badgeTextCol = '#FFFFFF';
              } else if (result.status === 'stretch') {
                badgeText = 'NEEDS REVIEW';
                badgeBg = '#E6A23C';
                badgeTextCol = '#111827';
              } else if (result.status === 'overqualified') {
                badgeText = 'OVERQUALIFIED';
                badgeBg = '#94A3B8';
                badgeTextCol = '#0F172A';
              }
            }

            const pillWidth = badgeText ? Math.max(66, badgeText.length * 6.5 + 16) : 0;

            return (
              <motion.g
                key={candidate.id}
                initial={{ opacity: 0, x: state.x, y: state.y - 10 }}
                animate={{ opacity: 1, x: state.x, y: state.y }}
                transition={{
                  type: 'spring',
                  stiffness: state.ambientPose === 'walking_to_coffee' ? 75 : 110,
                  damping: state.ambientPose === 'walking_to_coffee' ? 16 : 18,
                  mass: 0.9,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCandidate(candidate.id);
                  setClickedBubbleId(candidate.id);
                }}
                onMouseEnter={() => setHoveredId(candidate.id)}
                onMouseLeave={() => setHoveredId((prev) => (prev === candidate.id ? null : prev))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectCandidate(candidate.id);
                    setClickedBubbleId(candidate.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${candidate.shortName} by ${candidate.provider}, ${candidate.title}, ${result.statusLabel}`}
                className="cursor-pointer focus:outline-none"
              >
                <circle cx="0" cy="-12" r="34" fill="transparent" />

                <NpcSprite
                  candidate={candidate}
                  status={isDimmed ? 'overqualified' : result.status}
                  isSelected={isSelected || isHovered}
                  isListening={isListening}
                  isOnRug={state.isOnRug}
                  blueprint={isBlueprint}
                  ambientPose={state.ambientPose}
                  facing={state.facing}
                  reducedMotion={reducedMotion}
                />

                {/* Task Fit Pill Above Head (Active Task Only) */}
                {badgeText && (
                  <g transform="translate(0, -56)">
                    <rect
                      x={-pillWidth / 2}
                      y="-11"
                      width={pillWidth}
                      height="19"
                      rx="9.5"
                      fill={badgeBg}
                      stroke={isBlueprint ? '#BAE6FD' : '#111827'}
                      strokeWidth="1.2"
                    />
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      fontSize="8.5"
                      fontWeight="800"
                      letterSpacing="0.5"
                      fill={badgeTextCol}
                      fontFamily="var(--font-sans)"
                    >
                      {badgeText}
                    </text>
                  </g>
                )}

                {/* Clean Editorial Nameplate: Lab Color Dot + Short Name + Quiet Company Label */}
                <g transform="translate(0, 25)" opacity={isDimmed && !isSelected ? 0.62 : 1}>
                  <rect
                    x="-54"
                    y="-8"
                    width="108"
                    height={isBlueprint ? 28 : 25}
                    rx="6"
                    fill={
                      isBlueprint
                        ? isSelected
                          ? '#163A5F'
                          : 'rgba(11, 23, 42, 0.94)'
                        : isSelected
                        ? '#111827'
                        : 'rgba(255, 253, 249, 0.96)'
                    }
                    stroke={
                      isBlueprint
                        ? isSelected
                          ? '#7DD3FC'
                          : '#38BDF8'
                        : isSelected
                        ? '#E85D4A'
                        : '#111827'
                    }
                    strokeWidth={isSelected ? '1.6' : '1.1'}
                  />

                  {/* Colored Company Lab Dot */}
                  <circle
                    cx="-43"
                    cy="0.5"
                    r="3.4"
                    fill={labMeta.color}
                    stroke={isSelected && !isBlueprint ? '#FAF5EC' : 'none'}
                    strokeWidth="0.8"
                  />

                  {/* Short Model Name */}
                  <text
                    x="-35"
                    y="3"
                    textAnchor="start"
                    fontSize="8.8"
                    fontWeight="700"
                    fill={isBlueprint ? '#F0F9FF' : isSelected ? '#FAF5EC' : '#111827'}
                    fontFamily="var(--font-sans)"
                  >
                    {candidate.shortName}
                  </text>

                  {/* Quiet Company Name (or CAD Specs in Blueprint View) */}
                  {!isBlueprint ? (
                    <text
                      x="-35"
                      y="13"
                      textAnchor="start"
                      fontSize="6.8"
                      fontWeight="600"
                      fill={isSelected ? '#CBD5E1' : '#64748B'}
                      fontFamily="var(--font-sans)"
                    >
                      {labMeta.name} · {candidate.feeTier}
                    </text>
                  ) : (
                    <text
                      x="-35"
                      y="14"
                      textAnchor="start"
                      fontSize="6.8"
                      fill="#7DD3FC"
                      fontFamily="var(--font-mono)"
                    >
                      AA:{candidate.aaIndex} · ${candidate.costPerTaskUsd.toFixed(2)}
                    </text>
                  )}
                </g>
              </motion.g>
            );
          })}

        {/* ===================== SELF-EXPLANATORY ARCHITECTURAL ZONE LABELS ===================== */}
        <g pointerEvents="none">
          {/* Zone 1: Front-Desk Associates */}
          <g transform="translate(154, 562)">
            <rect
              x="-98"
              y="-15"
              width="196"
              height="36"
              rx="6"
              fill={isBlueprint ? 'rgba(11, 23, 42, 0.92)' : 'rgba(250, 245, 236, 0.95)'}
              stroke={isBlueprint ? '#38BDF8' : 'rgba(17,24,39,0.12)'}
              strokeWidth="1"
            />
            <text
              x="0"
              y="0"
              textAnchor="middle"
              fontSize="12.2"
              fontWeight="700"
              letterSpacing="0.5"
              fill={isBlueprint ? '#7DD3FC' : '#111827'}
              fontFamily={isBlueprint ? 'var(--font-mono)' : 'var(--font-serif)'}
            >
              FRONT-DESK ASSOCIATES
            </text>
            <text
              x="0"
              y="14"
              textAnchor="middle"
              fontSize="9.2"
              fontWeight="600"
              fill={isBlueprint ? '#93C5FD' : '#1F7A73'}
              fontFamily="var(--font-sans)"
            >
              Quick &amp; Everyday Helpers
            </text>
          </g>

          {/* Zone 2: Mid-Level Specialists */}
          <g transform="translate(560, 562)">
            <rect
              x="-102"
              y="-15"
              width="204"
              height="36"
              rx="6"
              fill={isBlueprint ? 'rgba(11, 23, 42, 0.92)' : 'rgba(250, 245, 236, 0.95)'}
              stroke={isBlueprint ? '#38BDF8' : 'rgba(17,24,39,0.12)'}
              strokeWidth="1"
            />
            <text
              x="0"
              y="0"
              textAnchor="middle"
              fontSize="12.2"
              fontWeight="700"
              letterSpacing="0.5"
              fill={isBlueprint ? '#7DD3FC' : '#111827'}
              fontFamily={isBlueprint ? 'var(--font-mono)' : 'var(--font-serif)'}
            >
              MID-LEVEL SPECIALISTS
            </text>
            <text
              x="0"
              y="14"
              textAnchor="middle"
              fontSize="9.2"
              fontWeight="600"
              fill={isBlueprint ? '#93C5FD' : '#1F7A73'}
              fontFamily="var(--font-sans)"
            >
              All-Round Daily Workhorses
            </text>
          </g>

          {/* Zone 3: Corner-Office Principals */}
          <g transform="translate(766, 122)">
            <rect
              x="-92"
              y="-24"
              width="184"
              height="56"
              rx="6"
              fill={isBlueprint ? 'rgba(11, 23, 42, 0.92)' : 'rgba(250, 245, 236, 0.94)'}
              stroke={isBlueprint ? '#38BDF8' : 'rgba(17,24,39,0.12)'}
              strokeWidth="1"
            />
            <text
              x="0"
              y="-6"
              textAnchor="middle"
              fontSize="12.6"
              fontWeight="700"
              letterSpacing="0.5"
              fill={isBlueprint ? '#7DD3FC' : '#111827'}
              fontFamily={isBlueprint ? 'var(--font-mono)' : 'var(--font-serif)'}
            >
              CORNER-OFFICE
            </text>
            <text
              x="0"
              y="10"
              textAnchor="middle"
              fontSize="12.6"
              fontWeight="700"
              letterSpacing="0.5"
              fill={isBlueprint ? '#7DD3FC' : '#111827'}
              fontFamily={isBlueprint ? 'var(--font-mono)' : 'var(--font-serif)'}
            >
              PRINCIPALS
            </text>
            <text
              x="0"
              y="24"
              textAnchor="middle"
              fontSize="9"
              fontWeight="600"
              fill={isBlueprint ? '#93C5FD' : '#E85D4A'}
              fontFamily="var(--font-sans)"
            >
              Deep Thinkers for Tough Calls
            </text>
          </g>
        </g>

        {/* ===================== HOVER / CLICK-ONLY SPEECH BUBBLE ===================== */}
        <AnimatePresence mode="wait">
          {activeBubble &&
            (() => {
              const state = getSeatState(activeBubble.seatKey, activeBubble.candidate);
              const anchor = getBubbleAnchor(state.x, state.y);
              const boxW = 264;
              const boxX =
                anchor.align === 'left'
                  ? Math.max(16, anchor.bx - 20)
                  : anchor.align === 'right'
                  ? Math.min(920 - boxW - 16, anchor.bx - boxW + 20)
                  : Math.min(920 - boxW - 16, Math.max(16, anchor.bx - boxW / 2));
              const boxY = Math.max(14, anchor.by - 18);
              const labMeta = LAB_META[activeBubble.candidate.labId];

              return (
                <motion.g
                  key={`${activeBubble.candidate.id}-${activeBubble.message.slice(0, 14)}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.16 }}
                  pointerEvents="none"
                >
                  <foreignObject x={boxX} y={boxY} width={boxW} height="90">
                    <div
                      className={`rounded-xl border-[1.5px] px-3 py-2 text-[11.5px] leading-snug shadow-lg ${
                        isBlueprint
                          ? 'bg-[#0F2138] border-[#38BDF8] text-[#E0F2FE]'
                          : 'bg-[#FFFDF9] border-[#111827] text-[#111827]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="font-bold text-[10px] uppercase tracking-wider truncate">
                          {activeBubble.candidate.shortName} · {activeBubble.tag}
                        </span>
                        <span
                          className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded text-white shrink-0"
                          style={{ backgroundColor: labMeta.color }}
                        >
                          {labMeta.name}
                        </span>
                      </div>
                      <div className="line-clamp-2">“{activeBubble.message}”</div>
                    </div>
                  </foreignObject>
                </motion.g>
              );
            })()}
        </AnimatePresence>
      </svg>
    </div>
  );
};
