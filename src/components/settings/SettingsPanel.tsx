import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

export default function SettingsPanel() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string>("");
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [loadingTest, setLoadingTest] = useState(false);

  useEffect(() => {
    try {
      setApiKey(localStorage.getItem("OPENAI_API_KEY_OVERRIDE") || "");
      setBaseUrl(localStorage.getItem("OPENAI_BASE_URL_OVERRIDE") || "");
    } catch {
      // ignore
    }
  }, []);

  const save = () => {
    try {
      if (apiKey) localStorage.setItem("OPENAI_API_KEY_OVERRIDE", apiKey.trim());
      else localStorage.removeItem("OPENAI_API_KEY_OVERRIDE");
      if (baseUrl) localStorage.setItem("OPENAI_BASE_URL_OVERRIDE", baseUrl.trim());
      else localStorage.removeItem("OPENAI_BASE_URL_OVERRIDE");
      toast({ title: t("settings.saved") });
    } catch (e: unknown) {
      toast({
        title: t("settings.save_failed"),
        description: e instanceof Error ? e.message : t("common.unknown_error"),
        variant: "destructive",
      });
    }
  };

  const clearAll = () => {
    try {
      localStorage.removeItem("OPENAI_API_KEY_OVERRIDE");
      localStorage.removeItem("OPENAI_BASE_URL_OVERRIDE");
      setApiKey("");
      setBaseUrl("");
      toast({ title: t("settings.cleared") });
    } catch (e: unknown) {
      toast({
        title: t("settings.clear_failed"),
        description: e instanceof Error ? e.message : t("common.unknown_error"),
        variant: "destructive",
      });
    }
  };

  const testConnectivity = async () => {
    setLoadingTest(true);
    try {
      const key =
        localStorage.getItem("OPENAI_API_KEY_OVERRIDE") || (import.meta.env.VITE_OPENAI_API_KEY as string | undefined);
      if (!key) {
        toast({ title: t("connectivity.llm_not_configured"), variant: "destructive" });
        setLoadingTest(false);
        return;
      }
      const base =
        localStorage.getItem("OPENAI_BASE_URL_OVERRIDE") ||
        (import.meta.env.VITE_OPENAI_BASE_URL as string) ||
        "https://api.openai.com/v1";
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
    } finally {
      setLoadingTest(false);
    }
  };

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="text-white">{t("settings.title")}</CardTitle>
        <CardDescription className="text-blue-200">{t("settings.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-blue-200 font-medium">{t("settings.api_key_label")}</label>
          <Input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={t("settings.api_key_placeholder")}
            className="form-input"
          />
          <p className="text-xs text-blue-300">{t("settings.api_key_hint")}</p>
        </div>
        <div className="space-y-2">
          <label className="text-blue-200 font-medium">{t("settings.base_url_label")}</label>
          <Input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.openai.com/v1"
            className="form-input"
          />
          <p className="text-xs text-blue-300">{t("settings.base_url_hint")}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={save} className="btn-premium">{t("common.save")}</Button>
          <Button onClick={clearAll} variant="outline" className="btn-premium-outline">{t("settings.clear")}</Button>
          <Button onClick={testConnectivity} variant="outline" className="btn-premium-outline" disabled={loadingTest}>
            {loadingTest ? t("connectivity.testing") : t("connectivity.test_llm")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}