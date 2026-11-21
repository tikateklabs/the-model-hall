import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CalendarClock,
  Check,
  Copy,
  ExternalLink,
  Mail,
  Rss,
  Sparkles,
  X,
} from 'lucide-react';
import { Candidate, LabId, ModalityKey, ViewMode } from '../types';
import { LAB_META, LabBrandPill, MODALITY_ITEMS } from './LabBadge';

interface LaunchDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: Candidate[];
  viewMode: ViewMode;
  onInspectCandidate: (candidateId: string) => void;
}

interface SavedSubscription {
  email: string;
  labs: LabId[];
  modalities: ModalityKey[];
  savedAt: string;
}

const STORAGE_KEY = 'model_hall_friday_newsletter_v1';

// Optional static form endpoint (e.g. Buttondown, Beehiiv, ConvertKit) — set VITE_NEWSLETTER_FORM_URL if deploying with a live mailing list.
const NEWSLETTER_ENDPOINT = (
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_NEWSLETTER_FORM_URL ?? ''
).trim();

const FRIDAY_ARRIVALS = [
  {
    id: 'gemini-4-neon',
    date: 'Fri, Nov 20, 2026',
    tag: 'FRIDAY DROP',
    headline: 'Google Gemini 4 Neon (Xhigh) enters Corner-Office Principals',
    summary:
      'Brings native Video + Audio + 1M reading memory at 56.5s start (~4× faster than rival Principals) for $6.44/task.',
  },
  {
    id: 'veo-3',
    date: 'Fri, Nov 13, 2026',
    tag: 'MEDIA STUDIO',
    headline: 'Google Veo 3 & OpenAI Sora 2 join Creative Media Gen Wing',
    summary:
      'Dedicated video generators now step onto the floor whenever a task asks for video creation, alongside Imagen 4 & FLUX.2.',
  },
  {
    id: 'claude-fable-5-2',
    date: 'Fri, Nov 06, 2026',
    tag: 'BENCHMARK LEADER',
    headline: 'Anthropic Claude Fable 5.2 (Max) leads Artificial Analysis at 65',
    summary:
      'Top reasoning & forensic legal/code audit score across independent benchmarks, best for high-stakes reviews ($26.54/task).',
  },
  {
    id: 'deepseek-r2',
    date: 'Fri, Oct 30, 2026',
    tag: 'OPEN-WEIGHT',
    headline: 'DeepSeek-R2, Qwen 3 Coder & Llama 4 Scout expand Open-Weight roster',
    summary:
      'Toggle Open-Weight Only inside Filters to explore downloadable models you can self-host privately.',
  },
  {
    id: 'gpt-6-2-sol',
    date: 'Fri, Oct 23, 2026',
    tag: 'DAILY WORKHORSE',
    headline: 'OpenAI GPT-6.2 Sol & Astra add Native Image Gen + Voice',
    summary:
      'Sol delivers 88% of senior partner judgment plus voice and native visual creation at $1.01/task.',
  },
  {
    id: 'muse-ember',
    date: 'Fri, Oct 16, 2026',
    tag: 'SPEED RECORD',
    headline: 'Meta Muse Ember (Max) hits 5.3s reply time at 14¢/task',
    summary:
      'Fastest everyday helper in the Hall—unlocks 90% cost savings when paired with a Principal in a 2-Person Split.',
  },
];

export const LaunchDispatchModal: React.FC<LaunchDispatchModalProps> = ({
  isOpen,
  onClose,
  candidates,
  viewMode,
  onInspectCandidate,
}) => {
  const [activeTab, setActiveTab] = useState<'subscribe' | 'arrivals'>('subscribe');
  const [email, setEmail] = useState('');
  const [selectedLabs, setSelectedLabs] = useState<LabId[]>([
    'anthropic',
    'google',
    'openai',
    'deepseek',
    'meta',
    'xai',
    'mistral',
    'qwen',
  ]);
  const [selectedMods, setSelectedMods] = useState<ModalityKey[]>([
    'video',
    'code',
    'imageGen',
    'videoGen',
  ]);
  const [savedSub, setSavedSub] = useState<SavedSubscription | null>(null);
  const [rssCopied, setRssCopied] = useState(false);

  const isBlueprint = viewMode === 'blueprint';

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedSubscription;
        setSavedSub(parsed);
        setEmail(parsed.email);
        setSelectedLabs(parsed.labs);
        setSelectedMods(parsed.modalities);
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  const toggleLab = (lab: LabId) => {
    setSelectedLabs((prev) =>
      prev.includes(lab) ? prev.filter((item) => item !== lab) : [...prev, lab]
    );
  };

  const toggleMod = (mod: ModalityKey) => {
    setSelectedMods((prev) =>
      prev.includes(mod) ? prev.filter((item) => item !== mod) : [...prev, mod]
    );
  };

  const handleSaveSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = email.trim();
    if (!cleaned) return;

    const payload: SavedSubscription = {
      email: cleaned,
      labs: selectedLabs.length > 0 ? selectedLabs : ['anthropic', 'google', 'openai'],
      modalities: selectedMods,
      savedAt: new Date().toLocaleDateString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
    setSavedSub(payload);

    if (NEWSLETTER_ENDPOINT) {
      fetch(NEWSLETTER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {
        // Static fallback already saved locally
      });
    }
  };

  const getRssUrl = () => {
    if (typeof window === 'undefined') return './feed.xml';
    const base = window.location.href.split('?')[0].replace(/index\.html$/, '');
    const normalized = base.endsWith('/') ? base : `${base}/`;
    return `${normalized}feed.xml`;
  };

  const handleCopyRss = async () => {
    const url = getRssUrl();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setRssCopied(true);
    window.setTimeout(() => setRssCopied(false), 2200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="friday-newsletter-heading"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`relative z-10 w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl border-2 overflow-hidden shadow-2xl ${
              isBlueprint
                ? 'bg-[#0F172A] border-[#38BDF8] text-[#E2E8F0]'
                : 'bg-[#FAF5EC] border-[#111827] text-[#111827]'
            }`}
          >
            {/* Header */}
            <div
              className={`px-6 py-4 border-b flex items-center justify-between gap-4 ${
                isBlueprint
                  ? 'bg-[#112036] border-[#1E3A5F]'
                  : 'bg-[#111827] border-[#111827] text-[#FAF5EC]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#E85D4A] text-white flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2
                      id="friday-newsletter-heading"
                      className="font-serif text-xl font-semibold text-white"
                    >
                      The Friday AI Intuition Newsletter
                    </h2>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1F7A73] text-white">
                      Always Free
                    </span>
                  </div>
                  <p className="text-xs text-[#CBD5E1] mt-0.5">
                    Data refreshes every Friday with newly launched models—explained in plain English, zero hype.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Friday Newsletter"
                className="p-2 rounded-lg border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Bar */}
            <div
              className={`px-6 pt-3 pb-2 border-b flex items-center gap-2 ${
                isBlueprint ? 'border-[#1E3A5F] bg-[#0D1A2D]' : 'border-[#111827]/15 bg-[#FFFDF9]'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveTab('subscribe')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'subscribe'
                    ? isBlueprint
                      ? 'bg-[#1E3A5F] text-[#7DD3FC]'
                      : 'bg-[#111827] text-[#FAF5EC]'
                    : isBlueprint
                    ? 'text-[#94A3B8] hover:text-white'
                    : 'text-[#64748B] hover:text-[#111827]'
                }`}
              >
                <CalendarClock className="w-3.5 h-3.5" />
                Subscribe (Always Free)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('arrivals')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'arrivals'
                    ? isBlueprint
                      ? 'bg-[#1E3A5F] text-[#7DD3FC]'
                      : 'bg-[#111827] text-[#FAF5EC]'
                    : isBlueprint
                    ? 'text-[#94A3B8] hover:text-white'
                    : 'text-[#64748B] hover:text-[#111827]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Recent Friday Drops ({FRIDAY_ARRIVALS.length})
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              {activeTab === 'subscribe' ? (
                <>
                  {/* Friday Refresh Promise Banner */}
                  <div
                    className={`rounded-xl border p-4 text-xs sm:text-[13px] leading-relaxed ${
                      isBlueprint
                        ? 'bg-[#11223A] border-[#38BDF8]/40 text-[#E0F2FE]'
                        : 'bg-[#FFFDF9] border-[#111827]/20 text-[#334155]'
                    }`}
                  >
                    <strong className={isBlueprint ? 'text-white' : 'text-[#111827]'}>
                      What arrives every Friday (always 100% free):
                    </strong>{' '}
                    Which newly launched models actually earned a seat in The Model Hall, what kind
                    of tasks they change, and one simple intuition rule you can remember in 60 seconds.
                  </div>

                  {/* Email Subscription Form */}
                  <form onSubmit={handleSaveSubscription} className="space-y-4">
                    <div>
                      <label
                        htmlFor="friday-newsletter-email"
                        className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                      >
                        Get the Weekly Friday Update
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          id="friday-newsletter-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className={`flex-1 px-3.5 py-2.5 rounded-xl border-[1.5px] text-sm focus:outline-none focus:ring-2 ${
                            isBlueprint
                              ? 'bg-[#0B172A] border-[#38BDF8]/70 text-white placeholder:text-[#64748B] focus:ring-[#38BDF8]/40'
                              : 'bg-[#FFFDF9] border-[#111827] text-[#111827] placeholder:text-[#94A3B8] focus:ring-[#E85D4A]/40'
                          }`}
                        />
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-[#E85D4A] hover:bg-[#D44B39] text-white font-bold text-sm border-[1.5px] border-[#111827] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {savedSub ? 'Update Preferences' : 'Subscribe — Always Free'}
                        </button>
                      </div>
                    </div>

                    {/* Lab Watchlist */}
                    <div className="space-y-2">
                      <span className="block text-xs font-semibold opacity-80">
                        Labs you want to follow every Friday:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(Object.keys(LAB_META) as LabId[]).map((lab) => {
                          const active = selectedLabs.includes(lab);
                          const meta = LAB_META[lab];
                          return (
                            <button
                              key={lab}
                              type="button"
                              onClick={() => toggleLab(lab)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                active
                                  ? 'text-white border-[#111827]'
                                  : isBlueprint
                                  ? 'bg-[#0B172A] border-[#1E3A5F] text-[#94A3B8]'
                                  : 'bg-[#FFFDF9] border-[#111827]/25 text-[#475569]'
                              }`}
                              style={active ? { backgroundColor: meta.color } : undefined}
                            >
                              {active ? '✓ ' : '+ '}
                              {meta.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Modality Watchlist */}
                    <div className="space-y-2">
                      <span className="block text-xs font-semibold opacity-80">
                        Alert me when new models improve:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {MODALITY_ITEMS.map((item) => {
                          const active = selectedMods.includes(item.key);
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => toggleMod(item.key)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                                active
                                  ? isBlueprint
                                    ? 'bg-[#0C4A6E] border-[#38BDF8] text-[#E0F2FE]'
                                    : 'bg-[#1F7A73] border-[#111827] text-white'
                                  : isBlueprint
                                  ? 'bg-[#0B172A] border-[#1E3A5F] text-[#94A3B8]'
                                  : 'bg-[#FFFDF9] border-[#111827]/25 text-[#475569]'
                              }`}
                            >
                              {active ? '✓ ' : '+ '}
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {savedSub && (
                      <div
                        className={`rounded-xl border px-4 py-3 text-xs flex items-center gap-2.5 ${
                          isBlueprint
                            ? 'bg-[#0C3547] border-[#38BDF8] text-[#BAE6FD]'
                            : 'bg-[#E5F2EE] border-[#1F7A73] text-[#115E59]'
                        }`}
                      >
                        <Check className="w-4 h-4 shrink-0" />
                        <span>
                          You&rsquo;re on the Friday list as <strong>{savedSub.email}</strong> (
                          {savedSub.labs.length} labs tracked · saved {savedSub.savedAt}). You can
                          also plug the static RSS feed below into any reader for zero-tracking
                          Friday alerts.
                        </span>
                      </div>
                    )}
                  </form>

                  {/* Static RSS 2.0 Feed Card */}
                  <div
                    className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isBlueprint
                        ? 'bg-[#11223A] border-[#38BDF8]/50'
                        : 'bg-[#E5F2EE] border-[#1F7A73]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Rss
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          isBlueprint ? 'text-[#38BDF8]' : 'text-[#1F7A73]'
                        }`}
                      />
                      <div>
                        <div className="text-sm font-semibold">
                          Prefer RSS? Direct Static Friday Feed
                        </div>
                        <p className="text-xs opacity-85 mt-0.5">
                          Add <code className="font-mono">./feed.xml</code> to Feedly, Readwise,
                          Slack, or Discord for automatic Friday model drops.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyRss}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                          isBlueprint
                            ? 'bg-[#0B172A] border-[#38BDF8] text-[#7DD3FC] hover:bg-[#1E3A5F]'
                            : 'bg-[#FFFDF9] border-[#111827] text-[#111827] hover:bg-[#F2E9DB]'
                        }`}
                      >
                        {rssCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {rssCopied ? 'RSS Copied!' : 'Copy RSS'}
                      </button>
                      <a
                        href="./feed.xml"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                          isBlueprint
                            ? 'border-[#38BDF8]/60 text-[#E0F2FE] hover:bg-[#1E3A5F]'
                            : 'bg-[#1F7A73] border-[#111827] text-white hover:bg-[#16605A]'
                        }`}
                      >
                        <span>XML</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                /* Tab 2: Recent Friday Drops */
                <div className="space-y-3">
                  {FRIDAY_ARRIVALS.map((item) => {
                    const candidate = candidates.find((c) => c.id === item.id);
                    if (!candidate) return null;
                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl border-[1.5px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isBlueprint
                            ? 'bg-[#112036] border-[#1E3A5F]'
                            : 'bg-[#FFFDF9] border-[#111827]/25'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <LabBrandPill labId={candidate.labId} blueprint={isBlueprint} />
                            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#E85D4A]/15 text-[#E85D4A]">
                              {item.tag}
                            </span>
                            <span className="text-[11px] font-mono opacity-65">{item.date}</span>
                          </div>
                          <h3 className="font-serif text-base font-semibold">{item.headline}</h3>
                          <p className="text-xs opacity-85 leading-relaxed">{item.summary}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onInspectCandidate(candidate.id);
                            onClose();
                          }}
                          className={`shrink-0 px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap transition-colors ${
                            isBlueprint
                              ? 'border-[#38BDF8] text-[#7DD3FC] hover:bg-[#1E3A5F]'
                              : 'bg-[#FAF5EC] border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white'
                          }`}
                        >
                          See on Floor →
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
