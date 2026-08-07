import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { TriggerReviewDto } from './dto/review.dto';
import { User } from '../auth/decorators/user.decorator';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('projects/:projectId/reviews')
  async triggerReview(
    @User('userId') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: TriggerReviewDto,
  ) {
    return this.reviewsService.triggerReview(userId, projectId, dto);
  }

  @Get('projects/:projectId/reviews')
  async findByProject(
    @User('userId') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.reviewsService.findByProject(userId, projectId);
  }

  @Get('reviews/:id')
  async findOne(@User('userId') userId: string, @Param('id') id: string) {
    return this.reviewsService.findOne(userId, id);
  }

  @Delete('reviews/:id')
  async remove(@User('userId') userId: string, @Param('id') id: string) {
    return this.reviewsService.remove(userId, id);
  }
}
