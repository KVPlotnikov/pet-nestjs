import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class FileService {
  private readonly dataDirectory: string;

  constructor() {
    this.dataDirectory = path.join(__dirname, '..', 'data');
  }

  public getFilePath(fileName: string) {
    return path.resolve(this.dataDirectory, fileName);
  }

  async createDir() {
    if (!fs.existsSync(this.dataDirectory)) {
      await fsPromises.mkdir(this.dataDirectory, { recursive: true });
    }
  }

  async writeToFile(fileName: string, data: string): Promise<void> {
    const filePath = this.getFilePath(fileName);
    this.createDir();

    try {
      await fsPromises.writeFile(filePath, data, 'utf-8');
    } catch (error) {
      throw new Error(`Произошла ошибка при записи в файл: ${error.message}`);
    }
  }

  async readFromFile(fileName: string): Promise<string> {
    const filePath = this.getFilePath(fileName);
    this.createDir();
    try {
      const data = await fsPromises.readFile(filePath, 'utf-8');
      return data;
    } catch (error) {
      throw new Error(`Произошла ошибка при чтении файла: ${error.message}`);
    }
  }

  async getAvailableFiles(): Promise<string[]> {
    this.createDir();
    try {
      const files = await fsPromises.readdir(this.dataDirectory);
      return files;
    } catch (error) {
      throw new Error(
        `Произошла ошибка при получении списка файлов: ${error.message}`,
      );
    }
  }

  public getFileStream(filePath: string): Readable {
    return fs.createReadStream(filePath);
  }
}
