/**
 * Analysis prompt templates
 * 
 * Each analysis type has prompts for each output language (hy, en, ru).
 * The transcript is ALWAYS in its original language - only the analysis output is translated.
 */

import type { AnalysisType } from '@/app/api/analyze/route';

export type OutputLanguage = 'hy' | 'en' | 'ru';

// ============================================================================
// SUMMARY PROMPTS
// ============================================================================

const SUMMARY_PROMPTS: Record<OutputLanguage, string> = {
  hy: `Դուք մասնագիտացված օգնական եք հանդիպումների ամփոփագրեր ստեղծելու համար:
Ստորև բերված տրանսկրիպտից կազմեք հստակ, կառուցվածքային ամփոփագիր հայերենով:
Ներառեք՝ հանդիպման հիմնական թեման, կարևոր քննարկումները, և եզրակացությունները:
Պահպանեք պրոֆեսիոնալ, բայց մատչելի ոճ:`,

  en: `You are a professional meeting summarization assistant.
Create a clear, structured summary in English from the transcript below.
Include: the main topic, key discussion points, and conclusions.
Maintain a professional but accessible tone.`,

  ru: `Вы — профессиональный помощник по составлению резюме встреч.
Создайте четкое, структурированное резюме на русском языке на основе транскрипта ниже.
Включите: основную тему, ключевые моменты обсуждения и выводы.
Сохраняйте профессиональный, но доступный тон.`,
};

// ============================================================================
// BRIEF PROMPTS
// ============================================================================

const BRIEF_PROMPTS: Record<OutputLanguage, string> = {
  hy: `Դուք գործադիր օգնական եք: Ստորև բերված տրանսկրիպտից պատրաստեք կարճ, գործնական տեղեկագիր հայերենով:
Ֆորմատ՝
• Նպատակ: [մեկ նախադասություն]
• Հիմնական կետեր: [3-5 կետ]
• Հաջորդ քայլեր: [եթե կան]
Պահպանեք կարճ և ընթեռնելի:`,

  en: `You are an executive assistant. Create a brief, actionable executive brief in English from the transcript below.
Format:
• Purpose: [one sentence]
• Key points: [3-5 bullet points]
• Next steps: [if any]
Keep it concise and scannable.`,

  ru: `Вы — исполнительный помощник. Создайте краткую, практичную служебную записку на русском языке на основе транскрипта ниже.
Формат:
• Цель: [одно предложение]
• Ключевые моменты: [3-5 пунктов]
• Следующие шаги: [если есть]
Сохраняйте краткость и удобочитаемость.`,
};

// ============================================================================
// ACTION ITEMS PROMPTS
// ============================================================================

const ACTION_ITEMS_PROMPTS: Record<OutputLanguage, string> = {
  hy: `Դուք նախագծի մենեջեր եք: Ստորև բերված տրանսկրիպտից դուրս բերեք բոլոր գործողությունները և ներկայացրեք հայերենով:
Ֆորմատ՝
[ ] Գործողություն — Պատասխանատու (եթե նշված է) — Ժամկետ (եթե նշված է)
Միայն կոնկրետ, գործողությամբ արտահայտված կետեր:`,

  en: `You are a project manager. Extract all action items from the transcript below and present them in English.
Format:
[ ] Action item — Owner (if mentioned) — Due date (if mentioned)
Only include concrete, actionable items.`,

  ru: `Вы — менеджер проекта. Извлеките все задачи из транскрипта ниже и представьте их на русском языке.
Формат:
[ ] Задача — Ответственный (если указан) — Срок (если указан)
Включайте только конкретные, выполнимые пункты.`,
};

// ============================================================================
// KEY DECISIONS PROMPTS
// ============================================================================

const KEY_DECISIONS_PROMPTS: Record<OutputLanguage, string> = {
  hy: `Դուք ռազմավարական խորհրդատու եք: Ստորև բերված տրանսկրիպտից նշեք բոլոր ընդունված որոշումները հայերենով:
Ֆորմատ՝
✓ Որոշում — Հիմնավորում (կարճ) — Ազդեցություն (եթե քննարկվել է)
Միայն պաշտոնապես ընդունված որոշումներ, ոչ թե առաջարկներ:`,

  en: `You are a strategic advisor. List all decisions made from the transcript below in English.
Format:
✓ Decision — Rationale (brief) — Impact (if discussed)
Only include formally agreed decisions, not suggestions.`,

  ru: `Вы — стратегический консультант. Перечислите все принятые решения из транскрипта ниже на русском языке.
Формат:
✓ Решение — Обоснование (кратко) — Влияние (если обсуждалось)
Включайте только официально принятые решения, а не предложения.`,
};

// ============================================================================
// MEETING MINUTES PROMPTS
// ============================================================================

const MEETING_MINUTES_PROMPTS: Record<OutputLanguage, string> = {
  hy: `Դուք պրոֆեսիոնալ քարտուղար եք: Ստորև բերված տրանսկրիպտից կազմեք պաշտոնական արձանագրություն հայերենով:
Կառուցվածք՝
1. Մետատվյալներ (ամսաթիվ, մասնակիցներ, նպատակ)
2. Օրակարգի կետեր և քննարկումներ
3. Ընդունված որոշումներ
4. Գործողություններ և պատասխանատուներ
5. Հաջորդ հանդիպում (եթե նշված է)
Պահպանեք պաշտոնական, օբյեկտիվ ոճ:`,

  en: `You are a professional secretary. Create formal meeting minutes in English from the transcript below.
Structure:
1. Metadata (date, attendees, purpose)
2. Agenda items and discussions
3. Decisions made
4. Action items and owners
5. Next meeting (if mentioned)
Maintain a formal, objective tone.`,

  ru: `Вы — профессиональный секретарь. Составьте официальный протокол встречи на русском языке на основе транскрипта ниже.
Структура:
1. Метаданные (дата, участники, цель)
2. Пункты повестки и обсуждения
3. Принятые решения
4. Задачи и ответственные
5. Следующая встреча (если упомянута)
Сохраняйте официальный, объективный тон.`,
};

// ============================================================================
// EXPORT
// ============================================================================

const PROMPT_MAP: Record<AnalysisType, Record<OutputLanguage, string>> = {
  summary: SUMMARY_PROMPTS,
  brief: BRIEF_PROMPTS,
  action_items: ACTION_ITEMS_PROMPTS,
  key_decisions: KEY_DECISIONS_PROMPTS,
  meeting_minutes: MEETING_MINUTES_PROMPTS,
};

/**
 * Get the prompt template for a given analysis type and output language
 */
export function getAnalysisPrompt(type: AnalysisType, language: OutputLanguage): string | null {
  return PROMPT_MAP[type]?.[language] ?? null;
}

/**
 * Get all available output languages for a given analysis type
 */
export function getSupportedLanguages(type: AnalysisType): OutputLanguage[] {
  return Object.keys(PROMPT_MAP[type]) as OutputLanguage[];
}

/**
 * Get all available analysis types
 */
export function getAnalysisTypes(): AnalysisType[] {
  return Object.keys(PROMPT_MAP) as AnalysisType[];
}
