# Shagun — Mehendi Artist Website

A static, mobile-first website for Shagun, a mehendi artist based in Kota, Rajasthan, serving brides, families and festivals since 2006 with 30 years of experience.

## What this project is

A 7-page static website that:
- Showcases Shagun's work across 5 service categories
- Explains mehendi types (Natural / Instant / Alta) and safety
- Routes every visitor to WhatsApp, phone, or email with pre-filled context
- Contains **no backend, no database, no payment processing**

It is **not** a booking engine. The website's job ends where the conversation begins (WhatsApp or phone).

## Before you write any code

**Read all files in `specs/` in order, before writing any code:**

1. `specs/01-architecture.md` — Stack, folder structure, components
2. `specs/02-content-schema.md` — Zod schemas and content examples
3. `specs/03-business-rules.md` — 31 business rules and 7 build gates
4. `specs/04-pages-copy.md` — Page-by-page specs and final copy
5. `specs/05-deployment.md` — Cloudflare Pages setup
6. `specs/06-content-guide.md` — How the owner edits content

Each spec is authoritative. When in doubt, the spec wins.

## Quick start

```bash
# Prerequisites: Node 20 LTS
nvm use 20

# Install
npm install

# Dev
npm run dev
# → http://localhost:4321

# Build with gates
npm run build
# → runs 7 build gates; any failure blocks the build