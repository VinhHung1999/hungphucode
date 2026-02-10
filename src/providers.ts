import { ChatXAI } from "@langchain/xai";
import { ChatOpenAI } from "@langchain/openai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export interface ModelConfig {
  label: string;
  model: string;
  description: string;
  recommended?: boolean | undefined;
}

export interface ProviderConfig {
  name: string;
  displayName: string;
  models: ModelConfig[];
  create: (model: string) => BaseChatModel;
}

export const providers: ProviderConfig[] = [
  {
    name: "xai",
    displayName: "xAI (Grok)",
    models: [
      {
        label: "Grok 4 Fast",
        model: "grok-4-fast-non-reasoning",
        description: "Fast reasoning from xAI",
        recommended: true,
      },
    ],
    create: (model) =>
      new ChatXAI({
        model,
        apiKey: process.env.XAI_API_KEY!,
      }),
  },
  {
    name: "proxy",
    displayName: "DTA Proxy",
    models: [
      {
        label: "Gemini 3 Pro",
        model: "gemini-3-pro-preview",
        description: "Best for everyday tasks",
      },
      {
        label: "Gemini 3 Flash",
        model: "gemini-3-flash-preview",
        description: "Fastest for quick answers",
      },
      {
        label: "GPT 5.3 Codex",
        model: "gpt-5.3-codex",
        description: "Best for coding tasks",
        recommended: true,
      },
      {
        label: "GPT 5.2",
        model: "gpt-5.2",
        description: "Most capable for complex work",
      }
    ],
    create: (model) =>
      new ChatOpenAI({
        model,
        apiKey: process.env.PROXY_KEY!,
        configuration: {
          baseURL: "https://api.dta.business/v1",
        },
      }),
  },
];

let providerIndex = 1;
let modelIndex = 0;

export function getCurrentProvider(): ProviderConfig {
  return providers[providerIndex]!;
}

export function getCurrentModel(): ModelConfig {
  return getCurrentProvider().models[modelIndex]!;
}

export function switchProvider(): ProviderConfig {
  providerIndex = (providerIndex + 1) % providers.length;
  modelIndex = 0;
  return getCurrentProvider();
}

export function setModelIndex(index: number): ModelConfig {
  modelIndex = index;
  return getCurrentModel();
}

export function getModelIndex(): number {
  return modelIndex;
}

export function createLlm(): BaseChatModel {
  const provider = getCurrentProvider();
  const model = getCurrentModel();
  return provider.create(model.model);
}
