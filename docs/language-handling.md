# docs/language-handling.md — Two Languages, One Product

> The single most important product rule lives here. If something contradicts this file, this file wins.

---

## The rule

VideoScribe handles two **independent** languages:

1. **Source language** = the language of the audio. Auto-detected by Gemini. Used for the transcript.
2. **Output language** = the language of the analyses (summary, brief, action items, etc.). Chosen by the user from a switcher.

These two are **never coupled**. Armenian audio → English summary is a valid, common flow. So is English audio → Armenian minutes.

We **never translate the transcript itself**. The transcript is always in the source language.

---

## UI

- Transcribe page: no language selection. Gemini handles detection.
- Analysis page: a **Language switcher** dropdown (default = user's profile `default_output_lang`, fallback to UI locale).
- Changing the dropdown triggers a regenerate button per analysis card. (We don't auto-regenerate on every dropdown change because each regen costs a Gemini call.)

---

## Backend

- `transcripts.source_language` (auto-detected, stored).
- `analyses.output_language` (user-selected, stored).
- Cache key for an analysis: `(transcript_id, type, output_language)`. Switching the output language gets a fresh row, not a re-write.

---

## Prompt selection

Prompts live in `lib/analyses/prompts/<type>/<locale>.ts`. Example file:

```ts
// lib/analyses/prompts/summary/hy.ts
export default (transcript: string) => `
Հայերենով կազմեք հակիրճ ամփոփագիր հետևյալ սղագրությունից։
Բացահայտեք քննարկված հիմնական թեմաները։

Սղագրությունը՝
${transcript}
`;
```

Loader:
```ts
// lib/analyses/load.ts
import type { AnalysisType } from './types';
export async function loadPrompt(type: AnalysisType, locale: string) {
  const safeLocale = SUPPORTED_LOCALES.includes(locale) ? locale : 'en';
  const mod = await import(`./prompts/${type}/${safeLocale}.ts`);
  return mod.default;
}
```

If a locale lacks a prompt for a given type, fall back to English.

---

## Supported locales (MVP)

| Code | Name | Native |
|---|---|---|
| `hy` | Armenian | Հայերեն |
| `en` | English | English |
| `ru` | Russian | Русский |

---

## Adding a new language

1. Add the code to `lib/i18n/locales.ts` (single source of truth for supported locales).
2. Add UI strings: `lib/i18n/translations/<code>.json`.
3. (Optional but recommended) Add per-type prompts: `lib/analyses/prompts/<type>/<code>.ts`. If missing, English fallback kicks in automatically.
4. No core code changes.
