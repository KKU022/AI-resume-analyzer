# Medha — Project Structure

This folder contains the complete, production-ready source code for the Medha SaaS platform.

## 📂 Structured Layout Overview

### 🏁 Core & Configuration

- `package.json`: Project dependencies and scripts.
- `next.config.mjs`: Next.js configuration (unoptimized images for demo).
- `tsconfig.json`: TypeScript configuration for strict type-safety.
- `.env.local`: Environment variables (API keys).

### 🚀 App Layer (`/app`)

Organized by route groups and SaaS modules:

- `/(auth)`: Premium login and signup flows.
- `/(dashboard)`: The main SaaS engine.
  - `/upload`: Resume ingestion module.
  - `/analysis`: AI deep-scan reports.
  - `/skill-gap`: Career roadmap generator.
  - `/jobs`: Intelligent job matching.
  - `/history`: Previous analysis tracking.
  - `/settings`: Account and profile management.
- `/api`: Backend service layer for OpenAI integration and file parsing.

### 🧩 Components (`/components`)

Modularized for high reusability:

- `/landing`: Awwwards-level sections (Hero, Features, Navbar, Footer).
- `/dashboard`: Shared SaaS UI elements (Sidebar, Topbar, Analytics Cards).
- `/ui`: Standardized atomic components (Buttons, Cards, Inputs) via ShadCN.

### 📊 Data & Utils (`/data`, `/lib`)

- `mock-analysis-data.ts`: High-fidelity data for hackathon demonstrations.
- `utils.ts`: Global helper functions (Tailwind Merge, etc.).

---

✨ **Medha** — Built for high-impact career growth.
