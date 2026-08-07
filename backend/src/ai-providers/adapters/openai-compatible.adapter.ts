import {
  AIProvider,
  AIProviderConfigData,
  ChatMessage,
  AICompletionOptions,
  AIResponse,
} from '../interfaces/ai-provider.interface';

export class OpenAICompatibleProvider implements AIProvider {
  constructor(private config: AIProviderConfigData) {}

  async complete(
    messages: ChatMessage[],
    options: AICompletionOptions = {},
  ): Promise<AIResponse> {
    const url = `${this.config.baseUrl.replace(/\/$/, '')}/chat/completions`;

    const body: Record<string, any> = {
      model: this.config.modelName,
      messages: messages,
      temperature: options.temperature ?? 0.2,
    };

    if (options.maxTokens) {
      body.max_tokens = options.maxTokens;
    }

    if (options.responseFormatJson) {
      body.response_format = { type: 'json_object' };
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Provider Request Failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return {
      content,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens,
      },
    };
  }
}
