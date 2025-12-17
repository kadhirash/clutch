"use client";

import React from "react";
import { BusinessEntity } from "@/app/types/ai-chat";

type AiMessageVariant = "card" | "bubble";

type SuggestionItem = {
  title: string;
  body: string;
};

function isBulletLine(line: string) {
  return (
    /^(\d+[\)\.\-]|[-*•])\s+/.test(line) ||
    /^[A-Z][A-Za-z0-9'’&().,\- ]+:\s+/.test(line)
  );
}

function cleanBulletPrefix(line: string) {
  return line.replace(/^(\d+[\)\.\-]|[-*•])\s+/, "");
}

function splitIntoSentences(text: string) {
  // Keep it heuristic (no heavy NLP): split on punctuation followed by space + a capital letter.
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseRestaurantSuggestions(text: string): {
  intro?: string;
  items?: SuggestionItem[];
} {
  const raw = text.trim();
  if (!raw) return {};

  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Handle already-list-like responses (bullets / numbering / "Name: description")
  if (lines.some(isBulletLine)) {
    const items: SuggestionItem[] = [];
    let current: SuggestionItem | null = null;

    for (const line of lines) {
      if (isBulletLine(line)) {
        const cleaned = cleanBulletPrefix(line);
        const [maybeTitle, ...rest] = cleaned.split(":");
        const hasTitleColon = rest.length > 0 && maybeTitle.trim().length > 1;

        const title = hasTitleColon ? maybeTitle.trim() : "";
        const body = hasTitleColon ? rest.join(":").trim() : cleaned.trim();

        current = {
          title,
          body,
        };
        items.push(current);
      } else if (current) {
        current.body = `${current.body} ${line}`.trim();
      }
    }

    return { items: items.filter((i) => i.title || i.body) };
  }

  // Handle paragraph-y responses (like the screenshot)
  const sentences = splitIntoSentences(raw);
  if (sentences.length <= 1) return {};

  const introCandidates: string[] = [];
  const items: SuggestionItem[] = [];

  const nameVerbRegex =
    /^((?:The|A|An)\s+)?([A-Z][\w'’&().,\-]*(?:\s+[A-Z][\w'’&().,\-]*){0,6})\s+(is|offers|serves|specializes|specialises|known|features|has|delivers|provides)\b/;

  for (const sentence of sentences) {
    const s = sentence.replace(/^\s+/, "").trim();
    if (!s) continue;

    if (/^here (are|is)\b/i.test(s) || /^top\b/i.test(s) || /^based on\b/i.test(s)) {
      introCandidates.push(s);
      continue;
    }

    const match = s.match(nameVerbRegex);
    if (match) {
      const fullName = `${match[1] || ""}${match[2]}`.trim();
      const body = s.slice(fullName.length).trim().replace(/^[-–—:]\s*/, "");
      items.push({ title: fullName, body });
      continue;
    }

    // Fallback: try "Name — description" style
    const dashSplit = s.split(/\s+[–—-]\s+/);
    if (dashSplit.length >= 2 && /^[A-Z]/.test(dashSplit[0].trim())) {
      items.push({ title: dashSplit[0].trim(), body: dashSplit.slice(1).join(" — ").trim() });
      continue;
    }

    // As a last resort, keep it as a body-only item if we already started a list.
    if (items.length > 0) {
      items.push({ title: "", body: s });
    } else {
      introCandidates.push(s);
    }
  }

  const intro =
    introCandidates.length > 0 ? introCandidates.join(" ").trim() : undefined;

  // Only return items if it truly looks like multiple suggestions.
  if (items.length >= 2) return { intro, items };
  return { intro };
}

function Paragraphs({ text }: { text: string }) {
  const paragraphs = text
    .trim()
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="space-y-2">
      {paragraphs.map((p, idx) => (
        <p key={idx} className="whitespace-pre-line leading-relaxed">
          {p}
        </p>
      ))}
    </div>
  );
}

export function AiMessage({
  text,
  variant = "card",
  businesses = [],
}: {
  text: string;
  variant?: AiMessageVariant;
  businesses?: BusinessEntity[];
}) {
  const parsed = parseRestaurantSuggestions(text);
  const items = parsed.items ?? [];
  const hasList = items.length >= 2;

  const normalizeName = (s: string) =>
    s
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");

  const businessByName = new Map(
    businesses
      .filter((b) => b?.name && b?.url)
      .map((b) => [normalizeName(b.name), b])
  );

  if (!hasList) {
    return (
      <div
        className={
          variant === "bubble"
            ? "text-foreground/90 leading-relaxed text-sm sm:text-base"
            : "text-foreground/90 text-center leading-relaxed text-sm sm:text-base"
        }
      >
        <Paragraphs text={text} />
      </div>
    );
  }

  return (
    <div className={variant === "bubble" ? "space-y-3 sm:space-y-4" : "space-y-4 sm:space-y-5"}>
      {variant === "card" && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            <span className="text-xs sm:text-sm uppercase tracking-wider text-foreground/70 font-semibold">
              Concierge Picks
            </span>
          </div>
        </div>
      )}
      {parsed.intro && (
        <p
          className={
            variant === "bubble"
              ? "text-foreground/80 leading-relaxed text-sm sm:text-base"
              : "text-foreground/80 text-center leading-relaxed text-sm sm:text-base px-4"
          }
        >
          {parsed.intro}
        </p>
      )}

      <ol className={variant === "bubble" ? "space-y-2 sm:space-y-3" : "space-y-3 sm:space-y-4"}>
        {items.slice(0, 6).map((item, idx) => {
          const linkedBusiness = item.title
            ? businessByName.get(normalizeName(item.title))
            : undefined;

          return (
            <li
              key={`${item.title}-${idx}`}
              className={
                variant === "bubble"
                  ? "leading-relaxed"
                  : "rounded-xl sm:rounded-2xl border border-border-light glass-strong p-3 sm:p-4 text-left hover:border-accent/30 transition-all duration-200"
              }
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="mt-0.5 sm:mt-1 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-accent/20 text-accent text-xs sm:text-sm font-bold flex-shrink-0 shadow-glow-sm">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  {item.title && (
                    <div
                      className={
                        variant === "bubble"
                          ? "font-semibold text-foreground text-sm sm:text-base"
                          : "font-semibold text-foreground text-sm sm:text-base md:text-lg mb-1"
                      }
                    >
                      {linkedBusiness ? (
                        <a
                          href={linkedBusiness.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-accent transition-colors underline-offset-2 hover:underline"
                        >
                          {item.title}
                        </a>
                      ) : (
                        item.title
                      )}
                    </div>
                  )}
                  <div
                    className={
                      variant === "bubble"
                        ? "text-foreground/80 text-xs sm:text-sm leading-relaxed"
                        : "text-foreground/80 text-xs sm:text-sm md:text-base leading-relaxed"
                    }
                  >
                    {item.body}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
