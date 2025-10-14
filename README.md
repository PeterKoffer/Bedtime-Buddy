# Bedtime Buddy (Local-only)

Tech stack:
- Vite + React + TypeScript
- Tailwind CSS
- shadcn-ui components
- Localization (react-i18next)

Backend: Local-only (localStorage). Supabase is disabled.

## First-run auto-load

On app start, if `bedtimeBuddy.creatures.v2025` is missing, the app fetches `/creatures_2025.json` (copied to `public/`), validates a minimal schema (array of 10 items with `id`, `name`, `species`), and saves to localStorage. If loading fails, a toast appears and a “Retry Prefab Load” button shows in the header.

## Public Library

- Import JSON: Replace the prefab set by uploading a JSON array of creatures.
- Search: Free-text across name, species, tags, suggested_themes.
- Filters: Age (4-6, 6-8) and Language (da/en).
- Sort: Name (A→Z) and Likes (desc). Likes are aggregated from the Sharing Board by creatureId.
- Reset Filters: One-click reset.

## Generate flow prefill

Navigate from Library → “Use in story” to Generate. The selection is passed via router state (session-only). Generate shows:
- Badge “Using prefab: {name}”
- Prefill details (themes/tags/seed)
- Clear button to remove prefill

## Sharing Board

- Nickname: Prompt once if missing; stored under `bedtimeBuddy.user.nickname`.
- Posting: Title + excerpt + optional linked creatureId; stored under `bedtimeBuddy.board.posts`.
- Likes: One like per nickname per post (toggle) stored under `bedtimeBuddy.board.likes[postId]` (array of nicknames). Counts are shown per post; Library aggregates likes per creature.
- Bad-word filter: Simple client-side block for title/excerpt.
- All strings use i18n with default fallbacks.

## Storage keys

- `bedtimeBuddy.creatures.v2025`
- `bedtimeBuddy.board.posts`
- `bedtimeBuddy.board.likes`
- `bedtimeBuddy.user.nickname`

## Notes

- Router/Auth/Layout: All Links and Routes render inside `BrowserRouter`; `AuthProvider` wraps the app root. Home uses the starfield theme.
- Persistence: Local-only. For public backend, enable Supabase via the platform’s Supabase button.
- Lint: Run `pnpm run lint` and `pnpm run build` before publish.