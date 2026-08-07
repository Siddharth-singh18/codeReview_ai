import { Controller, Post, Body, Param } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { GenerateDocsDto, ScanTechDebtDto } from './dto/tools.dto';
import { User } from '../auth/decorators/user.decorator';

@Controller()
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Post('projects/:projectId/generate-docs')
  async generateDocs(
    @User('userId') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: GenerateDocsDto,
  ) {
    return this.toolsService.generateDocs(userId, projectId, dto.providerId);
  }

  @Post('projects/:projectId/tech-debt')
  async scanTechDebt(
    @User('userId') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: ScanTechDebtDto,
  ) {
    return this.toolsService.scanTechDebt(userId, projectId, dto.providerId);
  }
}
