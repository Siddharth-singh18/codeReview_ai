import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendChatMessageDto } from './dto/chat.dto';
import { User } from '../auth/decorators/user.decorator';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('projects/:projectId/chat')
  async sendMessage(
    @User('userId') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: SendChatMessageDto,
  ) {
    return this.chatService.sendMessage(userId, projectId, dto);
  }

  @Get('projects/:projectId/chat/sessions')
  async getSessions(
    @User('userId') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.chatService.getSessions(userId, projectId);
  }

  @Get('chat/sessions/:sessionId/messages')
  async getSessionMessages(
    @User('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.chatService.getSessionMessages(userId, sessionId);
  }
}
