import { Injectable, ExecutionContext, UnauthorizedException, Logger, Inject, forwardRef } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { JwtStrategy } from './jwt.strategy';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private jwtStrategy?: JwtStrategy
  ) {
    super();
    console.log('JwtAuthGuard构造函数被调用，依赖注入情况：', {
      hasJwtService: !!jwtService,
      hasUsersService: !!usersService,
      hasJwtStrategy: !!jwtStrategy
    });
    this.logger.log('JwtAuthGuard已初始化');
  }

  // 重写canActivate方法以添加详细日志
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    this.logger.debug(`接收到请求: ${request.method} ${request.url}`);
    
    // 验证Authorization头是否存在
    if (!authHeader) {
      this.logger.warn('Authorization头不存在，JWT验证失败');
      throw new UnauthorizedException('缺少Authorization头');
    }
    
    // 检查Bearer前缀
    if (!authHeader.startsWith('Bearer ')) {
      this.logger.warn('Authorization头格式错误，应以"Bearer "开头');
      throw new UnauthorizedException('Authorization头格式不正确');
    }

    // 提取JWT令牌
    const token = authHeader.split(' ')[1];
    if (!token) {
      this.logger.warn('未找到JWT令牌');
      throw new UnauthorizedException('未找到令牌');
    }

    // 记录令牌信息(只记录前10个字符和后10个字符，中间用...代替，保护敏感信息)
    const tokenLength = token.length;
    const maskedToken = tokenLength > 20 
      ? `${token.slice(0, 10)}...${token.slice(tokenLength - 10)}` 
      : token;
    this.logger.debug(`JWT令牌: ${maskedToken} (长度: ${tokenLength})`);

    try {
      // 尝试使用父类方法进行验证（标准方式）
      let isAuthenticated = false;
      
      try {
        // 首先尝试使用标准Passport验证方式
        this.logger.debug('尝试使用标准Passport方式验证JWT');
        
        // 如果有JwtStrategy注入，直接使用
        if (this.jwtStrategy) {
          try {
            // 解码JWT令牌
            const payload = this.jwtService.verify(token);
            console.log('JwtAuthGuard验证 - 使用注入的JwtStrategy');
            // 调用策略的validate方法
            const user = await this.jwtStrategy.validate(payload);
            if (user) {
              request.user = user;
              isAuthenticated = true;
              this.logger.log(`使用注入的JwtStrategy验证成功，用户ID: ${user._id}`);
            }
          } catch (strategyError) {
            console.log(`使用注入的JwtStrategy验证失败: ${strategyError.message}`);
            this.logger.warn(`使用注入的JwtStrategy验证失败: ${strategyError.message}`);
            // 继续尝试标准方式
          }
        }
        
        // 如果上面的方式未成功，尝试标准方式
        if (!isAuthenticated) {
          isAuthenticated = await super.canActivate(context) as boolean;
          this.logger.log(`标准验证结果: ${isAuthenticated ? '成功' : '失败'}`);
        }
      } catch (passportError) {
        // // Passport验证失败，尝试手动验证
        // console.log(`标准Passport验证失败: ${passportError.message}`);
        // this.logger.warn(`标准Passport验证失败: ${passportError.message}，尝试手动验证`);
        
        // // 如果有注入JwtService，尝试手动验证
        // if (this.jwtService && this.usersService) {
        //   try {
        //     // 解码JWT令牌
        //     this.logger.debug('尝试手动解码和验证JWT');
        //     const payload = this.jwtService.verify(token);
        //     this.logger.debug(`JWT解码成功，payload: ${JSON.stringify(payload)}`);
            
        //     // 验证payload中的walletAddress
        //     if (!payload.walletAddress) {
        //       this.logger.warn('JWT payload中缺少walletAddress字段');
        //       throw new UnauthorizedException('令牌中缺少钱包地址');
        //     }
            
        //     // 查找用户
        //     const user = await this.usersService.findByWalletAddress(payload.walletAddress);
        //     if (!user) {
        //       this.logger.warn(`未找到钱包地址为 ${payload.walletAddress} 的用户`);
        //       throw new UnauthorizedException('用户不存在');
        //     }
            
        //     // 将用户信息附加到请求对象上
        //     request.user = user;
        //     isAuthenticated = true;
        //     this.logger.log(`手动验证成功，用户ID: ${user._id}`);
        //   } catch (jwtError) {
        //     this.logger.error(`手动JWT验证出错: ${jwtError.message}`);
            
        //     if (jwtError.name === 'TokenExpiredError') {
        //       throw new UnauthorizedException('令牌已过期，请重新登录');
        //     } else if (jwtError.name === 'JsonWebTokenError') {
        //       throw new UnauthorizedException(`无效的令牌: ${jwtError.message}`);
        //     }
            
        //     throw jwtError;
        //   }
        // } else {
        //   // 没有JwtService注入，无法进行手动验证
        //   this.logger.error('无法进行手动验证，JwtService或UsersService未注入');
        //   throw passportError;
        // }
      }
      
      if (isAuthenticated) {
        const user = request.user;
        this.logger.debug(`验证成功，用户: ${user?._id || '未知'}, 钱包: ${user?.walletAddress || '未知'}`);
      } else {
        this.logger.warn('身份验证失败但未抛出异常，拒绝访问');
        throw new UnauthorizedException('身份验证失败');
      }
      
      return isAuthenticated;
    } catch (error) {
      // 捕获所有验证过程中的错误
      console.log(`JWT验证最终错误: ${error.message}`, error.stack);
      this.logger.error(`JWT验证出错: ${error.message}`, error.stack);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new UnauthorizedException('令牌验证失败');
    }
  }
} 