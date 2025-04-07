import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { UpdateAgentRatingDto } from './dto/update-agent-rating.dto';
// import { InternalApiGuard } from './guards/internal-api.guard'; // 生产环境使用
import { DevelopmentApiGuard } from './guards/development-api.guard'; // 开发环境使用
import { AgentWithDocuments } from './interfaces/agent-with-documents.interface';
import { AgentDocument } from './entities/agent.entity';
import { Constants } from '../config/constants';

@Controller('internal/agents')
@UseGuards(DevelopmentApiGuard) // 开发环境中使用开放的守卫
export class InternalApiController {
  constructor(private readonly agentsService: AgentsService) {}

  /**
   * 获取所有代理及其关联文件的URL
   * 用于AI服务获取要处理的代理列表
   * 
   * 开发环境：无需认证
   * 生产环境：需要API密钥和IP限制
   */
  @Get()
  async findAllWithDocumentUrls(): Promise<{ baseUrl: string; agents: AgentWithDocuments[] }> {
    const agents = await this.agentsService.findAllWithDocumentUrls();
    return {
      baseUrl: Constants.APP.BASE_URL, // 添加BASE_URL到响应中
      agents: agents,
    };
  }

  /**
   * 更新代理评分
   * 用于AI服务对代理进行评分
   * 
   * 开发环境：无需认证
   * 生产环境：需要API密钥和IP限制
   */
  @Post(':id/rating')
  async updateRating(
    @Param('id') id: string,
    @Body() updateRatingDto: UpdateAgentRatingDto,
  ): Promise<AgentDocument> {
    return this.agentsService.updateRating(id, updateRatingDto);
  }
} 