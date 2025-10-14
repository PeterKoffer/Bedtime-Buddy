/**
 * OpenAI integration: story generation, Vision trait extraction, and image generation (no edits).
 * - LocalStorage overrides: OPENAI_API_KEY_OVERRIDE, OPENAI_BASE_URL_OVERRIDE
 * - JSON payloads with timeouts and localized error mapping.
 */
import type { CharacterTraits } from "@/types";

export interface StoryGenParams {
  age_min: number;
  age_max: number;
  primary_age: number;
  complexity_level: string;
  words_total_min: number;
  words_total_max: number;
  words_per_page: number;
  reading_minutes?: number;
  max_pages?: number;

  child_name?: string;
  pronouns?: string;
  reading_prefs?: string;
  content_boundaries?: string[];
  theme_main?: string;
  theme_secondary?: string;
  settings?: string[];
  vibes?: string[];
  learning_goals?: string[];
  humor_level?: string;
  language: string;
  locale: string;
  dedication?: string | null;

  avatar_codename?: string;
  avatar_description?: string;
  avatar_tokens?: string[];
  secondary_characters?: string[];
  companion?: string | null;
  clothing_rule?: string;

  aspect_ratio?: string;
  art_style?: string;
  lighting_style?: string;
  palette_keywords?: string[];
  linework?: string;
  camera_style?: string;
}

export type GenerateOpts = { signal?: AbortSignal; timeoutMs?: number };

function getLang(): "da" | "en" {
  try {
    const v = window.localStorage.getItem("appLang");
    return v === "en" ? "en" : "da";
  } catch {
    return "da";
  }
}

function getEffectiveKey(): string | undefined {
  try {
    const override = window.localStorage.getItem("OPENAI_API_KEY_OVERRIDE") || undefined;
    return override || (import.meta.env.VITE_OPENAI_API_KEY as string | undefined);
  } catch {
    return import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  }
}

function getEffectiveBase(): string {
  try {
    const override = window.localStorage.getItem("OPENAI_BASE_URL_OVERRIDE") || undefined;
    return override || (import.meta.env.VITE_OPENAI_BASE_URL as string) || "https://api.openai.com/v1";
  } catch {
    return (import.meta.env.VITE_OPENAI_BASE_URL as string) || "https://api.openai.com/v1";
  }
}

async function safeReadText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

/**
 * Generate a strict JSON storybook using OpenAI Chat Completions.
 */
export async function generateStoryBookJSON(
  params: StoryGenParams,
  opts: GenerateOpts = {},
): Promise<unknown> {
  const timeoutMs = typeof opts.timeoutMs === "number" ? opts.timeoutMs : 45000;

  const key = getEffectiveKey();
  if (!key) {
    const lang = getLang();
    throw new Error(
      lang === "da"
        ? "Story-generation er ikke konfigureret. Tilføj OPENAI API nøgle i .env.local."
        : "Story generation is not configured. Add OPENAI API key in .env.local."
    );
  }

  const internalController = new AbortController();
  const { signal } = opts;
  if (signal) {
    if (signal.aborted) {
      internalController.abort();
    } else {
      signal.addEventListener("abort", () => internalController.abort(), { once: true });
    }
  }

  const url = `${getEffectiveBase()}/chat/completions`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };

  const system =
    "You are a bedtime storybook generator. Respond ONLY with valid JSON object following schema: " +
    '{ "title": string, "language": string, "pages": [ { "text": string, "illustration_prompt": string } ], "meta": { "words_total": number, "primary_age": number } }.';

  const user = {
    type: "story_request",
    params,
  };

  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: JSON.stringify(user) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  };

  let timeoutId: number | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = (typeof window !== "undefined" ? window.setTimeout : setTimeout)(() => {
      try {
        internalController.abort();
      } catch {
        // ignore
      }
      const lang = getLang();
      reject(new Error(lang === "da" ? "Generering fik timeout" : "Generation timed out"));
    }, timeoutMs) as unknown as number;
  });

  try {
    const fetchPromise = fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: internalController.signal,
    });
    const res = (await Promise.race([fetchPromise, timeoutPromise])) as Response;

    if (!res.ok) {
      const text = await safeReadText(res);
      console.error("[openai.generateStoryBookJSON] HTTP error", { status: res.status, text });
      const lang = getLang();
      throw new Error(
        lang === "da" ? `OpenAI fejl: ${res.status} ${res.statusText}` : `OpenAI error: ${res.status} ${res.statusText}`
      );
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.length) {
      console.error("[openai.generateStoryBookJSON] empty content", json);
      const lang = getLang();
      throw new Error(lang === "da" ? "Ugyldigt JSON fra modellen (tomt indhold)" : "Invalid JSON from model (empty content)");
    }

    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (e) {
      console.error("[openai.generateStoryBookJSON] parse error", e);
      const lang = getLang();
      throw new Error(lang === "da" ? "Ugyldigt JSON fra modellen (parse fejlede)" : "Invalid JSON from model (parse failed)");
    }
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.error("[openai.generateStoryBookJSON] aborted");
      const lang = getLang();
      throw new Error(lang === "da" ? "Generering annulleret" : "Generation canceled");
    }
    const msg = err instanceof Error ? err.message : (getLang() === "da" ? "Story generering fejlede" : "Story generation failed");
    throw new Error(msg);
  } finally {
    if (typeof timeoutId !== "undefined") {
      (typeof window !== "undefined" ? window.clearTimeout : clearTimeout)(timeoutId as unknown as number);
    }
  }
}

/**
 * Vision-based trait extraction using gpt-4o.
 * - Includes user content with text + image_url entries for each photo (data URL or http URL).
 * - Returns CharacterTraits, or a stub if API key missing.
 */
export async function extractCharacterTraitsFromPhotosVision(photos: string[]): Promise<{ traits: CharacterTraits }> {
  const key = getEffectiveKey();
  if (!key) {
    // Stub so UI can continue
    return {
      traits: {
        hairColor: "unknown",
        hairStyle: "unknown",
        eyeColor: "unknown",
        skinTone: "unknown",
        freckles: false,
        genderGuess: "unspecified",
        notableMarks: [],
      },
    };
  }

  const url = `${getEffectiveBase()}/chat/completions`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };

  const systemPrompt =
    "You are a careful vision assistant. Extract concise character traits from provided images. Respond ONLY with JSON.";
  const userText =
    "Extract hairColor, hairStyle, eyeColor, skinTone, freckles (boolean), notableMarks (array of strings), genderGuess (string). Output strictly JSON.";

  const content: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > = [{ type: "text", text: userText }];
  for (const p of photos?.slice(0, 4) || []) {
    const urlItem = p; // data URLs or remote URLs
    content.push({ type: "image_url", image_url: { url: urlItem } });
  }

  const body = {
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content },
    ],
    response_format: { type: "json_object" },
    temperature: 0,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`Vision detection failed: ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    const contentStr = json?.choices?.[0]?.message?.content;
    if (!contentStr || typeof contentStr !== "string") {
      throw new Error("Vision returned empty content");
    }
    const parsed = JSON.parse(contentStr);
    const traits: CharacterTraits = {
      hairColor: parsed?.hairColor ?? "unknown",
      hairStyle: parsed?.hairStyle ?? "unknown",
      eyeColor: parsed?.eyeColor ?? "unknown",
      skinTone: parsed?.skinTone ?? "unknown",
      freckles: Boolean(parsed?.freckles ?? false),
      genderGuess: parsed?.genderGuess ?? "unspecified",
      notableMarks: Array.isArray(parsed?.notableMarks) ? parsed.notableMarks : [],
    };
    return { traits };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Vision detection failed";
    console.error("[openai.extractCharacterTraitsFromPhotosVision] error", msg);
    // Return stub on failure
    return {
      traits: {
        hairColor: "unknown",
        hairStyle: "unknown",
        eyeColor: "unknown",
        skinTone: "unknown",
        freckles: false,
        genderGuess: "unspecified",
        notableMarks: [],
      },
    };
  }
}

/**
 * Generate an avatar image (no edits) with a descriptive prompt.
 * Returns a data URL: "data:image/png;base64,...."
 */
export async function generateAvatarImage(opts: {
  appearance: string;
  controller?: AbortController;
  timeoutMs?: number;
}): Promise<string> {
  const apiKey = getEffectiveKey();
  const lang = getLang();
  if (!apiKey) {
    throw new Error(
      lang === "da"
        ? "Story/Avatar-generation er ikke konfigureret endnu. Tilføj din OPENAI API nøgle i .env.local."
        : "Story/Avatar generation is not configured yet. Add your OPENAI API key in .env.local."
    );
  }

  const model = (import.meta.env.VITE_OPENAI_IMAGE_MODEL as string) || "gpt-image-1";
  const size = "1024x1024";
  const timeoutMs = opts.timeoutMs ?? 45000;

  const controller = opts.controller ?? new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const prompt = [
    "Kid-safe, brand-neutral portrait of a child avatar.",
    "Inclusive, correct age proportions, natural expression.",
    "Cinematic, dreamy, soft focus; gentle warm dusk light.",
    `Appearance: ${opts.appearance || (lang === "da" ? "venligt, alderssvarende, neutral stil" : "friendly, age-appropriate, neutral style")}.`,
    "No text, no logos, no watermark.",
  ].join(" ");

  try {
    const res = await fetch(`${getEffectiveBase()}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        size,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      let message = lang === "da"
        ? `Avatar generering fejlede: ${res.status} ${res.statusText}`
        : `Avatar generation failed: ${res.status} ${res.statusText}`;
      if (res.status === 401 || res.status === 403) {
        message = lang === "da" ? "API nøgle ugyldig eller ikke indlæst" : "API key invalid or not loaded";
      } else if (res.status === 429) {
        message = lang === "da" ? "Du har ramt en grænse (rate limit/kvote). Prøv igen senere." : "Rate limit/quota reached. Try again later.";
      } else if (res.status === 400) {
        message = lang === "da" ? "Ugyldig anmodning – format er nu rettet til JSON." : "Invalid request — format is now fixed to JSON.";
      }
      throw new Error(message);
    }

    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error(lang === "da" ? "Manglende billeddata fra OpenAI (generate)." : "Missing image data from OpenAI (generate).");
    }
    return `data:image/png;base64,${b64}`;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : (lang === "da" ? "Kunne ikke generere avatar-billede" : "Could not generate avatar image");
    throw new Error(msg);
  } finally {
    clearTimeout(timer);
  }
}