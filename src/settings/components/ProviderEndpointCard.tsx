import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { ProviderInfo } from "@/modules/ai/config";
import {
  CheckmarkCircle02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { ProviderIcon } from "./ProviderIcon";

type Props = {
  provider: ProviderInfo;
  currentBaseURL: string;
  currentModelId: string;
  currentToken?: string | null;
  showToken?: boolean;
  baseURLPlaceholder: string;
  modelPlaceholder: string;
  tokenPlaceholder?: string;
  onSaveBaseURL: (value: string) => Promise<void>;
  onSaveModelId: (value: string) => Promise<void>;
  onSaveToken?: (value: string) => Promise<void>;
  onClearToken?: () => Promise<void>;
};

export function ProviderEndpointCard({
  provider,
  currentBaseURL,
  currentModelId,
  currentToken,
  showToken = false,
  baseURLPlaceholder,
  modelPlaceholder,
  tokenPlaceholder = "Paste token",
  onSaveBaseURL,
  onSaveModelId,
  onSaveToken,
  onClearToken,
}: Props) {
  const [baseURLDraft, setBaseURLDraft] = useState(currentBaseURL);
  const [modelDraft, setModelDraft] = useState(currentModelId);
  const [tokenDraft, setTokenDraft] = useState(currentToken ?? "");
  const [savingBaseURL, setSavingBaseURL] = useState(false);
  const [savingModel, setSavingModel] = useState(false);
  const [savingToken, setSavingToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => setBaseURLDraft(currentBaseURL), [currentBaseURL]);
  useEffect(() => setModelDraft(currentModelId), [currentModelId]);
  useEffect(() => setTokenDraft(currentToken ?? ""), [currentToken]);

  const saveBaseURL = async () => {
    const next = baseURLDraft.trim();
    if (!next || next === currentBaseURL) return;
    setSavingBaseURL(true);
    setNotice(null);
    try {
      await onSaveBaseURL(next);
    } catch (e) {
      setNotice(`Failed to save URL: ${String(e)}`);
    } finally {
      setSavingBaseURL(false);
    }
  };

  const saveModel = async () => {
    const next = modelDraft.trim();
    if (!next || next === currentModelId) return;
    setSavingModel(true);
    setNotice(null);
    try {
      await onSaveModelId(next);
    } catch (e) {
      setNotice(`Failed to save model: ${String(e)}`);
    } finally {
      setSavingModel(false);
    }
  };

  const saveToken = async () => {
    if (!showToken || !onSaveToken || !onClearToken) return;
    const next = tokenDraft.trim();
    setSavingToken(true);
    setNotice(null);
    try {
      if (!next) await onClearToken();
      else await onSaveToken(next);
    } catch (e) {
      setNotice(`Failed to save token: ${String(e)}`);
    } finally {
      setSavingToken(false);
    }
  };

  const testEndpoint = async () => {
    const base = baseURLDraft.trim();
    if (!base) {
      setNotice("Enter a base URL first.");
      return;
    }
    setTesting(true);
    setNotice(null);
    try {
      const url = `${base.replace(/\/$/, "")}/models`;
      const headers: Record<string, string> = {};
      const token = tokenDraft.trim();
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(url, { method: "GET", headers });
      setNotice(res.ok ? "Connected — server responded." : `Server returned ${res.status}.`);
    } catch {
      setNotice("Could not reach the server.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2 rounded-lg border border-border/60 bg-card/60 px-3 py-2.5")}>
      <div className="flex items-center gap-2">
        <ProviderIcon provider={provider.id} size={16} />
        <span className="text-[12.5px] font-medium">{provider.label}</span>
        <span className="ml-auto text-[10.5px] text-muted-foreground">
          configurable endpoint
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <Input
            value={baseURLDraft}
            onChange={(e) => setBaseURLDraft(e.target.value)}
            onBlur={() => void saveBaseURL()}
            placeholder={baseURLPlaceholder}
            spellCheck={false}
            disabled={savingBaseURL}
            className="h-8 flex-1 font-mono text-[11.5px]"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => void testEndpoint()}
            disabled={testing || savingBaseURL}
            className="h-8 px-2.5 text-[11px]"
          >
            {testing ? <Spinner className="size-3" /> : "Test"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Input
          value={modelDraft}
          onChange={(e) => setModelDraft(e.target.value)}
          onBlur={() => void saveModel()}
          placeholder={modelPlaceholder}
          spellCheck={false}
          disabled={savingModel}
          className="h-8 font-mono text-[11.5px]"
        />
      </div>

      {showToken ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1.5">
            <Input
              type="password"
              value={tokenDraft}
              onChange={(e) => setTokenDraft(e.target.value)}
              onBlur={() => void saveToken()}
              placeholder={tokenPlaceholder}
              spellCheck={false}
              autoComplete="off"
              disabled={savingToken}
              className="h-8 flex-1 font-mono text-[11.5px]"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => void saveToken()}
              disabled={savingToken}
              className="h-8 px-2.5 text-[11px]"
            >
              {savingToken ? <Spinner className="size-3" /> : "Save"}
            </Button>
          </div>
          <div className="flex items-center justify-end gap-1">
            {currentToken ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setTokenDraft("");
                  void onClearToken?.();
                }}
                className="h-7 px-2 text-[11px]"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={11} strokeWidth={2} />
                Clear
              </Button>
            ) : null}
            {currentToken ? (
              <span className="text-[10.5px] text-emerald-600 dark:text-emerald-400">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={10} />
                Stored
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {notice ? (
        <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
          <span className="truncate">{notice}</span>
        </div>
      ) : null}
    </div>
  );
}
