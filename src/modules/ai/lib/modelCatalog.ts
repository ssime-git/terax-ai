import { getModel, type ModelId, type ProviderId } from "../config";

export type EditableModelProvider = "cerebras" | "groq" | "lmstudio";

export type EditableModelEntry = {
  label: string;
  modelRef: string;
};

export type EditableModelOverrides = Partial<
  Record<EditableModelProvider, Partial<EditableModelEntry>>
>;

export type EditableModelPreferenceSource = {
  cerebrasModelLabel?: string;
  cerebrasModelRef?: string;
  groqModelLabel?: string;
  groqModelRef?: string;
  lmstudioModelLabel?: string;
  lmstudioModelRef?: string;
};

export const EDITABLE_MODEL_PROVIDERS: readonly EditableModelProvider[] = [
  "cerebras",
  "groq",
  "lmstudio",
] as const;

export const SHIPPED_EDITABLE_DEFAULTS: Record<
  EditableModelProvider,
  { label: string; modelRef: string; provider: ProviderId }
> = {
  cerebras: {
    label: "GPT-OSS 120B",
    modelRef: "gpt-oss-120b",
    provider: "cerebras",
  },
  groq: {
    label: "GPT-OSS 20B",
    modelRef: "openai/gpt-oss-20b",
    provider: "groq",
  },
  lmstudio: {
    label: "LM Studio (local)",
    modelRef: "lmstudio-local",
    provider: "lmstudio",
  },
};

export type ResolvedEditableModel = {
  provider: ProviderId;
  label: string;
  modelRef: string;
  defaultLabel: string;
  defaultModelRef: string;
};

export function isEditableModelProvider(
  provider: ProviderId,
): provider is EditableModelProvider {
  return EDITABLE_MODEL_PROVIDERS.includes(provider as EditableModelProvider);
}

export function resolveEditableModel(
  modelId: ModelId,
  overrides: EditableModelOverrides = {},
): ResolvedEditableModel {
  const base = getModel(modelId);
  if (!isEditableModelProvider(base.provider)) {
    return {
      provider: base.provider,
      label: base.label,
      modelRef: base.id,
      defaultLabel: base.label,
      defaultModelRef: base.id,
    };
  }

  const shipped = SHIPPED_EDITABLE_DEFAULTS[base.provider];
  const custom = overrides[base.provider] ?? {};
  const label = custom.label?.trim() || shipped.label;
  const modelRef = custom.modelRef?.trim() || shipped.modelRef;
  return {
    provider: base.provider,
    label,
    modelRef,
    defaultLabel: shipped.label,
    defaultModelRef: shipped.modelRef,
  };
}

export function getEditableModelOverrides(
  source: EditableModelPreferenceSource,
): EditableModelOverrides {
  return {
    cerebras:
      source.cerebrasModelLabel || source.cerebrasModelRef
        ? {
            label: source.cerebrasModelLabel,
            modelRef: source.cerebrasModelRef,
          }
        : undefined,
    groq:
      source.groqModelLabel || source.groqModelRef
        ? {
            label: source.groqModelLabel,
            modelRef: source.groqModelRef,
          }
        : undefined,
    lmstudio:
      source.lmstudioModelLabel || source.lmstudioModelRef
        ? {
            label: source.lmstudioModelLabel,
            modelRef: source.lmstudioModelRef,
          }
        : undefined,
  };
}

export function resolveEditableModelRef(
  modelId: ModelId,
  overrides: EditableModelOverrides = {},
): string {
  const resolved = resolveEditableModel(modelId, overrides);
  return resolved.modelRef;
}

export function resolveEditableModelLabel(
  modelId: ModelId,
  overrides: EditableModelOverrides = {},
): string {
  const resolved = resolveEditableModel(modelId, overrides);
  return resolved.label;
}
