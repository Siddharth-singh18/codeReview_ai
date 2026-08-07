export interface FileTreeNode {
  id?: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  language?: string;
  children?: FileTreeNode[];
}

export interface FileContent {
  id: string;
  path: string;
  content: string;
  language: string;
  size: number;
}
