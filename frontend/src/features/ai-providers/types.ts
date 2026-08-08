export type ProviderType = 'OPENAI' | 'GROQ' | 'LM_STUDIO' | 'OLLAMA' | 'OPENROUTER' | 'GENERIC';

export interface AIProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  modelName: string;
  providerType: ProviderType;
  hasApiKey: boolean;
  createdAt: string;
}
