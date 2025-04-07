### 技术文档：0G DA 层与跨链NFT实现

#### 项目概述

本项目利用0G的数据可用性（DA）层，打造跨链NFT交易系统，以确保在多链环境中，NFT可以高效、安全、低成本地流转。通过跨链桥接与0G的DA层，我们可以解决数据存储、验证和传输效率问题，从而提升NFT在不同链之间的互操作性。

#### 1. **0G DA 层介绍**

0G的DA层是一种可扩展、高效的数据可用性解决方案，支持大规模去中心化数据存储和快速验证。它允许跨链应用和智能合约通过一个高效、分布式的存储系统快速查询、验证和存取数据。

- **无限可扩展**：0G DA层通过水平扩展共识网络，使系统能够处理更多交易和数据，提升网络吞吐量。
- **模块化架构**：0G将存储、数据可用性和共识分离，每个模块可以根据需要进行优化，提升数据处理效率。
- **去中心化AI操作系统**：0G支持去中心化AI应用，提供高吞吐量基础设施，满足大数据量处理需求，尤其是AI工作负载。

#### 2. **0G DA 与跨链NFT交易流程**

##### 2.1 **NFT 锁定与签名生成**
1. **用户操作**：用户在EVM链（如以太坊）选择其NFT进行锁定操作。前端向后端提交NFT ID、用户地址等信息。
2. **后端签名生成**：后端系统使用用户地址与NFT相关信息生成签名字符串，确保锁定操作的合法性和不可篡改性。签名会存储在后端的中心化数据库中。
3. **签名返回前端**：生成的签名字符串通过API返回给前端。

##### 2.2 **NFT 数据转移与验证**
1. **前端提交请求**：用户确认交易后，前端提交锁定的NFT ID、用户地址、签名信息至BNB链合约。
2. **合约验证签名**：BNB链合约验证提交的签名是否有效，验证通过后开始重铸NFT。
3. **合约重铸NFT**：合约根据签名信息，重新铸造NFT，并将其发送到目标用户地址。

##### 2.3 **0G DA 层的角色**
- **数据存储**：NFT的交易记录、签名和锁定状态将存储在0G的分布式存储系统中，确保数据的可用性和验证。
- **数据可用性验证**：在跨链操作过程中，0G DA层确保数据在不同链之间的可用性。通过其独特的共识机制和高吞吐量设计，能够实时验证跨链操作中的数据有效性。

#### 3. **技术架构**

##### 3.1 **前端**
- **功能**：用户在前端界面上选择NFT进行锁定操作，获取签名，提交签名验证请求。
- **技术栈**：React、Vue.js，Web3.js、Ethers.js用于与区块链交互。

##### 3.2 **后端**
- **功能**：生成签名、记录数据、验证签名并与0G DA层交互。
- **技术栈**：Node.js（Express/Koa）、Web3.js、Ethers.js，MySQL/PostgreSQL。

##### 3.3 **0G DA 层**
- **数据存储**：0G的模块化存储系统会将NFT锁定信息、签名等数据分布式存储在多个存储节点中。
- **共识机制**：0G通过验证随机选出的数据可用性节点（DA节点）来确保数据的有效性，防止数据丢失或篡改。

##### 3.4 **跨链桥接**
- **EVM链与BNB链互通**：利用0G DA层存储和验证NFT数据，通过跨链桥将EVM链上的NFT转移到BNB链。确保NFT在链间的完整性和一致性。

#### 4. **核心技术实现**

##### 4.1 **签名生成与验证**
签名用于确保NFT锁定操作的真实性和不可篡改性。以下是签名生成与验证的示例代码：

- **签名生成**（Node.js + Ethers.js）：

```javascript
const { ethers } = require('ethers');

// 生成签名
async function generateSignature(nftId, userAddress) {
    const privateKey = 'YOUR_PRIVATE_KEY';
    const wallet = new ethers.Wallet(privateKey);
    const message = ethers.utils.solidityKeccak256(
        ['string', 'address'],
        [nftId, userAddress]
    );
    const signature = await wallet.signMessage(ethers.utils.arrayify(message));
    return signature;
}
```

- **签名验证**（Solidity 合约）：

```solidity
function verifySignature(bytes32 dataHash, bytes memory signature, address expectedSigner) public pure returns (bool) {
    address recovered = recoverSigner(dataHash, signature);
    return recovered == expectedSigner;
}

function recoverSigner(bytes32 dataHash, bytes memory signature) public pure returns (address) {
    return dataHash.recover(signature);
}
```

##### 4.2 **0G DA 层数据验证**
0G的DA层通过验证数据的可用性来保证跨链NFT交易的数据完整性：

```solidity
// 0G DA 层验证数据可用性
function verifyDataAvailability(bytes32 dataHash) public view returns (bool) {
    // 使用VRF从DA节点获取数据可用性证明
    bytes32 proof = getProofFromDA(dataHash);
    return validateProof(proof, dataHash);
}
```

#### 5. **部署与集成**

##### 5.1 **部署0G DA层**
- **节点部署**：部署0G DA层存储节点，确保数据的冗余存储和快速访问。
- **跨链集成**：通过合约和API将EVM链和BNB链的NFT互通能力集成到0G DA层。

##### 5.2 **数据同步与验证**
- 0G DA层提供跨链数据同步机制，确保NFT从EVM链到BNB链的转移过程中，所有数据的完整性和一致性。
- 利用0G的共识机制和去中心化验证系统，确保在不同区块链网络间的无缝操作。

#### 6. **应用场景**

- **跨链NFT交易**：通过0G DA层，NFT可以在EVM链、BNB链等多个区块链之间无缝流动，提供安全、高效、低成本的跨链交易解决方案。
- **去中心化数据市场**：0G DA层的高效数据存储和验证能力使其成为去中心化数据市场的理想选择，支持快速查询和实时数据更新。
- **去中心化AI应用**：利用0G DA层的可扩展性和高吞吐量，为AI模型提供去中心化存储和数据验证服务。

#### 7. **总结**
本项目通过0G DA层实现跨链NFT交易，提供了一个高效、安全、低成本的数据可用性解决方案。0G的分布式存储与验证机制、去中心化共识机制和高吞吐量设计，使得NFT的跨链流动成为可能，提升了用户体验，并为去中心化AI与Web3应用的进一步发展提供了强有力的基础设施支持。


---

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
