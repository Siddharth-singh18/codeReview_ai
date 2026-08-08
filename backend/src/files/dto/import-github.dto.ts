import { IsNotEmpty, IsUrl } from 'class-validator';

export class ImportGithubDto {
  @IsNotEmpty()
  @IsUrl()
  githubUrl: string;
}
