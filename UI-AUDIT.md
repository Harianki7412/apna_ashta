# UI audit and design system

## Audit summary

The application already had a useful base of Tailwind color utilities and shared `.btn`, `.input`, `.card`, `.card-premium`, and `.badge` classes. Before this update, component surfaces mixed fixed light colors, slate-based dark colors, and ad hoc modal treatments. Most pages also use Tailwind utilities directly, so spacing and corner radii can drift between screens.

The shared tokens below now define the default palette and semantic light/dark surfaces. Common navigation, footer, listing-card, dashboard-card, form, and modal surfaces are connected to those foundations. This was a source-level audit; a route-by-route visual review in a browser has not been performed.

## Shared tokens

| Area | Standard |
|---|---|
| Brand | Blue scale (`brand-500`–`brand-700`) for primary actions and links |
| Accent | Gold scale (`accent-*`) for highlights; amber warning uses the darker `warning-700` text on light badges |
| Status | Green success, amber warning, red danger |
| Light surfaces | Page `#f8fafc`, card/raised `#ffffff`, muted `#f1f5f9` |
| Dark surfaces | Page `#0f172a`, card/raised `#1e293b` |
| Text | Primary `#111827` / `#f1f5f9`; secondary `#374151` / `#cbd5e1`; muted `#6b7280` / `#94a3b8` |
| Borders | `#e5e7eb` light / `#334155` dark, with subtle surface borders |
| Typography | Fluid display; headings 36/24/18px; body 15px; caption 13px |
| Radius | 6/8/12/16/20px (`sm` through `2xl`) |
| Elevation | Shared card, card-hover, button, float, and theme-aware modal shadows |
| Spacing | Tailwind's 4px spacing scale; shared controls and cards use tokenized padding |

Semantic custom properties are defined in `app/globals.css` and resolve per theme: `--surface-*`, `--text-*`, `--border-*`, `--overlay-backdrop`, and shared shadow tokens.

## Reusable class conventions

| Pattern | Usage |
|---|---|
| `.btn` + `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-success` | Action hierarchy; add `.btn-sm` or `.btn-lg` for size |
| `.input`, `.label`, `.input-error` | Form controls and validation |
| `.card` | Dashboard and content panels |
| `.card-premium` | Interactive property/listing cards |
| `.badge` + `.badge-brand`, `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-featured` | Status and metadata |
| `.modal-backdrop` + `.modal-panel` | Shared light/dark modal overlay and panel; retain sizing/layout utilities on the panel |
| `.type-display`, `.type-title`, `.type-heading`, `.type-body`, `.type-caption` | Named typography roles |
| `.site-nav`, `.site-nav--scrolled`, `.site-footer` | Shared global shell surfaces |
| `PageShell`, `SectionHeader`, `StatusBadge`, `EmptyState` | Shared page framing, section headings, status labels, and no-results content |

Keep layout-specific spacing in Tailwind utilities, but prefer the shared component classes for repeated controls and surfaces instead of restating color, border, radius, or shadow utilities.

## Surface audit

| Surface | Current foundation | Follow-up |
|---|---|---|
| Navbar | Semantic surface/border tokens and shared scrolled elevation | Check mobile and desktop states at narrow widths |
| Footer | Shared shell surface; existing link and content layout retained | Check long translated labels and footer contrast |
| Property cards | `.card-premium` plus semantic card surface/shadows | Review image overlays and all badge/status combinations |
| Owner dashboard | Refreshed owner workspace, metric cards, shortcuts, and property list; shared semantic surfaces | Check additional translated labels and narrow-screen control wrapping |
| Admin panels | Shared admin shell, consistent blue navigation, semantic cards, readable responsive tables, and shared spacing | Review modal layouts and long-content states on the least-used admin screens |
| Forms | `.input` / `.label` tokenized and used in shared forms | Some pages still use utility-styled controls; migrate incrementally and check error/disabled states |
| Modals | Three shared modal surfaces use `.modal-backdrop` / `.modal-panel` | Other overlays and command palettes remain bespoke |
| Light/dark theme | Shared token pairs plus existing explicit dark utilities | Manual contrast and screenshot review remains outstanding |

## Validation notes

- Shared button, input, card, badge, and modal styles are centralized in `app/globals.css`.
- Repeated listing, agreement, notification, and saved-search screens use shared page and section components; common API payloads and view models live in `types/index.ts`.
- Key modal implementations use the same semantic panel and overlay classes.
- No wholesale page-by-page migration was done; existing utility layouts and intentional status colors are preserved.
- Owner listings can be searched, filtered by status, and sorted by date, rent, or views without changing the dashboard totals.
- Admin loading and error boundaries are shared across routes; property and analytics fetch errors are distinct from empty results and can be retried.
- `npm run lint`, `npx tsc --noEmit`, and `npm run build` passed after these updates.
- Browser-based visual regression and a full accessibility contrast audit remain recommended follow-up work.
