import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

@Injectable()
export class StorageService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  async saveFromString(
    content: string,
    extension = 'txt',
  ): Promise<string> {
    await mkdir(this.uploadDir, { recursive: true });
    const name = `${randomBytes(12).toString('hex')}.${extension}`;
    const filePath = join(this.uploadDir, name);
    await writeFile(filePath, content, 'utf8');
    return `uploads/${name}`;
  }

  async saveFromUrl(url: string): Promise<string> {
    return url;
  }
}
