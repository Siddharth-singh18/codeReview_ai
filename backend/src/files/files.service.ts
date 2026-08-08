import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import AdmZip = require('adm-zip');

export interface FileTreeNode {
  id?: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  language?: string;
  children?: FileTreeNode[];
}

const ALLOWED_EXTENSIONS = new Set([
  'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'go', 'rs',
  'php', 'rb', 'swift', 'kt', 'kts', 'html', 'css', 'scss', 'sass', 'json', 'yaml',
  'yml', 'md', 'txt', 'sql', 'sh', 'bash', 'zsh', 'env', 'prisma', 'graphql', 'dockerfile',
  'toml', 'xml', 'ini', 'config'
]);

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
  ) {}

  async processZipUpload(userId: string, projectId: string, file: Express.Multer.File) {
    // Validate project ownership
    await this.projectsService.findOne(userId, projectId);

    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid zip file payload');
    }

    let zip: AdmZip;
    try {
      zip = new AdmZip(file.buffer);
    } catch {
      throw new BadRequestException('Failed to parse zip archive. Please ensure it is a valid zip file.');
    }

    const zipEntries = zip.getEntries();
    const filesToCreate: { path: string; content: string; language: string; size: number }[] = [];

    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;
      
      const pathSegments = entry.entryName.split('/').filter(Boolean);
      // Skip hidden folders like .git, node_modules, etc.
      if (pathSegments.some((seg) => seg.startsWith('.') || seg === 'node_modules' || seg === 'dist' || seg === 'build')) {
        continue;
      }

      const path = pathSegments.join('/');
      const filename = pathSegments[pathSegments.length - 1];
      const ext = filename.includes('.') ? filename.split('.').pop()!.toLowerCase() : filename.toLowerCase();

      if (!ALLOWED_EXTENSIONS.has(ext)) {
        continue;
      }

      const content = entry.getData().toString('utf8');
      // Skip large binary/minified files (e.g. > 1MB)
      if (entry.header.size > 1024 * 1024) continue;

      filesToCreate.push({
        path,
        content,
        language: this.detectLanguage(ext),
        size: entry.header.size,
      });
    }

    if (filesToCreate.length === 0) {
      throw new BadRequestException('No supported source files found in the zip archive');
    }

    // Replace existing files for project upload
    await this.prisma.file.deleteMany({
      where: { projectId },
    });

    await this.prisma.file.createMany({
      data: filesToCreate.map((f) => ({
        projectId,
        path: f.path,
        content: f.content,
        language: f.language,
        size: f.size,
      })),
    });

    return {
      message: `Successfully processed zip upload`,
      fileCount: filesToCreate.length,
    };
  }

  async processGithubImport(userId: string, projectId: string, githubUrl: string) {
    await this.projectsService.findOne(userId, projectId);

    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new BadRequestException('Invalid GitHub URL format. Example: https://github.com/owner/repo');
    }

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');

    const zipUrl = `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/main`;
    const fallbackZipUrl = `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/master`;

    let buffer: Buffer;
    try {
      const response = await fetch(zipUrl);
      if (response.ok) {
        buffer = Buffer.from(await response.arrayBuffer());
      } else {
        const fallbackRes = await fetch(fallbackZipUrl);
        if (!fallbackRes.ok) {
          throw new BadRequestException(`Failed to download repository zip archive from GitHub for ${owner}/${repo}`);
        }
        buffer = Buffer.from(await fallbackRes.arrayBuffer());
      }
    } catch (err: any) {
      throw new BadRequestException(err.message || 'Failed to fetch repository from GitHub');
    }

    const fakeFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: `${repo}.zip`,
      encoding: '7bit',
      mimetype: 'application/zip',
      buffer,
      size: buffer.length,
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    return this.processZipUpload(userId, projectId, fakeFile);
  }

  async getFileTree(userId: string, projectId: string): Promise<FileTreeNode[]> {
    await this.projectsService.findOne(userId, projectId);

    const files = await this.prisma.file.findMany({
      where: { projectId },
      select: { id: true, path: true, size: true, language: true },
      orderBy: { path: 'asc' },
    });

    const root: FileTreeNode[] = [];

    for (const file of files) {
      const parts = file.path.split('/');
      let currentLevel = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1;
        const currentPath = parts.slice(0, i + 1).join('/');

        let existing = currentLevel.find((item) => item.name === part);

        if (!existing) {
          existing = {
            name: part,
            path: currentPath,
            type: isFile ? 'file' : 'directory',
            ...(isFile ? { id: file.id, size: file.size, language: file.language } : { children: [] }),
          };
          currentLevel.push(existing);
        }

        if (!isFile && existing.children) {
          currentLevel = existing.children;
        }
      }
    }

    return root;
  }

  async getFileContent(userId: string, fileId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      include: { project: { select: { userId: true } } },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.project.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    return {
      id: file.id,
      path: file.path,
      content: file.content,
      language: file.language,
      size: file.size,
    };
  }

  private detectLanguage(extension: string): string {
    const map: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      cs: 'csharp',
      go: 'go',
      rs: 'rust',
      php: 'php',
      rb: 'ruby',
      swift: 'swift',
      kt: 'kotlin',
      html: 'html',
      css: 'css',
      json: 'json',
      yaml: 'yaml',
      yml: 'yaml',
      md: 'markdown',
      sql: 'sql',
      sh: 'bash',
      prisma: 'prisma',
    };
    return map[extension] || 'text';
  }
}
