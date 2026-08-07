import { Module } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { ToolsController } from './tools.controller';
import { ProjectsModule } from '../projects/projects.module';
import { AIProvidersModule } from '../ai-providers/ai-providers.module';

@Module({
  imports: [ProjectsModule, AIProvidersModule],
  controllers: [ToolsController],
  providers: [ToolsService],
})
export class ToolsModule {}
