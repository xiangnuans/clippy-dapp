import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // 检查API密钥
    const apiKey = request.headers['x-api-key'];
    const validApiKey = this.configService.get<string>('INTERNAL_API_KEY');

    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    // 检查IP地址限制
    const allowedIps = this.configService.get<string>('INTERNAL_ALLOWED_IPS');
    if (allowedIps) {
      const clientIp = request.ip;
      const ipList = allowedIps.split(',').map(ip => ip.trim());
      
      // 检查IP是否在允许列表中
      const isAllowed = ipList.some(ip => {
        if (ip.includes('/')) {
          // CIDR格式 - 简单实现，仅支持/8, /16, /24, /32
          const [network, bits] = ip.split('/');
          const networkParts = network.split('.');
          const clientParts = clientIp.split('.');
          
          if (bits === '8') {
            return networkParts[0] === clientParts[0];
          } else if (bits === '16') {
            return networkParts[0] === clientParts[0] && networkParts[1] === clientParts[1];
          } else if (bits === '24') {
            return networkParts[0] === clientParts[0] && 
                   networkParts[1] === clientParts[1] && 
                   networkParts[2] === clientParts[2];
          } else if (bits === '32') {
            return network === clientIp;
          }
          return false;
        } else {
          // 单个IP
          return clientIp === ip;
        }
      });

      if (!isAllowed) {
        throw new ForbiddenException('IP address not allowed');
      }
    }

    return true;
  }
} 