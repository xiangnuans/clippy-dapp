import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { Document, DocumentDocument, DocumentType } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { UserDocument } from '../users/entities/user.entity';
import { AgentsService } from './agents.service';

// 定义文件接口，避免使用全局Express.Multer.File类型
interface UploadedFile {
  originalname: string;
  path: string;
  size: number;
  [key: string]: any;
}

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(Document.name) private documentModel: Model<Document>,
    private agentsService: AgentsService,
  ) {
    // 确保上传目录存在
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists(): void {
    const uploadDir = path.join(process.cwd(), 'uploads');
    console.log(`检查上传目录: ${uploadDir}`);
    if (!fs.existsSync(uploadDir)) {
      console.log(`创建上传目录: ${uploadDir}`);
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('上传目录创建成功');
      } catch (error) {
        console.error('创建上传目录失败:', error);
      }
    } else {
      console.log('上传目录已存在');
    }
  }

  async create(
    agentId: string, 
    createDocumentDto: CreateDocumentDto, 
    file: UploadedFile, 
    user: UserDocument
  ): Promise<DocumentDocument> {
    // 确保上传目录存在
    this.ensureUploadDirectoryExists();
    
    // 确认agent存在且属于当前用户
    const agent = await this.agentsService.findOne(agentId, user);
    
    // 验证文件类型
    const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
    if (!Object.values(DocumentType).includes(fileExtension as DocumentType)) {
      throw new BadRequestException(`不支持的文件类型: ${fileExtension}`);
    }
    
    // 创建文档记录
    const document = new this.documentModel({
      ...createDocumentDto,
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      fileType: fileExtension,
      agent: agent._id,
    });
    
    return document.save();
  }

  async findAll(agentId: string, user: UserDocument): Promise<DocumentDocument[]> {
    // 确认agent存在且属于当前用户
    await this.agentsService.findOne(agentId, user);
    
    return this.documentModel.find({ agent: agentId }).exec();
  }

  async findOne(agentId: string, id: string, user: UserDocument): Promise<DocumentDocument> {
    // 确认agent存在且属于当前用户
    await this.agentsService.findOne(agentId, user);
    
    const document = await this.documentModel.findOne({ 
      _id: id, 
      agent: agentId 
    }).exec();
    
    if (!document) {
      throw new NotFoundException(`文档ID ${id} 不存在`);
    }
    
    return document;
  }

  async update(
    agentId: string, 
    id: string, 
    updateDocumentDto: UpdateDocumentDto, 
    user: UserDocument
  ): Promise<DocumentDocument> {
    const document = await this.findOne(agentId, id, user);
    
    Object.assign(document, updateDocumentDto);
    return document.save();
  }

  async remove(agentId: string, id: string, user: UserDocument): Promise<void> {
    const document = await this.findOne(agentId, id, user);
    
    // 删除文件
    try {
      fs.unlinkSync(document.filePath);
    } catch (error) {
      // 文件可能已被删除，记录错误但不阻止操作
      console.error(`Error deleting file ${document.filePath}:`, error);
    }
    
    // 删除数据库记录
    await document.deleteOne();
  }

  async getFilePath(agentId: string, id: string, user: UserDocument): Promise<string> {
    const document = await this.findOne(agentId, id, user);
    return document.filePath;
  }
} 