"use client";

import * as React from "react";
import {
  KeyRound,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { useSettingsStore } from "@/store/settings-store";
import { PROVIDER_META } from "@/services/ai";
import { FRIENDLY_MESSAGES, AIError } from "@/services/ai/errors";
import type { AIProviderId } from "@/types";

const FEATURES = [
  "Personalized roadmaps",
  "Practice questions",
  "Flashcards",
  "Cheat sheets",
  "Interview prep",
  "Revision plans",
];

export default function SettingsPage() {
  const { settings, keyStatus, loaded, update, setProvider, validateKey } =
    useSettingsStore();
  const [apiKey, setApiKey] = React.useState("");
  const [model, setModel] = React.useState("");
  const [reveal, setReveal] = React.useState(false);

  React.useEffect(() => {
    if (loaded) {
      setApiKey(settings.apiKey);
      setModel(settings.model ?? "");
    }
  }, [loaded, settings.apiKey, settings.model]);

  const meta = PROVIDER_META.find((p) => p.id === settings.provider);

  async function handleSave() {
    await update({ apiKey: apiKey.trim(), model: model.trim() });
    toast.success("Settings saved", "Your key is stored locally on this device.");
  }

  async function handleValidate() {
    await update({ apiKey: apiKey.trim(), model: model.trim() });
    try {
      const ok = await validateKey();
      if (ok) toast.success("Connection verified", "Your API key works.");
      else toast.error("Key rejected", FRIENDLY_MESSAGES.invalid_key);
    } catch (err) {
      const e = err as AIError;
      toast.error("Validation failed", FRIENDLY_MESSAGES[e.code] ?? e.message);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Connect your own AI provider. Your key never leaves this device except to call the provider directly."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" /> AI Provider
              </CardTitle>
              <CardDescription>
                Choose a provider and paste your API key.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select
                  value={settings.provider}
                  onValueChange={(v) => setProvider(v as AIProviderId)}
                >
                  <SelectTrigger id="provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_META.map((p) => (
                      <SelectItem key={p.id} value={p.id} disabled={!p.available}>
                        {p.label}
                        {!p.available && " — coming soon"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={reveal ? "text" : "password"}
                    placeholder="xai-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setReveal((r) => !r)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={reveal ? "Hide key" : "Show key"}
                  >
                    {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {meta && (
                  <a
                    href={meta.keyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Get a {meta.label} key <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model (optional)</Label>
                <Input
                  id="model"
                  placeholder={meta?.defaultModel ?? "default"}
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use the default ({meta?.defaultModel}).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleSave} variant="outline">
                  Save
                </Button>
                <Button onClick={handleValidate} disabled={keyStatus === "checking" || !apiKey}>
                  {keyStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin" />}
                  Validate Key
                </Button>
                <ConnectionStatus status={keyStatus} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-accent/30">
            <CardContent className="flex gap-3 p-5 text-sm">
              <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Your key stays private</p>
                <p className="mt-1 text-muted-foreground">
                  The API key is stored only in your browser&apos;s IndexedDB. It is sent
                  exclusively to the provider&apos;s API endpoint when you generate content —
                  never to CertPath AI or any third party.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Provider info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{meta?.description}</p>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Default model</span>
                <code className="text-xs">{meta?.defaultModel}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                {meta?.available ? (
                  <Badge variant="success">Available</Badge>
                ) : (
                  <Badge variant="warning">Coming soon</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unlocked features</CardTitle>
              <CardDescription>What your key powers</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" /> {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ConnectionStatus({ status }: { status: string }) {
  if (status === "valid")
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-success">
        <CheckCircle2 className="h-4 w-4" /> Connected
      </span>
    );
  if (status === "invalid")
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-destructive">
        <XCircle className="h-4 w-4" /> Not connected
      </span>
    );
  if (status === "checking")
    return <span className="text-sm text-muted-foreground">Checking…</span>;
  return <span className="text-sm text-muted-foreground">Not verified</span>;
}
