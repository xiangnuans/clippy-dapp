import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InternalApiService } from './internal-api.service';

@Injectable()
export class DeepseekService {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(
    private configService: ConfigService,
    private internalApiService: InternalApiService,
  ) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    this.apiUrl = this.configService.get<string>('DEEPSEEK_API_URL');
  }

  private async analyzeWithDeepseek(content: string) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          messages: [
            {
              role: 'system',
              content: '你是一个专业的AI助手评估专家。请分析以下内容并给出评分（0-100）和详细反馈。评分标准：1. 专业性 2. 准确性 3. 实用性 4. 创新性',
            },
            {
              role: 'user',
              content: content,
            },
          ],
          model: 'deepseek-chat',
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const analysis = response.data.choices[0].message.content;
      
      // 解析Deepseek的响应，提取评分和反馈
      const scoreMatch = analysis.match(/评分[：:]\s*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;
      
      // 提取反馈内容（去除评分部分）
      const feedback = analysis.replace(/评分[：:]\s*\d+[\n\r]*/i, '').trim();

      return { score, feedback };
    } catch (error) {
      throw new HttpException(
        'Failed to analyze content with Deepseek',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async analyzeAgent(agentId: string) {
    try {
      // 获取agent信息
      const agents = await this.internalApiService.getAllAgents();
      const agent = agents.find(a => a.id === agentId);
      
      if (!agent) {
        throw new HttpException('Agent not found', HttpStatus.NOT_FOUND);
      }

      // 下载并分析所有文件
      let allContent = `Agent名称: ${agent.name}\n行业: ${agent.industry}\n描述: ${agent.description}\n\n`;
      
      for (const doc of agent.documents) {
        const fileContent = await this.internalApiService.downloadFile(doc.id);
        // 将文件内容转换为文本（这里假设是文本文件，实际可能需要根据文件类型处理）
        allContent += `文件 ${doc.name} 内容:\n${fileContent.toString()}\n\n`;
      }

      // 使用Deepseek分析内容
      const { score, feedback } = await this.analyzeWithDeepseek(allContent);

      // 更新agent评分
      await this.internalApiService.updateAgentRating(agentId, score, feedback);

      return {
        agentId,
        score,
        feedback,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to analyze agent',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 