import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { AIProvidersService } from '../ai-providers/ai-providers.service';
import { SendChatMessageDto } from './dto/chat.dto';
import { ChatMessage } from '../ai-providers/interfaces/ai-provider.interface';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
    private aiProvidersService: AIProvidersService,
  ) {}

  async sendMessage(userId: string, projectId: string, dto: SendChatMessageDto) {
    // 1. Verify project ownership
    await this.projectsService.findOne(userId, projectId);

    // 2. Get or create ChatSession
    let session;
    if (dto.sessionId) {
      session = await this.prisma.chatSession.findUnique({
        where: { id: dto.sessionId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
      if (!session || session.userId !== userId || session.projectId !== projectId) {
        throw new NotFoundException('Chat session not found');
      }
    } else {
      session = await this.prisma.chatSession.create({
        data: {
          projectId,
          userId,
        },
        include: { messages: true },
      });
    }

    // 3. Persist User Message
    await this.prisma.message.create({
      data: {
        sessionId: session.id,
        role: 'USER',
        content: dto.message,
      },
    });

    // 4. Fetch codebase context files (Optimized for Groq 12k TPM limit)
    const files = await this.prisma.file.findMany({
      where: { projectId },
      select: { path: true, content: true, language: true },
      take: 6,
    });

    const codebaseContext = files
      .map((f) => `--- FILE: ${f.path} (${f.language}) ---\n${f.content.slice(0, 1000)}\n--- END FILE ---`)
      .join('\n\n');

    const systemPrompt = `You are an expert AI Code Assistant pair programming with a developer.
You have direct context of the developer's project files. Answer questions accurately, reference file names and line numbers when applicable, and provide clean code snippets.

--- REPOSITORY CODEBASE CONTEXT ---
${codebaseContext || 'No files uploaded yet.'}
--- END CODEBASE CONTEXT ---`;

    // 5. Construct conversation history array
    const previousMessages: ChatMessage[] = session.messages.map((m) => ({
      role: m.role === 'USER' ? 'user' : 'assistant',
      content: m.content,
    }));

    const conversation: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...previousMessages,
      { role: 'user', content: dto.message },
    ];

    try {
      // 6. Invoke AI Provider completion
      const provider = await this.aiProvidersService.getProviderInstance(userId, dto.providerId);
      const aiResponse = await provider.complete(conversation, { temperature: 0.3 });

      // 7. Persist Assistant Message
      const assistantMessage = await this.prisma.message.create({
        data: {
          sessionId: session.id,
          role: 'ASSISTANT',
          content: aiResponse.content,
        },
      });

      return {
        sessionId: session.id,
        userMessage: dto.message,
        assistantMessage: assistantMessage.content,
        createdAt: assistantMessage.createdAt,
      };
    } catch (err: any) {
      console.error('Chat completion error:', err);
      throw new BadRequestException(err.message || 'Failed to complete chat message');
    }
  }

  async getSessions(userId: string, projectId: string) {
    await this.projectsService.findOne(userId, projectId);

    return this.prisma.chatSession.findMany({
      where: { projectId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSessionMessages(userId: string, sessionId: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        project: { select: { userId: true } },
      },
    });

    if (!session || session.project.userId !== userId) {
      throw new NotFoundException('Chat session not found');
    }

    return session.messages;
  }
}
