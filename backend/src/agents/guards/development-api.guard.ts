import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class DevelopmentApiGuard implements CanActivate {
  private readonly logger = new Logger(DevelopmentApiGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    let clientIp = request.ip || 
                   request.connection.remoteAddress || 
                   request.headers['x-forwarded-for'] as string;
    
    // 处理IPv6格式的本地地址
    if (clientIp && clientIp.includes('::ffff:')) {
      clientIp = clientIp.replace('::ffff:', '');
    }

    this.logger.debug(`API请求(开发模式): ${request.method} ${request.url} 来自IP: ${clientIp}`);

    /* 
    // 在生产环境中，你应该取消注释以下代码以启用API密钥验证
    const apiKey = request.headers['x-api-key'] as string;
    if (!apiKey || apiKey !== INTERNAL_API_KEY) {
      this.logger.warn(`内部API请求API密钥验证失败: ${request.url}`);
      throw new UnauthorizedException('无效的API密钥');
    }

    // 在生产环境中，你应该取消注释以下代码以启用IP地址验证
    if (!this.isIpAllowed(clientIp)) {
      this.logger.warn(`内部API请求IP地址不在允许列表中: ${clientIp}`);
      throw new ForbiddenException('IP地址不在允许列表中');
    }
    */

    this.logger.log(`API请求验证通过(开发模式): ${request.method} ${request.url}`);
    return true;
  }

  /* 
  // 在生产环境中使用此方法验证IP地址
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
  */
} 