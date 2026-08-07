import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAIProviderConfigDto, UpdateAIProviderConfigDto } from './dto/ai-provider.dto';
import { EncryptionUtil } from './utils/encryption.util';
import { AIProvider } from './interfaces/ai-provider.interface';
import { OpenAICompatibleProvider } from './adapters/openai-compatible.adapter';

@Injectable()
export class AIProvidersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateAIProviderConfigDto) {
    const encryptedKey = dto.apiKey ? EncryptionUtil.encrypt(dto.apiKey) : '';

    const created = await this.prisma.aIProviderConfig.create({
      data: {
        userId,
        name: dto.name,
        baseUrl: dto.baseUrl,
        apiKeyEncrypted: encryptedKey,
        modelName: dto.modelName,
        providerType: dto.providerType || 'OPENAI',
      },
    });

    return {
      ...created,
      apiKeyEncrypted: undefined,
      hasApiKey: !!dto.apiKey,
    };
  }

  async findAll(userId: string) {
    const configs = await this.prisma.aIProviderConfig.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return configs.map((c) => ({
      ...c,
      apiKeyEncrypted: undefined,
      hasApiKey: !!c.apiKeyEncrypted,
    }));
  }

  async findOne(userId: string, id: string) {
    const config = await this.prisma.aIProviderConfig.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('AI Provider configuration not found');
    }

    if (config.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return config;
  }

  async update(userId: string, id: string, dto: UpdateAIProviderConfigDto) {
    const existing = await this.findOne(userId, id);

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.baseUrl) updateData.baseUrl = dto.baseUrl;
    if (dto.modelName) updateData.modelName = dto.modelName;
    if (dto.providerType) updateData.providerType = dto.providerType;
    if (dto.apiKey !== undefined) {
      updateData.apiKeyEncrypted = dto.apiKey ? EncryptionUtil.encrypt(dto.apiKey) : '';
    }

    const updated = await this.prisma.aIProviderConfig.update({
      where: { id },
      data: updateData,
    });

    return {
      ...updated,
      apiKeyEncrypted: undefined,
      hasApiKey: !!updated.apiKeyEncrypted,
    };
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    await this.prisma.aIProviderConfig.delete({
      where: { id },
    });

    return { message: 'Provider configuration deleted' };
  }

  // Polymorphic Provider Instance Factory
  async getProviderInstance(userId: string, providerConfigId: string): Promise<AIProvider> {
    const config = await this.findOne(userId, providerConfigId);
    const decryptedKey = config.apiKeyEncrypted ? EncryptionUtil.decrypt(config.apiKeyEncrypted) : '';

    return new OpenAICompatibleProvider({
      baseUrl: config.baseUrl,
      apiKey: decryptedKey,
      modelName: config.modelName,
    });
  }

  async testConnection(userId: string, id: string) {
    const provider = await this.getProviderInstance(userId, id);
    try {
      const response = await provider.complete(
        [
          { role: 'system', content: 'You are a test assistant.' },
          { role: 'user', content: 'Respond with the word "OK"' },
        ],
        { maxTokens: 10 },
      );

      return {
        success: true,
        message: 'Connection successful!',
        responseSample: response.content,
      };
    } catch (err: any) {
      throw new BadRequestException(`Connection test failed: ${err.message}`);
    }
  }
}
