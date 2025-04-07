import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AptosSignatureService } from './aptos-signature.service';
import { User, UserDocument } from '../users/entities/user.entity';
import { SIGNATURE_MESSAGE } from '../config/constants';

interface SignInParams {
  walletAddress: string;
  signature: string;
  publicKey?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private aptosSignatureService: AptosSignatureService,
  ) {}

  async signIn(signInParams: SignInParams) {
    const { walletAddress, signature, publicKey } = signInParams;
    this.logger.debug(`开始处理登录请求 - 钱包地址: ${walletAddress}`);

    // 验证签名 - 使用常量中的签名消息
    this.logger.log(`正在验证签名，使用消息: "${SIGNATURE_MESSAGE}"`);
    const isValidSignature = await this.aptosSignatureService.verifySignature({
      walletAddress,
      message: SIGNATURE_MESSAGE, // 使用全局常量
      signature,
      publicKey,
    });

    if (!isValidSignature) {
      this.logger.warn(`签名验证失败 - 钱包地址: ${walletAddress}`);
      throw new UnauthorizedException('签名验证失败，请确保您使用正确的钱包和签名方法');
    }

    // 查找或创建用户
    this.logger.log(`签名验证成功，正在查找或创建用户: ${walletAddress}`);
    const user = await this.usersService.findOrCreateUser(walletAddress);

    // 生成JWT令牌
    this.logger.log(`生成JWT令牌，用户ID: ${user._id}`);
    return this.generateToken(user);
  }

  private generateToken(user: UserDocument) {
    const payload = {
      sub: user._id,
      walletAddress: user.walletAddress,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    };
  }
} 