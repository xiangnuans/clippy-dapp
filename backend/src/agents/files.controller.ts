import { Controller, Get, Param, Res, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Document, DocumentDocument } from './entities/document.entity';

@Controller('files')
export class FilesController {
  private readonly logger = new Logger(FilesController.name);
  
  constructor(
    @InjectModel(Document.name) private documentModel: Model<Document>,
  ) {}

  /**
   * 文件下载接口
   * 用于内部AI服务下载用户上传的文件
   */
  @Get(':id/download')
  async downloadFile(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      this.logger.debug(`请求下载文件: ${id}`);
      
      // 查找文件记录
      const document = await this.documentModel.findById(id).exec();
      
      if (!document) {
        this.logger.warn(`文件不存在: ${id}`);
        throw new NotFoundException(`文件ID: ${id} 不存在`);
      }
      
      // 检查文件是否存在
      if (!fs.existsSync(document.filePath)) {
        this.logger.warn(`文件路径不存在: ${document.filePath}`);
        throw new NotFoundException('文件不存在或已被删除');
      }
      
      // 设置内容类型
      const contentType = this.getContentType(document.fileType);
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      
      // 返回文件
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.name)}"`);
      this.logger.log(`下载文件: ${document.name} (${id})`);
      return res.sendFile(path.resolve(document.filePath));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`文件下载出错: ${error.message}`, error.stack);
      throw new InternalServerErrorException('文件下载失败');
    }
  }
  
  private getContentType(fileType: string): string {
    const contentTypes = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    
    return contentTypes[fileType.toLowerCase()] || 'application/octet-stream';
  }
} 