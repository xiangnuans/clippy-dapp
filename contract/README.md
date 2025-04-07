# EverMove NFT 合约

这是一个基于 Aptos 区块链的 NFT 合约项目，使用 Move 语言开发。

## 项目结构

```
contract/
├── Move.toml          # 项目配置文件
├── sources/           # Move 源代码目录
│   └── evermove_nft.move  # 主合约文件
├── tests/            # 测试文件目录
│   └── nft_tests.move    # 测试用例
└── scripts/          # 部署脚本目录
    ├── init_wallet.bat    # 钱包初始化脚本
    ├── deploy.bat         # 部署脚本
    ├── init_collection.bat # 集合初始化脚本
    ├── mint_nft.bat       # NFT铸造脚本
    └── view_collection.bat # 集合查看脚本
```

## 环境要求

- [Aptos CLI](https://aptos.dev/cli)
- [Rust](https://www.rust-lang.org/tools/install)
- [Git](https://git-scm.com/downloads)

## 安装依赖

1. 安装 Aptos CLI：
```powershell
winget install Aptos.AptosCLI
```

2. 安装 Rust：
```powershell
winget install Rustlang.Rust
```

3. 安装 Git：
```powershell
winget install Git.Git
```

## 使用指南

### 1. 初始化钱包

```powershell
.\scripts\init_wallet.bat
```

### 2. 部署合约

部署到测试网：
```powershell
.\scripts\deploy.bat testnet
```

部署到主网：
```powershell
.\scripts\deploy.bat mainnet
```

### 3. 初始化NFT集合

```powershell
.\scripts\init_collection.bat testnet
```

### 4. 铸造NFT

```powershell
.\scripts\mint_nft.bat testnet "NFT名称" "NFT描述" "NFT URI"
```

### 5. 查看集合信息

```powershell
.\scripts\view_collection.bat testnet <collection_address>
```

## 合约功能

- 创建NFT集合
- 铸造NFT
- 设置铸造权限
- 查询集合信息
- 查询NFT元数据

## 测试

运行所有测试：
```powershell
aptos move test
```

## 开发指南

1. 修改合约代码：
   - 编辑 `sources/evermove_nft.move`
   - 添加新的测试用例到 `tests/nft_tests.move`

2. 编译合约：
```powershell
aptos move compile
```

3. 运行测试：
```powershell
aptos move test
```

## 注意事项

- 部署到主网前，请确保在测试网充分测试
- 铸造NFT时注意设置合理的元数据
- 确保账户有足够的代币支付交易费用

## 许可证

MIT License 