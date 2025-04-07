/**
 * 测试钱包签名格式
 * 
 * 这个脚本测试了钱包使用不同方式签名的情况，并进行验证
 * 特别适用于调试签名验证失败的问题
 */

const { AptosAccount, HexString } = require('aptos');
const nacl = require('tweetnacl');
const crypto = require('crypto');

// 测试数据
const testData = {
  walletAddress: "0xafd28007464059c67fc7988516605eaca31beae6ddf73051cd646eaef1288350",
  signature: "0x9a4c5b1a55ccc1af8caa321bf846fab986feb432634e69f8567d755a3507ee8d2f7bc3033970539913b36ba7b9ce2fc50c25d78ec41f5ec0599b48b351739605",
  publicKey: "0xe49506c917c2bb2dcaa030c1234e7ba8015fce4eaa24d81128a7aaae9bf6693d",
  message: "CLIPPY: INFUSE SOUL INTO HUMANOID ROBOTS"
};

// Petra钱包签名数据结构
const petrayPayload = {
  address: testData.walletAddress,
  application: "https://example.com",
  chainId: 1,
  fullMessage: `APTOS\nmessage: ${testData.message}\nnonce: ${crypto.randomUUID()}`,
  message: testData.message,
  nonce: crypto.randomUUID(),
  prefix: "APTOS",
  signature: testData.signature,
  publicKey: testData.publicKey
};

// Martian钱包签名数据结构
const martianPayload = {
  address: testData.walletAddress,
  message: testData.message,
  signature: testData.signature,
  publicKey: testData.publicKey,
  // 有时martian不添加前缀
};

// Blocto钱包签名数据结构
const bloctoPayload = {
  address: testData.walletAddress,
  message: testData.message,
  // Blocto有时使用数组包装公钥和签名
  publicKey: [testData.publicKey],
  signature: [testData.signature],
  // 有时Blocto添加bitmap字段
  bitmap: [1]
};

/**
 * 辅助函数：将消息编码为字节数组
 */
function encodeMessage(message) {
  return new TextEncoder().encode(message);
}

/**
 * 辅助函数：将十六进制字符串转为字节数组
 */
function hexToBytes(hex) {
  hex = hex.startsWith('0x') ? hex.substring(2) : hex;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * 辅助函数：根据钱包类型准备消息
 */
function prepareMessage(message, walletType) {
  switch (walletType) {
    case 'petra':
      // Petra添加前缀并可能添加nonce
      return `APTOS\nmessage: ${message}`;
    case 'martian':
      // Martian可能使用原始消息
      return message;
    case 'blocto':
      // Blocto可能添加nonce
      return message;
    case 'direct':
    default:
      return message;
  }
}

/**
 * 辅助函数：根据钱包类型准备签名数据
 */
function prepareSignature(signature, walletType) {
  const sigHex = signature.startsWith('0x') ? signature.substring(2) : signature;
  switch (walletType) {
    case 'petra':
    case 'martian':
      // 可能使用完整签名
      return hexToBytes(sigHex);
    case 'blocto':
      // Blocto可能使用64字节签名
      if (sigHex.length > 128) {
        return hexToBytes(sigHex.substring(0, 128));
      }
      return hexToBytes(sigHex);
    case 'direct':
    default:
      return hexToBytes(sigHex);
  }
}

/**
 * 验证签名 - 标准验证方法
 */
function verifySignatureStandard(message, signature, publicKey) {
  try {
    const messageBytes = encodeMessage(message);
    const signatureBytes = HexString.ensure(signature).toUint8Array();
    const publicKeyBytes = HexString.ensure(publicKey).toUint8Array();
    
    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
  } catch (error) {
    console.error('标准验证出错:', error.message);
    return false;
  }
}

/**
 * 验证签名 - 使用前缀哈希
 */
function verifySignatureWithPrefixHash(message, signature, publicKey) {
  try {
    const prefixedMessage = `APTOS\nmessage: ${message}`;
    const messageBytes = encodeMessage(prefixedMessage);
    const hash = crypto.createHash('sha3-256').update(messageBytes).digest();
    
    const signatureBytes = HexString.ensure(signature).toUint8Array();
    const publicKeyBytes = HexString.ensure(publicKey).toUint8Array();
    
    return nacl.sign.detached.verify(
      hash,
      signatureBytes,
      publicKeyBytes
    );
  } catch (error) {
    console.error('前缀哈希验证出错:', error.message);
    return false;
  }
}

/**
 * 模拟不同钱包的签名验证
 */
function testWalletVerification(data) {
  const walletTypes = ['direct', 'petra', 'martian', 'blocto'];
  const results = {};
  
  console.log('===========================================');
  console.log('测试不同钱包签名验证格式');
  console.log('===========================================\n');
  
  console.log('钱包地址:', data.walletAddress);
  console.log('消息:', data.message);
  console.log('签名:', data.signature);
  console.log('公钥:', data.publicKey);
  console.log('');
  
  for (const walletType of walletTypes) {
    console.log(`\n测试 ${walletType.toUpperCase()} 钱包格式:`);
    
    // 准备消息和签名
    const preparedMessage = prepareMessage(data.message, walletType);
    const preparedSignature = data.signature;
    
    // 标准验证方法
    const standardResult = verifySignatureStandard(
      preparedMessage,
      preparedSignature,
      data.publicKey
    );
    
    console.log(`- 标准验证 (原始消息): ${standardResult ? '成功 ✓' : '失败 ✗'}`);
    
    // 前缀哈希验证方法
    if (walletType === 'petra') {
      const prefixResult = verifySignatureWithPrefixHash(
        data.message,
        preparedSignature,
        data.publicKey
      );
      console.log(`- 前缀哈希验证: ${prefixResult ? '成功 ✓' : '失败 ✗'}`);
      results[walletType] = standardResult || prefixResult;
    } else {
      results[walletType] = standardResult;
    }
    
    // 尝试修复可能的签名格式问题
    if (!results[walletType]) {
      try {
        console.log('  尝试修复可能的签名格式问题:');
        
        // 去除前缀
        const sigHex = data.signature.startsWith('0x') ? data.signature.substring(2) : data.signature;
        const pubHex = data.publicKey.startsWith('0x') ? data.publicKey.substring(2) : data.publicKey;
        
        // 尝试不同长度的签名
        const sigParts = [
          sigHex.substring(0, 128), // 标准签名长度
          sigHex // 完整签名
        ];
        
        for (let i = 0; i < sigParts.length; i++) {
          const sigPart = sigParts[i];
          const msgBytes = encodeMessage(preparedMessage);
          const sigBytes = hexToBytes(sigPart);
          const pubBytes = hexToBytes(pubHex);
          
          try {
            const isValid = nacl.sign.detached.verify(
              msgBytes,
              sigBytes,
              pubBytes
            );
            
            console.log(`  > 签名片段 ${i+1} (长度: ${sigPart.length/2}字节): ${isValid ? '成功 ✓' : '失败 ✗'}`);
            
            if (isValid) {
              results[walletType] = true;
              break;
            }
          } catch (err) {
            console.log(`  > 签名片段 ${i+1} 验证错误:`, err.message);
          }
        }
      } catch (fixError) {
        console.error('  尝试修复签名格式时出错:', fixError.message);
      }
    }
  }
  
  console.log('\n===========================================');
  console.log('验证结果摘要:');
  console.log('===========================================');
  
  for (const [wallet, result] of Object.entries(results)) {
    console.log(`${wallet.toUpperCase()} 钱包格式: ${result ? '成功 ✓' : '失败 ✗'}`);
  }
  
  const anySuccess = Object.values(results).some(r => r);
  console.log(`\n总体结果: ${anySuccess ? '至少有一种格式验证成功 ✓' : '所有格式均验证失败 ✗'}`);
  
  if (!anySuccess) {
    console.log('\n可能的问题:');
    console.log('1. 签名与提供的公钥不匹配');
    console.log('2. 签名或公钥格式不正确');
    console.log('3. 消息格式不匹配（可能缺少前缀或包含不同编码）');
    console.log('4. 使用了不支持的签名算法或变体');
    console.log('\n调试建议:');
    console.log('- 检查签名生成过程');
    console.log('- 验证公钥是否与签名对应');
    console.log('- 确认消息格式与签名时完全一致');
  }
  
  return anySuccess;
}

// 执行测试
testWalletVerification(testData); 