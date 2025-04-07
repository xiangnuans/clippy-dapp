import { Controller, Post, Body, UseGuards, Get, Request, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AptosSignatureService } from './aptos-signature.service';
import { SIGNATURE_MESSAGE } from '../config/constants';

interface SignInDto {
  walletAddress: string;
  signature: string;
  publicKey?: string;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  
  constructor(
    private authService: AuthService,
    private aptosSignatureService: AptosSignatureService
  ) {}

  @Post('login')
  async login(@Body() signInDto: SignInDto) {
    this.logger.log(`尝试登录: ${signInDto.walletAddress}`);
    
    // 确保publicKey存在，这是验证签名所必需的
    if (!signInDto.publicKey) {
      this.logger.warn(`尝试登录时缺少公钥: ${signInDto.walletAddress}`);
    }
    
    // 打印收到的签名信息，用于调试
    this.logger.log(`登录详情 - 钱包地址: ${signInDto.walletAddress}`);
    this.logger.log(`签名: ${signInDto.signature}`);
    this.logger.log(`公钥: ${signInDto.publicKey}`);
    this.logger.debug(`登录详情 - 钱包地址: ${signInDto.walletAddress}, 签名长度: ${signInDto.signature?.length || 0}, 公钥存在: ${!!signInDto.publicKey}`);
    
    try {
      const result = await this.authService.signIn(signInDto);
      
      // 打印生成的令牌信息
      this.logger.log(`登录成功，用户ID: ${result.user.id}`);
      
      return result;
    } catch (error) {
      this.logger.error(`登录失败 - 钱包地址: ${signInDto.walletAddress}, 错误: ${error.message}`);
      // 重新抛出异常，让NestJS处理
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    this.logger.log(`获取用户资料: ${req.user?._id || '未知用户'}`);
    return req.user;
  }
  
  @Post('verify-signature')
  async verifySignature(@Body() data: SignInDto) {
    this.logger.log(`开始验证签名 - 钱包地址: ${data.walletAddress}`);
    this.logger.log(`签名: ${data.signature}`);
    this.logger.log(`公钥: ${data.publicKey}`);
    
    // 用于测试的字节序列转换
    const messageBytes = new TextEncoder().encode(SIGNATURE_MESSAGE);
    let signatureBytes;
    let publicKeyBytes;
    try {
      signatureBytes = data.signature.startsWith('0x') 
        ? data.signature.substring(2) 
        : data.signature;
      publicKeyBytes = data.publicKey && data.publicKey.startsWith('0x')
        ? data.publicKey.substring(2)
        : data.publicKey;
    } catch (error) {
      this.logger.error(`转换签名/公钥出错: ${error.message}`);
    }
    
    // 验证签名
    const result = await this.aptosSignatureService.verifySignature({
      walletAddress: data.walletAddress,
      message: SIGNATURE_MESSAGE,
      signature: data.signature,
      publicKey: data.publicKey,
    });
    
    // 返回详细结果
    return {
      isValid: result,
      message: SIGNATURE_MESSAGE,
      signatureLength: data.signature?.length || 0,
      publicKeyLength: data.publicKey?.length || 0,
      bytesInfo: {
        messageBytes: Array.from(messageBytes),
        signatureHex: signatureBytes,
        publicKeyHex: publicKeyBytes,
      },
      timestamp: new Date().toISOString(),
    };
  }
} 