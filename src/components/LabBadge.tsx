import React from 'react';
import {
  Code2,
  Eye,
  Film,
  Image as ImageIcon,
  Mic,
  Video,
} from 'lucide-react';
import { CandidateModalities, LabId, ModalityKey, SpecialtyWingId } from '../types';

export const LAB_META: Record<
  LabId,
  {
    name: string;
    shortName: string;
    color: string;
    softBg: string;
    border: string;
    textOnSoft: string;
  }
> = {
  anthropic: {
    name: 'Anthropic',
    shortName: 'ANTHROPIC',
    color: '#C86442',
    softBg: '#FBECE6',
    border: '#C86442',
    textOnSoft: '#8A3B1F',
  },
  google: {
    name: 'Google',
    shortName: 'GOOGLE',
    color: '#2563EB',
    softBg: '#E8F0FE',
    border: '#2563EB',
    textOnSoft: '#1D4ED8',
  },
  openai: {
    name: 'OpenAI',
    shortName: 'OPENAI',
    color: '#0F766E',
    softBg: '#E4F5F2',
    border: '#0F766E',
    textOnSoft: '#115E59',
  },
  deepseek: {
    name: 'DeepSeek',
    shortName: 'DEEPSEEK',
    color: '#4338CA',
    softBg: '#ECEBFF',
    border: '#4338CA',
    textOnSoft: '#3730A3',
  },
  meta: {
    name: 'Meta',
    shortName: 'META',
    color: '#6D28D9',
    softBg: '#F1EAFF',
    border: '#6D28D9',
    textOnSoft: '#5B21B6',
  },
  xai: {
    name: 'xAI',
    shortName: 'xAI',
    color: '#111827',
    softBg: '#EAECEF',
    border: '#111827',
    textOnSoft: '#111827',
  },
  mistral: {
    name: 'Mistral AI',
    shortName: 'MISTRAL',
    color: '#D97706',
    softBg: '#FEF3C7',
    border: '#D97706',
    textOnSoft: '#92400E',
  },
  qwen: {
    name: 'Alibaba Qwen',
    shortName: 'QWEN',
    color: '#0284C7',
    softBg: '#E0F2FE',
    border: '#0284C7',
    textOnSoft: '#075985',
  },
  cohere: {
    name: 'Cohere',
    shortName: 'COHERE',
    color: '#047857',
    softBg: '#DCFCE7',
    border: '#047857',
    textOnSoft: '#065F46',
  },
  amazon: {
    name: 'Amazon',
    shortName: 'AMAZON',
    color: '#EA580C',
    softBg: '#FFEDD5',
    border: '#EA580C',
    textOnSoft: '#9A3412',
  },
  media_labs: {
    name: 'Media Studios',
    shortName: 'MEDIA LABS',
    color: '#BE185D',
    softBg: '#FCE7F3',
    border: '#BE185D',
    textOnSoft: '#9D174D',
  },
};

export const WING_META: Record<
  SpecialtyWingId,
  { label: string; shortLabel: string; description: string }
> = {
  all: {
    label: 'All-Stars (Full Hall)',
    shortLabel: 'All-Stars',
    description: 'Dynamic 8-seat showcase drawn from all 42 specialists across 11 AI labs.',
  },
  reasoning_audit: {
    label: 'Reasoning & Audits',
    shortLabel: 'Reasoning',
    description: 'Deep math, legal redlines, strategic planning, and zero-bluff verification.',
  },
  coding_agents: {
    label: 'Coding & Agents',
    shortLabel: 'Coding',
    description: 'Repository-scale debugging, SWE-bench bug fixing, SQL, and IDE speed.',
  },
  multimodal_vision_video: {
    label: 'Vision & Video Analysis',
    shortLabel: 'Vision/Video',
    description: 'Native inspection of screenshots, charts, scanned PDFs, and long video streams.',
  },
  creative_media_gen: {
    label: 'Image & Video Gen',
    shortLabel: 'Media Gen',
    description: 'Dedicated creative studios generating posters, photoreal artwork, and cinema reels.',
  },
  voice_audio: {
    label: 'Voice & Audio',
    shortLabel: 'Voice/Audio',
    description: 'Sub-second speech-to-speech, expressive voice narration, and 30-language dubbing.',
  },
  bulk_triage: {
    label: 'Bulk Triage & Fast',
    shortLabel: 'Bulk Triage',
    description: 'Penny-tier sprinters built for sorting 1,000+ emails, tickets, and edge tasks.',
  },
  enterprise_rag: {
    label: 'Enterprise RAG & Docs',
    shortLabel: 'Enterprise RAG',
    description: 'Massive 256K–10M context windows, inline citations, and sovereign VPC deployments.',
  },
};

export const LabCrestIcon: React.FC<{ labId: LabId; className?: string }> = ({
  labId,
  className = 'w-4 h-4',
}) => {
  switch (labId) {
    case 'anthropic':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <path d="M3 16 L8.5 4 L11.2 4 L5.7 16 Z" fill="currentColor" />
          <path d="M10.5 4 L13.2 4 L17 16 L14.3 16 Z" fill="currentColor" opacity="0.82" />
        </svg>
      );
    case 'google':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <path
            d="M10 1.8 C10.8 6.4 13.6 9.2 18.2 10 C13.6 10.8 10.8 13.6 10 18.2 C9.2 13.6 6.4 10.8 1.8 10 C6.4 9.2 9.2 6.4 10 1.8 Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'openai':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <polygon
            points="10,2 17,6 17,14 10,18 3,14 3,6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
          />
          <circle cx="10" cy="10" r="2.6" fill="currentColor" />
        </svg>
      );
    case 'deepseek':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <path
            d="M2.5 11.5 C5 6.5 9 5.5 13 7.5 C15 8.5 16.5 7.2 17.8 5.5 C17.2 11.5 13.5 15.5 8 15.5 C5.4 15.5 3.6 14 2.5 11.5 Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'meta':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <path
            d="M3 13 C3 8 5.2 5.5 7.4 5.5 C9.3 5.5 10.2 7.5 10.9 9.5 C11.6 7.5 12.6 5.5 14.5 5.5 C16.6 5.5 18 8 18 12.8 C18 14.3 17 15.2 15.6 15.2 C13.8 15.2 12.5 13.2 11 10.6 C9.6 13.2 8.2 15.2 6.1 15.2 C4.3 15.2 3 14.4 3 13 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'xai':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <path d="M3.5 3.5 L16.5 16.5 M16.5 3.5 L3.5 16.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'mistral':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <rect x="2.5" y="4" width="3.5" height="12" fill="currentColor" />
          <rect x="8.2" y="7" width="3.5" height="9" fill="currentColor" opacity="0.85" />
          <rect x="14" y="4" width="3.5" height="12" fill="currentColor" />
          <rect x="6" y="4" width="8" height="3" fill="currentColor" opacity="0.65" />
        </svg>
      );
    case 'qwen':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <circle cx="9.5" cy="9.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path d="M13 13 L17.5 17.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'cohere':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <circle cx="7" cy="7.5" r="3.6" fill="currentColor" />
          <circle cx="14" cy="12.5" r="3.2" fill="currentColor" opacity="0.75" />
          <path d="M9.5 9.5 L12 11.2" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'amazon':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <path d="M3 12.5 Q10 17.5 17 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M14.5 10.8 L17.3 12 L15.5 14.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 9.5 L10 4 L14 9.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'media_labs':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <rect x="2.5" y="4.5" width="15" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <polygon points="8.2,7.5 13.5,10 8.2,12.5" fill="currentColor" />
        </svg>
      );
  }
};

export const LabBrandPill: React.FC<{
  labId: LabId;
  blueprint?: boolean;
  size?: 'sm' | 'md';
}> = ({ labId, blueprint = false, size = 'sm' }) => {
  const meta = LAB_META[labId];
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold tracking-wider uppercase rounded-md border whitespace-nowrap ${
        size === 'md' ? 'px-2.5 py-1 text-[11px]' : 'px-2 py-0.5 text-[10px]'
      }`}
      style={
        blueprint
          ? {
              backgroundColor: 'rgba(15, 33, 56, 0.9)',
              borderColor: meta.color === '#111827' ? '#94A3B8' : meta.color,
              color: '#E0F2FE',
            }
          : {
              backgroundColor: meta.color,
              borderColor: '#111827',
              color: '#FFFFFF',
            }
      }
    >
      <LabCrestIcon labId={labId} className={size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
      <span>{meta.name}</span>
    </span>
  );
};

export const MODALITY_ITEMS: Array<{
  key: ModalityKey;
  label: string;
  short: string;
  pip: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'vision', label: 'Vision / PDF', short: 'Vision', pip: 'VIS', icon: Eye },
  { key: 'video', label: 'Native Video', short: 'Video', pip: 'VID', icon: Video },
  { key: 'audio', label: 'Native Audio', short: 'Audio', pip: 'AUD', icon: Mic },
  { key: 'code', label: 'Code & Tools', short: 'Code', pip: 'COD', icon: Code2 },
  { key: 'imageGen', label: 'Image Gen', short: 'Img Gen', pip: 'IMG', icon: ImageIcon },
  { key: 'videoGen', label: 'Video Gen', short: 'Vid Gen', pip: 'VGN', icon: Film },
];

export const ModalityLoadoutGrid: React.FC<{
  modalities: CandidateModalities;
  requiredModalities: ModalityKey[];
  blueprint?: boolean;
}> = ({ modalities, requiredModalities, blueprint = false }) => {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {MODALITY_ITEMS.map((item) => {
        const Icon = item.icon;
        const supported = modalities[item.key];
        const isRequired = requiredModalities.includes(item.key);
        const isMissingRequired = isRequired && !supported;

        return (
          <div
            key={item.key}
            title={`${item.label}: ${supported ? 'Natively supported' : 'Not supported natively'}`}
            className={`rounded-lg border px-2 py-1.5 flex items-center justify-between gap-1 transition-colors ${
              isMissingRequired
                ? blueprint
                  ? 'bg-[#3F161D] border-[#F87171] text-[#FCA5A5]'
                  : 'bg-[#FEE2E2] border-[#DC2626] text-[#991B1B]'
                : supported
                ? isRequired
                  ? blueprint
                    ? 'bg-[#0C4A6E] border-[#38BDF8] text-[#E0F2FE]'
                    : 'bg-[#1F7A73] border-[#111827] text-white'
                  : blueprint
                  ? 'bg-[#0F243E] border-[#38BDF8]/50 text-[#BAE6FD]'
                  : 'bg-[#E5F2EE] border-[#1F7A73]/45 text-[#115E59]'
                : blueprint
                ? 'bg-[#0B1626] border-[#1E3A5F]/60 text-[#475569] opacity-55'
                : 'bg-[#F3EEE5] border-[#111827]/12 text-[#94A3B8] opacity-65'
            }`}
          >
            <div className="flex items-center gap-1 min-w-0">
              <Icon className="w-3 h-3 shrink-0" />
              <span className="text-[9.5px] font-bold leading-none truncate">
                {item.short}
              </span>
            </div>
            <span className="text-[8.5px] font-bold opacity-90 shrink-0">
              {supported ? 'YES' : 'NO'}
            </span>
          </div>
        );
      })}
    </div>
  );
};
