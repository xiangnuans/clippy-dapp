import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

// 数据库配置对象，可根据环境变量来设置
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'evermove',
  entities: [User],
  synchronize: process.env.NODE_ENV !== 'production', // 在生产环境中不应该使用synchronize
  logging: process.env.NODE_ENV !== 'production',
}; 