import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { AIProvidersService } from './ai-providers.service';
import { CreateAIProviderConfigDto, UpdateAIProviderConfigDto } from './dto/ai-provider.dto';
import { User } from '../auth/decorators/user.decorator';

@Controller('ai-providers')
export class AIProvidersController {
  constructor(private readonly aiProvidersService: AIProvidersService) {}

  @Post()
  async create(@User('userId') userId: string, @Body() dto: CreateAIProviderConfigDto) {
    return this.aiProvidersService.create(userId, dto);
  }

  @Get()
  async findAll(@User('userId') userId: string) {
    return this.aiProvidersService.findAll(userId);
  }

  @Get(':id')
  async findOne(@User('userId') userId: string, @Param('id') id: string) {
    const config = await this.aiProvidersService.findOne(userId, id);
    return {
      ...config,
      apiKeyEncrypted: undefined,
      hasApiKey: !!config.apiKeyEncrypted,
    };
  }

  @Patch(':id')
  async update(
    @User('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAIProviderConfigDto,
  ) {
    return this.aiProvidersService.update(userId, id, dto);
  }

  @Delete(':id')
  async remove(@User('userId') userId: string, @Param('id') id: string) {
    return this.aiProvidersService.remove(userId, id);
  }

  @Post(':id/test')
  async testConnection(@User('userId') userId: string, @Param('id') id: string) {
    return this.aiProvidersService.testConnection(userId, id);
  }
}
