/**
 * 全局常量配置
 */
export const Constants = {
  // 认证相关
  AUTH: {
    // 签名消息文本
    SIGNATURE_MESSAGE: 'CLIPPY: INFUSE SOUL INTO HUMANOID ROBOTS',
    // JWT过期时间
    JWT_EXPIRES_IN: '30d',
  },

  // 应用信息
  APP: {
    NAME: 'Clippy',
    VERSION: '1.0.0',
    // 基础URL，用于构建完整URL路径
    BASE_URL: process.env.BASE_URL || 'http://localhost:5471',
  },

  // API配置
  API: {
    PREFIX: 'api',
  },

  // 内部服务通信
  INTERNAL: {
    // 内部服务API密钥 (实际部署时应使用环境变量)
    API_KEY: process.env.INTERNAL_API_KEY || 'clippy-internal-api-key-secure',
    // 允许访问的内部服务IP列表
    ALLOWED_IPS: process.env.INTERNAL_ALLOWED_IPS 
      ? process.env.INTERNAL_ALLOWED_IPS.split(',') 
      : ['127.0.0.1', 'localhost', '::1', '192.168.0.0/16', '10.0.0.0/8'],
    // 文件下载URL的路径部分（不包含域名）
    FILE_PATH: '/api/files',
    // 获取完整的文件下载URL（根据环境配置动态生成）
    get FILE_BASE_URL() {
      return `${Constants.APP.BASE_URL}${this.FILE_PATH}`;
    },
  },
};

// 导出方便引用的常量
export const SIGNATURE_MESSAGE = Constants.AUTH.SIGNATURE_MESSAGE;
export const INTERNAL_API_KEY = Constants.INTERNAL.API_KEY;
export const INTERNAL_ALLOWED_IPS = Constants.INTERNAL.ALLOWED_IPS; 