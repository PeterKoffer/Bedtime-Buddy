import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { generateAvatarImage } from "@/lib/openai";
import placeholderUrl from "@/assets/avatar_placeholder.svg";
import { useTranslation } from "react-i18next";

interface Character {
  name: string;
  appearance: string;
}

export default function GenerateStory() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [character, setCharacter] = useState<Character | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Load persisted character from localStorage fallback
    try {
      const raw = localStorage.getItem("bb_current_character");
      if (raw) {
        setCharacter(JSON.parse(raw));
      }
    } catch {
      // no-op
    }
  }, []);

  const handleGenerateAvatar = async () => {
    if (!character) {
      toast({
        title: t("generate.no_character_title", "Ingen karakter fundet"),
        description: t("generate.no_character_desc", "Opret eller vælg først en karakter."),
        variant: "destructive",
      });
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoadingAvatar(true);
    try {
      const url = await generateAvatarImage({
        appearance: character.appearance,
        controller,
      });
      setAvatarUrl(url);
      toast({
        title: t("avatar.toast_success_title", "Avatar genereret"),
        description: t("avatar.toast_success_desc", "Vi har lavet et nyt avatar-portræt."),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("ikke konfigureret")) {
        toast({
          title: t("avatar.toast_not_configured_title"),
          description: t("avatar.toast_not_configured_desc"),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("avatar.toast_error_title"),
          description: t("avatar.toast_error_desc_generic"),
          variant: "destructive",
        });
      }
      // Fallback to placeholder
      setAvatarUrl(placeholderUrl);
    } finally {
      setLoadingAvatar(false);
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setLoadingAvatar(false);
    toast({
      title: t("common.cancelled", "Annulleret"),
      description: t("generate.cancelled_desc", "Generering af avatar blev afbrudt."),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bb-deep-navy)] to-[var(--bb-base-dark-blue)] text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold">{t("generate.title", "Generér historie")}</h1>

        <div className="flex items-center gap-4">
          <div className="w-28 h-28 rounded-full overflow-hidden border border-white/20 bg-black/20 flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <img src={placeholderUrl} alt="Avatar placeholder" className="w-16 h-16 opacity-80" />
            )}
          </div>

          <div className="space-x-2">
            <Button
              onClick={handleGenerateAvatar}
              disabled={loadingAvatar}
              className="bg-[var(--bb-warm-dusk-gold)] text-black hover:bg-[#e3b371]"
            >
              {loadingAvatar ? t("common.generating", "Genererer…") : t("avatar.generate_cta", "🎬 Generér historie-avatar")}
            </Button>
            {loadingAvatar && (
              <Button variant="outline" onClick={handleCancel}>
                {t("common.cancel", "Annuller")}
              </Button>
            )}
          </div>
        </div>

        {/* Existing story generation UI continues below... */}
      </div>
    </div>
  );
}