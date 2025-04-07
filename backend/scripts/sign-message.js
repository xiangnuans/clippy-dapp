/**
 * 签名测试脚本
 * 用于使用指定助记词生成钱包并对签名消息进行签名
 * 
 * 使用方法：
 * node sign-message.js
 */

const { AptosAccount, AptosClient, HexString, TxnBuilderTypes, BCS } = require('aptos');
const { mnemonicToSeedSync } = require('@scure/bip39');
const { HDKey } = require('@scure/bip32');
const { derivePath } = require('ed25519-hd-key');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { createHash } = require('crypto');
const nacl = require('tweetnacl');
const SHA3 = require('js-sha3');

// 加载.env文件
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 直接在文件中定义助记词 (请替换为你自己的助记词)
// 单词间可以用空格或逗号分隔
const MNEMONIC = "faculty trust topple change october alter swamp hazard unfair balance move glory";

// 从常量文件中读取签名消息
let SIGNATURE_MESSAGE = 'CLIPPY: INFUSE SOUL INTO HUMANOID ROBOTS';
try {
  const constantsPath = path.resolve(__dirname, '../src/config/constants.ts');
  const constantsContent = fs.readFileSync(constantsPath, 'utf8');
  
  // 使用正则表达式从constants.ts文件中提取SIGNATURE_MESSAGE
  const match = constantsContent.match(/SIGNATURE_MESSAGE:\s*['"](.+)['"]/);
  if (match && match[1]) {
    SIGNATURE_MESSAGE = match[1];
    console.log(`从constants.ts中读取到SIGNATURE_MESSAGE: ${SIGNATURE_MESSAGE}`);
  }
} catch (error) {
  console.warn('无法从constants.ts读取SIGNATURE_MESSAGE，使用默认值:', error.message);
}

// 使用字节转十六进制的辅助函数(从Aptos SDK复制)
function bytesToHex(bytes) {
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

// 目标地址
const TARGET_ADDRESS = '0xefa19f1a7eed5f5bc494eb72a1d9ff881c25864eac5d826e55fa82edb06673e5';

// 只保留确认有效的Aptos派生路径
const DERIVATION_PATH = `m/44'/637'/0'/0'/0'`;

/**
 * 验证派生路径是否有效
 * 直接从AptosAccount类中复制
 */
function isValidPath(path) {
  if (!/^m\/44'\/637'\/[0-9]+'\/[0-9]+'\/[0-9]+'+$/.test(path)) {
    return false;
  }
  return true;
}

/**
 * 使用官方SDK方式从助记词生成Aptos账户
 * 参考Aptos官方SDK中的实现
 * @param {string} mnemonics - 助记词短语
 * @param {string} path - 派生路径
 * @returns {AptosAccount} Aptos账户对象
 */
function getAptosAccountFromDerivePath(mnemonics, path) {
  try {
    // 验证路径
    if (!isValidPath(path)) {
      console.warn(`路径 ${path} 不符合标准格式，尝试使用但可能不正确`);
    }
    
    // 规范化助记词 - 与官方实现保持一致
    const normalizeMnemonics = mnemonics
      .trim()
      .split(/\s+/)
      .map((part) => part.toLowerCase())
      .join(" ");
    
    // 生成种子
    const seed = mnemonicToSeedSync(normalizeMnemonics);
    const seedHex = bytesToHex(seed);
    
    // 使用ed25519-hd-key库派生密钥(与官方SDK相同)
    const { key } = derivePath(path, seedHex);
    
    // 使用派生的密钥创建Aptos账户
    return new AptosAccount(new Uint8Array(key));
  } catch (error) {
    console.error(`使用路径 ${path} 派生账户时出错:`, error.message);
    return null;
  }
}

/**
 * 计算账户的认证密钥（authKey）
 * 直接从AptosAccount类中的authKey方法复制实现
 * @param {Uint8Array} publicKey - 账户的公钥
 * @returns {string} 十六进制格式的认证密钥
 */
function calculateAuthKey(publicKey) {
  const hash = SHA3.sha3_256.create();
  hash.update(publicKey);
  hash.update("\x00");
  return hash.hex();
}

/**
 * 使用账户对消息进行签名 (原始消息签名)
 * @param {AptosAccount} account - Aptos账户
 * @param {string} message - 要签名的消息
 * @returns {string} 签名结果的十六进制字符串
 */
function signMessage(account, message) {
  try {
    // 将消息转换为字节数组
    const messageBytes = new TextEncoder().encode(message);
    
    // 使用账户对消息进行签名 - 确保返回的是Uint8Array
    const signature = account.signBuffer(messageBytes);
    
    // 确保签名是Uint8Array格式，然后转换为HexString
    if (signature instanceof Uint8Array) {
      return HexString.fromUint8Array(signature).toString();
    } else if (signature instanceof HexString) {
      return signature.toString();
    } else {
      // 如果是其他格式，尝试直接转换
      console.warn("签名结果不是预期的Uint8Array格式，尝试直接转换");
      return signature.toString();
    }
  } catch (error) {
    console.error("签名过程中出错:", error);
    throw error;
  }
}

/**
 * 使用账户对消息进行签名 (前缀哈希方法)
 * 一些钱包实现可能使用这种方式
 * @param {AptosAccount} account - Aptos账户
 * @param {string} message - 要签名的消息
 * @returns {string} 签名结果的十六进制字符串
 */
function signMessageWithPrefixHash(account, message) {
  try {
    // 添加前缀
    const prefixedMessage = `APTOS\nmessage: ${message}`;
    
    // 计算SHA3-256哈希
    const messageBytes = new TextEncoder().encode(prefixedMessage);
    const hash = createHash('sha3-256').update(messageBytes).digest();
    
    // 使用账户对哈希进行签名
    const signature = account.signBuffer(hash);
    
    // 确保签名是Uint8Array格式
    if (signature instanceof Uint8Array) {
      return HexString.fromUint8Array(signature).toString();
    } else if (signature instanceof HexString) {
      return signature.toString();
    } else {
      console.warn("签名结果不是预期的Uint8Array格式，尝试直接转换");
      return signature.toString();
    }
  } catch (error) {
    console.error("带前缀哈希签名过程中出错:", error);
    throw error;
  }
}

/**
 * 使用BCS序列化对消息进行签名
 * 某些Aptos钱包使用这种方式
 * @param {AptosAccount} account - Aptos账户
 * @param {string} message - 要签名的消息
 * @returns {string} 签名结果的十六进制字符串
 */
function signMessageWithBCS(account, message) {
  try {
    // 创建一个BCS序列化器
    const serializer = new BCS.Serializer();
    
    // 序列化字符串长度和内容
    serializer.serializeStr(message);
    
    // 获取序列化后的字节
    const bytes = serializer.getBytes();
    
    // 使用账户对序列化后的字节进行签名
    const signature = account.signBuffer(bytes);
    
    // 确保签名是Uint8Array格式
    if (signature instanceof Uint8Array) {
      return HexString.fromUint8Array(signature).toString();
    } else if (signature instanceof HexString) {
      return signature.toString();
    } else {
      console.warn("签名结果不是预期的Uint8Array格式，尝试直接转换");
      return signature.toString();
    }
  } catch (error) {
    console.error('BCS签名出错:', error);
    return null;
  }
}

/**
 * Blocto风格的签名函数
 * 模拟Blocto SDK的签名流程，支持多重签名
 * @param {AptosAccount} account - Aptos账户
 * @param {string} message - 要签名的消息
 * @param {string} nonce - 可选的随机数
 * @returns {object} 包含签名相关信息的对象
 */
function signMessageBloctoStyle(account, message, nonce = '') {
  try {
    // 构建完整消息（可能包含nonce和前缀）
    const fullMessage = nonce 
      ? `${message}\nnonce: ${nonce}` 
      : message;
    
    // 将消息转换为字节数组
    const messageBytes = new TextEncoder().encode(fullMessage);
    
    // 使用账户对消息进行签名
    const signature = account.signBuffer(messageBytes);
    
    // 确保签名是Uint8Array格式
    let signatureHex;
    if (signature instanceof Uint8Array) {
      signatureHex = HexString.fromUint8Array(signature).toString();
    } else if (signature instanceof HexString) {
      signatureHex = signature.toString();
    } else {
      console.warn("签名结果不是预期的Uint8Array格式，尝试直接转换");
      signatureHex = signature.toString();
    }
    
    // 创建bitmap（对于单一密钥账户，这是固定的）
    const bitmap = new Uint8Array([1]); // 表示只使用第一个密钥
    
    // 返回Blocto风格的响应
    return {
      fullMessage,
      signature: [signatureHex], // 数组形式，支持多签名
      bitmap: Array.from(bitmap),
    };
  } catch (error) {
    console.error("Blocto风格签名过程中出错:", error);
    throw error;
  }
}

/**
 * 验证Aptos签名
 * @param {string} message - 原始消息或完整消息
 * @param {string} signature - 十六进制格式的签名
 * @param {string} publicKey - 十六进制格式的公钥
 * @returns {boolean} 签名是否有效
 */
function verifySignature(message, signature, publicKey) {
  try {
    // 将消息转换为字节数组
    const messageBytes = new TextEncoder().encode(message);
    
    // 将签名和公钥转换为Uint8Array
    const signatureBytes = HexString.ensure(signature).toUint8Array();
    const publicKeyBytes = HexString.ensure(publicKey).toUint8Array();
    
    // 使用nacl验证签名
    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
  } catch (error) {
    console.error('验证签名时出错:', error);
    return false;
  }
}

/**
 * 检查AptosAccount实例的signBuffer方法实现
 * @param {AptosAccount} account - Aptos账户
 */
function examineSignBufferMethod(account) {
  const methodStr = account.signBuffer.toString();
  console.log("\n🔍 AptosAccount.signBuffer方法：");
  console.log(methodStr);
  
  // 测试一个简单消息
  const testMessage = new TextEncoder().encode("TEST");
  try {
    const result = account.signBuffer(testMessage);
    console.log("\n测试结果类型:", Object.prototype.toString.call(result));
    console.log("是Uint8Array?", result instanceof Uint8Array);
    console.log("是HexString?", result instanceof HexString);
    if (result) {
      console.log("结果值:", result);
    }
  } catch (error) {
    console.error("测试过程中出错:", error);
  }
}

/**
 * 主函数 - 生成钱包并签名
 */
async function main() {
  try {
    console.log('==================================');
    console.log('Clippy 签名测试工具 (使用官方Aptos SDK方法)');
    console.log('==================================\n');
    
    console.log(`📝 使用助记词: "${MNEMONIC}"`);
    console.log(`📝 使用派生路径: ${DERIVATION_PATH}`);
    console.log(`🎯 目标钱包地址: ${TARGET_ADDRESS}`);
    
    // 使用官方方式派生账户
    console.log('\n🔑 生成账户中...');
    const account = getAptosAccountFromDerivePath(MNEMONIC, DERIVATION_PATH);
    
    if (!account) {
      throw new Error('无法从派生路径生成有效账户');
    }
    
    const address = account.address().hex();
    const authKey = calculateAuthKey(account.signingKey.publicKey);
    const isMatched = address.toLowerCase() === TARGET_ADDRESS.toLowerCase();
    
    console.log(`📝 钱包地址: ${address} ${isMatched ? '✅ 匹配!' : '❌ 不匹配'}`);
    console.log(`📝 公钥: ${HexString.fromUint8Array(account.pubKey().toUint8Array()).toString()}`);
    console.log(`📝 认证密钥: 0x${authKey}`);
    
    if (!isMatched) {
      throw new Error('生成的钱包地址与目标地址不匹配，请检查助记词和派生路径');
    }
    
    // 检查signBuffer方法
    examineSignBufferMethod(account);
    
    console.log('\n📋 尝试多种签名方法...');
    
    // 方法1: 直接签名
    console.log('\n📋 方法1: 直接签名');
    console.log(`📝 消息: "${SIGNATURE_MESSAGE}"`);
    const signature1 = signMessage(account, SIGNATURE_MESSAGE);
    console.log(`✅ 签名结果: ${signature1}`);
    
    // 验证签名1
    const isValid1 = verifySignature(
      SIGNATURE_MESSAGE, 
      signature1, 
      HexString.fromUint8Array(account.pubKey().toUint8Array()).toString()
    );
    console.log(`🔍 验证结果: ${isValid1 ? '有效 ✓' : '无效 ✗'}`);
    
    // 方法2: 带前缀哈希的签名
    console.log('\n📋 方法2: 带前缀哈希的签名');
    console.log(`📝 消息: "${SIGNATURE_MESSAGE}"`);
    const signature2 = signMessageWithPrefixHash(account, SIGNATURE_MESSAGE);
    console.log(`✅ 签名结果: ${signature2}`);
    
    // 方法3: BCS序列化签名
    console.log('\n📋 方法3: BCS序列化签名');
    console.log(`📝 消息: "${SIGNATURE_MESSAGE}"`);
    const signature3 = signMessageWithBCS(account, SIGNATURE_MESSAGE);
    console.log(`✅ 签名结果: ${signature3 || '签名失败'}`);
    
    // 方法4: Blocto风格签名
    console.log('\n📋 方法4: Blocto风格签名');
    console.log(`📝 消息: "${SIGNATURE_MESSAGE}"`);
    const nonce = "eab0a194-a56f-4a93-ba84-a7f4533ad914"; // 示例nonce
    console.log(`📝 Nonce: "${nonce}"`);
    const bloctoStyleResponse = signMessageBloctoStyle(account, SIGNATURE_MESSAGE, nonce);
    console.log(`✅ 签名结果: ${JSON.stringify(bloctoStyleResponse, null, 2)}`);
    
    // 验证Blocto风格签名
    const isValidBlocto = verifySignature(
      bloctoStyleResponse.fullMessage,
      bloctoStyleResponse.signature[0],
      HexString.fromUint8Array(account.pubKey().toUint8Array()).toString()
    );
    console.log(`🔍 验证结果: ${isValidBlocto ? '有效 ✓' : '无效 ✗'}`);
    
    // 打印登录信息
    console.log('\n==================================');
    console.log('登录请求示例 (方法1 - 直接签名):');
    console.log('==================================');
    console.log(JSON.stringify({
      walletAddress: account.address().hex(),
      signature: signature1,
      publicKey: HexString.fromUint8Array(account.pubKey().toUint8Array()).toString()
    }, null, 2));
    
    console.log('\n==================================');
    console.log('登录请求示例 (方法2 - 带前缀哈希的签名):');
    console.log('==================================');
    console.log(JSON.stringify({
      walletAddress: account.address().hex(),
      signature: signature2,
      publicKey: HexString.fromUint8Array(account.pubKey().toUint8Array()).toString()
    }, null, 2));
    
    if (signature3) {
      console.log('\n==================================');
      console.log('登录请求示例 (方法3 - BCS序列化签名):');
      console.log('==================================');
      console.log(JSON.stringify({
        walletAddress: account.address().hex(),
        signature: signature3,
        publicKey: HexString.fromUint8Array(account.pubKey().toUint8Array()).toString()
      }, null, 2));
    }
    
    console.log('\n==================================');
    console.log('登录请求示例 (方法4 - Blocto风格):');
    console.log('==================================');
    console.log(JSON.stringify({
      walletAddress: account.address().hex(),
      publicKey: [HexString.fromUint8Array(account.pubKey().toUint8Array()).toString()],
      minKeysRequired: 1,
      ...bloctoStyleResponse
    }, null, 2));
    
    console.log('\n✨ 可以尝试使用上述信息通过 /api/auth/login API 登录系统');
    console.log('✨ 如果一种方法不起作用，请尝试其他签名方法');
    
  } catch (error) {
    console.error('执行过程中发生错误:', error);
  }
}

main(); 