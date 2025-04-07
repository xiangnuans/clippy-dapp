import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Constants } from './config/constants';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Logger, LogLevel } from '@nestjs/common';

// 加载.env文件
dotenv.config();

// 全局日志配置
const globalLogger = new Logger('Bootstrap');

// 获取日志级别设置
function getLogLevels(): LogLevel[] {
  const env = process.env.NODE_ENV || 'development';
  // 在开发和测试环境下，启用所有日志级别
  if (['development', 'test'].includes(env)) {
    return ['error', 'warn', 'log', 'debug', 'verbose'];
  }
  // 在生产环境下，只启用必要的日志级别
  return ['error', 'warn', 'log'];
}

// 输出当前环境变量
function logEnvironmentInfo() {
  globalLogger.log('环境变量信息:');
  globalLogger.log(`- NODE_ENV: ${process.env.NODE_ENV || '未设置 (默认为development)'}`);
  globalLogger.log(`- PORT: ${process.env.PORT || '3000 (默认)'}`);
  globalLogger.log(`- MONGODB_URI: ${process.env.MONGODB_URI ? '已设置' : '未设置，使用默认值'}`);
  globalLogger.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? '已设置' : '未设置，使用默认值'}`);
  globalLogger.log(`- APTOS_NODE_URL: ${process.env.APTOS_NODE_URL ? '已设置' : '未设置，使用默认值'}`);
  globalLogger.log(`- BASE_URL: ${process.env.BASE_URL || 'http://localhost:5471 (默认)'}`);
  globalLogger.log(`- 日志级别: ${getLogLevels().join(', ')}`);
}

// 确保上传目录存在
function ensureUploadDirectoryExists() {
  const uploadDir = path.join(process.cwd(), 'uploads');
  globalLogger.log(`在应用启动前检查上传目录: ${uploadDir}`);
  if (!fs.existsSync(uploadDir)) {
    globalLogger.log(`创建上传目录: ${uploadDir}`);
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      globalLogger.log('上传目录创建成功');
    } catch (error) {
      globalLogger.error('创建上传目录失败:', error);
    }
  } else {
    globalLogger.log('上传目录已存在');
  }
}

async function bootstrap() {
  // 首先输出环境信息
  logEnvironmentInfo();
  
  // 确保上传目录存在
  ensureUploadDirectoryExists();
  
  try {
    // 强制启用所有日志级别，特别是调试签名验证问题
    const logLevels: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];
    
    globalLogger.log(`启动应用程序，启用的日志级别: ${logLevels.join(', ')}`);
    
    const app = await NestFactory.create(AppModule, {
      // 启用详细日志，显示所有级别的日志
      logger: logLevels,
      // 关闭自动校验，避免在开发阶段由于DTO验证错误导致的问题
      abortOnError: false,
    });
    
    globalLogger.log(`应用已创建，开始配置...`);
    
    // 设置完全允许跨域
    app.enableCors({
      origin: '*', // 允许任何来源
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // 允许的HTTP方法
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true, // 允许携带凭证
      allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization,X-Auth-Token', // 允许的头信息
    });
    globalLogger.log(`CORS已配置，允许所有来源`);
    
    // 设置全局前缀
    app.setGlobalPrefix(Constants.API.PREFIX);
    globalLogger.log(`API前缀已设置为: ${Constants.API.PREFIX}`);
    
    // 获取端口号
    const port = process.env.PORT || 3000;
    
    // 启动应用
    await app.listen(port);
    globalLogger.log(`${Constants.APP.NAME} 应用程序正在运行，端口: ${port}`);
    globalLogger.log(`对外API访问地址: http://localhost:${port}/${Constants.API.PREFIX}`);
  } catch (error) {
    globalLogger.error('启动应用时出错:', error);
  }
}
bootstrap();
