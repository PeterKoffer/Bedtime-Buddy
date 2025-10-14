# Local-only Library & Sharing Board

This app runs without a backend service. All data persists locally via `localStorage`.

## Auto-load (first run)

- On first run, the app fetches `/creatures_2025.json` from `public/` and stores it under `bedtimeBuddy.creatures.v2025`.
- Minimal validation: 10 items; each has `id`, `name`, `species`.
- On failure, a toast appears and a “Retry Prefab Load” button shows in the header.

## Library

- Import JSON to replace the prefab set.
- Search across name/species/tags/suggested_themes.
- Filters: Age ranges (4-6, 6-8) and languages (da/en).
- Sort by Name (A→Z) or Likes (desc). Likes are aggregated from the Sharing Board using `creature_id`.
- Reset Filters to defaults.

## Generate

- From Library, click “Use in story” to navigate to Generate with a selected creature using router state (session-only).
- Generate shows a badge “Using prefab: {name}” and a Clear button to remove the prefill.

## Sharing Board

- Nickname: Prompt once if missing; stored under `bedtimeBuddy.user.nickname`. The nickname is shown on the board.
- Posting: Title + excerpt + optional `creature_id`; stored under `bedtimeBuddy.board.posts`.
- Likes: One like per nickname per post. Stored under `bedtimeBuddy.board.likes[postId]` as an array of nicknames. The UI shows total likes; Library aggregates likes per creature.
- Bad-word filter: Simple client-side filter prevents posting until edited.
- All strings use i18n with safe defaults.

## Moderation & Visibility

- Local-only environment; posts and likes are visible on this device/browser only.
- For public sharing with moderation and accounts, enable Supabase and integrate auth/rls policies in a future iteration.