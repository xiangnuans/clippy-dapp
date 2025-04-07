# Clippy 后端 API 文档

## 技术栈

- NestJS 框架
- MongoDB 数据库
- JWT 身份验证
- Multer 文件上传

## 安装

```bash
# 安装依赖
npm install

# 开发模式运行
npm run start:dev

# 生产模式构建
npm run build

# 生产模式运行
npm run start:prod
```

## 环境变量

在项目根目录创建 `.env` 文件：

```
# MongoDB配置
MONGODB_URI=mongodb://localhost:27017/clippy

# JWT配置
JWT_SECRET=clippy-secret-key-change-in-production

# Aptos节点配置
APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com

# 应用配置
PORT=3000
NODE_ENV=development
```

## API 端点

### 认证 API

#### 登录

- **URL**: `/api/auth/login`
- **方法**: `POST`
- **描述**: 使用钱包地址和签名登录
- **请求体**:
  ```json
  {
    "walletAddress": "0xefa19f1a7eed5f5bc494eb72a1d9ff881c25864eac5d826e55fa82edb06673e5",
    "signature": "0x5797a9156b27380dbc7539f3ffb6b3686998b49b4caffe0f817ead3b7447c62ef0cb3ff97112a7d9efa657ac2dec4d527445df556ded6789e6046c7a62b1f00a",
    "publicKey": "0xfbc8dcaec7b352c3e46b24b877c452b2b7a2555260cc6e0f24104f4836dcc148"  // 可选
  }
  ```
- **成功响应** (200 OK):
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "6087e35f3e5a2b1234567890",
      "walletAddress": "0x123456789abcdef",
      "username": null,
      "email": null,
      "avatar": null
    }
  }
  ```

#### 获取用户信息

- **URL**: `/api/auth/profile`
- **方法**: `GET`
- **描述**: 获取当前登录用户信息
- **请求头**: 
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **成功响应** (200 OK):
  ```json
  {
    "id": "6087e35f3e5a2b1234567890",
    "walletAddress": "0x123456789abcdef",
    "username": null,
    "email": null,
    "avatar": null
  }
  ```

### Agent API

#### 创建 Agent

- **URL**: `/api/agents`
- **方法**: `POST`
- **描述**: 创建新的 AI Agent
- **请求头**: 
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **请求体**:
  ```json
  {
    "name": "市场分析助手",
    "industry": "金融",
    "description": "专注于金融市场分析的AI助手"
  }
  ```
- **成功响应** (201 Created):
  ```json
  {
    "_id": "6087e35f3e5a2b1234567890",
    "name": "市场分析助手",
    "industry": "金融",
    "description": "专注于金融市场分析的AI助手",
    "owner": "6087e35f3e5a2b0987654321",
    "isActive": true,
    "createdAt": "2023-04-27T10:00:00.000Z",
    "updatedAt": "2023-04-27T10:00:00.000Z"
  }
  ```

#### 获取所有 Agent

- **URL**: `/api/agents`
- **方法**: `GET`
- **描述**: 获取当前用户的所有 Agent
- **请求头**: 
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **成功响应** (200 OK):
  ```json
  [
    {
      "_id": "6087e35f3e5a2b1234567890",
      "name": "市场分析助手",
      "industry": "金融",
      "description": "专注于金融市场分析的AI助手",
      "owner": "6087e35f3e5a2b0987654321",
      "isActive": true,
      "createdAt": "2023-04-27T10:00:00.000Z",
      "updatedAt": "2023-04-27T10:00:00.000Z"
    }
  ]
  ```

#### 获取单个 Agent

- **URL**: `/api/agents/:id`
- **方法**: `GET`
- **描述**: 获取特定 Agent
- **请求头**: 
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **成功响应** (200 OK):
  ```json
  {
    "_id": "6087e35f3e5a2b1234567890",
    "name": "市场分析助手",
    "industry": "金融",
    "description": "专注于金融市场分析的AI助手",
    "owner": "6087e35f3e5a2b0987654321",
    "isActive": true,
    "createdAt": "2023-04-27T10:00:00.000Z",
    "updatedAt": "2023-04-27T10:00:00.000Z"
  }
  ```

#### 更新 Agent

- **URL**: `/api/agents/:id`
- **方法**: `PUT`
- **描述**: 更新特定 Agent
- **请求头**: 
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **请求体**:
  ```json
  {
    "name": "高级市场分析助手",
    "industry": "金融证券",
    "description": "专注于金融市场深度分析的AI助手"
  }
  ```
- **成功响应** (200 OK):
  ```json
  {
    "_id": "6087e35f3e5a2b1234567890",
    "name": "高级市场分析助手",
    "industry": "金融证券",
    "description": "专注于金融市场深度分析的AI助手",
    "owner": "6087e35f3e5a2b0987654321",
    "isActive": true,
    "createdAt": "2023-04-27T10:00:00.000Z",
    "updatedAt": "2023-04-27T11:00:00.000Z"
  }
  ```

#### 删除 Agent

- **URL**: `/api/agents/:id`
- **方法**: `DELETE`
- **描述**: 删除特定 Agent
- **请求头**: 
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **成功响应** (204 No Content)

### 文档 API

#### 上传文档

- **URL**: `/api/agents/:agentId/documents`
- **方法**: `POST`
- **描述**: 为特定 Agent 上传文档
- **请求头**: 
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: multipart/form-data
  ```
- **请求体**:
  ```
  file: [二进制文件数据]
  name: "市场报告"
  description: "2023年第二季度市场分析报告"
  ```
- **支持的文件类型**: pdf, jpg, png, gif, mov, mp4
- **最大文件大小**: 50MB
- **成功响应** (201 Created):
  ```json
  {
    "_id": "6087e35f3e5a2b1234567891",
    "name": "市场报告",
    "description": "2023年第二季度市场分析报告",
    "fileName": "2023_Q2_Market_Report.pdf",
    "filePath": "uploads/12345-67890-abcdef.pdf",
    "fileSize": 1024000,
    "fileType": "pdf",
    "agent": "6087e35f3e5a2b1234567890",
    "createdAt": "2023-04-27T12:00:00.000Z",
    "updatedAt": "2023-04-27T12:00:00.000Z"
  }
  ```

#### 获取所有文档

- **URL**: `/api/agents/:agentId/documents`
- **方法**: `GET`
- **描述**: 获取特定 Agent 的所有文档
- **请求头**: 
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **成功响应** (200 OK):
  ```json
  [
    {
      "_id": "6087e35f3e5a2b1234567891",
      "name": "市场报告",
      "description": "2023年第二季度市场分析报告",
      "fileName": "2023_Q2_Market_Report.pdf",
      "filePath": "uploads/12345-67890-abcdef.pdf",
      "fileSize": 1024000,
      "fileType": "pdf",
      "agent": "6087e35f3e5a2b1234567890",
      "createdAt": "2023-04-27T12:00:00.000Z",
      "updatedAt": "2023-04-27T12:00:00.000Z"
    }
  ]
  ```

#### 获取单个文档

- **URL**: `/api/agents/:agentId/documents/:id`
- **方法**: `GET`
- **描述**: 获取特定文档信息
- **请求头**: 
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **成功响应** (200 OK):
  ```json
  {
    "_id": "6087e35f3e5a2b1234567891",
    "name": "市场报告",
    "description": "2023年第二季度市场分析报告",
    "fileName": "2023_Q2_Market_Report.pdf",
    "filePath": "uploads/12345-67890-abcdef.pdf",
    "fileSize": 1024000,
    "fileType": "pdf",
    "agent": "6087e35f3e5a2b1234567890",
    "createdAt": "2023-04-27T12:00:00.000Z",
    "updatedAt": "2023-04-27T12:00:00.000Z"
  }
  ```

#### 下载文档

- **URL**: `/api/agents/:agentId/documents/:id/download`
- **方法**: `GET`
- **描述**: 下载特定文档
- **请求头**: 
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **成功响应**: 文件内容流（附带相应的Content-Type和Content-Disposition头）
- **失败响应** (404 Not Found):
  ```json
  {
    "message": "文件不存在或已被删除"
  }
  ```

#### 更新文档信息

- **URL**: `/api/agents/:agentId/documents/:id`
- **方法**: `PUT`
- **描述**: 更新文档信息（不包括文件本身）
- **请求头**: 
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **请求体**:
  ```json
  {
    "name": "2023年Q2市场报告",
    "description": "2023年第二季度金融市场深度分析报告"
  }
  ```
- **成功响应** (200 OK):
  ```json
  {
    "_id": "6087e35f3e5a2b1234567891",
    "name": "2023年Q2市场报告",
    "description": "2023年第二季度金融市场深度分析报告",
    "fileName": "2023_Q2_Market_Report.pdf",
    "filePath": "uploads/12345-67890-abcdef.pdf",
    "fileSize": 1024000,
    "fileType": "pdf",
    "agent": "6087e35f3e5a2b1234567890",
    "createdAt": "2023-04-27T12:00:00.000Z",
    "updatedAt": "2023-04-27T13:00:00.000Z"
  }
  ```

#### 删除文档

- **URL**: `/api/agents/:agentId/documents/:id`
- **方法**: `DELETE`
- **描述**: 删除特定文档（包括文件存储）
- **请求头**: 
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **成功响应** (204 No Content)

### 内部API（用于服务间通信）

#### 获取Agent列表及文件URL

- **URL**: `/api/internal/agents`
- **方法**: `GET`
- **描述**: 获取所有活跃的Agent及其文件的下载URL（用于内部AI服务获取数据）
- **请求头**: 
  ```
  x-api-key: clippy-internal-api-key-secure
  ```
- **成功响应** (200 OK):
  ```json
  [
    {
      "id": "6087e35f3e5a2b1234567890",
      "name": "市场分析助手",
      "industry": "金融",
      "description": "专注于金融市场分析的AI助手",
      "score": 85,
      "feedback": "这是一个不错的Agent，但还有提升空间",
      "documents": [
        {
          "id": "6087e35f3e5a2b1234567891",
          "name": "市场报告",
          "fileType": "pdf",
          "downloadUrl": "http://localhost:5471/api/files/6087e35f3e5a2b1234567891/download"
        }
      ]
    }
  ]
  ```

#### 更新Agent评分

- **URL**: `/api/internal/agents/:id/rating`
- **方法**: `POST`
- **描述**: 更新特定Agent的评分和反馈（用于内部AI服务评估Agent质量）
- **请求头**: 
  ```
  x-api-key: clippy-internal-api-key-secure
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "score": 85,
    "feedback": "这是一个不错的Agent，但还有提升空间"
  }
  ```
- **成功响应** (200 OK):
  ```json
  {
    "_id": "6087e35f3e5a2b1234567890",
    "name": "市场分析助手",
    "industry": "金融",
    "description": "专注于金融市场分析的AI助手",
    "owner": "6087e35f3e5a2b0987654321",
    "isActive": true,
    "score": 85,
    "feedback": "这是一个不错的Agent，但还有提升空间",
    "ratedAt": "2023-04-27T14:00:00.000Z",
    "createdAt": "2023-04-27T10:00:00.000Z",
    "updatedAt": "2023-04-27T14:00:00.000Z"
  }
  ```

#### 文件下载

- **URL**: `/api/files/:id/download`
- **方法**: `GET`
- **描述**: 下载特定文件（用于内部AI服务访问用户上传的文件）
- **无需认证**：此接口依赖于URL中的文件ID进行安全控制
- **成功响应**: 文件内容流（附带相应的Content-Type和Content-Disposition头）
- **失败响应** (404 Not Found):
  ```json
  {
    "message": "文件不存在或已被删除"
  }
  ```

### 内部API安全机制

内部API使用以下安全机制保护：

1. **API密钥认证**：所有内部API调用需要在请求头中包含`x-api-key`字段
2. **IP地址限制**：只允许特定IP地址或IP范围访问内部API
3. **环境变量配置**：
   - `INTERNAL_API_KEY`: 设置内部API密钥
   - `INTERNAL_ALLOWED_IPS`: 设置允许访问的IP地址列表，以逗号分隔
   - `FILE_BASE_URL`: 设置文件下载URL的基础路径

配置示例：
```
INTERNAL_API_KEY=your-secure-api-key
INTERNAL_ALLOWED_IPS=127.0.0.1,192.168.0.0/16,10.0.0.0/8
FILE_BASE_URL=http://your-api-server/api/files
```

## 错误处理

### 常见错误状态码

- **400 Bad Request**: 请求参数错误
- **401 Unauthorized**: 未授权（缺少或无效的JWT令牌）
- **403 Forbidden**: 无权访问（试图访问不属于自己的资源）
- **404 Not Found**: 资源不存在
- **413 Payload Too Large**: 上传的文件太大
- **415 Unsupported Media Type**: 不支持的文件类型
- **500 Internal Server Error**: 服务器内部错误

### 错误响应格式

```json
{
  "statusCode": 400,
  "message": "错误信息",
  "error": "Bad Request"
}
```

## 身份验证

所有API端点（除了`/api/auth/login`）都需要JWT身份验证。在请求头中添加：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 文件上传说明

- 最大文件大小：50MB
- 支持的文件类型：pdf, jpg, png, gif, mov, mp4
- 文件通过`multipart/form-data`格式上传
- 文件存储在服务器的`uploads`目录中
