# Frontend architecture

## Boundaries

This application is intentionally a browser-facing Next.js frontend. It does not add API route handlers, server actions, external-service clients, credentials, or a database. Data displayed in the workspace is fictional seed data plus local browser state.

The integration seam is `src/lib/services/contracts.ts`. UI features currently call the local implementations in `src/lib/services/mock-services.ts`; these adapters update the Zustand store and return promises to provide realistic loading states. Replace the adapter implementations with typed API clients when a backend exists. Do not move Cloudflare or email-provider credentials into the browser.

## Application layers

1. **App Router** — public pages live directly under `src/app`; the authenticated-style demo shell is nested under `src/app/app`.
2. **Layouts and providers** — root layout provides CSS, theme synchronization, store rehydration, and Sonner. The app route group adds the responsive sidebar/header shell.
3. **Feature components** — reusable client components live under `src/components/features`. Route files are intentionally thin.
4. **Shared UI** — `src/components/ui` contains local shadcn/ui-style button, card, dialog, input, badge, field, toggle, empty-state, and skeleton components. Dialogs and dropdown/accordion interactions use Radix UI primitives.
5. **State and models** — shared interfaces are in `src/types/index.ts`; seed content is in `src/lib/mock-data/index.ts`; browser-demo state and deterministic actions are in `src/stores/demo-store.ts`.
6. **Forms** — React Hook Form manages form state and Zod provides frontend validation. Password values are not part of the persisted store.

## State and persistence

`useDemoStore` uses Zustand `persist` with a guarded storage adapter and `skipHydration`. `AppProviders` rehydrates in an effect so accessing `window` or `localStorage` does not happen during server rendering. The default server/client render begins from the same seed data; theme and density classes are synchronized after hydration.

Persisted state is local, editable demo content—not a secure store. The state model deliberately excludes credentials, tokens, and uploaded file bytes. Selected composer attachments retain only file metadata for demonstration.

## Services

- `AuthService`: simulated sign-in, registration, and recovery flows.
- `EmailService`: local list, draft, send-to-demo-Sent, and folder actions.
- `DomainService`: local domain creation, simulated verification, and removal.
- `ContactService`: local contact CRUD.
- `SettingsService`: local preference saves.
- `TeamService`: local invitation creation.

For a future implementation, define request/response DTOs and error types, then replace `mock-services.ts`. Keep success messages explicit about whether an action is local or externally completed.

## UI and route composition

The `AppShell` contains an accessible responsive sidebar, top header, global search, theme toggle, notification menu, and profile menu. Mailbox folders share `MailboxPage`; setting routes share `SettingsPage`; domain list and detail remain separate flows. The landing page includes a handcrafted React UI preview and uses only embedded CSS/SVG and local icons.

All external reference links open explicitly in a new tab. No remote fonts, images, or stylesheets are required for the in-app preview.

## Integration cautions

- DNS examples use `.invalid` and are illustrative only. Actual MX, SPF, DKIM, and DMARC values depend on the chosen services and zone.
- Demo `verifyDomain` is a local state transition, never a DNS query.
- Demo `sendMessage` only creates a local Sent item, never calls an SMTP or provider endpoint.
- Authorization is not implemented. Sidebar visibility and mock roles are not permissions.
- Analytics are deterministic demo datasets and must not be presented as provider telemetry.
