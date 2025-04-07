import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'clippy-secret-key',
    });
    // console.log('JwtStrategy构造函数被调用 - 初始化中');
    // this.logger.log(`JWT策略初始化，使用密钥: ${process.env.JWT_SECRET ? '来自环境变量' : '默认密钥'}`);
  }

  async validate(payload: any): Promise<UserDocument> {
    console.log('JwtStrategy.validate方法被调用，payload:', JSON.stringify(payload));
    try {
      // this.logger.debug(`正在验证JWT payload: ${JSON.stringify(payload)}`);
      
      if (!payload) {
        // console.log('JWT payload为空');
        this.logger.error('JWT payload为空');
        throw new UnauthorizedException('无效的令牌');
      }
      
      if (!payload.walletAddress) {
        // console.log('JWT payload中缺少walletAddress字段');
        this.logger.error('JWT payload中缺少walletAddress字段');
        throw new UnauthorizedException('令牌中缺少钱包地址');
      }
      
      // console.log(`开始查找钱包地址: ${payload.walletAddress}`);
      // this.logger.log(`查找钱包地址: ${payload.walletAddress}`);
      const user = await this.usersService.findByWalletAddress(payload.walletAddress);

      // console.log("验证过程 - 用户查询结果:", user ? `找到用户(${user._id})` : '未找到用户');
      
      if (!user) {
        console.log(`未找到钱包地址为 ${payload.walletAddress} 的用户`);
        this.logger.warn(`未找到钱包地址为 ${payload.walletAddress} 的用户`);
        throw new UnauthorizedException('用户不存在');
      }
      
      // console.log(`JWT验证成功，用户ID: ${user._id}`);
      // this.logger.log(`JWT验证成功，用户ID: ${user._id}`);
      return user;
    } catch (error) {
      console.log(`JWT验证错误: ${error.message}`, error.stack);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`JWT验证过程中出错: ${error.message}`, error.stack);
      throw new UnauthorizedException('令牌验证失败');
    }
  }
} 