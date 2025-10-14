import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, RefreshCw, Download, Wand2, AlertCircle, BadgeCheck } from "lucide-react";
import { extractCharacterTraitsFromPhotosVision, generateAvatarImage } from "@/lib/openai";
import type { CharacterTraits, GenderOption } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import placeholder from "@/assets/avatar_placeholder.svg";
import { useTranslation } from "react-i18next";

interface AvatarGeneratorProps {
  photos: string[];
  characterName: string;
  characterAge: number;
  selectedGender?: GenderOption;
  onAvatarGenerated: (avatarUrl: string) => void;
}

type GenStep = 0 | 1 | 2 | 3;

type GenerationLog = {
  ts: string;
  name: string;
  age: number;
  traits: CharacterTraits | null;
  likeness: number;
  status: "success" | "error";
  data?: Record<string, unknown>;
};

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

export default function AvatarGenerator({
  photos,
  characterName,
  characterAge,
  selectedGender,
  onAvatarGenerated,
}: AvatarGeneratorProps) {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const [generationAttempts, setGenerationAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [traits, setTraits] = useState<CharacterTraits | null>(null);
  const [likeness, setLikeness] = useState<number>(75);
  const [step, setStep] = useState<GenStep>(0);

  const hairIsRed = useMemo(
    () =>
      (traits?.hairColor || "").toLowerCase().includes("red") ||
      (traits?.hairColor || "").toLowerCase().includes("ginger"),
    [traits]
  );

  const logsKey = "avatarGenerationLogs";

  const saveLog = (status: "success" | "error", data: Record<string, unknown> = {}) => {
    try {
      const logs: GenerationLog[] = JSON.parse(localStorage.getItem(logsKey) || "[]") as GenerationLog[];
      logs.push({
        ts: new Date().toISOString(),
        name: characterName,
        age: characterAge,
        traits,
        likeness,
        status,
        data,
      });
      localStorage.setItem(logsKey, JSON.stringify(logs));
    } catch {
      // ignore
    }
  };

  const latestGenIdRef = useRef<string | null>(null);
  const timeoutsRef = useRef<{ slow?: number; kill?: number }>({});

  const clearGenTimers = () => {
    const tRef = timeoutsRef.current;
    if (tRef.slow) clearTimeout(tRef.slow);
    if (tRef.kill) clearTimeout(tRef.kill);
    timeoutsRef.current = {};
  };

  const cancelGeneration = () => {
    latestGenIdRef.current = null;
    clearGenTimers();
    setIsGenerating(false);
    setStep(0);
    setAnalysisStep("");
    setError(i18n.language === "da" ? "Annulleret af bruger." : "Canceled by user.");
    saveLog("error", { canceled: true });
  };

  const testLLM = async () => {
    try {
      const key = getEffectiveKey();
      if (!key) {
        toast({
          title: t("avatar.toast_not_configured_title"),
          description: t("avatar.toast_not_configured_desc"),
          variant: "destructive",
        });
        return;
      }
      const base = getEffectiveBase();
      const res = await fetch(`${base}/models`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (res.ok) {
        toast({ title: t("connectivity.test_ok") });
      } else {
        toast({
          title: t("connectivity.test_fail"),
          description: `${res.status} ${res.statusText}`,
          variant: "destructive",
        });
      }
    } catch (e: unknown) {
      toast({
        title: t("connectivity.test_fail"),
        description: e instanceof Error ? e.message : t("common.unknown_error"),
        variant: "destructive",
      });
    }
  };

  // Generate avatar using image generations only + optional Vision traits
  const generateAvatar = async () => {
    setError(null);

    if (!getEffectiveKey()) {
      setGeneratedAvatar(placeholder);
      setTraits(null);
      toast({
        title: t("avatar.toast_not_configured_title"),
        description: t("avatar.toast_not_configured_desc"),
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationAttempts((prev) => prev + 1);
    setStep(1);
    setAnalysisStep(t("avatar.analyzing", { name: characterName }));

    const genId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? (crypto as unknown as { randomUUID: () => string }).randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    latestGenIdRef.current = genId;

    timeoutsRef.current.slow = window.setTimeout(() => {
      if (latestGenIdRef.current === genId) {
        setAnalysisStep(i18n.language === "da" ? "Det tager lidt længere tid end normalt… arbejder stadig." : "Taking a bit longer than usual… still working.");
      }
    }, 30000);

    timeoutsRef.current.kill = window.setTimeout(() => {
      if (latestGenIdRef.current === genId) {
        setError(i18n.language === "da" ? "Dette tager for lang tid. Prøv igen." : "This is taking too long. Please try again.");
        setIsGenerating(false);
        setStep(0);
        setAnalysisStep("");
        saveLog("error", { timedOut: true });
        latestGenIdRef.current = null;
      }
    }, 90000);

    try {
      // Vision detection if key present
      try {
        const result = await extractCharacterTraitsFromPhotosVision(photos);
        if (latestGenIdRef.current === null) return;
        setTraits(result.traits);
      } catch {
        // ignore Vision errors; proceed
      }

      setStep(2);
      setAnalysisStep(t("avatar.creating", { name: characterName }));

      const appearanceHints = [
        selectedGender ? `${t("badges.gender_set")}: ${selectedGender}` : "",
        `name: ${characterName}`,
        `age: ${characterAge}`,
        traits?.hairColor ? `${t("badges.hair")}: ${traits.hairColor}` : "",
        traits?.eyeColor ? `${t("badges.eyes")}: ${traits.eyeColor}` : "",
        traits?.skinTone ? `${t("badges.skin")}: ${traits.skinTone}` : "",
      ]
        .filter(Boolean)
        .join(", ");

      const controller = new AbortController();
      const url = await generateAvatarImage({
        appearance: appearanceHints || characterName,
        controller,
        timeoutMs: 45000,
      });

      if (latestGenIdRef.current === null) return;
      setStep(3);
      setAnalysisStep(t("avatar.finishing", { name: characterName }));
      setGeneratedAvatar(url);
      onAvatarGenerated(url);
      saveLog("success", { traits, appearanceHints });
      toast({ title: i18n.language === "da" ? "Avatar genereret" : "Avatar generated", description: i18n.language === "da" ? "Vi har lavet et nyt avatar-portræt." : "A new avatar portrait was generated." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("avatar.toast_error_desc_generic");
      setError(message);
      saveLog("error", { message });

      let description = t("avatar.toast_error_desc_generic");
      if (message.toLowerCase().includes("api nøgle") || message.toLowerCase().includes("api key")) {
        description = t("avatar.toast_error_desc_api_key");
      } else if (message.toLowerCase().includes("rate limit") || message.includes("kvote")) {
        description = t("avatar.toast_error_desc_rate_limit");
      } else if (message.toLowerCase().includes("invalid request") || message.toLowerCase().includes("ugyldig anmodning")) {
        description = t("avatar.toast_error_desc_invalid_request");
      }

      toast({
        title: t("avatar.toast_error_title"),
        description,
        variant: "destructive",
      });

      setGeneratedAvatar(placeholder);
      onAvatarGenerated(placeholder);
    } finally {
      clearGenTimers();
      setIsGenerating(false);
      setAnalysisStep("");
      setStep(0);
    }
  };

  const downloadAvatar = () => {
    if (!generatedAvatar) return;

    const link = document.createElement("a");
    link.href = generatedAvatar;
    link.download = `${characterName}-story-avatar.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const apiKeyMissing = !getEffectiveKey();

  return (
    <Card className="premium-card">
      <CardHeader className="text-center">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <Wand2 className="h-12 w-12 text-yellow-300 mx-auto relative z-10" />
        </div>
        <CardTitle className="text-2xl font-bold text-white">🎬</CardTitle>
        <CardDescription className="text-blue-200 text-lg">
          {t("avatar.cta_ready", { name: characterName })}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {apiKeyMissing && (
          <div className="mb-2 text-center">
            <span className="inline-block text-xs px-2 py-1 rounded-full bg-blue-900/40 border border-blue-400/40 text-yellow-300">
              {t("connectivity.llm_not_configured")}
            </span>
            <div className="mt-2">
              <Button variant="outline" className="btn-premium-outline" onClick={testLLM}>
                {t("connectivity.test_llm")}
              </Button>
            </div>
          </div>
        )}

        {/* Photo Preview */}
        <div className="grid grid-cols-2 gap-3">
          {photos.slice(0, 4).map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`${characterName} photo ${index + 1}`}
              className="w-full h-20 object-cover rounded-lg border-2 border-blue-500/30"
            />
          ))}
        </div>

        {/* Traits Preview */}
        {traits && (
          <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/20 flex flex-wrap items-center gap-2">
            <span className="text-blue-200 text-sm">{t("avatar.detected")}</span>
            {traits.hairColor && (
              <Badge className="bg-blue-700/60 border border-blue-400/30">
                {t("badges.hair")}: {traits.hairColor} {hairIsRed && <BadgeCheck className="inline-block h-4 w-4 ml-1" />}
              </Badge>
            )}
            {selectedGender && selectedGender !== "unspecified" && (
              <>
                <Badge className="bg-blue-700/60 border border-blue-400/30">{t("badges.gender_set")}: {selectedGender}</Badge>
                {traits?.genderGuess && (() => {
                  const guess = (traits.genderGuess || "").toLowerCase();
                  const normGuess =
                    guess.includes("female") || guess.includes("girl")
                      ? "girl"
                      : guess.includes("male") || guess.includes("boy")
                      ? "boy"
                      : guess.includes("non-binary") || guess.includes("nonbinary")
                      ? "non-binary"
                      : "unspecified";
                  return normGuess !== selectedGender ? (
                    <span className="text-xs text-yellow-300/90">
                      {i18n.language === "da" ? `Bruger valgt køn: ${selectedGender} (overrider AI).` : `Using selected gender: ${selectedGender} (overrides AI).`}
                    </span>
                  ) : null;
                })()}
              </>
            )}
            {traits.eyeColor && (
              <Badge className="bg-blue-700/60 border border-blue-400/30">{t("badges.eyes")}: {traits.eyeColor}</Badge>
            )}
            {traits.skinTone && (
              <Badge className="bg-blue-700/60 border border-blue-400/30">{t("badges.skin")}: {traits.skinTone}</Badge>
            )}
            {typeof traits.freckles === "boolean" && (
              <Badge className="bg-blue-700/60 border border-blue-400/30">{t("badges.freckles")}: {traits.freckles ? (i18n.language === "da" ? "ja" : "yes") : (i18n.language === "da" ? "nej" : "no")}</Badge>
            )}
            {traits.notableMarks?.length ? (
              <Badge className="bg-blue-700/60 border border-blue-400/30">
                {t("badges.marks")}: {traits.notableMarks.slice(0, 2).join(", ")}
                {traits.notableMarks.length > 2 ? "…" : ""}
              </Badge>
            ) : null}
          </div>
        )}

        {/* Progress Steps */}
        {isGenerating && (
          <div className="bg-blue-900/30 rounded-lg p-6 border border-blue-500/30">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {step === 1 && t("avatar.analyzing", { name: characterName })}
              {step === 2 && t("avatar.creating", { name: characterName })}
              {step === 3 && t("avatar.finishing", { name: characterName })}
            </h3>
            <p className="text-blue-200 text-sm mb-2">{analysisStep || t("avatar.working")}</p>
            <div className="mt-4 bg-blue-800/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full animate-pulse"
                style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "90%" }}
              ></div>
            </div>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" className="btn-premium-outline" onClick={cancelGeneration}>
                {t("avatar.cancel")}
              </Button>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center space-y-4">
          {!generatedAvatar && !isGenerating && (
            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
              <p className="text-blue-200 mb-4">
                {t("avatar.cta_ready", { name: characterName })}
              </p>
              <Button
                onClick={generateAvatar}
                className="btn-premium text-lg px-8 py-3 magic-glow"
                disabled={isGenerating}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {t("avatar.generate_cta")}
              </Button>
            </div>
          )}
        </div>

        {/* Error + Fallback */}
        {error && !isGenerating && !generatedAvatar && (
          <div className="bg-red-900/30 rounded-lg p-4 border border-red-500/30">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-300" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <img src={placeholder} alt="Avatar placeholder" className="w-16 h-16 rounded-full border border-white/20" />
              <span className="text-sm text-white/80">{t("avatar.placeholder_text")}</span>
            </div>
            <Button onClick={generateAvatar} variant="outline" className="btn-premium-outline mt-3" disabled={isGenerating}>
              {t("common.tryAgain")}
            </Button>
          </div>
        )}

        {/* Result */}
        {generatedAvatar && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 rounded-lg p-6 border border-yellow-400/50 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 text-center">{t("avatar.generated_title", { name: characterName })}</h3>
              <div className="relative inline-block mx-auto">
                <div className="relative">
                  <img
                    src={generatedAvatar}
                    alt={`${characterName}'s animated story avatar`}
                    className="w-48 h-48 rounded-lg border-4 border-yellow-400 shadow-2xl mx-auto block"
                    style={{ imageRendering: "crisp-edges" }}
                  />
                </div>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-transparent to-yellow-400/10 pointer-events-none"></div>
              </div>
              {traits && (
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  <Badge className="bg-blue-700/60 border border-blue-400/30">{t("badges.hair")}: {traits.hairColor || "—"}</Badge>
                  <Badge className="bg-blue-700/60 border border-blue-400/30">{t("badges.eyes")}: {traits.eyeColor || "—"}</Badge>
                  <Badge className="bg-blue-700/60 border border-blue-400/30">{t("badges.skin")}: {traits.skinTone || "—"}</Badge>
                  <Badge className="bg-blue-700/60 border border-blue-400/30">{t("badges.freckles")}: {traits.freckles ? (i18n.language === "da" ? "ja" : "yes") : (i18n.language === "da" ? "nej" : "no")}</Badge>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={generateAvatar} variant="outline" className="btn-premium-outline" disabled={isGenerating}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("avatar.regenerate")}
              </Button>
              <Button onClick={downloadAvatar} variant="outline" className="btn-premium-outline">
                <Download className="mr-2 h-4 w-4" />
                {t("common.download")}
              </Button>
            </div>

            {generationAttempts > 1 && (
              <p className="text-xs text-blue-300 text-center">{i18n.language === "da" ? `Genereret ${generationAttempts} versioner` : `Generated ${generationAttempts} versions`}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}