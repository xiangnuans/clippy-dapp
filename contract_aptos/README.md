
### Key Features of the EVM Chain NFT Contract:

1. **Base Functionality**: 
   - Implements ERC721 standard with URI storage for metadata
   - Includes ownership management and reentrancy protection

2. **Cross-Chain Locking Mechanism**:
   - `lockNFT()`: Locks NFTs for cross-chain transfer with signature validation
   - `unlockNFT()`: Unlocks NFTs when they return from other chains

3. **0G DA Layer Integration**:
   - Includes placeholder functions for storing and verifying data on the 0G DA layer
   - Maintains a reference to the 0G DA layer contract address

4. **Security Features**:
   - Signature validation using ECDSA for cross-chain operations
   - Access control for administrative functions
   - Transfer restrictions for locked tokens

5. **State Management**:
   - Maintains mappings for token lock status and cross-chain identifiers
   - Tracks relationships between native token IDs and cross-chain IDs

The contract provides a solid foundation for the NFT cross-chain system described in your technical documentation. The integration with the 0G DA layer would need to be completed by implementing the actual calls to the 0G DA layer contract, which would be responsible for ensuring data availability across chains.



The BNB Chain NFT Contract implements the receiver side of the cross-chain NFT system. This contract focuses on minting new NFTs when they are transferred from other chains (like Ethereum) and burning them when they are sent back. Here are the key features:

### Key Features of The BNB Chain NFT Contract：

1. **Cross-Chain Minting**:
   - `mintFromCrossChain()` function creates new NFTs on BNB Chain corresponding to locked NFTs on other chains
   - Stores original chain metadata including original owner, contract address, and token ID
   - Validates operations with cryptographic signatures

2. **Cross-Chain Burning**:
   - `burnForCrossChain()` function burns NFTs when they are being transferred back to their original chain
   - Updates the 0G DA layer with burn information to facilitate unlocking on the original chain

3. **Metadata Management**:
   - Stores detailed NFT metadata including name, description, and image URI
   - Preserves the relationship between the BNB Chain token and the original chain token

4. **0G DA Layer Integration**:
   - Includes functions for storing and verifying data on the 0G DA layer
   - Validates cross-chain operations using data from the 0G DA layer

5. **Security Features**:
   - Signature validation using ECDSA for all cross-chain operations
   - Reentrancy protection for state-changing functions
   - Access control for administrative functions

The contract works as part of the complete system where:
1. NFTs are locked on the original chain (e.g., Ethereum)
2. Data about the lock is stored on the 0G DA layer
3. The BNB Chain contract mints a corresponding NFT after verifying the data
4. When transferring back, the BNB Chain NFT is burned
5. The 0G DA layer is updated with burn information
6. The original NFT can be unlocked on its original chain

This implementation ensures secure, efficient cross-chain NFT transfers utilizing the 0G DA layer for data availability and verification.


This 0G DA Layer Integration Contract serves as the central component of the cross-chain NFT system, providing data availability and verification services. Here are the key features and functionality:

### Key Features Of the 0G DA Layer Integration Contract：

1. **Data Storage and Management:**
   - Stores comprehensive NFT data including original chain information, current status, and metadata
   - Tracks the complete lifecycle of cross-chain NFT transfers with timestamps for lock, mint, burn, and unlock operations
   - Maps cross-chain identifiers to data hashes for efficient lookup

2. **Validator System:**
   - Implements a validator network to verify data availability
   - Requires a minimum number of validators (configurable) to confirm data validity
   - Allows adding and removing validators by the contract owner

3. **Node Operator Management:**
   - Supports weighted consensus with node operators having different weights
   - Provides functions to add and remove node operators
   - Tracks the total node weight for consensus calculations

4. **Cross-Chain Operations Support:**
   - `storeNFTLockData`: Records data when NFTs are locked on the original chain
   - `updateNFTMintData`: Updates information when NFTs are minted on the destination chain
   - `updateNFTBurnData`: Registers when NFTs are burned on the destination chain
   - `updateNFTUnlockData`: Records when NFTs are unlocked on the original chain

5. **Data Availability Verification:**
   - `validateDataAvailability`: Allows validators to submit proofs of data availability
   - `verifyNFTData`: Verifies that NFT data is available and validated
   - Multiple query functions to access NFT and proof data

6. **Security Features:**
   - Ownership control for administrative functions
   - Reentrancy guards to prevent attack vectors
   - Data integrity checks throughout the contract

7. **Emergency Functions:**
   - `emergencyResetTransferState`: Allows the owner to reset the state of a transfer in case of issues

### Integration with Other Components

This contract bridges the EVM Chain NFT Contract and BNB Chain NFT Contract by:

1. Storing and verifying data about locked NFTs on the original chain
2. Providing validation for minting corresponding NFTs on the destination chain
3. Tracking the complete lifecycle of cross-chain transfers
4. Ensuring data availability across different blockchain networks

The 0G DA Layer contract leverages the concept of data availability proofs, where multiple validators confirm the data's existence in the network, providing security and reliability for cross-chain operations without requiring direct communication between different blockchains.

This implementation creates a decentralized infrastructure that enables efficient, secure, and low-cost NFT transfers across multiple blockchain networks.


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
