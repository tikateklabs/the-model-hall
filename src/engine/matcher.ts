import {
  BenchmarkSourceId,
  BudgetLevel,
  Candidate,
  CandidateFitStatus,
  CandidateMatchResult,
  CandidateTraits,
  FloorCastAssignment,
  HallMatchEvaluation,
  ModalityKey,
  SpecialtyWingId,
  StakesLevel,
  TaskBucketId,
  TaskProfile,
  TeamSplitRecommendation,
  WinnerReasoning,
  ZoneId,
} from '../types';

export const MODALITY_META: Record<
  ModalityKey,
  { label: string; shortLabel: string; missingBadge: string }
> = {
  vision: { label: 'Vision / PDF', shortLabel: 'Vision', missingBadge: 'NO VISION' },
  video: { label: 'Native Video', shortLabel: 'Video', missingBadge: 'NO VIDEO' },
  audio: { label: 'Native Audio', shortLabel: 'Audio', missingBadge: 'NO AUDIO' },
  code: { label: 'Code & Tools', shortLabel: 'Code', missingBadge: 'NO CODE' },
  imageGen: { label: 'Image Gen', shortLabel: 'Img Gen', missingBadge: 'NO IMG GEN' },
  videoGen: { label: 'Video Gen', shortLabel: 'Vid Gen', missingBadge: 'NO VID GEN' },
};

export const FLOOR_SEAT_SLOTS: Array<{
  seatKey: string;
  seatZone: ZoneId;
  x: number;
  y: number;
  defaultFlagshipId: string;
}> = [
  // Corner-Office Principals (3 glass offices)
  { seatKey: 'co_0', seatZone: 'corner_office', x: 525, y: 208, defaultFlagshipId: 'gemini-4-neon' },
  { seatKey: 'co_1', seatZone: 'corner_office', x: 642, y: 280, defaultFlagshipId: 'gpt-6-2-astra' },
  { seatKey: 'co_2', seatZone: 'corner_office', x: 758, y: 350, defaultFlagshipId: 'claude-fable-5-2' },
  // Mid-Level Specialists (3 drafting stations)
  { seatKey: 'mid_0', seatZone: 'mid_level', x: 422, y: 355, defaultFlagshipId: 'gemini-4-hydrogen' },
  { seatKey: 'mid_1', seatZone: 'mid_level', x: 524, y: 416, defaultFlagshipId: 'gpt-6-2-sol' },
  { seatKey: 'mid_2', seatZone: 'mid_level', x: 616, y: 472, defaultFlagshipId: 'deepseek-v4-1-flash' },
  // Front-Desk Associates (2 rapid counter stations)
  { seatKey: 'fd_0', seatZone: 'front_desk', x: 184, y: 430, defaultFlagshipId: 'gpt-6-luna' },
  { seatKey: 'fd_1', seatZone: 'front_desk', x: 278, y: 468, defaultFlagshipId: 'muse-ember' },
];

interface BucketDefinition {
  id: TaskBucketId;
  label: string;
  complexity: 'routine' | 'medium' | 'high';
  weights: CandidateTraits;
  summary: string;
  keywords: Array<{ term: string; weight: number }>;
}

const BUCKET_DEFINITIONS: BucketDefinition[] = [
  {
    id: 'legal_audit',
    label: 'High-Stakes Legal & Audit',
    complexity: 'high',
    weights: { thinking: 0.38, honesty: 0.36, clarity: 0.16, creativity: 0.05, speed: 0.05 },
    summary: 'Prioritizes deep forensic reasoning, zero-bluff honesty, and redline precision.',
    keywords: [
      { term: 'lease', weight: 4 },
      { term: 'rental', weight: 3 },
      { term: 'vendor', weight: 3 },
      { term: 'contract', weight: 4 },
      { term: 'trap', weight: 3.5 },
      { term: 'clause', weight: 4 },
      { term: 'legal', weight: 4 },
      { term: 'audit', weight: 3.5 },
      { term: 'insurance', weight: 3.5 },
      { term: 'policy', weight: 3 },
      { term: 'policies', weight: 3 },
      { term: 'fact-check', weight: 3.5 },
      { term: 'fact check', weight: 3.5 },
      { term: 'citation', weight: 3.5 },
      { term: 'bluffing', weight: 3 },
      { term: 'compliance', weight: 3.5 },
      { term: 'liability', weight: 4 },
      { term: 'agreement', weight: 3 },
    ],
  },
  {
    id: 'coding_debugging',
    label: 'Engineering & Debugging',
    complexity: 'high',
    weights: { thinking: 0.4, honesty: 0.25, clarity: 0.2, creativity: 0.05, speed: 0.1 },
    summary: 'Demands multi-step architectural logic, edge-case rigor, and clean code execution.',
    keywords: [
      { term: 'debug', weight: 4 },
      { term: 'bug', weight: 3.5 },
      { term: 'architecture', weight: 4 },
      { term: 'gnarly', weight: 3 },
      { term: 'unit test', weight: 3.5 },
      { term: 'tests', weight: 2.5 },
      { term: 'edge case', weight: 3 },
      { term: 'refactor', weight: 3.5 },
      { term: 'legacy code', weight: 4 },
      { term: 'code', weight: 3 },
      { term: 'typescript', weight: 3 },
      { term: 'api', weight: 2.5 },
      { term: 'sql', weight: 3 },
      { term: 'algorithm', weight: 3.5 },
      { term: 'database', weight: 3 },
    ],
  },
  {
    id: 'media_generation',
    label: 'Creative Image & Video Generation',
    complexity: 'medium',
    weights: { thinking: 0.12, honesty: 0.12, clarity: 0.22, creativity: 0.42, speed: 0.12 },
    summary: 'Selects dedicated generative cinema & visual studios with strong aesthetic & prompt fidelity.',
    keywords: [
      { term: 'generate video', weight: 6 },
      { term: 'product video', weight: 5.5 },
      { term: 'launch video', weight: 5.5 },
      { term: 'ad reel', weight: 5 },
      { term: 'cinema clip', weight: 5 },
      { term: 'trailer', weight: 4.5 },
      { term: 'generate hero visual', weight: 5.5 },
      { term: 'generate image', weight: 5.5 },
      { term: 'create artwork', weight: 5 },
      { term: 'create a poster', weight: 5 },
      { term: 'hero visual', weight: 4.5 },
      { term: 'illustration', weight: 4 },
    ],
  },
  {
    id: 'voice_dubbing',
    label: 'Live Voice, Narration & Dubbing',
    complexity: 'medium',
    weights: { thinking: 0.14, honesty: 0.16, clarity: 0.32, creativity: 0.18, speed: 0.2 },
    summary: 'Prioritizes expressive speech realism, ultra-low voice latency, and clean audio fidelity.',
    keywords: [
      { term: 'voiceover', weight: 5.5 },
      { term: 'narration', weight: 5 },
      { term: 'dubbing', weight: 5.5 },
      { term: 'voice clone', weight: 5 },
      { term: 'audiobook', weight: 5 },
      { term: 'live voice', weight: 5 },
      { term: 'voice memo', weight: 4.5 },
      { term: 'transcribe', weight: 4.5 },
      { term: 'podcast', weight: 4 },
      { term: 'audio', weight: 4 },
    ],
  },
  {
    id: 'multimodal_media',
    label: 'Multimodal Media & Visual Analysis',
    complexity: 'medium',
    weights: { thinking: 0.26, honesty: 0.2, clarity: 0.24, creativity: 0.14, speed: 0.16 },
    summary: 'Requires native perception over video, audio, photos, or UI screenshots.',
    keywords: [
      { term: 'lecture video', weight: 5 },
      { term: 'seminar video', weight: 5 },
      { term: 'screen recording', weight: 5 },
      { term: 'video', weight: 4.5 },
      { term: 'photo', weight: 3.5 },
      { term: 'dashboard warning', weight: 4 },
      { term: 'screenshot', weight: 4 },
      { term: 'diagram', weight: 3.5 },
      { term: 'chart', weight: 3 },
    ],
  },
  {
    id: 'bulk_triage',
    label: 'High-Volume Triage & Bulk Sorting',
    complexity: 'routine',
    weights: { thinking: 0.12, honesty: 0.1, clarity: 0.2, creativity: 0.08, speed: 0.5 },
    summary: 'Rewards instant turnaround, predictable formatting, and penny-level unit economics.',
    keywords: [
      { term: '1,000', weight: 4.5 },
      { term: '1000', weight: 4.5 },
      { term: '500', weight: 4 },
      { term: 'sort', weight: 3.5 },
      { term: 'cheaply', weight: 4.5 },
      { term: 'cheap', weight: 3.5 },
      { term: 'bulk', weight: 4 },
      { term: 'triage', weight: 3.5 },
      { term: 'parse', weight: 3.5 },
      { term: 'json', weight: 3.5 },
      { term: 'logs', weight: 3.5 },
      { term: 'messy', weight: 2 },
      { term: 'flashcard', weight: 4 },
      { term: 'customer email', weight: 3.5 },
      { term: 'emails', weight: 2.5 },
      { term: 'classify', weight: 3 },
      { term: 'tag', weight: 2 },
      { term: 'extract', weight: 2.5 },
    ],
  },
  {
    id: 'education_papers',
    label: 'Education, Lesson Plans & Rubrics',
    complexity: 'medium',
    weights: { thinking: 0.24, honesty: 0.2, clarity: 0.3, creativity: 0.16, speed: 0.1 },
    summary: 'Balances crystal-clear pedagogy, accurate curriculum alignment, and engaging structure.',
    keywords: [
      { term: 'question paper', weight: 5 },
      { term: 'chapter notes', weight: 4 },
      { term: 'lesson plan', weight: 4.5 },
      { term: 'rubric', weight: 4 },
      { term: '40 essays', weight: 3.5 },
      { term: 'essay', weight: 2.5 },
      { term: 'kids', weight: 3.5 },
      { term: 'student', weight: 3 },
      { term: 'quiz', weight: 3.5 },
      { term: 'exam', weight: 3.5 },
      { term: 'curriculum', weight: 3.5 },
      { term: 'explain a hard concept', weight: 4 },
      { term: 'simply', weight: 2.5 },
      { term: 'teach', weight: 3 },
      { term: 'classroom', weight: 3 },
    ],
  },
  {
    id: 'marketing_creative',
    label: 'Marketing, Copy & Brand Voice',
    complexity: 'medium',
    weights: { thinking: 0.16, honesty: 0.12, clarity: 0.28, creativity: 0.32, speed: 0.12 },
    summary: 'Elevates originality, punchy phrasing, audience empathy, and zero-slop polish.',
    keywords: [
      { term: 'brochure', weight: 4.5 },
      { term: 'ad hook', weight: 4.5 },
      { term: 'punchy', weight: 3.5 },
      { term: 'variations', weight: 3 },
      { term: 'copy', weight: 3.5 },
      { term: 'launch email', weight: 4 },
      { term: 'marketing', weight: 4 },
      { term: 'brand', weight: 3.5 },
      { term: 'campaign', weight: 3.5 },
      { term: 'tagline', weight: 3.5 },
      { term: 'polish my essay', weight: 3.5 },
      { term: 'ai slop', weight: 3.5 },
      { term: 'newsletter', weight: 3 },
      { term: 'pitch', weight: 3 },
    ],
  },
  {
    id: 'long_document',
    label: 'Long-Document & Research Synthesis',
    complexity: 'high',
    weights: { thinking: 0.3, honesty: 0.28, clarity: 0.24, creativity: 0.08, speed: 0.1 },
    summary: 'Built for dense 60-page PDFs, competitor teardowns, and academic paper distillation.',
    keywords: [
      { term: '60-page', weight: 4.5 },
      { term: 'board report', weight: 4.5 },
      { term: 'pdf', weight: 4 },
      { term: 'competitor strategy', weight: 4.5 },
      { term: 'tear down', weight: 4 },
      { term: 'research paper', weight: 4.5 },
      { term: 'dense', weight: 3.5 },
      { term: 'summarize', weight: 3 },
      { term: 'report', weight: 3 },
      { term: 'whitepaper', weight: 3.5 },
      { term: 'roadmap', weight: 3.5 },
      { term: 'strategy', weight: 3 },
      { term: 'document', weight: 2.5 },
      { term: 'manuscript', weight: 3.5 },
      { term: 'knowledge base', weight: 4 },
      { term: 'rag', weight: 4 },
    ],
  },
  {
    id: 'everyday_comms',
    label: 'Everyday Communication & Planning',
    complexity: 'routine',
    weights: { thinking: 0.15, honesty: 0.15, clarity: 0.34, creativity: 0.18, speed: 0.18 },
    summary: 'Prioritizes human warmth, tactful phrasing, and quick everyday practicality.',
    keywords: [
      { term: 'polite no', weight: 4.5 },
      { term: 'boss', weight: 3.5 },
      { term: 'scope creep', weight: 4 },
      { term: 'push back', weight: 3.5 },
      { term: 'family trip', weight: 4 },
      { term: '5-day', weight: 3.5 },
      { term: 'itinerary', weight: 3.5 },
      { term: 'travel', weight: 3 },
      { term: 'job interview', weight: 4 },
      { term: 'prep me', weight: 3 },
      { term: 'polite', weight: 3 },
      { term: 'reply', weight: 2.5 },
      { term: 'thank you', weight: 2.5 },
      { term: 'warm', weight: 2.5 },
    ],
  },
];

const DEFAULT_PROFILE: TaskProfile = {
  bucket: 'general_balanced',
  label: 'General Studio Brief',
  complexity: 'medium',
  weights: { thinking: 0.28, honesty: 0.22, clarity: 0.24, creativity: 0.14, speed: 0.12 },
  matchedKeywords: [],
  detectedModalities: [],
  summary: 'Balanced mix of judgment, clarity, and sensible turnaround.',
};

export function detectModalitiesFromText(taskText: string): ModalityKey[] {
  const lower = taskText.toLowerCase();
  const detected: ModalityKey[] = [];

  if (
    lower.includes('generate video') ||
    lower.includes('generate a video') ||
    lower.includes('product video') ||
    lower.includes('launch video') ||
    lower.includes('ad reel') ||
    lower.includes('cinema clip') ||
    lower.includes('trailer')
  ) {
    detected.push('videoGen');
  } else if (
    lower.includes('video') ||
    lower.includes('screen recording') ||
    lower.includes('youtube') ||
    lower.includes('footage') ||
    lower.includes('recorded seminar')
  ) {
    detected.push('video');
  }

  if (
    lower.includes('audio') ||
    lower.includes('voice memo') ||
    lower.includes('voice note') ||
    lower.includes('voiceover') ||
    lower.includes('dubbing') ||
    lower.includes('narration') ||
    lower.includes('transcribe') ||
    lower.includes('podcast')
  ) {
    detected.push('audio');
  }

  if (
    lower.includes('screenshot') ||
    lower.includes('photo') ||
    lower.includes('diagram') ||
    lower.includes('chart') ||
    lower.includes('pdf') ||
    lower.includes('dashboard warning')
  ) {
    detected.push('vision');
  }

  if (
    lower.includes('generate hero visual') ||
    lower.includes('hero visual') ||
    lower.includes('generate image') ||
    lower.includes('generate an image') ||
    lower.includes('illustration') ||
    lower.includes('create a poster') ||
    lower.includes('create artwork')
  ) {
    detected.push('imageGen');
  }

  if (
    lower.includes('unit test') ||
    lower.includes('debug') ||
    lower.includes('refactor') ||
    lower.includes('legacy code') ||
    lower.includes('json') ||
    lower.includes('sql') ||
    lower.includes('typescript')
  ) {
    detected.push('code');
  }

  return detected;
}

export function classifyTask(taskText: string): TaskProfile {
  const normalized = taskText.trim().toLowerCase();
  const detectedModalities = detectModalitiesFromText(normalized);
  if (!normalized) return { ...DEFAULT_PROFILE, detectedModalities };

  let bestBucket: BucketDefinition | null = null;
  let bestScore = 0;
  let bestMatches: string[] = [];

  for (const def of BUCKET_DEFINITIONS) {
    let score = 0;
    const matches: string[] = [];
    for (const kw of def.keywords) {
      if (normalized.includes(kw.term)) {
        score += kw.weight;
        matches.push(kw.term);
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestBucket = def;
      bestMatches = matches;
    }
  }

  if (!bestBucket || bestScore === 0) {
    return {
      ...DEFAULT_PROFILE,
      detectedModalities,
      matchedKeywords: normalized.split(/\s+/).slice(0, 3),
    };
  }

  let complexity = bestBucket.complexity;
  if (
    (normalized.includes('cheap') || normalized.includes('quick') || normalized.includes('simple')) &&
    bestBucket.id !== 'legal_audit'
  ) {
    complexity = complexity === 'high' ? 'medium' : 'routine';
  }
  if (
    normalized.includes('gnarly') ||
    normalized.includes('traps') ||
    normalized.includes('board report') ||
    normalized.includes('fact-check')
  ) {
    complexity = 'high';
  }

  return {
    bucket: bestBucket.id,
    label: bestBucket.label,
    complexity,
    weights: bestBucket.weights,
    matchedKeywords: bestMatches,
    detectedModalities,
    summary: bestBucket.summary,
  };
}

function computeSpecialtyBonus(
  candidate: Candidate,
  profile: TaskProfile,
  taskLower: string,
  requiredModalities: ModalityKey[]
): number {
  let bonus = 0;

  // Mild flagship recognition on default text/general tasks so iconic 2026 leads stay memorable
  if (candidate.isFlagship) {
    bonus += 2.5;
  }

  // Dedicated media-generation engines shouldn't outrank general LLMs on text-only tasks
  const isDedicatedMediaEngine =
    candidate.specialtyWing === 'creative_media_gen' && !candidate.modalities.code;
  const isMediaGenRequest =
    requiredModalities.includes('videoGen') ||
    requiredModalities.includes('imageGen') ||
    profile.bucket === 'media_generation';

  if (isDedicatedMediaEngine && !isMediaGenRequest) {
    bonus -= 22;
  }

  if (candidate.id === 'elevenlabs-v3' && !requiredModalities.includes('audio') && profile.bucket !== 'voice_dubbing') {
    bonus -= 20;
  }

  if (requiredModalities.includes('videoGen') && candidate.modalities.videoGen) {
    if (candidate.id === 'veo-3') bonus += 18;
    if (candidate.id === 'sora-2') bonus += 15;
    if (candidate.id === 'nova-reel') bonus += 12;
  }

  if (requiredModalities.includes('video') && candidate.modalities.video) {
    if (candidate.id === 'gemini-4-neon') bonus += 10;
    if (candidate.id === 'gemini-4-hydrogen') bonus += 8;
    if (candidate.id === 'gemini-2-5-pro') bonus += 7;
    if (candidate.id === 'qwen-2-5-vl-72b') bonus += 5;
  }

  if (requiredModalities.includes('imageGen') && candidate.modalities.imageGen) {
    if (candidate.id === 'imagen-4-ultra') bonus += 13;
    if (candidate.id === 'gpt-image-2') bonus += 12;
    if (candidate.id === 'flux-2-pro') bonus += 11;
    if (candidate.id === 'gpt-6-2-sol') bonus += 10;
    if (candidate.id === 'gpt-6-2-astra') bonus += 7;
  }

  if (requiredModalities.includes('audio') && candidate.modalities.audio) {
    if (profile.bucket === 'voice_dubbing' && candidate.id === 'elevenlabs-v3') bonus += 16;
    if (candidate.id === 'gpt-4o-realtime') bonus += 10;
    if (candidate.id === 'gemini-4-neon') bonus += 7;
    if (candidate.id === 'gemini-4-hydrogen') bonus += 6;
    if (candidate.id === 'qwen-2-5-omni') bonus += 5;
  }

  if (profile.bucket === 'bulk_triage') {
    if (candidate.id === 'muse-ember') bonus += 14;
    if (candidate.id === 'nova-micro') bonus += 11;
    if (candidate.id === 'ministral-8b') bonus += 9;
    if (candidate.id === 'gemini-2-5-flash') bonus += 9;
    if (candidate.id === 'claude-haiku-4-5') bonus += 7;
    if (candidate.id === 'deepseek-v4-1-flash' && (taskLower.includes('json') || taskLower.includes('log'))) bonus += 7;
    if (candidate.id === 'gpt-6-luna') bonus += 4;
  }

  if (profile.bucket === 'everyday_comms') {
    if (candidate.id === 'gpt-6-luna' && (taskLower.includes('trip') || taskLower.includes('polite') || taskLower.includes('warm'))) {
      bonus += 11;
    }
    if (candidate.id === 'gpt-6-2-sol') bonus += 6;
    if (candidate.id === 'claude-haiku-4-5') bonus += 5;
  }

  if (profile.bucket === 'education_papers') {
    if (candidate.id === 'gemini-4-hydrogen' && (taskLower.includes('question paper') || taskLower.includes('lesson') || taskLower.includes('chapter'))) {
      bonus += 10;
    }
    if (candidate.id === 'gpt-6-2-sol') bonus += 8;
    if (candidate.id === 'gemini-4-neon') bonus += 3;
  }

  if (profile.bucket === 'marketing_creative') {
    if (candidate.id === 'gemini-4-hydrogen' && taskLower.includes('brochure')) bonus += 8;
    if (candidate.id === 'gpt-6-2-sol') bonus += 7;
    if (candidate.id === 'gpt-6-2-astra') bonus += 5;
    if (candidate.id === 'grok-4') bonus += 4;
  }

  if (profile.bucket === 'long_document') {
    if (candidate.id === 'gemini-4-hydrogen') bonus += 8;
    if (candidate.id === 'gemini-4-neon') bonus += 6;
    if (candidate.id === 'gemini-2-5-pro') bonus += 6;
    if (candidate.id === 'command-a' && (taskLower.includes('rag') || taskLower.includes('citation') || taskLower.includes('knowledge'))) bonus += 10;
    if (candidate.id === 'llama-4-scout') bonus += 6;
    if (candidate.id === 'gpt-6-2-astra' && (taskLower.includes('strategy') || taskLower.includes('board') || taskLower.includes('competitor'))) {
      bonus += 8;
    }
  }

  if (profile.bucket === 'coding_debugging') {
    if (candidate.id === 'gemini-4-neon') bonus += 7;
    if (candidate.id === 'claude-sonnet-4-5') bonus += 9;
    if (candidate.id === 'claude-fable-5-2' && (taskLower.includes('gnarly') || taskLower.includes('architecture'))) bonus += 8;
    if (candidate.id === 'gpt-6-2-sol' && (taskLower.includes('unit test') || taskLower.includes('refactor'))) bonus += 8;
    if (candidate.id === 'qwen-3-coder') bonus += 7;
    if (candidate.id === 'deepseek-v4-1-flash') bonus += 6;
    if (candidate.id === 'codestral-25') bonus += 5;
  }

  if (profile.bucket === 'legal_audit') {
    if (candidate.id === 'claude-fable-5-2') bonus += 11;
    if (candidate.id === 'claude-opus-4-1') bonus += 7;
    if (candidate.id === 'gemini-4-neon') bonus += 6;
    if (candidate.id === 'gpt-6-2-astra') bonus += 6;
    if (candidate.id === 'command-a') bonus += 5;
  }

  return bonus;
}

function getRelevantBenchmarkSourceIds(
  profile: TaskProfile,
  requiredModalities: ModalityKey[],
  winner: Candidate,
  openWeightOnly: boolean
): BenchmarkSourceId[] {
  const ids: BenchmarkSourceId[] = ['artificial_analysis'];

  if (openWeightOnly || winner.license === 'open_weight') {
    ids.push('hf_open_llm');
  }
  if (profile.bucket === 'coding_debugging' || requiredModalities.includes('code')) {
    ids.push('swebench');
  }
  if (
    profile.bucket === 'multimodal_media' ||
    requiredModalities.includes('vision') ||
    requiredModalities.includes('video') ||
    requiredModalities.includes('audio')
  ) {
    ids.push('mmmu_pro');
  }
  if (profile.bucket === 'legal_audit' || profile.bucket === 'long_document') {
    ids.push('stanford_helm', 'livebench');
  }
  if (winner.zone === 'corner_office') {
    ids.push('epoch_ai');
  }
  if (
    profile.bucket === 'marketing_creative' ||
    profile.bucket === 'everyday_comms' ||
    profile.bucket === 'education_papers' ||
    profile.bucket === 'media_generation'
  ) {
    ids.push('lmarena');
  }

  for (const vid of winner.verifiedBenchmarkIds) {
    if (!ids.includes(vid)) ids.push(vid);
  }

  return Array.from(new Set(ids)).slice(0, 4);
}

function buildDynamicSpeech(
  candidate: Candidate,
  status: CandidateFitStatus,
  profile: TaskProfile,
  missingModalities: ModalityKey[],
  stakes: StakesLevel
): string {
  if (status === 'disqualified_modality' && missingModalities.length > 0) {
    const missingNames = missingModalities.map((m) => MODALITY_META[m].shortLabel).join(' & ');
    return `Sitting this out—I don't support native ${missingNames}. Pass this brief to a specialist.`;
  }

  if (status === 'in_sync') {
    const licenseTag = candidate.license === 'open_weight' ? 'open-weight' : candidate.provider;
    return `${licenseTag} pick locked in—${candidate.codename.toLowerCase()} at $${candidate.costPerTaskUsd.toFixed(
      2
    )}/task (${candidate.firstTokenSec}s start).`;
  }

  if (status === 'overqualified') {
    return `You're paying ${candidate.feeTier} ($${candidate.costPerTaskUsd.toFixed(
      2
    )}/task) for routine work—delegate this to the front desk.`;
  }

  if (status === 'stretch') {
    if (stakes === 'right_first_try') {
      return `I'm cheap & fast, but on "Right First Try" stakes you'll pay a review tax auditing my blind spots.`;
    }
    return `I can run a fast draft, but pair me with a Principal audit before shipping.`;
  }

  if (status === 'secondary_sync') {
    return `Strong #2 from ${candidate.provider} if you want a second lab's perspective on this brief.`;
  }

  return candidate.speechBubble;
}

function buildVerdictReason(
  candidate: Candidate,
  status: CandidateFitStatus,
  profile: TaskProfile,
  budget: BudgetLevel,
  stakes: StakesLevel,
  missingModalities: ModalityKey[]
): { title: string; reason: string } {
  const budgetLabel = budget === 'economical' ? 'Economical' : budget === 'balanced' ? 'Balanced' : 'Max';
  const stakesLabel = stakes === 'right_first_try' ? 'Right First Try' : 'Double-Check';

  if (status === 'disqualified_modality' && missingModalities.length > 0) {
    const missingNames = missingModalities.map((m) => MODALITY_META[m].label).join(', ');
    return {
      title: 'Missing Required Modality',
      reason: `${candidate.shortName} (${candidate.provider}) lacks native ${missingNames} support required for this job.`,
    };
  }

  switch (status) {
    case 'in_sync':
      return {
        title: 'Crew Locked In · #1 Match',
        reason: `Top fit across the catalog for ${profile.label} under ${budgetLabel} budget & ${stakesLabel} stakes (${candidate.provider} · $${candidate.costPerTaskUsd.toFixed(
          2
        )}/task).`,
      };
    case 'secondary_sync':
      return {
        title: 'Strong Runner-Up',
        reason: `Dependable alternative from ${candidate.provider} for ${profile.label} at $${candidate.costPerTaskUsd.toFixed(
          2
        )}/task.`,
      };
    case 'overqualified':
      return {
        title: 'Overqualified / Priced Out',
        reason: `Executive ${candidate.feeTier} rate ($${candidate.costPerTaskUsd.toFixed(
          2
        )}/task) is overkill for ${profile.label.toLowerCase()} under ${budgetLabel} budget.`,
      };
    case 'stretch':
      return {
        title: 'Stretch / Needs Supervision',
        reason: `Fast & cheap (${candidate.feeTier}), but carries real supervision risk on ${stakesLabel} ${profile.label.toLowerCase()}—audit with a Principal.`,
      };
    case 'idle':
      return {
        title: 'At Studio Station',
        reason: `Pick a starter job, switch Department Wings, or toggle a modality to see where ${candidate.shortName} wins—and where it sits out.`,
      };
    default:
      return {
        title: 'Available Specialist',
        reason: `Capable ${candidate.provider} model at $${candidate.costPerTaskUsd.toFixed(
          2
        )}/task, edged out by a tighter fit for this exact brief.`,
      };
  }
}

export function computeTeamSplit(
  pool: Candidate[],
  allCandidates: Candidate[],
  resultsById: Record<string, CandidateMatchResult>
): TeamSplitRecommendation {
  const source = pool.length >= 2 ? pool : allCandidates;
  const associates = source.filter((c) => c.zone === 'front_desk');
  const principals = source.filter((c) => c.zone === 'corner_office');

  const assocPool = associates.length > 0 ? associates : allCandidates.filter((c) => c.zone === 'front_desk');
  const princPool = principals.length > 0 ? principals : allCandidates.filter((c) => c.zone === 'corner_office');

  const bestAssociate = [...assocPool].sort(
    (a, b) =>
      (resultsById[b.id]?.finalScore ?? b.traits.speed) -
      (resultsById[a.id]?.finalScore ?? a.traits.speed)
  )[0];

  const bestPrincipal = [...princPool].sort(
    (a, b) =>
      (resultsById[b.id]?.rawTraitScore ?? b.traits.thinking) -
      (resultsById[a.id]?.rawTraitScore ?? a.traits.thinking)
  )[0];

  const associateSharePct = 90;
  const principalSharePct = 10;
  const blendedCostUsd = 0.9 * bestAssociate.costPerTaskUsd + 0.1 * bestPrincipal.costPerTaskUsd;
  const soloPrincipalCostUsd = Math.max(0.01, bestPrincipal.costPerTaskUsd);
  const savingsPct = Math.max(0, Math.round((1 - blendedCostUsd / soloPrincipalCostUsd) * 100));

  return {
    associate: bestAssociate,
    principal: bestPrincipal,
    associateSharePct,
    principalSharePct,
    blendedCostUsd,
    soloPrincipalCostUsd,
    savingsPct,
    headline: `Smart 2-Person Team Split: Assign ${bestAssociate.shortName} (${bestAssociate.provider}) for the 90% first pass + ${bestPrincipal.shortName} (${bestPrincipal.provider}) to audit the final 10% — Save ${savingsPct}% vs. hiring Principal solo`,
    rationale: `Blended cost ~$${blendedCostUsd.toFixed(2)}/task vs. $${soloPrincipalCostUsd.toFixed(
      2
    )}/task solo.`,
  };
}

/**
 * Dynamically casts 8 non-overlapping seats onto the Isometric Studio Floor
 * from all 42 models so the floor never crowds while always showcasing the
 * #1 winner, competing labs, pinned directory model, and instructive contrasts.
 */
function buildFloorCast(
  allCandidates: Candidate[],
  filteredPool: Candidate[],
  rankedIds: string[],
  resultsById: Record<string, CandidateMatchResult>,
  hasActiveTask: boolean,
  specialtyWing: SpecialtyWingId,
  openWeightOnly: boolean,
  pinnedCandidateId: string | null
): FloorCastAssignment[] {
  const byId = new Map(allCandidates.map((c) => [c.id, c]));

  // Default calm idle floor on 'all' wing + all licenses -> show the 8 iconic flagship seats
  if (!hasActiveTask && specialtyWing === 'all' && !openWeightOnly) {
    const seats = FLOOR_SEAT_SLOTS.map((slot) => {
      const candidate = byId.get(slot.defaultFlagshipId) ?? allCandidates[0];
      return {
        candidate,
        seatKey: slot.seatKey,
        seatZone: slot.seatZone,
        x: slot.x,
        y: slot.y,
      };
    });

    // If user pinned a model from the 42-model Roster Directory, swap it into its matching zone
    if (pinnedCandidateId && !seats.some((s) => s.candidate.id === pinnedCandidateId)) {
      const pinned = byId.get(pinnedCandidateId);
      if (pinned) {
        const targetIdx = seats.findIndex((s) => s.seatZone === pinned.zone);
        const idx = targetIdx >= 0 ? targetIdx : 4;
        seats[idx] = { ...seats[idx], candidate: pinned };
      }
    }
    return seats;
  }

  // Active task or filtered wing/open-weight -> smartly select 8 diverse models
  const chosen: Candidate[] = [];
  const labCounts: Record<string, number> = {};

  const tryAdd = (c: Candidate | undefined, maxPerLab = 2) => {
    if (!c) return false;
    if (chosen.length >= 8) return false;
    if (chosen.some((x) => x.id === c.id)) return false;
    const lc = labCounts[c.labId] ?? 0;
    if (lc >= maxPerLab) return false;
    chosen.push(c);
    labCounts[c.labId] = lc + 1;
    return true;
  };

  // 1. Pinned specialist from Directory (if compatible with current pool)
  if (pinnedCandidateId) {
    const pinned = byId.get(pinnedCandidateId);
    if (pinned && (filteredPool.some((p) => p.id === pinned.id) || specialtyWing === 'all')) {
      tryAdd(pinned, 3);
    }
  }

  // 2. Top ranked winners (ensure #1 winner + diverse runners-up from competing labs)
  const rankedCandidates = rankedIds
    .map((id) => byId.get(id))
    .filter((c): c is Candidate => Boolean(c));

  const eligibleRanked = rankedCandidates.filter(
    (c) => resultsById[c.id]?.status !== 'disqualified_modality'
  );

  // Add #1 winner unconditionally
  if (eligibleRanked[0]) {
    tryAdd(eligibleRanked[0], 3);
  }

  // Add top 4-5 eligible contenders favoring lab diversity
  for (const c of eligibleRanked.slice(1)) {
    if (chosen.length >= 6) break;
    tryAdd(c, 2);
  }

  // 3. Add 1-2 instructive contrast specialists (disqualified modality / overqualified / stretch)
  // so the floor visually teaches WHY certain labs sit out or are overkill!
  const contrastCandidates = rankedCandidates.filter((c) => {
    const st = resultsById[c.id]?.status;
    return st === 'disqualified_modality' || st === 'overqualified' || st === 'stretch';
  });

  // Prefer iconic flagships for contrast so users recognize famous models sitting out (e.g. Claude Fable on Video!)
  const sortedContrast = [...contrastCandidates].sort((a, b) => {
    const fa = a.isFlagship ? 1 : 0;
    const fb = b.isFlagship ? 1 : 0;
    if (fb !== fa) return fb - fa;
    return b.aaIndex - a.aaIndex;
  });

  for (const c of sortedContrast) {
    if (chosen.length >= 8) break;
    tryAdd(c, 2);
  }

  // 4. Fill any remaining seats from filteredPool first, then allCandidates
  for (const c of rankedCandidates) {
    if (chosen.length >= 8) break;
    tryAdd(c, 4);
  }
  for (const c of allCandidates) {
    if (chosen.length >= 8) break;
    tryAdd(c, 4);
  }

  // Assign the 8 chosen models to the 8 architectural seats matching their natural zones best
  const remaining = [...chosen];
  const assigned: Array<FloorCastAssignment | null> = FLOOR_SEAT_SLOTS.map(() => null);

  // First pass: exact zone matches
  FLOOR_SEAT_SLOTS.forEach((slot, idx) => {
    const matchIdx = remaining.findIndex((c) => c.zone === slot.seatZone);
    if (matchIdx >= 0) {
      const [picked] = remaining.splice(matchIdx, 1);
      assigned[idx] = {
        candidate: picked,
        seatKey: slot.seatKey,
        seatZone: slot.seatZone,
        x: slot.x,
        y: slot.y,
      };
    }
  });

  // Second pass: place any overflow into open architectural seats
  FLOOR_SEAT_SLOTS.forEach((slot, idx) => {
    if (!assigned[idx] && remaining.length > 0) {
      const picked = remaining.shift()!;
      assigned[idx] = {
        candidate: picked,
        seatKey: slot.seatKey,
        seatZone: slot.seatZone,
        x: slot.x,
        y: slot.y,
      };
    }
  });

  return assigned.filter((a): a is FloorCastAssignment => a !== null);
}

export function evaluateHall(
  allCandidates: Candidate[],
  taskText: string,
  budget: BudgetLevel,
  stakes: StakesLevel,
  selectedModalities: ModalityKey[] = [],
  specialtyWing: SpecialtyWingId = 'all',
  openWeightOnly: boolean = false,
  pinnedCandidateId: string | null = null
): HallMatchEvaluation {
  const trimmed = taskText.trim();
  const taskProfile = classifyTask(trimmed);
  const requiredModalities = Array.from(
    new Set<ModalityKey>([...selectedModalities, ...taskProfile.detectedModalities])
  );

  // Filter catalog by Department Wing and Open-Weight toggle
  const filteredPool = allCandidates.filter((c) => {
    if (specialtyWing !== 'all' && c.specialtyWing !== specialtyWing) return false;
    if (openWeightOnly && c.license !== 'open_weight') return false;
    return true;
  });

  const activePool = filteredPool.length > 0 ? filteredPool : allCandidates;
  const hasActiveTask = trimmed.length > 0 || selectedModalities.length > 0;
  const taskLower = trimmed.toLowerCase();

  if (!hasActiveTask) {
    const idleResults: Record<string, CandidateMatchResult> = {};
    for (const c of allCandidates) {
      const verdict = buildVerdictReason(c, 'idle', taskProfile, budget, stakes, []);
      idleResults[c.id] = {
        candidateId: c.id,
        rawTraitScore: Math.round(
          c.traits.thinking * 0.28 +
            c.traits.honesty * 0.22 +
            c.traits.clarity * 0.24 +
            c.traits.creativity * 0.14 +
            c.traits.speed * 0.12
        ),
        finalScore: 0,
        status: 'idle',
        statusLabel: 'AT DESK',
        verdictTitle: verdict.title,
        verdictReason: verdict.reason,
        dynamicSpeech: c.speechBubble,
        budgetAdjustment: 0,
        stakesAdjustment: 0,
        missingModalities: [],
      };
    }

    const sortedIdleIds = [...activePool]
      .sort((a, b) => b.aaIndex - a.aaIndex)
      .map((c) => c.id);

    const floorCast = buildFloorCast(
      allCandidates,
      activePool,
      sortedIdleIds,
      idleResults,
      false,
      specialtyWing,
      openWeightOnly,
      pinnedCandidateId
    );

    const muse =
      activePool.find((c) => c.id === 'muse-ember') ??
      activePool.find((c) => c.zone === 'front_desk') ??
      allCandidates[allCandidates.length - 1];
    const fable =
      activePool.find((c) => c.id === 'claude-fable-5-2') ??
      activePool.find((c) => c.zone === 'corner_office') ??
      allCandidates[0];
    const blended = 0.9 * muse.costPerTaskUsd + 0.1 * fable.costPerTaskUsd;
    const savingsPct = Math.max(0, Math.round((1 - blended / Math.max(0.01, fable.costPerTaskUsd)) * 100));

    return {
      hasActiveTask: false,
      totalCatalogCount: allCandidates.length,
      filteredPoolCount: activePool.length,
      taskProfile,
      requiredModalities: [],
      winnerId: null,
      winnerReasoning: null,
      resultsById: idleResults,
      rankedIds: sortedIdleIds,
      floorCast,
      teamSplit: {
        associate: muse,
        principal: fable,
        associateSharePct: 90,
        principalSharePct: 10,
        blendedCostUsd: blended,
        soloPrincipalCostUsd: fable.costPerTaskUsd,
        savingsPct,
        headline: `Smart 2-Person Team Split: Assign ${muse.shortName} (${muse.provider}) for the 90% first pass + ${fable.shortName} (${fable.provider}) to audit the final 10% — Save ${savingsPct}% vs. hiring Principal solo`,
        rationale: `Blended cost ~$${blended.toFixed(2)}/task vs. $${fable.costPerTaskUsd.toFixed(
          2
        )}/task solo.`,
      },
      formulaDescription:
        'Score = Wing/LicenseFilter × ModalityGate(req) × [Σ(trait_i × w_i) + BudgetMod + StakesMod]',
    };
  }

  const effectiveProfile: TaskProfile =
    trimmed.length === 0 && requiredModalities.length > 0
      ? {
          ...taskProfile,
          bucket: requiredModalities.includes('videoGen') || requiredModalities.includes('imageGen')
            ? 'media_generation'
            : 'multimodal_media',
          label: `${requiredModalities.map((m) => MODALITY_META[m].shortLabel).join(' + ')} Crew Filter`,
          complexity: 'medium',
          summary: `Filtering ${activePool.length} specialists for native ${requiredModalities
            .map((m) => MODALITY_META[m].label)
            .join(' & ')} capability.`,
        }
      : taskProfile;

  const w = effectiveProfile.weights;
  const scoreCandidate = (c: Candidate) => {
    const missingModalities = requiredModalities.filter((m) => !c.modalities[m]);

    const rawTraitScore =
      c.traits.thinking * w.thinking +
      c.traits.honesty * w.honesty +
      c.traits.clarity * w.clarity +
      c.traits.creativity * w.creativity +
      c.traits.speed * w.speed;

    let budgetAdjustment = 0;
    let stakesAdjustment = 0;
    let forcedStatus: CandidateFitStatus | null = null;

    if (budget === 'economical') {
      if (c.feeTier === '$$$$') {
        budgetAdjustment = effectiveProfile.complexity === 'high' ? -18 : -34;
      } else if (c.feeTier === '$$$') {
        budgetAdjustment = effectiveProfile.complexity === 'high' ? -8 : -22;
      } else if (c.feeTier === '$$') {
        budgetAdjustment = effectiveProfile.complexity === 'routine' ? -10 : -2;
      } else if (c.feeTier === '$') {
        budgetAdjustment = effectiveProfile.complexity === 'routine' ? 4 : 9;
      } else if (c.feeTier === '¢') {
        budgetAdjustment = effectiveProfile.complexity === 'routine' ? 16 : 6;
      }
    } else if (budget === 'balanced') {
      if (c.feeTier === '$$$$') {
        budgetAdjustment = effectiveProfile.complexity === 'high' ? -3 : -20;
      } else if (c.feeTier === '$$$') {
        budgetAdjustment = effectiveProfile.complexity === 'high' ? 2 : -10;
      } else if (c.feeTier === '$$') {
        budgetAdjustment = effectiveProfile.complexity === 'routine' ? -4 : 5;
      } else if (c.feeTier === '$') {
        budgetAdjustment = 7;
      } else if (c.feeTier === '¢') {
        budgetAdjustment = effectiveProfile.complexity === 'routine' ? 10 : -2;
      }
    } else {
      if (c.zone === 'corner_office') {
        budgetAdjustment = effectiveProfile.complexity === 'routine' ? -4 : 8;
      } else if (c.zone === 'mid_level') {
        budgetAdjustment = 2;
      } else {
        budgetAdjustment = effectiveProfile.complexity === 'routine' ? 4 : -6;
      }
    }

    if (stakes === 'right_first_try') {
      if (
        effectiveProfile.complexity === 'high' ||
        effectiveProfile.bucket === 'legal_audit' ||
        effectiveProfile.bucket === 'coding_debugging'
      ) {
        if (c.zone === 'front_desk') {
          stakesAdjustment = -32;
          forcedStatus = 'stretch';
        } else if (c.zone === 'mid_level') {
          stakesAdjustment = c.id === 'deepseek-v4-1-flash' ? -10 : -3;
        } else if (c.zone === 'corner_office') {
          stakesAdjustment = 14;
        }
      } else if (effectiveProfile.complexity === 'medium') {
        if (c.zone === 'front_desk') {
          stakesAdjustment = -16;
          forcedStatus = 'stretch';
        } else if (c.zone === 'corner_office') {
          stakesAdjustment = 6;
        }
      } else if (c.traits.honesty < 68) {
        stakesAdjustment = -6;
      }
    } else {
      if (c.zone === 'mid_level') stakesAdjustment = 4;
      if (c.zone === 'front_desk' && effectiveProfile.complexity !== 'high') stakesAdjustment = 4;
      if (c.zone === 'front_desk' && effectiveProfile.complexity === 'high') {
        stakesAdjustment = -14;
        forcedStatus = 'stretch';
      }
    }

    if (
      (effectiveProfile.complexity === 'routine' ||
        effectiveProfile.bucket === 'bulk_triage' ||
        effectiveProfile.bucket === 'everyday_comms') &&
      (c.feeTier === '$$$$' || (budget === 'economical' && c.feeTier === '$$$'))
    ) {
      forcedStatus = 'overqualified';
    }
    if (budget === 'economical' && c.feeTier === '$$$$' && effectiveProfile.complexity !== 'high') {
      forcedStatus = 'overqualified';
    }
    if (
      c.feeTier === '$$$$' &&
      effectiveProfile.complexity === 'medium' &&
      stakes === 'double_check' &&
      budget !== 'max'
    ) {
      forcedStatus = 'overqualified';
    }

    if (missingModalities.length > 0) {
      forcedStatus = 'disqualified_modality';
    }

    const specialtyBonus = computeSpecialtyBonus(c, effectiveProfile, taskLower, requiredModalities);
    const modalityPenalty = missingModalities.length > 0 ? -60 * missingModalities.length : 0;
    const finalScore =
      Math.round(
        (rawTraitScore + budgetAdjustment + stakesAdjustment + specialtyBonus + modalityPenalty) * 10
      ) / 10;

    return {
      candidate: c,
      rawTraitScore: Math.round(rawTraitScore * 10) / 10,
      budgetAdjustment,
      stakesAdjustment,
      finalScore,
      forcedStatus,
      missingModalities,
    };
  };

  // Score ALL 42 models so clicking any model in Directory has a valid result,
  // while selecting the #1 winner strictly from `activePool`!
  const allScored = allCandidates.map(scoreCandidate);
  const poolIdSet = new Set(activePool.map((c) => c.id));
  const poolScored = allScored.filter((s) => poolIdSet.has(s.candidate.id));

  const sortScored = (
    a: ReturnType<typeof scoreCandidate>,
    b: ReturnType<typeof scoreCandidate>
  ) => {
    const rankTier = (s: CandidateFitStatus | null) =>
      s === 'disqualified_modality' ? 2 : s === 'overqualified' || s === 'stretch' ? 1 : 0;
    const diff = rankTier(a.forcedStatus) - rankTier(b.forcedStatus);
    if (diff !== 0) return diff;
    return b.finalScore - a.finalScore;
  };

  poolScored.sort(sortScored);
  allScored.sort(sortScored);

  const winner = poolScored[0];
  const hasEligibleWinner = Boolean(winner && winner.missingModalities.length === 0);
  const runnerUp =
    poolScored.length > 1 && poolScored[1].missingModalities.length === 0 ? poolScored[1] : null;

  const resultsById: Record<string, CandidateMatchResult> = {};

  allScored.forEach((entry) => {
    let status: CandidateFitStatus;
    if (entry.missingModalities.length > 0) {
      status = 'disqualified_modality';
    } else if (hasEligibleWinner && entry.candidate.id === winner.candidate.id) {
      status = 'in_sync';
    } else if (entry.forcedStatus) {
      status = entry.forcedStatus;
    } else if (
      hasEligibleWinner &&
      poolIdSet.has(entry.candidate.id) &&
      winner.finalScore - entry.finalScore <= 9
    ) {
      status = 'secondary_sync';
    } else if (entry.candidate.zone === 'front_desk' && effectiveProfile.complexity === 'high') {
      status = 'stretch';
    } else if (
      entry.candidate.feeTier === '$$$$' &&
      budget === 'economical' &&
      hasEligibleWinner &&
      entry.finalScore < winner.finalScore - 10
    ) {
      status = 'overqualified';
    } else if (
      hasEligibleWinner &&
      entry.finalScore < winner.finalScore - 20 &&
      entry.candidate.zone === 'front_desk'
    ) {
      status = 'stretch';
    } else {
      status = 'neutral';
    }

    const statusLabel =
      status === 'disqualified_modality'
        ? MODALITY_META[entry.missingModalities[0]].missingBadge
        : status === 'in_sync' || status === 'secondary_sync'
        ? 'IN-SYNC'
        : status === 'stretch'
        ? 'NEEDS REVIEW'
        : status === 'overqualified'
        ? 'OVERQUALIFIED'
        : 'AVAILABLE';

    const verdict = buildVerdictReason(
      entry.candidate,
      status,
      effectiveProfile,
      budget,
      stakes,
      entry.missingModalities
    );
    const dynamicSpeech = buildDynamicSpeech(
      entry.candidate,
      status,
      effectiveProfile,
      entry.missingModalities,
      stakes
    );

    resultsById[entry.candidate.id] = {
      candidateId: entry.candidate.id,
      rawTraitScore: entry.rawTraitScore,
      finalScore: entry.finalScore,
      status,
      statusLabel,
      verdictTitle: verdict.title,
      verdictReason: verdict.reason,
      dynamicSpeech,
      budgetAdjustment: entry.budgetAdjustment,
      stakesAdjustment: entry.stakesAdjustment,
      missingModalities: entry.missingModalities,
    };
  });

  let winnerReasoning: WinnerReasoning | null = null;
  if (hasEligibleWinner && winner) {
    const wCand = winner.candidate;
    const rCand = runnerUp?.candidate ?? null;
    const margin = rCand
      ? Math.max(0.3, Math.round((winner.finalScore - runnerUp!.finalScore) * 10) / 10)
      : 0;

    const costDeltaSummary = rCand
      ? wCand.costPerTaskUsd < rCand.costPerTaskUsd
        ? `Saves $${(rCand.costPerTaskUsd - wCand.costPerTaskUsd).toFixed(2)}/task vs. ${rCand.shortName}`
        : wCand.costPerTaskUsd > rCand.costPerTaskUsd
        ? `+$${(wCand.costPerTaskUsd - rCand.costPerTaskUsd).toFixed(2)}/task over ${rCand.shortName} for higher accuracy`
        : `Same $${wCand.costPerTaskUsd.toFixed(2)}/task tier as ${rCand.shortName}`
      : `$${wCand.costPerTaskUsd.toFixed(2)}/task (${wCand.feeTier})`;

    const speedDeltaSummary = rCand
      ? wCand.firstTokenSec < rCand.firstTokenSec
        ? `${(rCand.firstTokenSec / Math.max(1, wCand.firstTokenSec)).toFixed(1)}× faster first token than ${rCand.shortName} (${wCand.firstTokenSec}s vs ${rCand.firstTokenSec}s)`
        : `${wCand.firstTokenSec}s first token (${wCand.seniorityLabel} pace)`
      : `${wCand.firstTokenSec}s first token`;

    const reasons: string[] = [];
    if (requiredModalities.length > 0) {
      reasons.push(
        `Passed native modality gate across ${activePool.length} models: supports ${requiredModalities
          .map((m) => MODALITY_META[m].label)
          .join(' + ')} natively.`
      );
    } else {
      reasons.push(
        `${wCand.provider}'s ${wCand.codename.toLowerCase()} scored #1 of ${activePool.length} (${winner.rawTraitScore.toFixed(
          0
        )}/100 on ${effectiveProfile.label} weights · AA Index ${wCand.aaIndex}).`
      );
    }

    if (rCand) {
      reasons.push(
        `Edged out #2 ${rCand.shortName} (${rCand.provider}) by +${margin.toFixed(
          1
        )} pts — ${costDeltaSummary.toLowerCase()}.`
      );
    } else {
      reasons.push(`Sole specialist in this pool satisfying every active modality gate simultaneously.`);
    }

    reasons.push(
      `Matched your ${budget === 'economical' ? 'Economical' : budget === 'balanced' ? 'Balanced' : 'Max'} budget & ${
        stakes === 'right_first_try' ? 'Right First Try' : 'Double-Check'
      } stakes (${speedDeltaSummary}${wCand.license === 'open_weight' ? ' · Open-Weight' : ''}).`
    );

    const disqualifiedCount = poolScored.filter((s) => s.missingModalities.length > 0).length;
    const disqualifiedSample = poolScored
      .filter((s) => s.missingModalities.length > 0)
      .slice(0, 2)
      .map((s) => `${s.candidate.shortName} (${MODALITY_META[s.missingModalities[0]].missingBadge.toLowerCase()})`);

    const overqualifiedCount = poolScored.filter(
      (s) => resultsById[s.candidate.id].status === 'overqualified'
    ).length;
    const stretchCount = poolScored.filter(
      (s) => resultsById[s.candidate.id].status === 'stretch'
    ).length;

    const ruledOutParts: string[] = [];
    if (disqualifiedCount > 0) {
      ruledOutParts.push(
        `Ruled out on modalities (${disqualifiedCount}): ${disqualifiedSample.join(', ')}${
          disqualifiedCount > 2 ? ` +${disqualifiedCount - 2} more` : ''
        }`
      );
    }
    if (overqualifiedCount > 0) {
      ruledOutParts.push(`${overqualifiedCount} priced out / overqualified`);
    }
    if (stretchCount > 0) {
      ruledOutParts.push(`${stretchCount} front-desk models flagged Needs Review`);
    }

    winnerReasoning = {
      winnerId: wCand.id,
      runnerUpId: rCand?.id ?? null,
      runnerUpName: rCand?.shortName ?? null,
      scoreMargin: margin,
      costDeltaSummary,
      speedDeltaSummary,
      reasons,
      ruledOutSummary:
        ruledOutParts.length > 0
          ? ruledOutParts.join(' · ')
          : `All ${activePool.length} specialists in this wing were eligible; ranked by trait fit, cost & stakes.`,
      benchmarkSourceIds: getRelevantBenchmarkSourceIds(
        effectiveProfile,
        requiredModalities,
        wCand,
        openWeightOnly
      ),
    };
  }

  const rankedIds = poolScored.map((s) => s.candidate.id);
  const floorCast = buildFloorCast(
    allCandidates,
    activePool,
    rankedIds,
    resultsById,
    true,
    specialtyWing,
    openWeightOnly,
    pinnedCandidateId
  );

  const teamSplit = computeTeamSplit(activePool, allCandidates, resultsById);
  const wStr = `T:${Math.round(w.thinking * 100)}% H:${Math.round(w.honesty * 100)}% Cl:${Math.round(
    w.clarity * 100
  )}% Cr:${Math.round(w.creativity * 100)}% Sp:${Math.round(w.speed * 100)}%`;

  return {
    hasActiveTask: true,
    totalCatalogCount: allCandidates.length,
    filteredPoolCount: activePool.length,
    taskProfile: effectiveProfile,
    requiredModalities,
    winnerId: hasEligibleWinner && winner ? winner.candidate.id : null,
    winnerReasoning,
    resultsById,
    rankedIds,
    floorCast,
    teamSplit,
    formulaDescription: `Pool=${activePool.length}/${allCandidates.length} · Weights [${wStr}] · Req=[${
      requiredModalities.length > 0 ? requiredModalities.join(',') : 'text'
    }] · Budget=${budget.toUpperCase()} · Stakes=${stakes.toUpperCase()}`,
  };
}
