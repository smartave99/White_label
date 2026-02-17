# White Label E-Commerce Platform

This is a modern, fully configurable white-label e-commerce solution built with [Next.js](https://nextjs.org). It is designed to be easily rebranded and deployed for various retail clients without changing the core codebase.

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

## Configuration

The platform is driven by a centralized configuration system (`src/types/site-config.ts`), which allows you to customize the branding, theme, and features.

### 1. Environment Variables
Basic branding can be set via `.env.local`:
```bash
NEXT_PUBLIC_BRAND_NAME="Your Brand"
NEXT_PUBLIC_BRAND_LOGO="/logo.png"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
```

### 2. Firestore Configuration
For deep customization, the system loads configuration from the `site_config` collection in Firebase Firestore. This overrides environment variables and allows for runtime updates without redeployment.
- **Collection**: `site_config`
- **Document**: `main`

## Features

### AI Shopping Assistant
Includes an intelligent AI assistant that helps users find products.
- Configurable AI providers (Google Gemini, OpenAI, Anthropic) via the Admin Panel.

### Admin Dashboard
Comprehensive admin panel (located at `/admin`) for managing:
- Products, Categories, and Offers
- AI settings and API keys
- Site Content and Branding

### Automated Tracking System
The codebase includes an automated system for tracking development progress.
- **Start a task**: `npm run track init <task-id>`
- **Log work**: `npm run track log "message"`
- **Finish task**: `npm run track stop`

## Deployment

The easiest way to deploy is using the [Vercel Platform](https://vercel.com). Ensure all environment variables found in `.env.example` are configured in your deployment project.
