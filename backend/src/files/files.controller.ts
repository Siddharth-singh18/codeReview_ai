import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { User } from '../auth/decorators/user.decorator';

@Controller()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('projects/:projectId/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadZip(
    @User('userId') userId: string,
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Please provide a repository zip file');
    }
    return this.filesService.processZipUpload(userId, projectId, file);
  }

  @Post('projects/:projectId/import-github')
  async importGithub(
    @User('userId') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: { githubUrl: string },
  ) {
    if (!body.githubUrl) {
      throw new BadRequestException('Please provide a valid GitHub repository URL');
    }
    return this.filesService.processGithubImport(userId, projectId, body.githubUrl);
  }

  @Get('projects/:projectId/tree')
  async getTree(
    @User('userId') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.filesService.getFileTree(userId, projectId);
  }

  @Get('files/:id')
  async getFile(
    @User('userId') userId: string,
    @Param('id') fileId: string,
  ) {
    return this.filesService.getFileContent(userId, fileId);
  }
}
