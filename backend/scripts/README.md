# Clippy 后端测试脚本

本目录包含用于测试和开发的实用脚本。

## 脚本列表

### 1. sign-message.js

这个脚本用于测试 Aptos 钱包签名功能，通过文件中预先定义的助记词来生成钱包地址、签名等信息，用于后端登录测试。

#### 依赖安装

在使用前需要安装以下依赖：

```bash
# 在backend目录下运行
npm install aptos @scure/bip39 @scure/bip32 ed25519-hd-key
```

#### 使用方法

编辑脚本文件中的 `MNEMONIC` 变量，设置为你想使用的助记词，然后执行：

```bash
node scripts/sign-message.js
```

> 注意：助记词单词可以用空格或逗号分隔。

#### 脚本功能

1. 使用预设的助记词生成 Aptos 钱包
2. 使用钱包对系统中定义的签名消息 (`SIGNATURE_MESSAGE`) 进行签名
3. 输出生成的钱包地址、公钥和签名
4. 提供一个可直接用于登录系统的 JSON 示例

#### 输出示例

```
==================================
Clippy 签名测试工具
==================================

📝 使用助记词: "apple banana cherry dog elephant frog grape horse ice jaguar kiwi lemon"
🔑 正在从助记词生成账户...
✅ 账户生成成功!
📝 钱包地址: 0x9a10f0e7d3efae5dad6a73cb7e53a8a6c3aaeebf72db5fc6b48b19d5b973a15b
📝 公钥: 0x25c0653a94a41e9be8f0ad9650e18956fd819e3a9bd8c3d3b50060ad59e60432

📋 准备签名消息: "CLIPPY: INFUSE SOUL INTO HUMANOID ROBOTS"
✅ 签名成功!
📝 签名结果: 0x93f6b1135293e725e04980b19513a777204c20da85d43f15ef940c5c234f9e877b1fe11ce7d23bb250ce21a86b57e8c9c7489f624fc8b82bdefa153b12d7c00c

==================================
登录请求示例:
==================================
{
  "walletAddress": "0x9a10f0e7d3efae5dad6a73cb7e53a8a6c3aaeebf72db5fc6b48b19d5b973a15b",
  "signature": "0x93f6b1135293e725e04980b19513a777204c20da85d43f15ef940c5c234f9e877b1fe11ce7d23bb250ce21a86b57e8c9c7489f624fc8b82bdefa153b12d7c00c",
  "publicKey": "0x25c0653a94a41e9be8f0ad9650e18956fd819e3a9bd8c3d3b50060ad59e60432"
}

✨ 可以使用上述信息通过 /api/auth/login API 登录系统
```

### 2. generate-test-data.js

这个脚本用于在开发环境中快速生成测试数据，包括用户、Agent 和文档。

#### 依赖安装

在使用前需要安装以下依赖：

```bash
# 在backend目录下运行
npm install mongodb
```

#### 使用方法

```bash
node scripts/generate-test-data.js
```

#### 脚本功能

1. 连接到 MongoDB 数据库
2. 创建测试用户数据
3. 为测试用户创建多个 Agent
4. 为每个 Agent 创建多个测试文档（包括生成测试文件）
5. 输出生成的测试数据摘要

#### 注意事项

- 此脚本会向数据库添加实际的测试数据，请谨慎在生产环境使用
- 脚本会检查是否已存在测试用户，如果存在会提示确认是否继续
- 生成的文件会存储在 `uploads` 目录中

## 注意事项

- 这些脚本仅用于开发和测试目的，请勿在生产环境中使用
- 永远不要分享你的助记词或私钥
- 测试完成后建议使用新的钱包地址进行生产环境操作 