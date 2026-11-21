import flagshipCandidatesRaw from './candidates.json';
import benchmarkSourcesRaw from './benchmarks.json';
import { ECOSYSTEM_MODELS } from './ecosystemModels';
import { BenchmarkSource, BenchmarkSourceId, Candidate } from '../types';

export const FLAGSHIP_CANDIDATES: Candidate[] = flagshipCandidatesRaw as Candidate[];
export const ALL_CANDIDATES: Candidate[] = [...FLAGSHIP_CANDIDATES, ...ECOSYSTEM_MODELS];
export const FLAGSHIP_IDS: string[] = FLAGSHIP_CANDIDATES.map((c) => c.id);

export const BENCHMARK_SOURCES: BenchmarkSource[] = benchmarkSourcesRaw as BenchmarkSource[];
export const BENCHMARK_BY_ID: Record<BenchmarkSourceId, BenchmarkSource> = BENCHMARK_SOURCES.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<BenchmarkSourceId, BenchmarkSource>
);

export interface IdleBanterPair {
  id: string;
  speakerAIds?: string[];
  speakerBIds?: string[];
  lineA: string;
  lineB: string;
}

/**
 * Living Studio idle banter scripts. When idle, the Ambient Life Director matches
 * pairs currently seated on the 8-seat studio floor (or falls back to universal scripts)
 * so the office feels alive with cross-lab camaraderie & subtle educational rivalry.
 */
export const IDLE_BANTER_SCRIPTS: IdleBanterPair[] = [
  {
    id: 'fable-vs-neon',
    speakerAIds: ['claude-fable-5-2', 'claude-opus-4-1'],
    speakerBIds: ['gemini-4-neon', 'gemini-2-5-pro'],
    lineA: 'Still bragging about native video? Wait till a sneaky lease hits the desk.',
    lineB: 'Deal—you audit the clauses, I’ll break down the 2-hour seminar video!',
  },
  {
    id: 'ember-vs-fable',
    speakerAIds: ['muse-ember', 'nova-micro', 'ministral-8b'],
    speakerBIds: ['claude-fable-5-2', 'openai-o3-pro', 'gpt-6-2-astra'],
    lineA: 'Cleared 800 support emails before your espresso cooled!',
    lineB: 'Impressive speed—just send the tricky 10% upstairs before hitting send.',
  },
  {
    id: 'deepseek-vs-sol',
    speakerAIds: ['deepseek-v4-1-flash', 'deepseek-r2', 'qwen-3-coder'],
    speakerBIds: ['gpt-6-2-sol', 'claude-sonnet-4-5'],
    lineA: 'Zero image fluff, pure code & open weights at a fraction of the bill.',
    lineB: 'Fair—until the client drops a UI screenshot or voice memo in the brief.',
  },
  {
    id: 'hydrogen-vs-astra',
    speakerAIds: ['gemini-4-hydrogen', 'llama-4-scout'],
    speakerBIds: ['gpt-6-2-astra', 'grok-4'],
    lineA: 'Just swallowed a 90-page board deck in one gulp—coffee break?',
    lineB: 'Save me a cup—I’m mapping the Q4 counter-strategy right now.',
  },
  {
    id: 'luna-vs-ember',
    speakerAIds: ['gpt-6-luna', 'claude-haiku-4-5'],
    speakerBIds: ['muse-ember', 'gemini-2-5-flash'],
    lineA: 'A polite “no” takes warmth, not just 200 tokens per second!',
    lineB: 'Haha, you charm the boss—I’ll sort the 1,000 inbox tickets.',
  },
  {
    id: 'media-gen-banter',
    speakerAIds: ['veo-3', 'sora-2', 'nova-reel'],
    speakerBIds: ['imagen-4-ultra', 'flux-2-pro', 'gpt-image-2'],
    lineA: 'Storyboard locked—rendering 1080p launch footage with camera pan.',
    lineB: 'Send me the hero frame—I’ll nail the poster typography in 5 seconds.',
  },
  {
    id: 'open-weight-alliance',
    speakerAIds: ['llama-4-maverick', 'mistral-large-3', 'qwen-3-max'],
    speakerBIds: ['deepseek-r2', 'llama-4-behemoth', 'command-r-plus'],
    lineA: 'Self-hosted open weights keep every private doc inside the VPC.',
    lineB: 'And zero per-seat markup—let’s see who claims the rug next.',
  },
  {
    id: 'universal-coffee',
    lineA: 'Fresh Vice Roast is brewing—quiet floor until the next brief drops.',
    lineB: 'Good! Let’s compare SWE-bench & LMArena numbers while we wait.',
  },
  {
    id: 'universal-split',
    lineA: 'Reminder: 90% Front Desk + 10% Principal audit saves over 80%!',
    lineB: 'Best heist math in the building—nobody needs $9/task for sorting mail.',
  },
];
