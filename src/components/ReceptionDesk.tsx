import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CalendarClock,
  Code2,
  Coffee,
  Compass,
  GraduationCap,
  Layers,
  Mail,
  Megaphone,
} from 'lucide-react';
import { RoleDefinition } from '../types';
import { LAB_META } from './LabBadge';

interface ReceptionDeskProps {
  roles: RoleDefinition[];
  totalModelsCount: number;
  onSelectRole: (roleId: string) => void;
  onSkipToHall: () => void;
  onOpenNewsletter: () => void;
}

const ROLE_ICONS: Record<RoleDefinition['iconKey'], React.ComponentType<{ className?: string }>> = {
  book: BookOpen,
  code: Code2,
  megaphone: Megaphone,
  briefcase: Briefcase,
  graduation: GraduationCap,
  coffee: Coffee,
};

export const ReceptionDesk: React.FC<ReceptionDeskProps> = ({
  roles,
  totalModelsCount,
  onSelectRole,
  onSkipToHall,
  onOpenNewsletter,
}) => {
  const labCount = Object.keys(LAB_META).length;

  return (
    <div className="min-h-screen bg-[#FAF5EC] text-[#111827] flex flex-col justify-between px-6 py-7 md:px-12 lg:px-16">
      {/* Calm Editorial Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between gap-4 border-b-[1.5px] border-[#111827] pb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 32 32" className="w-8 h-8 shrink-0" aria-hidden="true">
            <polygon
              points="16,3 29,10.5 29,21.5 16,29 3,21.5 3,10.5"
              fill="#1F7A73"
              stroke="#111827"
              strokeWidth="1.8"
            />
            <polygon
              points="16,9 23,13 16,17 9,13"
              fill="#FAF5EC"
              stroke="#111827"
              strokeWidth="1.5"
            />
            <circle cx="16" cy="21" r="3" fill="#E85D4A" stroke="#111827" strokeWidth="1.4" />
          </svg>
          <div>
            <span className="font-serif text-2xl font-bold tracking-tight text-[#111827] whitespace-nowrap block leading-none">
              The Model Hall
            </span>
            <span className="text-[11px] font-semibold text-[#1F7A73] mt-0.5 block">
              Refreshed every Friday · Always Free
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenNewsletter}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border-[1.5px] border-[#111827] bg-[#FFFDF9] hover:bg-[#111827] hover:text-[#FAF5EC] text-xs font-bold tracking-wide transition-colors cursor-pointer whitespace-nowrap"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Free Friday Newsletter</span>
        </button>
      </header>

      {/* Main 5-Second Newcomer "Why" Welcome */}
      <main className="max-w-5xl w-full mx-auto py-8 md:py-10 flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mb-7"
        >
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#E85D4A] mb-2.5">
            New to the world of AI? · Updated every Friday · Always Free
          </p>
          <h1
            className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#111827] leading-[1.12] mb-3.5"
            style={{ textWrap: 'balance' }}
          >
            Understand AI models in plain English—and build intuition for which one to pick.
          </h1>
          <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-3xl">
            Dozens of AI models exist today, each built like a different kind of specialist—quick
            everyday helpers, all-round daily workhorses, careful deep thinkers, and media creators.
            Pick your role below, try a real task, and watch who steps forward.
          </p>
        </motion.div>

        {/* 3 Clean Newcomer Intuition Beats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-[#FFFDF9] border border-[#111827]/20 px-4 py-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E5F2EE] text-[#1F7A73] flex items-center justify-center shrink-0 mt-0.5">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-[15px] font-bold text-[#111827]">
                See what kinds of AI exist
              </h2>
              <p className="text-xs text-[#475569] leading-relaxed mt-0.5">
                Grasp the difference between quick helpers, daily workhorses, deep thinkers, and
                media studios across {totalModelsCount} models in one glance.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-[#FFFDF9] border border-[#111827]/20 px-4 py-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FDECE7] text-[#E85D4A] flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-[15px] font-bold text-[#111827]">
                Build lasting picking intuition
              </h2>
              <p className="text-xs text-[#475569] leading-relaxed mt-0.5">
                Try any real task, watch the right specialist step onto the rug, and learn the
                simple rule of thumb behind why others stay seated.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-[#FFFDF9] border border-[#111827]/20 px-4 py-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EFE8DC] text-[#111827] flex items-center justify-center shrink-0 mt-0.5">
              <CalendarClock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-[15px] font-bold text-[#111827]">
                Refreshed every Friday, always free
              </h2>
              <p className="text-xs text-[#475569] leading-relaxed mt-0.5">
                Newly launched models join the studio every Friday, grounded in 8 independent
                benchmark websites whenever you want to verify.
              </p>
            </div>
          </div>
        </div>

        {/* Section Prompt */}
        <div className="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#475569]">
            Pick your starting lens (you can switch anytime)
          </span>
          <button
            type="button"
            onClick={onSkipToHall}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#111827] hover:text-[#E85D4A] transition-colors cursor-pointer"
          >
            <span>Skip straight to the Hall</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 6 Approachable Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role, index) => {
            const Icon = ROLE_ICONS[role.iconKey];
            return (
              <motion.button
                key={role.id}
                type="button"
                onClick={() => onSelectRole(role.id)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.28,
                  delay: 0.03 + index * 0.035,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.99 }}
                className="group text-left bg-[#FFFDF9] border-[1.5px] border-[#111827] rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-shadow hover:shadow-[4px_4px_0px_#E85D4A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F7A73] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF5EC] cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-[#E5F2EE] border-[1.5px] border-[#111827] flex items-center justify-center text-[#111827] group-hover:bg-[#1F7A73] group-hover:text-white transition-colors">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#E85D4A] group-hover:translate-x-1 transition-all mt-1" />
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#111827] mb-1">
                    {role.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed mb-3.5">
                    {role.tagline}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[#111827]/12 text-xs text-[#64748B] space-y-0.5">
                  <div className="truncate">· {role.starterChips[0]}</div>
                  <div className="truncate">· {role.starterChips[1]}</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </main>

      {/* Clean Product-Only Footer */}
      <footer className="max-w-5xl w-full mx-auto pt-4 border-t border-[#111827]/12 flex items-center justify-between flex-wrap gap-2 text-xs text-[#64748B]">
        <span>
          {totalModelsCount} AI specialists across {labCount} labs · Refreshed every Friday · Always
          100% Free
        </span>
        <span>Backed by 8 independent benchmark websites</span>
      </footer>
    </div>
  );
};
