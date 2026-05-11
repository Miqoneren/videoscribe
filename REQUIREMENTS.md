# REQUIREMENTS.md — VideoScribe

> The product spec. What we are building, for whom, and why. Update this when behavior changes.

---

## 1. Vision

A SaaS web app that takes any meeting recording (audio or video) and turns it into:
1. **A faithful transcription** in the original language of the recording.
2. **One or more structured analyses** (summary, brief, action items, key decisions, meeting minutes) in **any language the user chooses**.

The app is the only mature offering for **Armenian-speaking business teams**, while supporting English and Russian on equal footing. Other languages can be added without code changes (prompt-template + UI locale only).

A Chrome extension captures Google Meet and Zoom calls so the user never has to figure out how to record.

---

## 2. Primary users

- **Armenian business teams** (Yerevan-based, regional offices). Meetings often code-switch between Armenian / Russian / English.
- **Sales / customer success teams** running multilingual calls who need one tool that handles all three languages well.
- **Solo founders / consultants** who want fast meeting notes.

---

## 3. Core user flows

### 3.1 Upload flow (web app)
1. User signs in (email or Google OAuth, via Supabase).
2. User drops an audio or video file (mp3, wav, m4a, mp4, mov, webm).
3. File is uploaded to Supabase Storage (`recordings` bucket, user-scoped).
4. FFmpeg.wasm (client side) splits files >20 min into ~3-min WAV chunks.
5. Client posts chunks to `POST /api/transcribe` route handler.
6. Route handler streams each chunk to Gemini, returns text. Speaker labels included.
7. Backend persists transcript to `transcripts` table.
8. User sees transcript appear progressively.
9. User picks **output type(s)** (summary / brief / action items / key decisions / meeting minutes) and **output language** (independent of transcript language).
10. Client posts to `POST /api/analyze` → Gemini → results saved to `analyses` table.
11. User can copy, export (md / pdf / docx), share.

### 3.2 Chrome extension flow (live capture)
1. User installs the extension (unpacked or via Chrome Web Store).
2. User joins a Google Meet or Zoom call.
3. Extension auto-detects the call. User clicks "Start Recording" in the popup.
4. Extension records via `chrome.tabCapture` + offscreen `MediaRecorder` (webm/opus, 128 kbps).
5. User stops → extension downloads `.webm` and (optional v2) auto-uploads to the web app via magic-link handoff.
6. Web app proceeds as in 3.1 step 4 onward.

### 3.3 Archive flow
- Every transcript + every analysis is persisted in Supabase.
- User has a searchable archive: filter by date, language, length, output type.

---

## 4. Output types (analyses)

Each is a separate prompt-template + UI card. All produced in the user's chosen output language.

| Type | What it contains |
|---|---|
| **Summary** | 1–3 paragraphs. Narrative overview. |
| **Brief** | 5–8 bullet points. Executive-style. |
| **Action items** | Numbered list of concrete tasks, with owner (if mentioned) and deadline (if mentioned). |
| **Key decisions** | List of decisions made. Each: what, why, who decided. |
| **Meeting minutes** | Formal minutes: attendees, agenda inferred, discussion per topic, decisions, action items, next steps. |

User can request **multiple output types** from one transcript. Architecture must allow adding new types without touching the rest of the app (just add a new prompt template + register it).

---

## 5. Language behavior (CRITICAL — read twice)

### 5.1 Transcription
- Always in the **source audio language**, auto-detected.
- We **never** translate the transcript.
- Speaker labels (e.g. `Speaker 1:`, `Speaker 2:`) are language-neutral.

### 5.2 Analyses
- Always in the **user-selected output language**.
- User can change output language at any time and **regenerate** analyses without re-transcribing.
- Default output language: same as the user's UI locale.

### 5.3 Supported languages MVP
- **Armenian (hy)**
- **English (en)**
- **Russian (ru)**

### 5.4 Extensibility
Adding a new language requires only:
1. Add locale code to `lib/i18n/locales.ts`.
2. Add UI strings to `lib/i18n/translations/<locale>.json`.
3. (Optional) Tune analysis prompts in `lib/analyses/prompts/<locale>/`.

No core code changes.

---

## 6. Pricing

| Tier | Price | Limits |
|---|---|---|
| Free | $0 | 5 transcriptions/month, max 30 min each, archive 30 days |
| Pro | TBD | Unlimited transcriptions, max 4 hours each, unlimited archive, priority queue |
| Team (later) | TBD | Pro + shared workspace + SSO |

User chooses output types and output language on both tiers. No paywall on language features.

---

## 7. Non-goals (for v1)

- ❌ Real-time / live transcription during the call (post-call only).
- ❌ Native desktop app (browser + extension only).
- ❌ Mobile app (responsive web is enough for v1).
- ❌ Custom vocabulary / glossaries (v2).
- ❌ Integrations (Slack / Notion / Google Drive) — v2.
- ❌ Translating the transcript itself.

---

## 8. Success metrics (post-launch)

- Time-to-first-transcript < 60 seconds for a 10-min audio file.
- Armenian transcription word error rate (WER) < 15% on clean audio.
- Free → Pro conversion > 5%.
- < 1% transcription job failure rate.

---

## 9. Open questions

- [ ] Real Pro price.
- [ ] Final domain (Miqo to provide).
- [ ] Real-time mode — v2 timeline?
- [ ] Direct extension → app handoff (skip manual `.webm` upload) — v1 or v2?
- [ ] Beyond hy/en/ru — which next?
