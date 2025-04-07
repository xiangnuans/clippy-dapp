import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class InternalApiService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('API_BASE_URL');
    this.apiKey = this.configService.get<string>('INTERNAL_API_KEY');
  }

  private getHeaders() {
    return {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async getAllAgents() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/internal/agents`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch agents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async downloadFile(fileId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/files/${fileId}/download`,
        {
          headers: this.getHeaders(),
          responseType: 'arraybuffer',
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to download file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateAgentRating(agentId: string, score: number, feedback: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/internal/agents/${agentId}/rating`,
        {
          score,
          feedback,
        },
        {
          headers: this.getHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to update agent rating',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 