import type { AIProvider, ProviderConfig } from "./types";
import type { AIProviderId } from "@/types";
import { GroqProvider } from "./providers/groq";
import { GrokProvider } from "./providers/grok";
import { OpenAIProvider } from "./providers/openai";
import { ClaudeProvider } from "./providers/anthropic";
import { GeminiProvider } from "./providers/gemini";
import { AIError } from "./errors";

type ProviderCtor = new (config: ProviderConfig) => AIProvider;

/** Registry mapping provider id -> constructor. Add new providers here only. */
const REGISTRY: Record<AIProviderId, ProviderCtor> = {
  groq: GroqProvider,
  grok: GrokProvider,
  openai: OpenAIProvider,
  claude: ClaudeProvider,
  gemini: GeminiProvider,
};

export interface ProviderMeta {
  id: AIProviderId;
  label: string;
  defaultModel: string;
  /** Whether the provider is fully implemented and selectable today. */
  available: boolean;
  /** Where to obtain an API key. */
  keyUrl: string;
  description: string;
}

export const PROVIDER_META: ProviderMeta[] = [
  {
    id: "groq",
    label: "Groq",
    defaultModel: "llama-3.3-70b-versatile",
    available: true,
    keyUrl: "https://console.groq.com/keys",
    description:
      "Ultra-fast inference for open models (Llama, GPT-OSS). OpenAI-compatible. Keys start with \"gsk_\". (Not the same as Grok/xAI.)",
  },
  {
    id: "grok",
    label: "Grok (xAI)",
    defaultModel: "grok-4.3",
    available: true,
    keyUrl: "https://console.x.ai",
    description: "xAI's Grok models. OpenAI-compatible API. Keys start with \"xai-\".",
  },
  {
    id: "openai",
    label: "OpenAI",
    defaultModel: "gpt-4o-mini",
    available: true,
    keyUrl: "https://platform.openai.com/api-keys",
    description: "GPT-4o family. OpenAI-compatible API. Keys start with \"sk-\".",
  },
  {
    id: "claude",
    label: "Claude (Anthropic)",
    defaultModel: "claude-sonnet-4-6",
    available: true,
    keyUrl: "https://console.anthropic.com",
    description:
      "Anthropic's Claude models via the native Messages API. Keys start with \"sk-ant-\".",
  },
  {
    id: "gemini",
    label: "Gemini (Google)",
    defaultModel: "gemini-1.5-pro",
    available: true,
    keyUrl: "https://aistudio.google.com/apikey",
    description: "Google's Gemini models via the OpenAI-compatible endpoint.",
  },
];

/** Construct a provider instance from an id + config. */
export function createProvider(id: AIProviderId, config: ProviderConfig): AIProvider {
  const Ctor = REGISTRY[id];
  if (!Ctor) throw new AIError("unknown", `Unknown provider: ${id}`);
  return new Ctor(config);
}
