export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormatJson?: boolean;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface AIProviderConfigData {
  baseUrl: string;
  apiKey: string;
  modelName: string;
}

export interface AIProvider {
  complete(messages: ChatMessage[], options?: AICompletionOptions): Promise<AIResponse>;
}
