# Shagun — Mehendi Artist Website

A static, mobile-first website for Shagun, a mehendi artist based in Kota, Rajasthan, serving brides, families and festivals since 2006 with 30 years of experience.

## What this project is

A 7-page static website that:
- Showcases Shagun's work across 5 service categories
- Explains mehendi types (Natural / Instant / Alta) and safety
- Routes every visitor to WhatsApp, phone, or email with pre-filled context
- Contains **no backend, no database, no payment processing**

It is **not** a booking engine. The website's job ends where the conversation begins (WhatsApp or phone).

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
