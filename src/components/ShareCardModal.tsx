import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, Download, Share2, Sparkles, X } from 'lucide-react';
import { Candidate, HallMatchEvaluation, ViewMode } from '../types';
import { LAB_META } from './LabBadge';
import { buildIntuitionInsight } from '../utils/intuitionRules';

type CardFormatId = 'landscape' | 'square' | 'story';
type CaptionPlatformId = 'linkedin' | 'x' | 'instagram';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
  evaluation: HallMatchEvaluation;
  taskText: string;
  viewMode: ViewMode;
}

const FORMATS: Array<{
  id: CardFormatId;
  label: string;
  platformHint: string;
  width: number;
  height: number;
}> = [
  { id: 'landscape', label: 'LinkedIn / X', platformHint: '1200 × 630', width: 1200, height: 630 },
  { id: 'square', label: 'Instagram Post', platformHint: '1080 × 1080', width: 1080, height: 1080 },
  { id: 'story', label: 'Instagram Story', platformHint: '1080 × 1920', width: 1080, height: 1920 },
];

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  if (lines.length === maxLines) {
    const consumed = lines.join(' ').split(/\s+/).length;
    if (consumed < words.length) {
      let last = lines[maxLines - 1];
      while (last.length > 3 && ctx.measureText(`${last}…`).width > maxWidth) {
        last = last.slice(0, -1);
      }
      lines[maxLines - 1] = `${last.trimEnd()}…`;
    }
  }
  return lines;
}

function renderShareCardCanvas(
  canvas: HTMLCanvasElement,
  format: (typeof FORMATS)[number],
  candidate: Candidate,
  taskText: string,
  archetypeLabel: string,
  whyItFits: string,
  ruleHeadline: string,
  ruleBody: string
) {
  const { width: W, height: H } = format;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const lab = LAB_META[candidate.labId];
  const isLandscape = format.id === 'landscape';
  const isStory = format.id === 'story';

  // Background paper
  ctx.fillStyle = '#FAF5EC';
  ctx.fillRect(0, 0, W, H);

  // Subtle architectural grid dots
  ctx.fillStyle = 'rgba(17, 24, 39, 0.05)';
  const step = isLandscape ? 32 : 36;
  for (let gx = step; gx < W; gx += step) {
    for (let gy = step; gy < H; gy += step) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Outer editorial frame
  const pad = isLandscape ? 34 : 46;
  const frameX = pad;
  const frameY = pad;
  const frameW = W - pad * 2;
  const frameH = H - pad * 2;

  // Hard editorial shadow
  ctx.fillStyle = '#111827';
  drawRoundedRect(ctx, frameX + 8, frameY + 8, frameW, frameH, 24);
  ctx.fill();

  // Main white-cream card
  ctx.fillStyle = '#FFFDF9';
  drawRoundedRect(ctx, frameX, frameY, frameW, frameH, 24);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#111827';
  ctx.stroke();

  // Top Header Bar
  const headerH = isLandscape ? 72 : isStory ? 118 : 88;
  ctx.save();
  drawRoundedRect(ctx, frameX, frameY, frameW, frameH, 24);
  ctx.clip();
  ctx.fillStyle = '#111827';
  ctx.fillRect(frameX, frameY, frameW, headerH);
  ctx.restore();

  // Header Brand Left
  const innerPad = isLandscape ? 38 : 44;
  ctx.fillStyle = '#FAF5EC';
  ctx.font = `700 ${isLandscape ? 28 : isStory ? 38 : 32}px Georgia, "Times New Roman", serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText('The Model Hall', frameX + innerPad, frameY + headerH / 2 - (isStory ? 10 : 0));

  if (isStory) {
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '600 18px system-ui, -apple-system, sans-serif';
    ctx.fillText('Understand AI models & build picking intuition', frameX + innerPad, frameY + headerH / 2 + 24);
  }

  // Header Right Pill: Updated Every Friday · Always Free
  const pillText = 'UPDATED EVERY FRIDAY · ALWAYS FREE';
  ctx.font = `700 ${isLandscape ? 13 : 14}px system-ui, -apple-system, sans-serif`;
  const pillW = ctx.measureText(pillText).width + 28;
  const pillH = isLandscape ? 30 : 34;
  const pillX = frameX + frameW - innerPad - pillW;
  const pillY = frameY + (headerH - pillH) / 2;

  ctx.fillStyle = '#E85D4A';
  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 999);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(pillText, pillX + pillW / 2, pillY + pillH / 2 + 1);
  ctx.textAlign = 'left';

  const contentTop = frameY + headerH + (isLandscape ? 28 : 42);
  const footerH = isLandscape ? 54 : 74;
  const contentBottom = frameY + frameH - footerH;

  // Helper to draw Lab Badge + Archetype pill
  const drawBadges = (x: number, y: number) => {
    ctx.font = `800 ${isLandscape ? 13 : 15}px system-ui, -apple-system, sans-serif`;
    const labLabel = `${lab.name.toUpperCase()}  ·  ${candidate.feeTier}`;
    const labW = ctx.measureText(labLabel).width + 26;
    const bh = isLandscape ? 30 : 34;
    ctx.fillStyle = lab.color;
    drawRoundedRect(ctx, x, y, labW, bh, 8);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(labLabel, x + 13, y + bh / 2 + 1);

    const archLabel = archetypeLabel.toUpperCase();
    const archW = ctx.measureText(archLabel).width + 26;
    ctx.fillStyle = '#E5F2EE';
    drawRoundedRect(ctx, x + labW + 10, y, archW, bh, 8);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#1F7A73';
    ctx.stroke();
    ctx.fillStyle = '#115E59';
    ctx.fillText(archLabel, x + labW + 23, y + bh / 2 + 1);
  };

  // Helper to draw 5 Trait Bars
  const drawTraitBars = (x: number, y: number, w: number, rowGap: number) => {
    const rows: Array<{ label: string; value: number }> = [
      { label: 'Thinking', value: candidate.traits.thinking },
      { label: 'Honesty', value: candidate.traits.honesty },
      { label: 'Clarity', value: candidate.traits.clarity },
      { label: 'Creativity', value: candidate.traits.creativity },
      { label: 'Speed', value: candidate.traits.speed },
    ];
    const labelW = isLandscape ? 92 : 112;
    const scoreW = 42;
    const barW = w - labelW - scoreW - 14;
    const barH = isLandscape ? 12 : 16;

    rows.forEach((row, idx) => {
      const ry = y + idx * rowGap;
      ctx.fillStyle = '#111827';
      ctx.font = `700 ${isLandscape ? 15 : 18}px system-ui, -apple-system, sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.fillText(row.label, x, ry + barH / 2);

      // Track
      const bx = x + labelW;
      ctx.fillStyle = '#F2EBE0';
      drawRoundedRect(ctx, bx, ry, barW, barH, 999);
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#111827';
      ctx.stroke();

      // Fill
      const fillW = Math.max(barH, (barW * row.value) / 100);
      ctx.fillStyle = '#1F7A73';
      drawRoundedRect(ctx, bx, ry, fillW, barH, 999);
      ctx.fill();

      // Numeric
      ctx.fillStyle = '#475569';
      ctx.font = `700 ${isLandscape ? 14 : 17}px ui-monospace, SFMono-Regular, monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(String(row.value), x + w, ry + barH / 2);
      ctx.textAlign = 'left';
    });
  };

  if (isLandscape) {
    // TWO-COLUMN LANDSCAPE (1200x630)
    const leftX = frameX + innerPad;
    const leftW = 630;
    const rightX = leftX + leftW + 34;
    const rightW = frameW - innerPad * 2 - leftW - 34;

    // Task Eyebrow
    const taskPrompt = taskText.trim()
      ? `TASK: “${taskText.trim()}”`
      : 'AI SPECIALIST SPOTLIGHT';
    ctx.fillStyle = '#E85D4A';
    ctx.font = '800 13px system-ui, -apple-system, sans-serif';
    const taskLines = wrapTextLines(ctx, taskPrompt, leftW, 1);
    ctx.fillText(taskLines[0] ?? taskPrompt, leftX, contentTop + 8);

    // Winner Name
    ctx.fillStyle = '#111827';
    ctx.font = '700 44px Georgia, "Times New Roman", serif';
    const nameLines = wrapTextLines(ctx, candidate.name, leftW, 1);
    ctx.fillText(nameLines[0] ?? candidate.name, leftX, contentTop + 48);

    // Badges
    drawBadges(leftX, contentTop + 78);

    // Why It Fits
    ctx.fillStyle = '#334155';
    ctx.font = '500 18px system-ui, -apple-system, sans-serif';
    const fitLines = wrapTextLines(ctx, whyItFits, leftW, 3);
    fitLines.forEach((line, i) => {
      ctx.fillText(line, leftX, contentTop + 132 + i * 26);
    });

    // Intuition Rule Callout Box
    const ruleY = contentTop + 224;
    const ruleH = contentBottom - ruleY - 14;
    ctx.fillStyle = '#FDF1E8';
    drawRoundedRect(ctx, leftX, ruleY, leftW, ruleH, 16);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#E85D4A';
    ctx.stroke();

    ctx.fillStyle = '#C2412D';
    ctx.font = '800 12px system-ui, -apple-system, sans-serif';
    ctx.fillText('INTUITION RULE TO REMEMBER', leftX + 20, ruleY + 24);

    ctx.fillStyle = '#111827';
    ctx.font = '700 19px Georgia, "Times New Roman", serif';
    const rhLines = wrapTextLines(ctx, ruleHeadline, leftW - 40, 2);
    rhLines.forEach((line, i) => {
      ctx.fillText(line, leftX + 20, ruleY + 52 + i * 24);
    });

    ctx.fillStyle = '#475569';
    ctx.font = '500 14.5px system-ui, -apple-system, sans-serif';
    const rbLines = wrapTextLines(ctx, ruleBody, leftW - 40, 3);
    const rbStart = ruleY + 52 + rhLines.length * 24 + 8;
    rbLines.forEach((line, i) => {
      ctx.fillText(line, leftX + 20, rbStart + i * 20);
    });

    // Right Column Card: Trait Profile + Quick Specs
    ctx.fillStyle = '#FAF5EC';
    drawRoundedRect(ctx, rightX, contentTop, rightW, contentBottom - contentTop - 14, 18);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#111827';
    ctx.stroke();

    ctx.fillStyle = '#111827';
    ctx.font = '700 20px Georgia, "Times New Roman", serif';
    ctx.fillText('Specialist Profile', rightX + 24, contentTop + 34);

    ctx.fillStyle = '#64748B';
    ctx.font = '600 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      `~$${candidate.costPerTaskUsd.toFixed(2)}/task  ·  ${candidate.firstTokenSec}s start  ·  ${candidate.contextWindow}`,
      rightX + 24,
      contentTop + 60
    );

    drawTraitBars(rightX + 24, contentTop + 98, rightW - 48, 38);

    // Watch out for mini note
    const watchY = contentTop + 298;
    ctx.fillStyle = '#475569';
    ctx.font = '700 11.5px system-ui, -apple-system, sans-serif';
    ctx.fillText('WATCH OUT FOR', rightX + 24, watchY);
    ctx.font = 'italic 13.5px system-ui, -apple-system, sans-serif';
    const watchLines = wrapTextLines(ctx, candidate.watchOutFor, rightW - 48, 3);
    watchLines.forEach((line, i) => {
      ctx.fillText(line, rightX + 24, watchY + 22 + i * 19);
    });
  } else {
    // VERTICAL LAYOUT (Square 1080x1080 & Story 1080x1920)
    const cx = frameX + innerPad;
    const cw = frameW - innerPad * 2;
    let curY = contentTop;

    const taskPrompt = taskText.trim()
      ? `TASK: “${taskText.trim()}”`
      : 'AI SPECIALIST SPOTLIGHT';
    ctx.fillStyle = '#E85D4A';
    ctx.font = `800 ${isStory ? 20 : 16}px system-ui, -apple-system, sans-serif`;
    const taskLines = wrapTextLines(ctx, taskPrompt, cw, 2);
    taskLines.forEach((line, i) => {
      ctx.fillText(line, cx, curY + i * (isStory ? 28 : 22));
    });
    curY += taskLines.length * (isStory ? 28 : 22) + (isStory ? 34 : 20);

    // Winner Name
    ctx.fillStyle = '#111827';
    ctx.font = `700 ${isStory ? 62 : 50}px Georgia, "Times New Roman", serif`;
    const nameLines = wrapTextLines(ctx, candidate.name, cw, 2);
    nameLines.forEach((line, i) => {
      ctx.fillText(line, cx, curY + i * (isStory ? 68 : 54));
    });
    curY += nameLines.length * (isStory ? 68 : 54) + (isStory ? 18 : 14);

    // Badges
    drawBadges(cx, curY);
    curY += isStory ? 66 : 54;

    // Why It Fits
    ctx.fillStyle = '#334155';
    ctx.font = `500 ${isStory ? 27 : 21}px system-ui, -apple-system, sans-serif`;
    const fitLines = wrapTextLines(ctx, whyItFits, cw, isStory ? 4 : 3);
    fitLines.forEach((line, i) => {
      ctx.fillText(line, cx, curY + i * (isStory ? 38 : 30));
    });
    curY += fitLines.length * (isStory ? 38 : 30) + (isStory ? 46 : 26);

    // Intuition Rule Callout Box
    const ruleH = isStory ? 300 : 196;
    ctx.fillStyle = '#FDF1E8';
    drawRoundedRect(ctx, cx, curY, cw, ruleH, 20);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#E85D4A';
    ctx.stroke();

    ctx.fillStyle = '#C2412D';
    ctx.font = `800 ${isStory ? 17 : 14}px system-ui, -apple-system, sans-serif`;
    ctx.fillText('INTUITION RULE TO REMEMBER', cx + 28, curY + (isStory ? 42 : 30));

    ctx.fillStyle = '#111827';
    ctx.font = `700 ${isStory ? 31 : 23}px Georgia, "Times New Roman", serif`;
    const rhLines = wrapTextLines(ctx, ruleHeadline, cw - 56, 2);
    rhLines.forEach((line, i) => {
      ctx.fillText(line, cx + 28, curY + (isStory ? 92 : 66) + i * (isStory ? 40 : 30));
    });

    ctx.fillStyle = '#475569';
    ctx.font = `500 ${isStory ? 23 : 17}px system-ui, -apple-system, sans-serif`;
    const rbLines = wrapTextLines(ctx, ruleBody, cw - 56, isStory ? 4 : 3);
    const rbStart = curY + (isStory ? 96 : 68) + rhLines.length * (isStory ? 40 : 30) + 12;
    rbLines.forEach((line, i) => {
      ctx.fillText(line, cx + 28, rbStart + i * (isStory ? 32 : 24));
    });
    curY += ruleH + (isStory ? 48 : 26);

    // Trait Bars Panel
    const traitPanelH = Math.min(isStory ? 430 : 284, contentBottom - curY - 18);
    ctx.fillStyle = '#FAF5EC';
    drawRoundedRect(ctx, cx, curY, cw, traitPanelH, 20);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#111827';
    ctx.stroke();

    ctx.fillStyle = '#111827';
    ctx.font = `700 ${isStory ? 28 : 22}px Georgia, "Times New Roman", serif`;
    ctx.fillText('Specialist Profile', cx + 28, curY + (isStory ? 44 : 34));

    ctx.fillStyle = '#64748B';
    ctx.font = `600 ${isStory ? 19 : 15}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(
      `~$${candidate.costPerTaskUsd.toFixed(2)}/task · ${candidate.firstTokenSec}s · ${candidate.contextWindow}`,
      cx + cw - 28,
      curY + (isStory ? 44 : 34)
    );
    ctx.textAlign = 'left';

    drawTraitBars(
      cx + 28,
      curY + (isStory ? 96 : 72),
      cw - 56,
      isStory ? 60 : 40
    );

    if (isStory && curY + traitPanelH + 140 < contentBottom) {
      const watchY = curY + traitPanelH + 44;
      ctx.fillStyle = '#111827';
      ctx.font = '800 16px system-ui, -apple-system, sans-serif';
      ctx.fillText('WATCH OUT FOR', cx, watchY);
      ctx.fillStyle = '#475569';
      ctx.font = 'italic 22px system-ui, -apple-system, sans-serif';
      const wLines = wrapTextLines(ctx, candidate.watchOutFor, cw, 3);
      wLines.forEach((line, i) => {
        ctx.fillText(line, cx, watchY + 36 + i * 30);
      });
    }
  }

  // Bottom Product-Only Editorial Footer
  const footerLineY = frameY + frameH - footerH;
  ctx.strokeStyle = 'rgba(17, 24, 39, 0.16)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(frameX + innerPad, footerLineY);
  ctx.lineTo(frameX + frameW - innerPad, footerLineY);
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = `600 ${isLandscape ? 14 : 16}px system-ui, -apple-system, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText(
    'The Model Hall  ·  Verify on 8 independent benchmarks',
    frameX + innerPad,
    footerLineY + footerH / 2
  );

  ctx.fillStyle = '#1F7A73';
  ctx.font = `700 ${isLandscape ? 14 : 16}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText(
    'Refreshed every Friday · Always 100% Free',
    frameX + frameW - innerPad,
    footerLineY + footerH / 2
  );
  ctx.textAlign = 'left';
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  candidate,
  evaluation,
  taskText,
  viewMode,
}) => {
  const [formatId, setFormatId] = useState<CardFormatId>('landscape');
  const [captionPlatform, setCaptionPlatform] = useState<CaptionPlatformId>('linkedin');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isBlueprint = viewMode === 'blueprint';
  const activeFormat = FORMATS.find((f) => f.id === formatId) ?? FORMATS[0];
  const insight = useMemo(
    () => buildIntuitionInsight(candidate, evaluation),
    [candidate, evaluation]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    renderShareCardCanvas(
      canvasRef.current,
      activeFormat,
      candidate,
      taskText,
      insight.archetypeLabel,
      insight.whyItFits,
      insight.ruleHeadline,
      insight.ruleBody
    );
  }, [isOpen, activeFormat, candidate, taskText, insight]);

  const captions = useMemo(() => {
    const taskLine = taskText.trim()
      ? `Task: "${taskText.trim()}"`
      : `Model Spotlight: ${candidate.name} (${candidate.provider})`;

    return {
      linkedin: `New to the world of AI? Here is an easy intuition rule for picking the right model:\n\n${taskLine}\nBest fit: ${candidate.name} (${candidate.provider}) — a ${insight.archetypeLabel} (${candidate.feeTier}).\n\nRule of thumb to remember:\n${insight.ruleHeadline} ${insight.ruleBody}\n\nWatch out for: ${candidate.watchOutFor}\n\nExplore all 42 specialists across 11 AI labs in plain English on The Model Hall (refreshed every Friday with newly launched models · always free).`,
      x: `AI model intuition in 15 seconds:\n\n${taskLine}\nPick: ${candidate.name} (${candidate.provider} · ${candidate.feeTier})\n\nRule of thumb: ${insight.ruleHeadline}\n\n42 models across 11 labs, verified on 8 real benchmarks, refreshed every Friday & always free on The Model Hall.`,
      instagram: `Which AI model should you actually pick? Here’s the plain-English shortcut:\n\n• ${taskLine}\n• Best fit: ${candidate.name} (${candidate.provider})\n• Role: ${insight.archetypeLabel}\n• Remember this rule: ${insight.ruleHeadline}\n\n${insight.ruleBody}\n\nSave this card for next time — The Model Hall refreshes every Friday with newly launched models and is always free.\n\n#AIModels #LearnAI #AIForBeginners #TheModelHall`,
    };
  }, [candidate, taskText, insight]);

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `the-model-hall-${candidate.id}-${activeFormat.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 2200);
  };

  const handleCopyCaption = async () => {
    const text = captions[captionPlatform];
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedCaption(true);
    window.setTimeout(() => setCopiedCaption(false), 2200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-card-heading"
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
            className={`relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border-2 overflow-hidden shadow-2xl ${
              isBlueprint
                ? 'bg-[#0F172A] border-[#38BDF8] text-[#E2E8F0]'
                : 'bg-[#FAF5EC] border-[#111827] text-[#111827]'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`px-6 py-4 border-b flex items-center justify-between gap-4 ${
                isBlueprint
                  ? 'bg-[#112036] border-[#1E3A5F]'
                  : 'bg-[#111827] border-[#111827] text-[#FAF5EC]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1F7A73] text-white flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="share-card-heading" className="font-serif text-xl font-semibold text-white">
                    Shareable AI Intuition Card
                  </h2>
                  <p className="text-xs text-[#CBD5E1]">
                    Download a crisp PNG card ready for LinkedIn, X, or Instagram—purely branded as The Model Hall.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Share Card Studio"
                className="p-2 rounded-lg border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-[1.2fr_0.95fr] gap-6 items-start">
              {/* Left: Format Switcher + Live Canvas Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div
                    role="group"
                    aria-label="Export aspect ratio"
                    className={`inline-flex rounded-xl border-[1.5px] p-0.5 ${
                      isBlueprint
                        ? 'bg-[#0B172A] border-[#38BDF8]/60'
                        : 'bg-[#FFFDF9] border-[#111827]'
                    }`}
                  >
                    {FORMATS.map((fmt) => {
                      const active = fmt.id === formatId;
                      return (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setFormatId(fmt.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                            active
                              ? isBlueprint
                                ? 'bg-[#38BDF8] text-[#0B1526]'
                                : 'bg-[#111827] text-[#FAF5EC]'
                              : isBlueprint
                              ? 'text-[#94A3B8] hover:text-white'
                              : 'text-[#475569] hover:text-[#111827]'
                          }`}
                        >
                          {fmt.label}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[11px] font-mono opacity-70">
                    {activeFormat.platformHint} PNG
                  </span>
                </div>

                {/* Live Rendered Canvas Preview */}
                <div
                  className={`rounded-xl border p-3 flex items-center justify-center ${
                    isBlueprint
                      ? 'bg-[#0B172A] border-[#1E3A5F]'
                      : 'bg-[#EFE8DC] border-[#111827]/20'
                  }`}
                >
                  <canvas
                    ref={canvasRef}
                    className={`rounded-lg shadow-md ${
                      formatId === 'story'
                        ? 'max-h-[420px] w-auto'
                        : formatId === 'square'
                        ? 'max-h-[380px] w-auto'
                        : 'w-full h-auto'
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#E85D4A] hover:bg-[#D44B39] text-white font-bold text-sm border-[1.5px] border-[#111827] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {downloaded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>PNG Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download {activeFormat.label} Card (PNG)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right: Ready-to-Paste Educational Post Copy */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-80">
                    <Sparkles className="w-3.5 h-3.5 text-[#1F7A73]" />
                    Ready-to-Paste Post Copy
                  </span>
                </div>

                <div
                  role="tablist"
                  aria-label="Caption platform"
                  className={`grid grid-cols-3 rounded-xl border-[1.5px] p-0.5 ${
                    isBlueprint
                      ? 'bg-[#0B172A] border-[#38BDF8]/60'
                      : 'bg-[#FFFDF9] border-[#111827]'
                  }`}
                >
                  {(
                    [
                      { id: 'linkedin', label: 'LinkedIn' },
                      { id: 'x', label: 'X / Twitter' },
                      { id: 'instagram', label: 'Instagram' },
                    ] as const
                  ).map((tab) => {
                    const active = captionPlatform === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => {
                          setCaptionPlatform(tab.id);
                          setCopiedCaption(false);
                        }}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          active
                            ? isBlueprint
                              ? 'bg-[#1E3A5F] text-[#7DD3FC]'
                              : 'bg-[#1F7A73] text-white'
                            : isBlueprint
                            ? 'text-[#94A3B8] hover:text-white'
                            : 'text-[#475569] hover:text-[#111827]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div
                  className={`rounded-xl border-[1.5px] p-3.5 text-xs sm:text-[13px] leading-relaxed whitespace-pre-line min-h-[240px] ${
                    isBlueprint
                      ? 'bg-[#0B172A] border-[#1E3A5F] text-[#CBD5E1]'
                      : 'bg-[#FFFDF9] border-[#111827]/25 text-[#1E293B]'
                  }`}
                >
                  {captions[captionPlatform]}
                </div>

                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className={`w-full py-2.5 px-4 rounded-xl border-[1.5px] text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    copiedCaption
                      ? 'bg-[#1F7A73] border-[#111827] text-white'
                      : isBlueprint
                      ? 'bg-[#132640] border-[#38BDF8] text-[#E0F2FE] hover:bg-[#1E3A5F]'
                      : 'bg-[#FFFDF9] border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-[#FAF5EC]'
                  }`}
                >
                  {copiedCaption ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Caption Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy {captionPlatform === 'x' ? 'X' : captionPlatform === 'linkedin' ? 'LinkedIn' : 'Instagram'} Caption</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
