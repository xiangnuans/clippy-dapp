import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { INTERNAL_API_KEY, INTERNAL_ALLOWED_IPS } from '../../config/constants';

@Injectable()
export class InternalApiGuard implements CanActivate {
  private readonly logger = new Logger(InternalApiGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string;
    let clientIp = request.ip || 
                   request.connection.remoteAddress || 
                   request.headers['x-forwarded-for'] as string;
    
    // 处理IPv6格式的本地地址
    if (clientIp && clientIp.includes('::ffff:')) {
      clientIp = clientIp.replace('::ffff:', '');
    }

    this.logger.debug(`内部API请求: ${request.method} ${request.url} 来自IP: ${clientIp}`);

    // 验证API密钥
    if (!apiKey || apiKey !== INTERNAL_API_KEY) {
      this.logger.warn(`内部API请求API密钥验证失败: ${request.url}`);
      throw new UnauthorizedException('无效的API密钥');
    }

    // 验证IP地址是否在允许列表中
    if (!this.isIpAllowed(clientIp)) {
      this.logger.warn(`内部API请求IP地址不在允许列表中: ${clientIp}`);
      throw new ForbiddenException('IP地址不在允许列表中');
    }

    this.logger.log(`内部API请求验证通过: ${request.method} ${request.url}`);
    return true;
  }

  private isIpAllowed(ip: string): boolean {
    // 如果IP是undefined或空，拒绝访问
    if (!ip) return false;

    // 特殊处理localhost
    if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
      return true;
    }

    // 检查是否在允许的IP列表中
    return INTERNAL_ALLOWED_IPS.some(allowedIp => {
      // 精确匹配
      if (allowedIp === ip) {
        return true;
      }
      
      // 简单的子网匹配 (192.168.0.0/16会匹配所有192.168.开头的IP)
      if (allowedIp.includes('/')) {
        const [subnet] = allowedIp.split('/');
        if (ip.startsWith(subnet.substring(0, subnet.lastIndexOf('.')))) {
          return true;
        }
      }
      
      return false;
    });
  }
} 