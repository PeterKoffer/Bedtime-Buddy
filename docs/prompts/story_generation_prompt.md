# Story Generation Prompt — Exact Template and References

This document reconstructs the exact prompt used by the app, including the literal system message and the user message (JSON string) with {{placeholders}} for runtime values. It also summarizes constraints, expected output format, word-count targets, message order, and references to source code.

## Message Order

1) System message  
2) User message (stringified JSON with type and params)

## System Message (literal text)
Source: src/lib/openai.ts (approx. lines 85–88)

```
You are a bedtime storybook generator. Respond ONLY with valid JSON object following schema: { "title": string, "language": string, "pages": [ { "text": string, "illustration_prompt": string } ], "meta": { "words_total": number, "primary_age": number } }.
```

- Enforces strictly structured JSON, no extra prose.
- Note the image field name is illustration_prompt (not image_prompt).

## User Message (stringified JSON) — Template with {{placeholders}}

Envelope and serialization
- Source (envelope): src/lib/openai.ts (approx. lines 89–102)
- Source (params assembly): src/components/story/GenerateStory.tsx (approx. lines 134–160; arrays split at 109–113)

The app sends a JSON object as a string with this shape:

```json
{
  "type": "story_request",
  "params": {
    "age_min": {{age_min}},                       // from {{age}} - 1 (clamped >= 2)
    "age_max": {{age_max}},                       // from {{age}} + 1 (clamped <= 12)
    "primary_age": {{age}},                       // protagonist primary age
    "complexity_level": "{{complexity}}",         // e.g., "simple K-2"
    "words_total_min": {{wordsMin}},
    "words_total_max": {{wordsMax}},
    "words_per_page": {{wordsPerPage}},
    "dedication": {{dedication|null|undefined}},
    "themes_primary": "{{themeMain}}",
    "themes_secondary": "{{themeSecondary}}",

    "settings": {{settingsArray}},                // derived from {{settingsText}} split by commas
    "vibes": {{vibesArray}},                      // derived from {{vibesText}} split by commas
    "learning_goals": {{learningGoalsArray}},     // derived from {{learningGoalsText}} split by commas
    "humor": "{{humor}}",
    "boundaries": {{boundariesArray}},            // derived from {{boundariesText}} split by commas (kid-safe constraints)

    "protagonist": {
      "name": "{{name}}",
      "age": {{age}},
      "gender": {{selectedGender|null|undefined}},
      "description": {{description|null|undefined}}
      /* Note: {{personality}} and {{appearance}} exist on Character model but are not sent here. */
    },

    "language": "{{language}}",                   // e.g., "English" or "Danish"
    "locale": "{{locale}}",                       // e.g., "en-GB" or "da-DK"
    "aspect": "{{aspect}}",                       // "16:9" or "4:3"

    "tokens": []                                  // brand-neutral; no proprietary brand tokens
    /* Note: {{avatarUrl}} and {{avatarGenerated}} exist on Character but are not included in params. */
  }
}
```

Placeholder notes and mappings:
- {{name}}, {{age}}, {{selectedGender}}, {{description}} come from the selected Character (mapped to protagonist).
- {{personality}}, {{appearance}}, {{avatarUrl}}, {{avatarGenerated}} are Character fields but not included in the prompt params (current implementation).
- {{themeMain}}, {{themeSecondary}}, {{settingsText}}, {{vibesText}}, {{learningGoalsText}}, {{boundariesText}}, {{humor}}, {{dedication}} correspond to UI inputs. Arrays (settings/vibes/learning_goals/boundaries) are produced by splitting the text inputs by commas and trimming whitespace.
- {{language}} and {{locale}} derive from app language selection (e.g., English → en-GB, Danish → da-DK).
- {{complexity}}, {{wordsMin}}, {{wordsMax}}, {{wordsPerPage}}, {{aspect}} are taken from the Generate Story form controls.

## Request Settings (model, format, temperature)

Source: src/lib/openai.ts (approx. lines 94–102)

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    { "role": "system", "content": "<system message above>" },
    { "role": "user", "content": "<stringified user JSON above>" }
  ],
  "response_format": { "type": "json_object" },
  "temperature": 0.7
}
```

Runtime guards and timing:
- 45s hard timeout with Promise.race and AbortController (openai.ts approx. lines 61, 68–77, 104–114).
- UI Cancel button triggers AbortController (GenerateStory.tsx approx. lines 129–133, 284–288).

## Expected Output — Strict JSON Only

The system message enforces this minimal schema (exact field names):

```json
{
  "title": "string",
  "language": "string",
  "pages": [
    { "text": "string", "illustration_prompt": "string" }
  ],
  "meta": {
    "words_total": 0,
    "primary_age": 0
  }
}
```

Notes:
- Output must be strictly JSON — no surrounding prose.
- Field names must match exactly (illustration_prompt, not image_prompt).
- The UI provides word-count targets via inputs; the model should reflect totals in meta.words_total.

## Constraints and Safety

- Brand-neutral: tokens: [] enforces no proprietary brand tokens (GenerateStory.tsx ~line 159).
- Kid-safe bedtime tone: guided by {{boundariesText}}, {{humor}}, {{vibesText}}, {{learningGoalsText}}.
- Avoid fear triggers and respect boundaries (e.g., “no spiders, no jump-scares”).
- Positive morals and gentle humor appropriate for {{age}}.
- No PII beyond what is provided (typically the child’s first name).
- Language/locale should match {{language}} and {{locale}}.

## References (approximate line ranges)

- System/user message composition and request settings:
  - src/lib/openai.ts: 85–102
- Timeout and abort/cancel:
  - src/lib/openai.ts: 61, 68–77, 104–114
  - src/components/story/GenerateStory.tsx: 129–133, 284–288
- Params assembly and placeholders:
  - src/components/story/GenerateStory.tsx: 109–113 (array splitting), 134–160 (params shape)
- Brand neutrality and safety inputs:
  - src/components/story/GenerateStory.tsx: 147–150 (boundaries), 159 (tokens: [])

## Summary

- The prompt consists of a strict JSON-only system instruction and a user message containing a stringified JSON request with the params above.
- Placeholders are mapped from the Generate Story UI and the selected Character; some Character fields (personality, appearance, avatarUrl, avatarGenerated) exist but are not included in the current params payload.