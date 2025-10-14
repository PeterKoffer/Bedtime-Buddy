# i18n Coverage Audit (Danish default, English toggle)

Project: /workspace/shadcn-ui  
Dev URL: http://localhost:5174/

Scope: Scan for remaining English user-facing texts; propose i18n keys and Danish translations. The list below includes file path + line numbers (as currently in repo), suggested keys, and proposed translations.

Note: If line numbers shift due to edits, use the surrounding text to locate the string.

## src/components/character/AvatarGenerator.tsx
- L216: "🎬 Animated Story Avatar Generator"
  - key: avatar.title
  - da: "🎬 Animeret historie-avatar generator"
- L218: "Transform {characterName} into a friendly 3D animated story character"
  - key: avatar.subtitle
  - da: "Gør {characterName} til en venlig 3D-animeret historiefigur"
- L238: "Detected:"
  - key: avatar.detected.label
  - da: "Registreret:"
- L241: "Hair:"
  - key: avatar.traits.hair
  - da: "Hår:"
- L246: "Gender set: {selectedGender}"
  - key: avatar.traits.genderSet
  - da: "Køn valgt: {selectedGender}"
- L258–261: "Using selected gender: {selectedGender} (overrides AI guess)."
  - key: avatar.traits.genderOverride
  - da: "Bruger valgt køn: {selectedGender} (overskriver AI’s gæt)."
- L266: "Eyes:"
  - key: avatar.traits.eyes
  - da: "Øjne:"
- L269: "Skin:"
  - key: avatar.traits.skin
  - da: "Hud:"
- L272: "Freckles: {traits.freckles ? 'yes' : 'no'}"
  - key: avatar.traits.freckles
  - da: "Fregner: {traits.freckles ? 'ja' : 'nej'}"
- L276: "Marks:"
  - key: avatar.traits.marks
  - da: "Kendetegn:"
- L290–292: Step headings:
  - "🔎 Analyserer {characterName}'s fotos..." (Already Danish; keep)
  - "🎨 Genererer {characterName}'s avatar..." (Already Danish; keep)
  - "✨ Afslutter {characterName}'s avatar..." (Already Danish; keep)
- L313–323: CTA button "🎬 Generate Story Avatar"
  - key: avatar.cta.generate
  - da: "🎬 Generér historie-avatar"
- L302: "Cancel"
  - key: common.cancel
  - da: "Annuller"
- L339–341: "Try Again"
  - key: common.tryAgain
  - da: "Prøv igen"
- L375–378: "Regenerate"
  - key: avatar.actions.regenerate
  - da: "Generér igen"
- L379–382: "Download"
  - key: common.download
  - da: "Hent"
- L386: "Generated {generationAttempts} versions"
  - key: avatar.generatedCount
  - da: "Genereret {count} versioner"

Toasts/messages (ensure localized via i18n):
- Success: "Avatar genereret" (ok, Danish)
  - key: avatar.toast.success.title
  - da: "Avatar genereret"
- Success desc: "Vi har lavet et nyt avatar-portræt."
  - key: avatar.toast.success.desc
  - da: "Vi har lavet et nyt avatar-portræt."
- Error: "Kunne ikke generere avatar-billede"
  - key: avatar.toast.error.title
  - da: "Kunne ikke generere avatar-billede"
- Error desc: "Tjek din internetforbindelse eller prøv igen."
  - key: avatar.toast.error.desc
  - da: "Tjek din internetforbindelse eller prøv igen."

## src/components/character/CharacterCreation.tsx
- L327: "👧 Gender (optional)"
  - key: character.gender.label
  - da: "👧 Køn (valgfrit)"
- L330: "Girl"
  - key: character.gender.girl
  - da: "Pige"
- L331: "Boy"
  - key: character.gender.boy
  - da: "Dreng"
- L332: "Non-binary"
  - key: character.gender.nonBinary
  - da: "Non-binær"
- L333: "Prefer not to say"
  - key: character.gender.unspecified
  - da: "Foretrækker ikke at sige"
- L355: "This guides the AI to avoid gender mismatches."
  - key: character.gender.helper
  - da: "Dette hjælper AI’en med at undgå kønsmismatch."

Other possible English texts in this file (buttons/labels/tips) should be converted to t('...') and added to locales.

## src/components/story/GenerateStory.tsx
Common English strings to check and localize:
- Buttons: "Generate", "Start", "Save", "Publish", "Preview"
  - keys:
    - story.generate.cta -> da: "Generér"
    - story.start -> da: "Start"
    - common.save -> da: "Gem"
    - common.publish -> da: "Udgiv"
    - common.preview -> da: "Forhåndsvis"
- Notices/Toasts: "LLM not configured", "Missing API key", "Story generated"
  - keys:
    - common.llmNotConfigured -> da: "LLM ikke konfigureret"
    - common.missingApiKey -> da: "Manglende API-nøgle"
    - story.toast.generated -> da: "Historie genereret"

Please insert t('...') and add to da/en locales with the above keys.

## src/pages/CreateStory.tsx
Likely English strings:
- Headings: "Create a Character", "Add details", "Appearance", "Personality", "Save Character"
  - keys:
    - create.title -> da: "Opret en karakter"
    - create.details -> da: "Tilføj detaljer"
    - create.appearance -> da: "Udseende"
    - create.personality -> da: "Personlighed"
    - create.save -> da: "Gem karakter"

## src/pages/Generate.tsx
Likely English strings:
- Headings/CTAs: "Generate a Story", "Settings", "Language"
  - keys:
    - generate.title -> da: "Generér en historie"
    - common.settings -> da: "Indstillinger"
    - common.language -> da: "Sprog"

## src/pages/Home.tsx
Check hero/CTA texts:
- "Get started", "Create a character", "Generate story", "Library"
  - keys:
    - home.getStarted -> da: "Kom i gang"
    - home.createCharacter -> da: "Opret en karakter"
    - home.generateStory -> da: "Generér historie"
    - home.library -> da: "Bibliotek"

## src/App.tsx
Check navigation items and header badges:
- "Home", "Create", "Generate", "Stories"
  - keys:
    - nav.home -> da: "Hjem"
    - nav.create -> da: "Opret"
    - nav.generate -> da: "Generér"
    - nav.stories -> da: "Historier"
- Connectivity badges:
  - "LLM not configured" -> common.llmNotConfigured -> da: "LLM ikke konfigureret"
  - "Mode: Local-only" -> common.mode.localOnly -> da: "Tilstand: Kun lokalt"
  - "Supabase" (if shown) -> common.mode.supabase -> da: "Supabase"

## General guidance
- Wrap all user-facing strings in t('...').
- Default language: Danish ('da'). Ensure LanguageSwitcher toggles to English ('en').
- Add missing keys to:
  - /src/i18n/locales/da.json
  - /src/i18n/locales/en.json
- Persist language to localStorage key 'appLang'.

## Proposed additions to locales (examples)
da.json:
```json
{
  "avatar": {
    "title": "🎬 Animeret historie-avatar generator",
    "subtitle": "Gør {{name}} til en venlig 3D-animeret historiefigur",
    "detected": { "label": "Registreret:" },
    "traits": {
      "hair": "Hår:",
      "eyes": "Øjne:",
      "skin": "Hud:",
      "freckles": "Fregner: {{value}}",
      "marks": "Kendetegn:",
      "genderSet": "Køn valgt: {{gender}}",
      "genderOverride": "Bruger valgt køn: {{gender}} (overskriver AI’s gæt)."
    },
    "cta": { "generate": "🎬 Generér historie-avatar" },
    "actions": { "regenerate": "Generér igen" },
    "generatedCount": "Genereret {{count}} versioner",
    "toast": {
      "success": { "title": "Avatar genereret", "desc": "Vi har lavet et nyt avatar-portræt." },
      "error": { "title": "Kunne ikke generere avatar-billede", "desc": "Tjek din internetforbindelse eller prøv igen." }
    }
  },
  "character": {
    "gender": {
      "label": "👧 Køn (valgfrit)",
      "girl": "Pige",
      "boy": "Dreng",
      "nonBinary": "Non-binær",
      "unspecified": "Foretrækker ikke at sige",
      "helper": "Dette hjælper AI’en med at undgå kønsmismatch."
    }
  },
  "common": {
    "cancel": "Annuller",
    "tryAgain": "Prøv igen",
    "download": "Hent",
    "save": "Gem",
    "publish": "Udgiv",
    "preview": "Forhåndsvis",
    "llmNotConfigured": "LLM ikke konfigureret",
    "settings": "Indstillinger",
    "language": "Sprog",
    "mode": { "localOnly": "Tilstand: Kun lokalt", "supabase": "Supabase" }
  },
  "home": {
    "getStarted": "Kom i gang",
    "createCharacter": "Opret en karakter",
    "generateStory": "Generér historie",
    "library": "Bibliotek"
  },
  "create": {
    "title": "Opret en karakter",
    "details": "Tilføj detaljer",
    "appearance": "Udseende",
    "personality": "Personlighed",
    "save": "Gem karakter"
  },
  "generate": {
    "title": "Generér en historie"
  },
  "story": {
    "generate": { "cta": "Generér" },
    "toast": { "generated": "Historie genereret" }
  }
}
```

en.json (examples mirroring keys):
```json
{
  "avatar": {
    "title": "🎬 Animated Story Avatar Generator",
    "subtitle": "Transform {{name}} into a friendly 3D animated story character",
    "detected": { "label": "Detected:" },
    "traits": {
      "hair": "Hair:",
      "eyes": "Eyes:",
      "skin": "Skin:",
      "freckles": "Freckles: {{value}}",
      "marks": "Marks:",
      "genderSet": "Gender set: {{gender}}",
      "genderOverride": "Using selected gender: {{gender}} (overrides AI guess)."
    },
    "cta": { "generate": "🎬 Generate Story Avatar" },
    "actions": { "regenerate": "Regenerate" },
    "generatedCount": "Generated {{count}} versions",
    "toast": {
      "success": { "title": "Avatar generated", "desc": "We created a new avatar portrait." },
      "error": { "title": "Could not generate avatar image", "desc": "Check your internet connection or try again." }
    }
  },
  "character": {
    "gender": {
      "label": "👧 Gender (optional)",
      "girl": "Girl",
      "boy": "Boy",
      "nonBinary": "Non-binary",
      "unspecified": "Prefer not to say",
      "helper": "This helps the AI avoid gender mismatches."
    }
  },
  "common": {
    "cancel": "Cancel",
    "tryAgain": "Try Again",
    "download": "Download",
    "save": "Save",
    "publish": "Publish",
    "preview": "Preview",
    "llmNotConfigured": "LLM not configured",
    "settings": "Settings",
    "language": "Language",
    "mode": { "localOnly": "Mode: Local-only", "supabase": "Supabase" }
  },
  "home": {
    "getStarted": "Get started",
    "createCharacter": "Create a character",
    "generateStory": "Generate story",
    "library": "Library"
  },
  "create": {
    "title": "Create a Character",
    "details": "Add details",
    "appearance": "Appearance",
    "personality": "Personality",
    "save": "Save Character"
  },
  "generate": {
    "title": "Generate a Story"
  },
  "story": {
    "generate": { "cta": "Generate" },
    "toast": { "generated": "Story generated" }
  }
}
```

## Summary
- The above items capture many remaining English strings, especially in AvatarGenerator and CharacterCreation.
- Please apply t('...') replacements and populate da/en locales accordingly.
- After localization, verify default Danish with English toggle via LanguageSwitcher.