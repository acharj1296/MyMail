# Mailflare frontend demo

A responsive, interactive frontend prototype inspired by the open-source [Mailflare](https://github.com/hieunc229/mailflare) project. The reference project is a self-hosted email inbox for custom domains, with domain and mailbox management, inbox organization, contacts, and provider-aware setup. This repository implements a **frontend-only demo** of a subset of that experience, with additional mock analytics, settings, and team pages.

> **Demo boundary:** this project does not include a backend, database, real authentication, SMTP/IMAP, email delivery or receiving, Cloudflare API integration, or production DNS verification. “Send”, “verify”, “sign in”, and team administration actions update local demo state only. DNS values are illustrative and must never be copied into production DNS.

## Technology stack

- Next.js 16 App Router and React 19
- TypeScript with strict checking
- Tailwind CSS 4 (CSS-first theme tokens)
- Local shadcn/ui-style primitives with Radix UI, plus Lucide React icons
- React Hook Form and Zod validation
- Zustand with safe, browser-only localStorage persistence
- Recharts for responsive demo analytics
- Sonner for feedback, date-fns for display formatting

No environment variables are needed for this frontend demo. There is intentionally no `.env.example`.

## Prerequisites

- Node.js 20.9 or later
- npm 10 or later

## Install and run

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). The development server binds to `0.0.0.0` for preview environments. To run the browser tests, first install Playwright’s Chromium with `npm run test:e2e:install`; some Linux environments also need Playwright OS packages (`npx playwright install-deps chromium`).

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Run the Next.js development server on port 3000. |
| `npm run build` | Create a production Next.js build. |
| `npm start` | Serve the production build on port 3000. Run `npm run build` first. |
| `npm run lint` | Run ESLint across the project. |
| `npm run typecheck` | Run `tsc --noEmit` using the strict TypeScript configuration. |
| `npm run test:e2e:install` | Install Playwright Chromium for local browser tests. |
| `npm run test:e2e` | Run Playwright route, mailbox, composer, domain, theme, and mobile-navigation checks. |

## Folder structure

```text
src/
  app/                  App Router routes and layouts
    app/                Demo workspace routes
  components/
    features/            Dashboard, mailbox, domains, contacts, settings, etc.
    layout/              App shell, sidebar, header, branding
    marketing/           Landing and legal pages
    providers/           Store hydration, theme and toast setup
    ui/                  Shared Tailwind/Radix UI primitives
  lib/
    mock-data/           Fictional seed data
    services/            Service contracts and local demo adapters
    validation/          Zod schemas
    utils.ts             Shared UI helpers
  stores/                Zustand demo-state store
  types/                 Shared domain models
tests/                    Playwright end-to-end smoke and interaction tests
docs/
  FRONTEND_ARCHITECTURE.md
  FEATURES.md
```

## Demo mode and data

The application opens directly into a fictional Northstar Studio workspace so the product can be explored without signup. Login, registration, recovery, mail composition, domain verification, and team invitations are explicitly simulated. User actions update Zustand state and are persisted in `localStorage` under `mailflare-frontend-demo`; the store uses safe browser-only storage access and falls back to in-memory state when storage is unavailable.

The seed data uses fictional names and reserved `.example` addresses. DNS samples use the reserved `example.invalid` host. Theme and layout preferences are local. Use **Demo admin** and the footer notices to inspect integration boundaries.

To clear the sample workspace, remove the `mailflare-frontend-demo` key from localStorage in your browser’s developer tools, then reload.

## Frontend-only limitations

- No real identity provider or account/session security. The visible demo auth forms do not persist passwords.
- No backend routes or database.
- No inbound or outbound email service. Sending adds a local item to Sent and never transmits email.
- No actual file upload. The composer keeps only selected file names, types, and sizes in demo state.
- No Cloudflare API requests, DNS reads/writes, or production record verification.
- Analytics and activity are sample/demo data, not delivery, open, click, or uptime metrics.
- Team roles and invitations are presentation-only; they do not enforce permissions or send messages.

## Future backend integration points

The UI is kept separate from service contracts in `src/lib/services/contracts.ts`; current adapters live in `src/lib/services/mock-services.ts`. Replace those mock adapters with typed API clients for `AuthService`, `EmailService`, `DomainService`, `ContactService`, `SettingsService`, and `TeamService`. Keep the existing UI notices until the corresponding integration is actually available.

The central models are in `src/types/`, Zod form rules are in `src/lib/validation/schemas.ts`, and local interactions are coordinated in `src/stores/demo-store.ts`. A future backend can replace the persistence layer and service adapters without making DNS or email credentials available in client-side code. Never put secrets in `NEXT_PUBLIC_*` variables or browser storage.

## Reference and attribution

The user interface is an original frontend implementation inspired by the publicly available [hieunc229/mailflare](https://github.com/hieunc229/mailflare) project README and documentation. It is not the full Mailflare application and is not affiliated with its maintainers. Refer to the upstream repository for current capabilities, deployment requirements, and provider documentation.
