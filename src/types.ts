export type ZoneId = 'front_desk' | 'mid_level' | 'corner_office';
export type Seniority = 'associate' | 'specialist' | 'principal';
export type FeeTier = '¢' | '$' | '$$' | '$$$' | '$$$$';
export type BudgetLevel = 'economical' | 'balanced' | 'max';
export type StakesLevel = 'double_check' | 'right_first_try';
export type ViewMode = 'normal' | 'directory' | 'blueprint';

export type TraitKey = 'thinking' | 'honesty' | 'clarity' | 'creativity' | 'speed';

export type LabId =
  | 'anthropic'
  | 'google'
  | 'openai'
  | 'deepseek'
  | 'meta'
  | 'xai'
  | 'mistral'
  | 'qwen'
  | 'cohere'
  | 'amazon'
  | 'media_labs';

export type SpecialtyWingId =
  | 'all'
  | 'reasoning_audit'
  | 'coding_agents'
  | 'multimodal_vision_video'
  | 'creative_media_gen'
  | 'voice_audio'
  | 'bulk_triage'
  | 'enterprise_rag';

export type LicenseType = 'proprietary_api' | 'open_weight';

export type ModalityKey = 'vision' | 'video' | 'audio' | 'code' | 'imageGen' | 'videoGen';

export interface CandidateModalities {
  text: boolean;
  vision: boolean;
  video: boolean;
  audio: boolean;
  code: boolean;
  imageGen: boolean;
  videoGen: boolean;
}

export type BenchmarkSourceId =
  | 'artificial_analysis'
  | 'lmarena'
  | 'swebench'
  | 'livebench'
  | 'mmmu_pro'
  | 'stanford_helm'
  | 'hf_open_llm'
  | 'epoch_ai';

export interface BenchmarkSource {
  id: BenchmarkSourceId;
  name: string;
  organization: string;
  url: string;
  metricFocus: string;
  whatItMeasures: string;
  whyTrustIt: string;
  knownBlindSpot: string;
  bestForTasks: string;
}

export interface CandidateBenchmarkScores {
  aaIndex: number;
  codingScore: string;
  multimodalScore: string;
  gpqaScore: string;
}

export type TaskBucketId =
  | 'legal_audit'
  | 'coding_debugging'
  | 'education_papers'
  | 'marketing_creative'
  | 'long_document'
  | 'bulk_triage'
  | 'everyday_comms'
  | 'multimodal_media'
  | 'media_generation'
  | 'voice_dubbing'
  | 'general_balanced';

export type DilemmaId = 'sunday_overtime' | 'lease_clause';

export type AmbientPose =
  | 'typing'
  | 'sketching'
  | 'sipping_coffee'
  | 'walking_to_coffee'
  | 'chatting'
  | 'checking_watch'
  | 'walking_to_rug'
  | 'waving_rug'
  | 'leaning_back';

export interface CandidateTraits {
  thinking: number;
  honesty: number;
  clarity: number;
  creativity: number;
  speed: number;
}

export interface CandidateAppearance {
  skinTone: string;
  hairColor: string;
  hairStyle:
    | 'silver_part'
    | 'cropped_fade'
    | 'neat_bob'
    | 'wavy_bun'
    | 'short_sweep'
    | 'glasses_part'
    | 'ponytail'
    | 'curly_crop';
  shirtColor: string;
  accentColor: string;
  pantsColor: string;
  hasGlasses?: boolean;
  hasBeard?: boolean;
  prop:
    | 'fountain_pen'
    | 'tablet'
    | 'strategy_chart'
    | 'drafting_pen'
    | 'binder'
    | 'laptop'
    | 'stopwatch'
    | 'clipboard';
}

export interface TrialShiftSample {
  response: string;
  editorialNote: string;
  approachTag: string;
}

export interface Candidate {
  id: string;
  name: string;
  shortName: string;
  codename: string;
  provider: string;
  labId: LabId;
  labColor: string;
  specialtyWing: Exclude<SpecialtyWingId, 'all'>;
  license: LicenseType;
  isFlagship?: boolean;
  launchedLabel: string;
  zone: ZoneId;
  seniority: Seniority;
  seniorityLabel: string;
  title: string;
  badge?: string;
  feeTier: FeeTier;
  costPerTaskUsd: number;
  aaIndex: number;
  firstTokenSec: number;
  contextWindow: string;
  traits: CandidateTraits;
  modalities: CandidateModalities;
  bestFor: string[];
  avoidFor: string[];
  benchmarkScores: CandidateBenchmarkScores;
  verifiedBenchmarkIds: BenchmarkSourceId[];
  watchOutFor: string;
  speechBubble: string;
  appearance: CandidateAppearance;
  deskSlot: number;
  trialShifts: Record<DilemmaId, TrialShiftSample>;
}

export interface RoleDefinition {
  id: string;
  label: string;
  shortLabel: string;
  tagline: string;
  iconKey: 'book' | 'code' | 'megaphone' | 'briefcase' | 'graduation' | 'coffee';
  starterChips: string[];
  defaultBucket: TaskBucketId;
}

export type CandidateFitStatus =
  | 'idle'
  | 'in_sync'
  | 'secondary_sync'
  | 'stretch'
  | 'overqualified'
  | 'disqualified_modality'
  | 'neutral';

export interface CandidateMatchResult {
  candidateId: string;
  rawTraitScore: number;
  finalScore: number;
  status: CandidateFitStatus;
  statusLabel: string;
  verdictTitle: string;
  verdictReason: string;
  dynamicSpeech: string;
  budgetAdjustment: number;
  stakesAdjustment: number;
  missingModalities: ModalityKey[];
}

export interface TaskProfile {
  bucket: TaskBucketId;
  label: string;
  complexity: 'routine' | 'medium' | 'high';
  weights: CandidateTraits;
  matchedKeywords: string[];
  detectedModalities: ModalityKey[];
  summary: string;
}

export interface WinnerReasoning {
  winnerId: string;
  runnerUpId: string | null;
  runnerUpName: string | null;
  scoreMargin: number;
  costDeltaSummary: string;
  speedDeltaSummary: string;
  reasons: string[];
  ruledOutSummary: string;
  benchmarkSourceIds: BenchmarkSourceId[];
}

export interface TeamSplitRecommendation {
  associate: Candidate;
  principal: Candidate;
  associateSharePct: number;
  principalSharePct: number;
  blendedCostUsd: number;
  soloPrincipalCostUsd: number;
  savingsPct: number;
  headline: string;
  rationale: string;
}

export interface FloorCastAssignment {
  candidate: Candidate;
  seatKey: string;
  seatZone: ZoneId;
  x: number;
  y: number;
}

export interface HallMatchEvaluation {
  hasActiveTask: boolean;
  totalCatalogCount: number;
  filteredPoolCount: number;
  taskProfile: TaskProfile;
  requiredModalities: ModalityKey[];
  winnerId: string | null;
  winnerReasoning: WinnerReasoning | null;
  resultsById: Record<string, CandidateMatchResult>;
  rankedIds: string[];
  floorCast: FloorCastAssignment[];
  teamSplit: TeamSplitRecommendation;
  formulaDescription: string;
}
