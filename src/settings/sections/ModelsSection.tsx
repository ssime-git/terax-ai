import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  AUTOCOMPLETE_PROVIDERS,
  DEFAULT_AUTOCOMPLETE_MODEL,
  MODELS,
  OLLAMA_DEFAULT_BASE_URL,
  PROVIDERS,
  getProvider,
  providerNeedsKey,
  type AutocompleteProviderId,
  type ModelId,
  type ProviderId,
} from "@/modules/ai/config";
import {
  getEditableModelOverrides,
  resolveEditableModel,
  SHIPPED_EDITABLE_DEFAULTS,
} from "@/modules/ai/lib/modelCatalog";
import { clearKey, getAllKeys, setKey } from "@/modules/ai/lib/keyring";
import { usePreferencesStore } from "@/modules/settings/preferences";
import {
  emitKeysChanged,
  setAutocompleteEnabled,
  setAutocompleteModelId,
  setAutocompleteProvider,
  setCerebrasModelLabel,
  setCerebrasModelRef,
  setDefaultModel,
  setGroqModelLabel,
  setGroqModelRef,
  setLmstudioBaseURL,
  setLmstudioModelLabel,
  setLmstudioModelRef,
  setOllamaBaseURL,
  setOllamaModelId,
  setOpenAICompatibleBaseURL,
  setOpenAICompatibleModelId,
} from "@/modules/settings/store";
import { invoke } from "@tauri-apps/api/core";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { ProviderIcon } from "../components/ProviderIcon";
import { ProviderEndpointCard } from "../components/ProviderEndpointCard";
import { ProviderKeyCard } from "../components/ProviderKeyCard";
import { SectionHeader } from "../components/SectionHeader";

type KeysMap = Record<ProviderId, string | null>;

export function ModelsSection() {
  const [keys, setKeys] = useState<KeysMap | null>(null);
  const defaultModel = usePreferencesStore((s) => s.defaultModelId);
  const cerebrasModelLabel = usePreferencesStore((s) => s.cerebrasModelLabel);
  const cerebrasModelRef = usePreferencesStore((s) => s.cerebrasModelRef);
  const groqModelLabel = usePreferencesStore((s) => s.groqModelLabel);
  const groqModelRef = usePreferencesStore((s) => s.groqModelRef);
  const lmstudioModelLabel = usePreferencesStore((s) => s.lmstudioModelLabel);
  const lmstudioModelRef = usePreferencesStore((s) => s.lmstudioModelRef);
  const ollamaBaseURL = usePreferencesStore((s) => s.ollamaBaseURL);
  const ollamaModelId = usePreferencesStore((s) => s.ollamaModelId);
  const openaiCompatibleBaseURL = usePreferencesStore(
    (s) => s.openaiCompatibleBaseURL,
  );
  const openaiCompatibleModelId = usePreferencesStore(
    (s) => s.openaiCompatibleModelId,
  );

  useEffect(() => {
    void getAllKeys().then(setKeys);
  }, []);

  const onSave = async (provider: ProviderId, value: string) => {
    await setKey(provider, value);
    setKeys((prev) => (prev ? { ...prev, [provider]: value } : prev));
    await emitKeysChanged();
  };

  const onClear = async (provider: ProviderId) => {
    await clearKey(provider);
    setKeys((prev) => (prev ? { ...prev, [provider]: null } : prev));
    await emitKeysChanged();
  };

  if (!keys) {
    return <div className="text-[12px] text-muted-foreground">Loading…</div>;
  }

  const editableModelOverrides = getEditableModelOverrides({
    cerebrasModelLabel,
    cerebrasModelRef,
    groqModelLabel,
    groqModelRef,
    lmstudioModelLabel,
    lmstudioModelRef,
  });
  const defaultModelInfo = resolveEditableModel(
    defaultModel,
    editableModelOverrides,
  );
  const configuredCount = PROVIDERS.filter(
    (p) => providerNeedsKey(p.id) && !!keys[p.id],
  ).length;

  return (
    <div className="flex flex-col gap-7">
      <SectionHeader
        title="Models"
        description="Bring your own keys. They live in your OS keychain and are used only by Terax."
      />

      <div className="flex flex-col gap-2">
        <Label>Default model</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-9 justify-between gap-2 px-2.5 text-[12px]"
            >
              <span className="flex items-center gap-2">
                <ProviderIcon provider={defaultModelInfo.provider} size={14} />
                <span>{defaultModelInfo.label}</span>
                <span className="text-muted-foreground">
                  · {defaultModelInfo.defaultModelRef}
                </span>
              </span>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={12}
                strokeWidth={2}
                className="opacity-70"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[260px]">
            {PROVIDERS.map((p) => {
              const models = MODELS.filter((m) => m.provider === p.id);
              const hasKey = providerNeedsKey(p.id) ? !!keys[p.id] : true;
              return (
                <div key={p.id} className="px-1 pt-1.5">
                  <div className="mb-1 flex items-center gap-1.5 px-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    <ProviderIcon provider={p.id} size={11} />
                    <span>{p.label}</span>
                    {providerNeedsKey(p.id) && !hasKey && (
                      <span className="ml-auto text-[9.5px] normal-case tracking-normal text-muted-foreground/70">
                        no key
                      </span>
                    )}
                  </div>
                  {models.map((m) => (
                    <DropdownMenuItem
                      key={m.id}
                      disabled={!hasKey}
                      onSelect={() =>
                        hasKey && void setDefaultModel(m.id as ModelId)
                      }
                      className={cn(
                        "flex items-center justify-between gap-2 text-[12px]",
                        m.id === defaultModel && "bg-accent/50",
                      )}
                      title={
                        resolveEditableModel(
                          m.id as ModelId,
                          editableModelOverrides,
                        ).modelRef
                      }
                    >
                      <span className="flex flex-col">
                        <span>
                          {
                            resolveEditableModel(
                              m.id as ModelId,
                              editableModelOverrides,
                            ).label
                          }
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {resolveEditableModel(
                            m.id as ModelId,
                            editableModelOverrides,
                          ).modelRef}
                        </span>
                      </span>
                    </DropdownMenuItem>
                  ))}
                </div>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeader
          title="Editable model defaults"
          description="Override the label and real model ref used for Cerebras, Groq, and LM Studio."
        />
        <div className="grid grid-cols-1 gap-2 xl:grid-cols-3">
          <EditableModelCard
            provider={getProvider("cerebras")}
            label={cerebrasModelLabel}
            modelRef={cerebrasModelRef}
            defaultLabel={SHIPPED_EDITABLE_DEFAULTS.cerebras.label}
            defaultModelRef={SHIPPED_EDITABLE_DEFAULTS.cerebras.modelRef}
            onSaveLabel={setCerebrasModelLabel}
            onSaveModelRef={setCerebrasModelRef}
          />
          <EditableModelCard
            provider={getProvider("groq")}
            label={groqModelLabel}
            modelRef={groqModelRef}
            defaultLabel={SHIPPED_EDITABLE_DEFAULTS.groq.label}
            defaultModelRef={SHIPPED_EDITABLE_DEFAULTS.groq.modelRef}
            onSaveLabel={setGroqModelLabel}
            onSaveModelRef={setGroqModelRef}
          />
          <EditableModelCard
            provider={getProvider("lmstudio")}
            label={lmstudioModelLabel}
            modelRef={lmstudioModelRef}
            defaultLabel={SHIPPED_EDITABLE_DEFAULTS.lmstudio.label}
            defaultModelRef={SHIPPED_EDITABLE_DEFAULTS.lmstudio.modelRef}
            onSaveLabel={setLmstudioModelLabel}
            onSaveModelRef={setLmstudioModelRef}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <Label>API keys</Label>
          <span className="text-[10.5px] text-muted-foreground">
            {configuredCount} of {PROVIDERS.filter((p) => providerNeedsKey(p.id)).length} configured
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PROVIDERS.filter((p) => providerNeedsKey(p.id)).map((p) => (
            <ProviderKeyCard
              key={p.id}
              provider={p}
              currentKey={keys[p.id]}
              onSave={(v: string) => onSave(p.id, v)}
              onClear={() => onClear(p.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeader
          title="Local endpoints"
          description="Configure Ollama or any OpenAI-compatible endpoint with a base URL, model name, and optional token."
        />
        <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
          <ProviderEndpointCard
            provider={getProvider("ollama")}
            currentBaseURL={ollamaBaseURL}
            currentModelId={ollamaModelId}
            baseURLPlaceholder={OLLAMA_DEFAULT_BASE_URL}
            modelPlaceholder={DEFAULT_AUTOCOMPLETE_MODEL.ollama}
            onSaveBaseURL={setOllamaBaseURL}
            onSaveModelId={setOllamaModelId}
          />
          <ProviderEndpointCard
            provider={getProvider("openai-compatible")}
            currentBaseURL={openaiCompatibleBaseURL}
            currentModelId={openaiCompatibleModelId}
            currentToken={keys["openai-compatible"]}
            showToken
            baseURLPlaceholder="https://api.example.com/v1"
            modelPlaceholder={DEFAULT_AUTOCOMPLETE_MODEL["openai-compatible"]}
            tokenPlaceholder="Paste bearer token"
            onSaveBaseURL={setOpenAICompatibleBaseURL}
            onSaveModelId={setOpenAICompatibleModelId}
            onSaveToken={async (v) => {
              await setKey("openai-compatible", v);
              await emitKeysChanged();
            }}
            onClearToken={async () => {
              await clearKey("openai-compatible");
              await emitKeysChanged();
            }}
          />
        </div>
      </div>

      <AutocompleteBlock keys={keys} />
    </div>
  );
}

function AutocompleteBlock({ keys }: { keys: KeysMap }) {
  const enabled = usePreferencesStore((s) => s.autocompleteEnabled);
  const provider = usePreferencesStore((s) => s.autocompleteProvider);
  const modelId = usePreferencesStore((s) => s.autocompleteModelId);
  const lmstudioBaseURL = usePreferencesStore((s) => s.lmstudioBaseURL);
  const ollamaBaseURL = usePreferencesStore((s) => s.ollamaBaseURL);
  const openaiCompatibleBaseURL = usePreferencesStore(
    (s) => s.openaiCompatibleBaseURL,
  );

  const [modelDraft, setModelDraft] = useState(modelId);
  const [lmstudioUrlDraft, setLmstudioUrlDraft] = useState(lmstudioBaseURL);
  const [ollamaUrlDraft, setOllamaUrlDraft] = useState(ollamaBaseURL);
  const [openaiCompatibleUrlDraft, setOpenaiCompatibleUrlDraft] =
    useState(openaiCompatibleBaseURL);
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "ok" | "fail"
  >("idle");

  useEffect(() => setModelDraft(modelId), [modelId]);
  useEffect(() => setLmstudioUrlDraft(lmstudioBaseURL), [lmstudioBaseURL]);
  useEffect(() => setOllamaUrlDraft(ollamaBaseURL), [ollamaBaseURL]);
  useEffect(
    () => setOpenaiCompatibleUrlDraft(openaiCompatibleBaseURL),
    [openaiCompatibleBaseURL],
  );

  const onProviderChange = (next: AutocompleteProviderId) => {
    void setAutocompleteProvider(next);
    const knownDefaults = Object.values(DEFAULT_AUTOCOMPLETE_MODEL);
    if (knownDefaults.includes(modelId)) {
      void setAutocompleteModelId(DEFAULT_AUTOCOMPLETE_MODEL[next]);
    }
  };

  const providerInfo = getProvider(provider);
  const hasKey = providerNeedsKey(provider) ? !!keys[provider] : true;
  const currentBaseURL =
    provider === "lmstudio"
      ? lmstudioUrlDraft
      : provider === "ollama"
        ? ollamaUrlDraft
        : provider === "openai-compatible"
          ? openaiCompatibleUrlDraft
          : "";
  const hasBaseURL =
    provider === "lmstudio" ||
    provider === "ollama" ||
    provider === "openai-compatible";

  const saveBaseURL = async (value: string) => {
    const next = value.trim();
    if (provider === "lmstudio") {
      if (next && next !== lmstudioBaseURL) await setLmstudioBaseURL(next);
    } else if (provider === "ollama") {
      if (next && next !== ollamaBaseURL) await setOllamaBaseURL(next);
    } else if (provider === "openai-compatible") {
      if (next && next !== openaiCompatibleBaseURL)
        await setOpenAICompatibleBaseURL(next);
    }
  };

  const testBaseURL = async () => {
    if (!hasBaseURL) return;
    setTestStatus("testing");
    try {
      const url = currentBaseURL.replace(/\/$/, "") + "/models";
      const status = await invoke<number>("http_ping", { url });
      setTestStatus(status >= 200 && status < 400 ? "ok" : "fail");
    } catch {
      setTestStatus("fail");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <Label>Editor autocomplete</Label>
          <span className="text-[10.5px] leading-relaxed text-muted-foreground">
            Inline ghost-text suggestions in the code editor. Powered by
            ultra-fast inference (Cerebras / Groq) or a local LM Studio server.
          </span>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={(v) => void setAutocompleteEnabled(v)}
        />
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card/60 px-3 py-2.5">
        <div className="flex flex-col gap-1.5">
          <Label>Provider</Label>
          <div className="flex gap-1">
            {AUTOCOMPLETE_PROVIDERS.map((id) => {
              const info = getProvider(id);
              const active = id === provider;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onProviderChange(id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11.5px] transition-colors",
                    active
                      ? "border-foreground/40 bg-accent/60"
                      : "border-border/60 bg-transparent hover:bg-accent/30",
                  )}
                >
                  <ProviderIcon provider={id} size={12} />
                  <span>{info.label}</span>
                </button>
              );
            })}
          </div>
          {!hasKey ? (
            <span className="text-[10.5px] text-amber-500">
              No API key configured for {providerInfo.label}. Add one above.
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Model</Label>
          <Input
            value={modelDraft}
            onChange={(e) => setModelDraft(e.target.value)}
            onBlur={() => {
              const v = modelDraft.trim();
              if (v && v !== modelId) void setAutocompleteModelId(v);
            }}
            placeholder={DEFAULT_AUTOCOMPLETE_MODEL[provider]}
            spellCheck={false}
            className="h-8 font-mono text-[11.5px]"
          />
        </div>

        {hasBaseURL ? (
          <div className="flex flex-col gap-1.5">
            <Label>
              {provider === "lmstudio"
                ? "LM Studio base URL"
                : provider === "ollama"
                  ? "Ollama base URL"
                  : "OpenAI-compatible base URL"}
            </Label>
            <div className="flex gap-1.5">
              <Input
                value={currentBaseURL}
                onChange={(e) => {
                  const next = e.target.value;
                  if (provider === "lmstudio") setLmstudioUrlDraft(next);
                  else if (provider === "ollama") setOllamaUrlDraft(next);
                  else setOpenaiCompatibleUrlDraft(next);
                }}
                onBlur={() => {
                  const value =
                    provider === "lmstudio"
                      ? lmstudioUrlDraft
                      : provider === "ollama"
                        ? ollamaUrlDraft
                        : openaiCompatibleUrlDraft;
                  void saveBaseURL(value);
                }}
                placeholder={
                  provider === "lmstudio"
                    ? "http://localhost:1234/v1"
                    : provider === "ollama"
                      ? OLLAMA_DEFAULT_BASE_URL
                      : "https://api.example.com/v1"
                }
                spellCheck={false}
                className="h-8 flex-1 font-mono text-[11.5px]"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => void testBaseURL()}
                className="h-8 px-2.5 text-[11px]"
              >
                Test
              </Button>
            </div>
            {testStatus === "ok" ? (
              <span className="text-[10.5px] text-emerald-500">
                Connected — server responded.
              </span>
            ) : testStatus === "fail" ? (
              <span className="text-[10.5px] text-destructive">
                Could not reach the server.
              </span>
            ) : testStatus === "testing" ? (
              <span className="text-[10.5px] text-muted-foreground">
                Testing…
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EditableModelCard({
  provider,
  label,
  modelRef,
  defaultLabel,
  defaultModelRef,
  onSaveLabel,
  onSaveModelRef,
}: {
  provider: ReturnType<typeof getProvider>;
  label: string;
  modelRef: string;
  defaultLabel: string;
  defaultModelRef: string;
  onSaveLabel: (value: string) => Promise<void>;
  onSaveModelRef: (value: string) => Promise<void>;
}) {
  const [labelDraft, setLabelDraft] = useState(label);
  const [modelRefDraft, setModelRefDraft] = useState(modelRef);
  const [savingLabel, setSavingLabel] = useState(false);
  const [savingModelRef, setSavingModelRef] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => setLabelDraft(label), [label]);
  useEffect(() => setModelRefDraft(modelRef), [modelRef]);

  const saveLabel = async () => {
    const next = labelDraft.trim();
    if (next === label.trim()) return;
    setSavingLabel(true);
    setNotice(null);
    try {
      await onSaveLabel(next);
    } catch (e) {
      setNotice(`Failed to save label: ${String(e)}`);
    } finally {
      setSavingLabel(false);
    }
  };

  const saveModelRef = async () => {
    const next = modelRefDraft.trim();
    if (next === modelRef.trim()) return;
    setSavingModelRef(true);
    setNotice(null);
    try {
      await onSaveModelRef(next);
    } catch (e) {
      setNotice(`Failed to save model ref: ${String(e)}`);
    } finally {
      setSavingModelRef(false);
    }
  };

  const resetDefaults = async () => {
    setNotice(null);
    setLabelDraft(defaultLabel);
    setModelRefDraft(defaultModelRef);
    setSavingLabel(true);
    setSavingModelRef(true);
    try {
      await onSaveLabel(defaultLabel);
      await onSaveModelRef(defaultModelRef);
    } catch (e) {
      setNotice(`Failed to reset: ${String(e)}`);
    } finally {
      setSavingLabel(false);
      setSavingModelRef(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card/60 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <ProviderIcon provider={provider.id} size={16} />
        <span className="text-[12.5px] font-medium">{provider.label}</span>
        <span className="ml-auto text-[10.5px] text-muted-foreground">
          editable default
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Display name</Label>
        <Input
          value={labelDraft}
          onChange={(e) => setLabelDraft(e.target.value)}
          onBlur={() => void saveLabel()}
          placeholder={defaultLabel}
          spellCheck={false}
          disabled={savingLabel}
          className="h-8 font-mono text-[11.5px]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Model ref</Label>
        <Input
          value={modelRefDraft}
          onChange={(e) => setModelRefDraft(e.target.value)}
          onBlur={() => void saveModelRef()}
          placeholder={defaultModelRef}
          spellCheck={false}
          disabled={savingModelRef}
          className="h-8 font-mono text-[11.5px]"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[10.5px] text-muted-foreground">
          Used by the main model picker and chat runtime.
        </span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => void resetDefaults()}
          className="h-7 px-2 text-[11px]"
        >
          Reset
        </Button>
      </div>

      {notice ? (
        <div className="text-[10.5px] text-muted-foreground">{notice}</div>
      ) : null}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium tracking-tight text-muted-foreground">
      {children}
    </span>
  );
}
