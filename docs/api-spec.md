# docs/api-spec.md — VideoScribe API

> All API routes are Next.js App Router route handlers under `app/api/`. JSON requests/responses unless noted. Auth via Supabase session cookie.

---

## POST /api/transcribe

Transcribe a single audio chunk. Called once per chunk by the client.

**Auth:** required.

**Request body:**
```ts
{
  transcriptId: string;           // uuid; created server-side on first call
  storageKey: string;             // Supabase Storage object key
  chunkIndex: number;             // 0-based
  isFinal: boolean;
}
```

**Response (SSE stream):**
```
event: progress
data: {"chunkIndex": 0, "text": "Speaker 1: ..."}

event: done
data: {"transcriptId": "...", "totalChunks": 4}
```

**Errors:** 401 unauthenticated, 402 over free-tier limit, 413 chunk too large, 500 Gemini failure.

---

## POST /api/analyze

Generate one analysis of a transcript in a chosen output language.

**Auth:** required.

**Request body:**
```ts
{
  transcriptId: string;
  type: 'summary' | 'brief' | 'action_items' | 'key_decisions' | 'meeting_minutes';
  outputLanguage: 'hy' | 'en' | 'ru' | string;     // any locale code
  forceRegenerate?: boolean;                       // ignore cached result
}
```

**Response:**
```ts
{
  id: string;
  content: string;                                 // markdown
  cached: boolean;
}
```

**Errors:** 401, 404 transcript not owned by user, 500 Gemini failure.

---

## POST /api/auth/callback

OAuth callback for Supabase. Handles code exchange. Redirects to `/transcribe`.

---

## POST /api/stripe/checkout

Create a Stripe Checkout Session for the Pro plan. Returns redirect URL.

**Auth:** required.

**Response:**
```ts
{ url: string }
```

---

## POST /api/stripe/webhook

Stripe → server. Verifies signature using `STRIPE_WEBHOOK_SECRET`. Handles `customer.subscription.{created,updated,deleted}`, updates `profiles.plan`.

**Auth:** Stripe signature, not user session.

---

## GET /api/transcripts/:id/export

Export a transcript + analyses as md / pdf / docx.

**Query params:** `?format=md|pdf|docx&include=transcript,summary,minutes,…`

**Response:** file download (signed Storage URL or streamed body).
