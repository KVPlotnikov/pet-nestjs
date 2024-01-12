import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { Readable } from 'stream';

/**
 * @description Сервис для работы с файлами
 * */
@Injectable()
export class FileService {
  private readonly dataDirectory: string;

  constructor() {
    this.dataDirectory = path.resolve(__dirname, '..', '..', 'data');
  }

  /**
   * @description Метод получени пути до файла
   * */
  public getFilePath(fileName: string) {
    const withExtension = fileName.includes('.txt')
      ? fileName
      : `${fileName}.txt`;

    return path.resolve(this.dataDirectory, withExtension);
  }

  /**
   * @description Метод создания директории для хранения файла, в случае её отсутствия
   * */
  async createDir() {
    if (!fs.existsSync(this.dataDirectory)) {
      await fsPromises.mkdir(this.dataDirectory, { recursive: true });
    }
  }

  /**
   * @description Метод записи в файл полученных данных
   * @param {string} fileName - в какой файл записать
   * @param {string} data - что записать
   * */
  async writeToFile(fileName: string, data: string): Promise<void> {
    const filePath = this.getFilePath(fileName);
    await this.createDir();

    try {
      await fsPromises.appendFile(filePath, `\n${data}`, 'utf-8');
    } catch (error) {
      throw new Error(`Произошла ошибка при записи в файл: ${error.message}`);
    }
  }

  /**
   * @description Метод получения списка файлов, доступных для чтения
   * @returns {Promise<string[]>} - список имен файлов
   * */
  async getAvailableFiles(): Promise<string[]> {
    await this.createDir();
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

  public getFileStats(filePath: string) {
    return fs.statSync(filePath);
  }
}
