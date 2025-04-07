import { Controller, Get, Post, Param, Body, UseGuards, Res, NotFoundException } from '@nestjs/common';
import { DeepseekService } from '../services/deepseek.service';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { InternalApiService } from '../services/internal-api.service';

@Controller('api')
export class AnalysisController {
  constructor(
    private readonly deepseekService: DeepseekService,
    private readonly internalApiService: InternalApiService,
  ) {}

  @Post('analysis')
  async analyzeContent(@Body() body: { content: string }) {
    return this.deepseekService.analyzeContent(body.content);
  }

  @Get('internal/agents')
  @UseGuards(ApiKeyGuard)
  async getAllAgents() {
    return this.internalApiService.getAllAgents();
  }

  @Post('internal/agents/:id/analyze')
  @UseGuards(ApiKeyGuard)
  async analyzeAgent(@Param('id') agentId: string) {
    return this.deepseekService.analyzeAgent(agentId);
  }

  @Post('internal/agents/:id/rating')
  @UseGuards(ApiKeyGuard)
  async updateAgentRating(
    @Param('id') agentId: string,
    @Body() data: { score: number; feedback: string },
  ) {
    return this.internalApiService.updateAgentRating(
      agentId,
      data.score,
      data.feedback,
    );
  }

  @Get('files/:id/download')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    try {
      // 在实际应用中，这里应该从数据库获取文件信息
      // 这里我们模拟一个文件路径
      const filePath = path.join(process.cwd(), 'uploads', `${id}.pdf`);
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('文件不存在或已被删除');
      }
      
      // 获取文件信息
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;
      const fileType = path.extname(filePath).substring(1);
      
      // 设置响应头
      res.setHeader('Content-Type', this.getContentType(fileType));
      res.setHeader('Content-Disposition', `attachment; filename=${id}.${fileType}`);
      res.setHeader('Content-Length', fileSize);
      
      // 创建文件流并发送
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
      return;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error downloading file:', error);
      throw new NotFoundException('文件不存在或已被删除');
    }
  }
  
  private getContentType(fileType: string): string {
    const contentTypes = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'mov': 'video/quicktime',
      'mp4': 'video/mp4'
    };
    
    return contentTypes[fileType] || 'application/octet-stream';
  }
} 