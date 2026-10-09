# Feature and route inventory

All routes render in the frontend demo. State-changing actions are local and are labeled as simulated where they could otherwise imply a live service.

## Public routes

| Route | Frontend behavior |
| --- | --- |
| `/` | Product landing page, product preview, feature sections, Cloudflare setup overview, FAQ, and navigation. |
| `/login` | Validated simulated login, password visibility, remember-me, and demo-user entry. |
| `/register` | Validated mock registration, confirmation, and password-strength indicator. |
| `/forgot-password` | Validated recovery-request simulation; no email is sent. |
| `/privacy` | Demo-specific privacy notice. |
| `/terms` | Demo-specific terms and integration limitations. |

## Workspace routes

| Route | Frontend behavior |
| --- | --- |
| `/app` | Overview metrics, activity chart, domain status, setup checklist, recent messages, and quick actions. |
| `/app/inbox` | Search, read filters, sort, selection, message detail, star, archive, trash, reply, and forward. |
| `/app/sent` | Local demo Sent messages and message details. |
| `/app/drafts` | Local drafts; opening a row resumes the composer; save/discard controls are available. |
| `/app/starred` | Starred message collection with mailbox actions. |
| `/app/archive` | Archived messages with restore/move actions. |
| `/app/trash` | Trashed messages and restore actions. |
| `/app/compose` | Recipient/CC/BCC validation, sender identity selection, rich-text-style formatting controls, local attachment metadata, auto-save, draft save, and simulated send. |
| `/app/domains` | Search, status filters, domain cards, add-domain wizard, copy name, and remove confirmation. |
| `/app/domains/[id]` | Domain status, illustrative DNS records, copy controls, setup checklist, troubleshooting accordions, mock senders, and simulated verification/removal. |
| `/app/contacts` | Searchable contacts, add/edit/delete flows, tags, notes, and detail panel. |
| `/app/analytics` | Deterministic mock trends, date-range control, responsive Recharts, and demo-data notice. |
| `/app/activity` | Searchable and filterable local activity timeline. |
| `/app/settings` | Settings overview. |
| `/app/settings/profile` | Local display name and email preferences. |
| `/app/settings/security` | Password form simulation, mock sessions, unavailable 2FA notice, demo sign-out. |
| `/app/settings/appearance` | Persistent light, dark, system, comfortable, and compact preferences. |
| `/app/settings/notifications` | Persistent local notification preference toggles. |
| `/app/settings/mailboxes` | Sender identity, signature, reply preference, and list-density controls. |
| `/app/team` | Mock members, simulated role changes, invitation dialog. |
| `/app/team/invitations` | Local pending invitation list and removal. |
| `/app/admin` | Optional mock administration overview and explicit capability boundaries. |

## User-visible limitations

- No real account authentication, password reset, mail receiving, or email delivery.
- No real attachment upload or download.
- No Cloudflare API request or DNS lookup/write.
- All records in the wizard and detail view are illustrative placeholders.
- Team/admin roles are not authorization controls.
- Analytics are mock data rather than actual mailbox or provider activity.
