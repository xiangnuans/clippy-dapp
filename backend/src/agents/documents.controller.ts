import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UseGuards, 
  Request, 
  Put,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentType } from './entities/document.entity';

// 定义简单版本的Multer文件接口
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

@Controller('agents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post(':agentId/documents')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, uniqueFilename);
        },
      }),
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  async create(
    @Param('agentId') agentId: string,
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file: any,
    @Request() req,
  ) {
    // 手动验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(`文件大小超过限制：最大 ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
    
    // 手动验证文件类型
    const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
    if (!Object.values(DocumentType).includes(fileExtension as DocumentType)) {
      throw new BadRequestException(
        `不支持的文件类型: ${fileExtension}。支持的类型: ${Object.values(DocumentType).join(', ')}`
      );
    }
    
    return this.documentsService.create(agentId, createDocumentDto, file, req.user);
  }

  @Get(':agentId/documents')
  async findAll(@Param('agentId') agentId: string, @Request() req) {
    return this.documentsService.findAll(agentId, req.user);
  }

  @Get(':agentId/documents/:id')
  async findOne(
    @Param('agentId') agentId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.documentsService.findOne(agentId, id, req.user);
  }

  @Get(':agentId/documents/:id/download')
  async download(
    @Param('agentId') agentId: string,
    @Param('id') id: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const document = await this.documentsService.findOne(agentId, id, req.user);
    
    if (!fs.existsSync(document.filePath)) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: '文件不存在或已被删除',
      });
    }
    
    return res.download(document.filePath, document.fileName);
  }

  @Put(':agentId/documents/:id')
  async update(
    @Param('agentId') agentId: string,
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Request() req,
  ) {
    return this.documentsService.update(agentId, id, updateDocumentDto, req.user);
  }

  @Delete(':agentId/documents/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('agentId') agentId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    await this.documentsService.remove(agentId, id, req.user);
  }
} 