import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ProjectsModule } from '../projects/projects.module';
import { AIProvidersModule } from '../ai-providers/ai-providers.module';

@Module({
  imports: [ProjectsModule, AIProvidersModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
