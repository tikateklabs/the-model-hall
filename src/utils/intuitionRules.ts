import { Candidate, HallMatchEvaluation, ModalityKey, TaskBucketId } from '../types';
import { MODALITY_META } from '../engine/matcher';

export interface IntuitionInsight {
  archetypeLabel: string;
  whyItFits: string;
  ruleHeadline: string;
  ruleBody: string;
}

const BUCKET_RULES: Record<TaskBucketId, { headline: string; body: string }> = {
  legal_audit: {
    headline: 'High-stakes reading needs a Deep Thinker, not a sprinter.',
    body: 'When one missed clause or subtle contradiction could cost you money, hire a Corner-Office Principal that trades a few extra seconds for careful, honest verification.',
  },
  coding_debugging: {
    headline: 'Match coding tasks to specialists built for multi-file logic.',
    body: 'Quick models draft snippets fast, but tracking gnarly bugs across an architecture needs high thinking + honesty scores so the model admits edge cases instead of guessing.',
  },
  education_papers: {
    headline: 'Pair long reading with a patient explainer.',
    body: 'For dense research papers or study guides, prioritize clarity and large reading memory (context window) so nothing gets dropped halfway through the document.',
  },
  marketing_creative: {
    headline: 'Creative polish comes from balanced workhorses, not rigid auditors.',
    body: 'For campaigns, brand voice, and fresh angles, a Mid-Level Specialist with high creativity and clarity beats pricey reasoning models that can sound stiff.',
  },
  long_document: {
    headline: 'Check reading memory (context) before hiring for big files.',
    body: 'When dropping in whole reports, slide decks, or books, pick a specialist with a 1M+ context window so it reads every page together instead of skimming.',
  },
  bulk_triage: {
    headline: 'Never hire a senior partner to sort everyday mail.',
    body: 'For sorting hundreds of emails, tagging receipts, or quick summaries, a penny-tier Front-Desk Associate finishes in seconds at 90% lower cost.',
  },
  everyday_comms: {
    headline: 'All-round workhorses win 80% of daily writing tasks.',
    body: 'For emails, meeting notes, and clear explanations, Mid-Level Specialists hit the sweet spot—warm tone, strong clarity, fast replies, and sensible cost.',
  },
  multimodal_media: {
    headline: 'Not every AI can actually watch video or hear audio.',
    body: 'Many top text models are blind to video clips and audio tracks. Always check native multimodal support first—a specialist with native video/audio sees what text-only models miss.',
  },
  media_generation: {
    headline: 'Creating images or video requires a dedicated Media Studio.',
    body: 'Chat models write prompts, but generating crisp posters or cinema reels belongs to dedicated Image Gen and Video Gen specialists built specifically for pixels and motion.',
  },
  voice_dubbing: {
    headline: 'Real voice work needs native audio—not clunky text-to-speech.',
    body: 'For dubbing, narration, or live spoken coaching, pick a native audio specialist that hears pacing, emotion, and pronunciation directly.',
  },
  general_balanced: {
    headline: 'Start with a Mid-Level Workhorse, then scale up or down.',
    body: 'When unsure which AI to pick, start with an all-round Daily Workhorse. Step down to a Front-Desk Helper for bulk volume, or step up to a Principal only when stakes are high.',
  },
};

export function getZoneArchetypeLabel(candidate: Candidate): string {
  if (candidate.specialtyWing === 'creative_media_gen') return 'Creative Media Studio';
  if (candidate.specialtyWing === 'voice_audio') return 'Voice & Audio Specialist';
  switch (candidate.zone) {
    case 'front_desk':
      return 'Quick & Everyday Helper';
    case 'mid_level':
      return 'All-Round Daily Workhorse';
    case 'corner_office':
      return 'Deep Thinker for Tough Calls';
  }
}

export function buildIntuitionInsight(
  candidate: Candidate,
  evaluation: HallMatchEvaluation
): IntuitionInsight {
  const archetypeLabel = getZoneArchetypeLabel(candidate);
  const bucket = evaluation.taskProfile.bucket;
  const baseRule = BUCKET_RULES[bucket] ?? BUCKET_RULES.general_balanced;

  const reqMods: ModalityKey[] = evaluation.requiredModalities;
  let ruleHeadline = baseRule.headline;
  let ruleBody = baseRule.body;

  if (reqMods.includes('videoGen')) {
    ruleHeadline = BUCKET_RULES.media_generation.headline;
    ruleBody = BUCKET_RULES.media_generation.body;
  } else if (reqMods.includes('imageGen') && bucket !== 'marketing_creative') {
    ruleHeadline = 'Visual creation belongs with a native Image Gen specialist.';
    ruleBody =
      'Instead of asking a text-only model to describe an image, pick a specialist with native Image Gen built in so layout, lighting, and typography render directly.';
  } else if (reqMods.includes('video') || reqMods.includes('audio')) {
    const modList = reqMods
      .filter((m) => m === 'video' || m === 'audio')
      .map((m) => MODALITY_META[m].label)
      .join(' & ');
    ruleHeadline = `Check native ${modList} support before comparing IQ scores.`;
    ruleBody =
      'Even famous reasoning models can lack native video or audio ears. Filtering by native media support immediately narrows 42 models down to the few built for this job.';
  }

  let whyItFits: string;
  if (evaluation.hasActiveTask && evaluation.winnerReasoning && evaluation.winnerId === candidate.id) {
    const firstReason = evaluation.winnerReasoning.reasons[0];
    whyItFits =
      firstReason ||
      `${candidate.name} (${candidate.provider}) is a ${archetypeLabel.toLowerCase()} tailored to ${evaluation.taskProfile.label.toLowerCase()} at ${candidate.feeTier} cost.`;
  } else {
    whyItFits = `${candidate.name} by ${candidate.provider} is a ${archetypeLabel.toLowerCase()}—best known for ${candidate.bestFor[0].toLowerCase()}.`;
  }

  return {
    archetypeLabel,
    whyItFits,
    ruleHeadline,
    ruleBody,
  };
}
