# i18n Sweep: Index.tsx and NotFound.tsx

Goal: Identify remaining English strings and provide suggested i18n keys with Danish and English translations.

Note: Line numbers refer to current repository state and may shift after edits.

## File: src/pages/Index.tsx

- L37: "✨ Where Dreams Take Flight Under Starlit Skies ✨"
  - key: index.hero.tagline
  - da: "✨ Hvor drømme tager fart under stjerneklare himle ✨"
  - en: "✨ Where dreams take flight under starlit skies ✨"

- L40–42: "Create enchanting, AI-powered bedtime stories... imagination."
  - key: index.hero.lead
  - da: "Skab fortryllende, AI-drevne godnathistorier, der danser blandt stjernerne. Hver fortælling er en magisk rejse gennem dit barns fantasis kosmos."
  - en: "Create enchanting, AI-powered bedtime stories that dance among the stars. Every tale is a magical journey through the cosmos of your child’s imagination."

- L49: "✨ Create Story"
  - key: index.cta.create
  - da: "✨ Opret historie"
  - en: "✨ Create Story"

- L55: "🌙 My Stories"
  - key: index.cta.myStories
  - da: "🌙 Mine historier"
  - en: "🌙 My Stories"

- L66: "🌌 Magical Adventures Await 🌌"
  - key: index.features.heading
  - da: "🌌 Magiske eventyr venter 🌌"
  - en: "🌌 Magical adventures await 🌌"

- L69: "Journey through enchanted realms..."
  - key: index.features.subheading
  - da: "Rejs gennem fortryllede riger, hvor hver historie glitrer af forundring i månelysets blide skær."
  - en: "Journey through enchanted realms where every story sparkles with wonder under the gentle glow of moonlight."

Cards:
- L80: "✨ Enchanted Tales"
  - key: index.cards.enchanted.title
  - da: "✨ Fortryllede fortællinger"
  - en: "✨ Enchanted tales"
- L84–86: Description
  - key: index.cards.enchanted.desc
  - da: "Hver historie væves unikt af stjernestøv og drømme, skabt omkring dit barns personlighed. Se øjnene lyse, når de bliver helten i deres egen himmelske fortælling."
  - en: "Every story is uniquely woven from stardust and dreams, crafted around your child’s personality. Watch their eyes sparkle as they become the hero of their own celestial adventure."

- L96: "🌍 Worldly Wonder"
  - key: index.cards.world.title
  - da: "🌍 Verdens vidundere"
  - en: "🌍 Worldly wonder"
- L100–101: Description
  - key: index.cards.world.desc
  - da: "Flyd gennem historier fortalt på engelsk og dansk og åbn døre til fjerne lande og kulturer – under den samme stjerneklare himmel, der forbinder os alle."
  - en: "Drift through stories told in English and Danish, opening doorways to distant lands and cultures under the same starlit sky that connects us all."

- L112: "💖 Precious Moments"
  - key: index.cards.moments.title
  - da: "💖 Dyrebare øjeblikke"
  - en: "💖 Precious moments"
- L116–117: Description
  - key: index.cards.moments.desc
  - da: "Skab kærkomne godnatritualer i tusmørkets blide skær. Hver historie bliver en skat af minder, som dit barn vil bære i hjertet for altid."
  - en: "Create cherished bedtime rituals under the gentle glow of twilight. Each story becomes a treasured constellation of memories your child will carry in their heart forever."

Call-to-Action section:
- L132: "Ready to Begin Your Starlit Adventure?"
  - key: index.callout.title
  - da: "Klar til at begynde dit stjerneklare eventyr?"
  - en: "Ready to begin your starlit adventure?"
- L135: "Join thousands of families..."
  - key: index.callout.subtitle
  - da: "Slut dig til tusindvis af familier, der har opdaget magien i personlige godnathistorier."
  - en: "Join thousands of families who have discovered the magic of personalized bedtime stories."
- L140: "🌙 Create Your Story"
  - key: index.callout.button
  - da: "🌙 Opret din historie"
  - en: "🌙 Create your story"

Brand note:
- L33 "Bedtime Buddy" is a product/brand name; typically remains unchanged.

## File: src/pages/NotFound.tsx

- L13: "Page not found"
  - key: notfound.title
  - da: "Siden blev ikke fundet"
  - en: "Page not found"

- L17: "Sorry, we couldn't find the page you were looking for."
  - key: notfound.message
  - da: "Beklager, vi kunne ikke finde den side, du ledte efter."
  - en: "Sorry, we couldn't find the page you were looking for."

- L22: "Return to Home"
  - key: notfound.backHome
  - da: "Tilbage til Hjem"
  - en: "Return to Home"

## Implementation guidance

1) Replace hard-coded strings with t('...') in Index.tsx and NotFound.tsx using the above keys.
2) Add the keys to:
   - src/i18n/locales/da.json (Danish as default)
   - src/i18n/locales/en.json
3) Verify:
   - LanguageSwitcher toggles correctly.
   - All Index and NotFound texts reflect chosen language.
   - Run `pnpm run build`.

If you’d like, I can proceed to implement these replacements and update the locale JSONs now.