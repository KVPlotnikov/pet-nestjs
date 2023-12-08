import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileService } from './file.service';
import { logger } from '../logger/logger';
import { Response } from 'express';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('write')
  async writeFile(
    @Body() body: { fileName: string; data: string },
  ): Promise<string> {
    const { fileName, data } = body;
    try {
      await this.fileService.writeToFile(fileName, data);
      logger.info(`Success writing to file: ${fileName}`);
      return `Данные успешно записаны в файл ${fileName}`;
    } catch (error) {
      logger.error(
        `Error writing to file: ${fileName}. Error: ${error.message}`,
      );
      throw new BadRequestException(error.message);
    }
  }

  @Get('read/:fileName')
  async readFile(@Param('fileName') fileName: string, @Res() res: Response) {
    try {
      const filePath = this.fileService.getFilePath(fileName);
      const stat = this.fileService.getFileStats(filePath);

      res.setHeader('Content-Type', 'application/text');
      res.setHeader('Content-Length', stat.size);

      const stream = this.fileService.getFileStream(filePath);

      stream.pipe(res);
    } catch (error) {
      logger.error(
        `Error writing to file: ${fileName}. Error: ${error.message}`,
      );
      throw new NotFoundException(error.message);
    }
  }

  @Get('list')
  async getFilesList(): Promise<string[]> {
    try {
      const filesList = await this.fileService.getAvailableFiles();
      logger.info(`Success reading files list`);
      return filesList;
    } catch (error) {
      logger.error(`Error reading files list. Error: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  @Get('/get/:fileName')
  async getFile(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const filePath = this.fileService.getFilePath(fileName);
      logger.info(`Отдан файл ${fileName}`);
      res.download(filePath);
    } catch (err) {
      logger.error(`Не удалось отдать файл ${fileName}`);
      throw new NotFoundException(`Файл ${fileName} не найден`);
    }
  }
}
