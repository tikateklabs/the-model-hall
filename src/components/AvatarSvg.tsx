import React from 'react';
import { motion } from 'motion/react';
import { AmbientPose, Candidate, CandidateFitStatus } from '../types';

interface CandidatePortraitProps {
  candidate: Candidate;
  blueprint?: boolean;
  className?: string;
}

export const CandidatePortrait: React.FC<CandidatePortraitProps> = ({
  candidate,
  blueprint = false,
  className = 'w-20 h-20',
}) => {
  const { appearance } = candidate;
  const ink = blueprint ? '#7DD3FC' : '#1E293B';
  const bg = blueprint ? '#0B192C' : '#DCE6DF';
  const skin = blueprint ? '#102A45' : appearance.skinTone;
  const hair = blueprint ? '#1D4E7A' : appearance.hairColor;
  const shirt = blueprint ? '#133252' : appearance.shirtColor;
  const accent = blueprint ? '#38BDF8' : appearance.accentColor;

  return (
    <svg
      viewBox="0 0 88 88"
      className={className}
      role="img"
      aria-label={`Portrait of ${candidate.shortName}`}
    >
      <rect x="1.5" y="1.5" width="85" height="85" rx="7" fill={bg} stroke={ink} strokeWidth="2" />
      {blueprint && (
        <g stroke="#1E3A5F" strokeWidth="0.75">
          <line x1="22" y1="2" x2="22" y2="86" />
          <line x1="44" y1="2" x2="44" y2="86" />
          <line x1="66" y1="2" x2="66" y2="86" />
          <line x1="2" y1="22" x2="86" y2="22" />
          <line x1="2" y1="44" x2="86" y2="44" />
          <line x1="2" y1="66" x2="86" y2="66" />
        </g>
      )}

      {/* Shoulders & Shirt */}
      <path
        d="M14 86 C16 68 27 62 44 62 C61 62 72 68 74 86 Z"
        fill={shirt}
        stroke={ink}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M35 63 L44 74 L53 63"
        fill="none"
        stroke={ink}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M44 74 L44 86" stroke={accent} strokeWidth="2" strokeLinecap="round" />

      {/* Neck */}
      <rect x="38.5" y="52" width="11" height="13" rx="4" fill={skin} stroke={ink} strokeWidth="1.8" />

      {/* Hair back for bun/ponytail */}
      {appearance.hairStyle === 'wavy_bun' && (
        <circle cx="44" cy="18" r="9" fill={hair} stroke={ink} strokeWidth="1.8" />
      )}
      {appearance.hairStyle === 'ponytail' && (
        <path
          d="M57 32 C66 34 69 47 64 58 C60 54 58 46 56 40 Z"
          fill={hair}
          stroke={ink}
          strokeWidth="1.8"
        />
      )}

      {/* Ears */}
      <circle cx="27" cy="39" r="3.8" fill={skin} stroke={ink} strokeWidth="1.7" />
      <circle cx="61" cy="39" r="3.8" fill={skin} stroke={ink} strokeWidth="1.7" />

      {/* Head */}
      <path
        d="M28 34 C28 21 35 17 44 17 C53 17 60 21 60 34 C60 47 53 56 44 56 C35 56 28 47 28 34 Z"
        fill={skin}
        stroke={ink}
        strokeWidth="1.9"
      />

      {/* Hair Styles */}
      {appearance.hairStyle === 'silver_part' && (
        <path
          d="M27 34 C26 20 34 14 44 14 C55 14 62 21 61 34 C58 26 53 24 47 25 C41 26 33 24 27 34 Z"
          fill={hair}
          stroke={ink}
          strokeWidth="1.8"
        />
      )}
      {appearance.hairStyle === 'cropped_fade' && (
        <path
          d="M28 32 C28 19 35 15 44 15 C53 15 60 19 60 32 C57 25 51 23 44 23 C37 23 31 25 28 32 Z"
          fill={hair}
          stroke={ink}
          strokeWidth="1.8"
        />
      )}
      {appearance.hairStyle === 'short_sweep' && (
        <path
          d="M27 34 C26 19 35 13 46 14 C57 15 62 22 60 33 C56 25 48 22 39 24 C34 25 30 28 27 34 Z"
          fill={hair}
          stroke={ink}
          strokeWidth="1.8"
        />
      )}
      {appearance.hairStyle === 'glasses_part' && (
        <path
          d="M27 33 C27 21 34 17 44 17 C54 17 61 21 61 33 C59 27 56 24 52 24 C49 24 47 21 44 21 C40 21 37 24 34 24 C30 24 28 27 27 33 Z"
          fill={hair}
          stroke={ink}
          strokeWidth="1.8"
        />
      )}
      {appearance.hairStyle === 'wavy_bun' && (
        <path
          d="M27 36 C25 22 33 15 44 15 C55 15 63 22 61 36 C58 27 52 24 44 24 C36 24 30 27 27 36 Z"
          fill={hair}
          stroke={ink}
          strokeWidth="1.8"
        />
      )}
      {appearance.hairStyle === 'ponytail' && (
        <path
          d="M27 35 C26 20 34 14 44 14 C54 14 62 20 61 35 C57 26 50 23 43 24 C36 24 31 27 27 35 Z"
          fill={hair}
          stroke={ink}
          strokeWidth="1.8"
        />
      )}
      {appearance.hairStyle === 'curly_crop' && (
        <path
          d="M26 32 C25 22 30 15 37 15 C41 12 48 12 52 15 C58 15 62 22 61 32 C58 25 52 24 44 24 C36 24 30 25 26 32 Z"
          fill={hair}
          stroke={ink}
          strokeWidth="1.8"
        />
      )}
      {appearance.hairStyle === 'neat_bob' && (
        <path
          d="M25 46 C24 24 32 14 44 14 C56 14 64 24 63 46 C60 32 55 24 44 24 C33 24 28 32 25 46 Z"
          fill={hair}
          stroke={ink}
          strokeWidth="1.8"
        />
      )}

      {/* Facial Features */}
      <circle cx="38" cy="38" r="1.7" fill={ink} />
      <circle cx="50" cy="38" r="1.7" fill={ink} />
      <path d="M35 33.5 Q38 32 41 33.5" fill="none" stroke={ink} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M47 33.5 Q50 32 53 33.5" fill="none" stroke={ink} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M44 38 L43 44 L45.5 44.5" fill="none" stroke={ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M39.5 48.5 Q44 51.5 48.5 48.5" fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />

      {appearance.hasGlasses && (
        <g fill="none" stroke={ink} strokeWidth="1.5">
          <rect x="33.5" y="34.5" width="9" height="6.8" rx="2.5" />
          <rect x="45.5" y="34.5" width="9" height="6.8" rx="2.5" />
          <line x1="42.5" y1="37.5" x2="45.5" y2="37.5" />
        </g>
      )}
    </svg>
  );
};

// Export convenient alias used by RosterDirectory
export const PortraitSvg = CandidatePortrait;

interface NpcSpriteProps {
  candidate: Candidate;
  status: CandidateFitStatus;
  isSelected: boolean;
  isListening: boolean;
  isOnRug: boolean;
  blueprint: boolean;
  ambientPose?: AmbientPose;
  facing?: 'left' | 'right';
  reducedMotion?: boolean;
}

export const NpcSprite: React.FC<NpcSpriteProps> = ({
  candidate,
  status,
  isSelected,
  isListening,
  isOnRug,
  blueprint,
  ambientPose = 'typing',
  facing = 'right',
  reducedMotion = false,
}) => {
  const { appearance } = candidate;
  const isOverqualified = status === 'overqualified' || status === 'disqualified_modality';
  const isStretch = status === 'stretch';
  const isSynced = status === 'in_sync' || status === 'secondary_sync';

  const isWalking =
    !reducedMotion &&
    (ambientPose === 'walking_to_coffee' || ambientPose === 'walking_to_rug');
  const isSipping =
    ambientPose === 'sipping_coffee' || (isOverqualified && !isOnRug);
  const isChatting = !isOnRug && !isOverqualified && ambientPose === 'chatting';
  const isTyping = !isOnRug && !isOverqualified && ambientPose === 'typing';
  const isSketching = !isOnRug && !isOverqualified && ambientPose === 'sketching';

  const ink = blueprint ? '#7DD3FC' : '#1E293B';
  const skin = blueprint ? '#0F2744' : appearance.skinTone;
  const hair = blueprint ? '#1D4E7A' : appearance.hairColor;
  const shirt = blueprint
    ? isSynced
      ? '#164E63'
      : '#132A45'
    : appearance.shirtColor;
  const pants = blueprint ? '#0B192C' : appearance.pantsColor;
  const mugFill = blueprint ? '#0EA5E9' : '#FFFDF9';

  const blinkDelay = (candidate.deskSlot % 5) * 0.9 + 1.2;

  return (
    <motion.g
      animate={{
        opacity: isOverqualified ? 0.62 : 1,
        rotate: isOverqualified ? -4 : isChatting ? (facing === 'left' ? -3 : 3) : 0,
      }}
      transition={{ duration: 0.35 }}
      style={{ transformOrigin: '0px 0px' }}
    >
      {/* Subtle Selection / In-Sync Ground Halo */}
      {(isSelected || isSynced || isStretch) && (
        <motion.ellipse
          cx="0"
          cy="18"
          rx={isOnRug ? 26 : 20}
          ry={isOnRug ? 12 : 9}
          fill={
            blueprint
              ? isSynced
                ? 'rgba(56, 189, 248, 0.24)'
                : isStretch
                ? 'rgba(217, 155, 67, 0.24)'
                : 'rgba(125, 211, 252, 0.16)'
              : isSynced
              ? 'rgba(31, 122, 115, 0.34)'
              : isStretch
              ? 'rgba(230, 162, 60, 0.34)'
              : 'rgba(232, 93, 74, 0.24)'
          }
          stroke={
            blueprint
              ? isStretch
                ? '#FBBF24'
                : '#38BDF8'
              : isSynced
              ? '#1F7A73'
              : isStretch
              ? '#B7791F'
              : '#E85D4A'
          }
          strokeWidth={isSelected ? '2' : '1.4'}
          strokeDasharray={isSelected && !isSynced ? '4 3' : undefined}
          animate={reducedMotion ? undefined : { scale: isSynced ? [1, 1.07, 1] : 1 }}
          transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Ground Shadow */}
      <ellipse cx="0" cy="18" rx="14" ry="6" fill={blueprint ? 'rgba(0,0,0,0.35)' : 'rgba(17,24,39,0.16)'} />

      {/* Living Character Body Group (with subtle flip when facing left to chat) */}
      <g transform={facing === 'left' && !isOnRug ? 'scale(-1, 1)' : undefined}>
        <motion.g
          animate={
            reducedMotion
              ? { y: 0 }
              : isWalking
              ? { y: [0, -3.2, 0, -3.2, 0] }
              : isOnRug
              ? { y: [0, -2.5, 0] }
              : isListening
              ? { y: [0, -2, 0] }
              : isChatting
              ? { y: [0, -1.6, 0] }
              : { y: [0, -1.1, 0] }
          }
          transition={{
            duration: isWalking
              ? 0.55
              : isOnRug
              ? 1.7
              : isListening
              ? 1.05
              : isChatting
              ? 1.3
              : 2.6 + (candidate.deskSlot % 3) * 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Left Leg (swings when walking!) */}
          <motion.path
            d={isOnRug ? 'M-5 3 L-7 16 L-3 17 L-1 4 Z' : 'M-5 2 L-6 15 L-2 16 L-1 3 Z'}
            fill={pants}
            stroke={ink}
            strokeWidth="1.6"
            strokeLinejoin="round"
            style={{ transformOrigin: '-3px 3px' }}
            animate={isWalking ? { rotate: [20, -20, 20] } : { rotate: 0 }}
            transition={isWalking ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.25 }}
          />

          {/* Right Leg (counter-swings when walking!) */}
          <motion.path
            d={isOnRug ? 'M5 3 L8 15 L4 17 L1 4 Z' : 'M5 2 L6 15 L2 16 L1 3 Z'}
            fill={pants}
            stroke={ink}
            strokeWidth="1.6"
            strokeLinejoin="round"
            style={{ transformOrigin: '3px 3px' }}
            animate={isWalking ? { rotate: [-20, 20, -20] } : { rotate: 0 }}
            transition={isWalking ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.25 }}
          />

          {/* Torso */}
          <path
            d="M-10 -15 C-10 -20 -5 -22 0 -22 C5 -22 10 -20 10 -15 L8 4 L-8 4 Z"
            fill={shirt}
            stroke={ink}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M-4 -21 L0 -15 L4 -21" fill="none" stroke={ink} strokeWidth="1.3" />

          {/* Left Arm */}
          {isOnRug ? (
            <motion.g
              animate={reducedMotion ? undefined : { rotate: [0, -18, 8, -15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '-9px -16px' }}
            >
              <path
                d="M-9 -16 L-17 -28 L-14 -31 L-6 -19 Z"
                fill={shirt}
                stroke={ink}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="-16" cy="-31" r="3" fill={skin} stroke={ink} strokeWidth="1.4" />
            </motion.g>
          ) : (
            <motion.g
              animate={
                reducedMotion
                  ? { rotate: 0 }
                  : isWalking
                  ? { rotate: [-18, 18, -18] }
                  : isChatting
                  ? { rotate: [4, -22, -6, -18, 4] }
                  : isTyping
                  ? { rotate: [0, -10, 2, -8, 0] }
                  : { rotate: [0, 4, 0, -3, 0] }
              }
              transition={{
                duration: isWalking ? 0.55 : isTyping ? 0.65 : isChatting ? 1.4 : 2.3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ transformOrigin: '-9px -16px' }}
            >
              <path
                d="M-9 -16 L-14 -5 L-10 -4 L-6 -14 Z"
                fill={shirt}
                stroke={ink}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="-12" cy="-3.5" r="2.6" fill={skin} stroke={ink} strokeWidth="1.4" />
            </motion.g>
          )}

          {/* Right Arm + Coffee Sipping / Typing / Sketching / Chatting Props */}
          <motion.g
            animate={
              reducedMotion
                ? { rotate: 0 }
                : isOnRug
                ? { rotate: [0, 4, 0] }
                : isWalking
                ? { rotate: [18, -18, 18] }
                : isSipping
                ? { rotate: [0, 0, -54, -58, 0, 0] }
                : isChatting
                ? { rotate: [-6, -24, -10, -20, -6] }
                : isSketching
                ? { rotate: [-10, -22, -6, -18, -10] }
                : isTyping
                ? { rotate: [-2, 10, -4, 8, -2] }
                : { rotate: [0, -6, 2, 0] }
            }
            transition={{
              duration: isWalking
                ? 0.55
                : isSipping
                ? 3.8
                : isTyping
                ? 0.62
                : isSketching
                ? 1.5
                : isChatting
                ? 1.35
                : 2.0,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: '9px -16px' }}
          >
            <path
              d="M9 -16 L14 -5 L10 -4 L6 -14 Z"
              fill={shirt}
              stroke={ink}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="-3.5" r="2.6" fill={skin} stroke={ink} strokeWidth="1.4" />

            {/* Steaming Ceramic Coffee Mug when sipping or lounging! */}
            {isSipping && !isOnRug && (
              <g transform="translate(12, -8)">
                <rect x="-1" y="0" width="7" height="7.5" rx="1.4" fill={mugFill} stroke={ink} strokeWidth="1.2" />
                <path d="M6 1.8 C8.5 1.8 8.5 5.5 6 5.5" fill="none" stroke={ink} strokeWidth="1.1" />
                {/* Dark Vice Roast Coffee Rim */}
                <line x1="0" y1="1.3" x2="5" y2="1.3" stroke="#6F4E37" strokeWidth="1.4" />
                {/* Rising Animated Steam Curls */}
                {!reducedMotion && (
                  <>
                    <motion.path
                      d="M1.5 -1 Q0.5 -4 2 -6.5"
                      fill="none"
                      stroke={blueprint ? '#7DD3FC' : '#78716C'}
                      strokeWidth="1"
                      strokeLinecap="round"
                      animate={{ opacity: [0, 0.85, 0], y: [0, -4, -7] }}
                      transition={{ duration: 1.7, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <motion.path
                      d="M4 -1 Q5 -4 3.5 -6.5"
                      fill="none"
                      stroke={blueprint ? '#7DD3FC' : '#78716C'}
                      strokeWidth="1"
                      strokeLinecap="round"
                      animate={{ opacity: [0, 0.75, 0], y: [0, -4, -7] }}
                      transition={{ duration: 1.7, delay: 0.6, repeat: Infinity, ease: 'easeOut' }}
                    />
                  </>
                )}
              </g>
            )}

            {/* Signature Studio Props when working at station */}
            {!isSipping && !isOnRug && appearance.prop === 'stopwatch' && (
              <g transform="translate(15, -10)">
                <circle cx="0" cy="0" r="4.5" fill={blueprint ? '#0F172A' : '#FFFDF9'} stroke={ink} strokeWidth="1.3" />
                <line x1="0" y1="0" x2="0" y2="-2.6" stroke={ink} strokeWidth="1.2" />
                <line x1="0" y1="0" x2="2" y2="1" stroke="#E85D4A" strokeWidth="1.2" />
              </g>
            )}
            {!isSipping && !isOnRug && appearance.prop === 'clipboard' && (
              <rect
                x="10"
                y="-8"
                width="7"
                height="9"
                rx="1"
                fill={blueprint ? '#1E3A5F' : '#E7D4B5'}
                stroke={ink}
                strokeWidth="1.2"
                transform="rotate(12 13 -3)"
              />
            )}
            {!isSipping &&
              !isOnRug &&
              (appearance.prop === 'drafting_pen' || appearance.prop === 'fountain_pen') && (
                <line
                  x1="12"
                  y1="-4"
                  x2="19"
                  y2="-9"
                  stroke={blueprint ? '#38BDF8' : '#E85D4A'}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
          </motion.g>

          {/* Head (subtle nod while chatting or sketching) */}
          <motion.g
            animate={
              reducedMotion
                ? undefined
                : isChatting
                ? { rotate: [0, 5, -3, 4, 0] }
                : isSipping
                ? { rotate: [0, 0, -6, -6, 0, 0] }
                : undefined
            }
            transition={{
              duration: isSipping ? 3.8 : 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: '0px -23px' }}
          >
            <circle cx="0" cy="-31" r="9.5" fill={skin} stroke={ink} strokeWidth="1.7" />

            {/* Hair cap */}
            <path
              d="M-9.5 -32 C-9.5 -40 -4.5 -42 0 -42 C4.5 -42 9.5 -40 9.5 -32 C7 -36 3.5 -37 0 -37 C-3.5 -37 -7 -36 -9.5 -32 Z"
              fill={hair}
              stroke={ink}
              strokeWidth="1.5"
            />
            {appearance.hairStyle === 'wavy_bun' && (
              <circle cx="0" cy="-42.5" r="3.8" fill={hair} stroke={ink} strokeWidth="1.4" />
            )}
            {appearance.hairStyle === 'ponytail' && (
              <path d="M8 -35 C12 -33 13 -27 10 -24" fill="none" stroke={hair} strokeWidth="3.2" strokeLinecap="round" />
            )}

            {/* Eyes with Natural Periodic Blinking */}
            <motion.g
              style={{ transformOrigin: '0px -30.5px' }}
              animate={reducedMotion ? undefined : { scaleY: [1, 1, 1, 0.12, 1] }}
              transition={{
                duration: 4.2,
                times: [0, 0.9, 0.94, 0.97, 1],
                delay: blinkDelay,
                repeat: Infinity,
              }}
            >
              <circle cx="-3" cy="-30.5" r="1.15" fill={ink} />
              <circle cx="3" cy="-30.5" r="1.15" fill={ink} />
            </motion.g>

            {appearance.hasGlasses && (
              <g fill="none" stroke={ink} strokeWidth="1.1">
                <rect x="-5.5" y="-32.5" width="4.4" height="3.4" rx="1.2" />
                <rect x="1.1" y="-32.5" width="4.4" height="3.4" rx="1.2" />
                <line x1="-1.1" y1="-30.8" x2="1.1" y2="-30.8" />
              </g>
            )}

            {/* Expressive Mouth (animated when chatting!) */}
            {isChatting && !reducedMotion ? (
              <motion.ellipse
                cx="0"
                cy="-26.3"
                rx="2.1"
                ry="1.2"
                fill={ink}
                animate={{ ry: [0.6, 1.8, 0.7, 1.5, 0.6] }}
                transition={{ duration: 0.65, repeat: Infinity }}
              />
            ) : isOverqualified ? (
              <line x1="-2.2" y1="-26.5" x2="2.2" y2="-26.5" stroke={ink} strokeWidth="1.2" strokeLinecap="round" />
            ) : (
              <path d="M-2.5 -27 Q0 -25 2.5 -27" fill="none" stroke={ink} strokeWidth="1.2" strokeLinecap="round" />
            )}
          </motion.g>
        </motion.g>
      </g>

      {/* Listening Indicator (... / ?) while user is typing */}
      {isListening && (
        <motion.g
          initial={{ opacity: 0, y: 4 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity }}
          transform="translate(14, -48)"
        >
          <rect
            x="-12"
            y="-10"
            width="24"
            height="16"
            rx="8"
            fill={blueprint ? '#0F172A' : '#FFFDF9'}
            stroke={ink}
            strokeWidth="1.4"
          />
          <text
            x="0"
            y="1.5"
            textAnchor="middle"
            fontSize="9.5"
            fontWeight="700"
            fill={ink}
            fontFamily="var(--font-mono)"
          >
            {candidate.deskSlot % 2 === 0 ? '...' : '?'}
          </text>
        </motion.g>
      )}
    </motion.g>
  );
};
