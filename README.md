This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Medha

This project includes:

- Resume upload and parsing (PDF, DOCX, TXT)
- OCR fallback for scanned PDFs
- AI resume analysis and dashboard insights

## Configuration

Set these environment variables in `.env.local` or Vercel project settings:

### AI Provider Keys (Legitimate Platforms Only)

```bash
# Google Gemini (FREE tier - recommended, always available)
GEMINI_API_KEY=your_gemini_key
# Alternative aliases also supported:
# GOOGLE_API_KEY=your_gemini_key
# GENAI_API_KEY=your_gemini_key

# Groq API (FREE tier - ultra-fast inference)
GROQ_API_KEY=your_groq_api_key

# OpenAI (Optional, PAID - enables premium gpt-4o-mini analysis)
OPENAI_API_KEY=your_openai_key

# Database & Auth
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
```

### Provider Cascade Strategy

The system uses this priority order for resume analysis:

1. **Google Gemini** (if GEMINI_API_KEY configured) - Fast, reliable, free
2. **Groq** (if GROQ_API_KEY configured) - Ultra-fast, free
3. **OpenAI** (if OPENAI_API_KEY configured) - Premium analysis (billing-dependent)
4. **Deterministic Fallback** - Keyword + action analysis (no API required, always works)

**Guaranteed Analysis**: The system ALWAYS returns meaningful scoring. If all AI providers are unavailable, it uses production-grade keyword matching and heuristics.

### Getting Your API Keys

- **Gemini**: https://ai.google.dev/tutorials/python_quickstart (Free tier available)
- **Groq**: https://console.groq.com (Free tier available)
- **OpenAI**: https://platform.openai.com/api-keys (Paid, but optional)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
