import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from './entities/agent.entity';
import { Document as FileDocument, DocumentDocument } from './entities/document.entity';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { UpdateAgentRatingDto } from './dto/update-agent-rating.dto';
import { UserDocument } from '../users/entities/user.entity';
import { Constants } from '../config/constants';
import { AgentWithDocuments } from './interfaces/agent-with-documents.interface';

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(Agent.name) private agentModel: Model<Agent>,
    @InjectModel(FileDocument.name) private documentModel: Model<FileDocument>,
  ) {}

  async create(createAgentDto: CreateAgentDto, user: UserDocument): Promise<AgentDocument> {
    const agent = new this.agentModel({
      ...createAgentDto,
      owner: user._id,
    });
    return agent.save();
  }

  async findAll(user: UserDocument): Promise<AgentDocument[]> {
    return this.agentModel.find({ owner: user._id }).exec();
  }

  // 新增：获取所有agent及其文件URL（内部API用）
  async findAllWithDocumentUrls(): Promise<AgentWithDocuments[]> {
    // 获取所有active的agent
    const agents = await this.agentModel.find({ isActive: true }).exec();
    
    // 构建结果数组
    const result: AgentWithDocuments[] = [];
    
    // 为每个agent获取关联的文档
    for (const agent of agents) {
      const documents = await this.documentModel.find({ agent: agent._id }).exec();
      
      // 构建文档URL列表
      const documentUrls = documents.map(doc => ({
        id: doc._id.toString(),
        name: doc.name,
        fileType: doc.fileType,
        downloadUrl: `${Constants.INTERNAL.FILE_PATH}/${doc._id}/download`,
      }));
      
      // 添加到结果数组
      result.push({
        id: agent._id.toString(),
        name: agent.name,
        industry: agent.industry,
        description: agent.description,
        score: agent.score,
        feedback: agent.feedback,
        documents: documentUrls
      });
    }
    
    return result;
  }

  async findOne(id: string, user: UserDocument): Promise<AgentDocument> {
    const agent = await this.agentModel.findById(id).exec();
    
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }
    
    if (agent.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException('You do not have permission to access this agent');
    }
    
    return agent;
  }

  // 新增：根据ID查找agent（不验证所有权，用于内部API）
  async findOneById(id: string): Promise<AgentDocument> {
    const agent = await this.agentModel.findById(id).exec();
    
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }
    
    return agent;
  }

  async update(id: string, updateAgentDto: UpdateAgentDto, user: UserDocument): Promise<AgentDocument> {
    const agent = await this.findOne(id, user);
    
    Object.assign(agent, updateAgentDto);
    return agent.save();
  }

  // 新增：更新agent评分（内部API用）
  async updateRating(id: string, updateRatingDto: UpdateAgentRatingDto): Promise<AgentDocument> {
    const agent = await this.findOneById(id);
    
    // 更新评分信息
    agent.score = updateRatingDto.score;
    if (updateRatingDto.feedback) {
      agent.feedback = updateRatingDto.feedback;
    }
    agent.ratedAt = new Date();
    
    return agent.save();
  }

  async remove(id: string, user: UserDocument): Promise<void> {
    const agent = await this.findOne(id, user);
    await agent.deleteOne();
  }
} 