# Medha AI Resume Analyzer

Medha is a Next.js resume intelligence platform that extracts resume content, analyzes it with multiple AI providers, and generates ATS, skills, and career guidance insights.

## Core Features

- Resume upload and parsing for PDF, DOCX, TXT, and MD files
- Multi-provider AI analysis with automatic provider fallback
- ATS, skill match, and experience scoring
- Career roadmap, role recommendations, and improvement suggestions
- Analysis history with provider and reliability status
- Transparent degraded/synthetic mode notifications for judge-facing clarity

## AI Decision Pipeline

Medha uses a cascading provider strategy in this order:

1. Google Gemini (free tier)
2. Groq (free tier)
3. OpenAI (paid, billing dependent)
4. Deterministic fallback (keyword and heuristic analysis)
5. Synthetic last-resort mode (clearly labeled backup when reliable AI scoring cannot be completed)

### Why this design exists

- Billing, model deprecations, and provider outages are common in hackathon and production settings.
- A single-provider architecture can silently fail and produce unusable results.
- This pipeline guarantees an output while preserving transparency about reliability.

## Reliability and Transparency Modes

Medha explicitly reports analysis reliability:

- AI Valid: Analysis came from a live AI provider with meaningful output.
- Degraded: Deterministic fallback was used because providers failed or output quality was low.
- Synthetic Mode: Randomized backup report generated as a last-resort demo-safe output when reliable AI scoring could not be completed.

Important: Synthetic mode is clearly labeled in notes and diagnostics so judges can differentiate it from true AI analysis.

## Extraction Quality Guardrails

Before scoring, Medha checks extracted text quality to avoid scoring corrupted content:

- Rejects parser placeholder text
- Detects PDF object-stream noise (obj, xref, stream, trailer artifacts)
- Rejects very short/garbled/low-signal text
- Surfaces explicit reasons when a resume is degraded

This prevents fake confidence from unreadable extraction.

## Environment Variables

Configure these in local `.env.local` and Vercel project settings:

```bash
# AI providers
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
OPENAI_API_KEY=your_openai_key

# Optional Gemini aliases (supported)
# GOOGLE_API_KEY=your_gemini_key
# GENAI_API_KEY=your_gemini_key

# Database and auth
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# OAuth (if enabled)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Local Development

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Start production server locally:

```bash
npm run start
```

## Judge Notes

If analysis appears degraded, it usually means one of these conditions occurred:

- The uploaded file contained unreadable/embedded PDF object data
- The resume was image-heavy and text extraction quality was low
- AI provider model endpoint was unavailable/deprecated
- API quota or billing prevented premium model usage

Medha records and exposes these causes in analysis diagnostics and notifications.

## Troubleshooting Checklist

1. Verify `GEMINI_API_KEY` is present in all deployment environments.
2. Verify `GROQ_API_KEY` is configured as secondary provider.
3. Upload a text-based PDF or DOCX (not scanned image PDF) for best results.
4. Check analysis diagnostics on the report page for provider and reliability state.
5. If degraded mode appears repeatedly, re-export resume as clean DOCX or TXT and retry.

## Tech Stack

- Next.js App Router (TypeScript)
- MongoDB with Mongoose
- NextAuth
- pdf-parse, pdfjs-dist, mammoth, tesseract.js
- Multi-provider AI integration (Gemini, Groq, OpenAI)

## Deployment

Deploy on Vercel with environment variables configured for all environments:

- Production
- Preview
- Development

After updating provider keys or models, redeploy to ensure runtime picks up the latest configuration.
