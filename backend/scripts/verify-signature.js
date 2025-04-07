/**
 * 签名验证测试脚本
 * 用于测试多种签名验证方法
 */

const { HexString } = require('aptos');
const nacl = require('tweetnacl');
const { createHash } = require('crypto');
const BCS = require('aptos').BCS;

// 测试数据
const testData = {
  walletAddress: "0xafd28007464059c67fc7988516605eaca31beae6ddf73051cd646eaef1288350",
  signature: "0x9a4c5b1a55ccc1af8caa321bf846fab986feb432634e69f8567d755a3507ee8d2f7bc3033970539913b36ba7b9ce2fc50c25d78ec41f5ec0599b48b351739605",
  publicKey: "0xe49506c917c2bb2dcaa030c1234e7ba8015fce4eaa24d81128a7aaae9bf6693d",
  message: "CLIPPY: INFUSE SOUL INTO HUMANOID ROBOTS"
};

/**
 * 辅助函数：将十六进制字符串转换为Uint8Array
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
 * 辅助函数：显示字节数组的十六进制表示
 */
function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 方法1：直接验证签名
 */
function verifySignatureDirect(message, signature, publicKey) {
  try {
    console.log("\n方法1：直接验证签名");
    
    // 将消息转换为字节数组
    const messageBytes = new TextEncoder().encode(message);
    console.log(`消息: "${message}"`);
    console.log(`消息字节长度: ${messageBytes.length}`);
    console.log(`消息字节: ${bytesToHex(messageBytes)}`);
    
    // 将签名和公钥转换为Uint8Array
    const signatureBytes = HexString.ensure(signature).toUint8Array();
    const publicKeyBytes = HexString.ensure(publicKey).toUint8Array();
    
    console.log(`签名长度: ${signatureBytes.length} 字节`);
    console.log(`公钥长度: ${publicKeyBytes.length} 字节`);
    
    // 使用nacl验证签名
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
    
    console.log(`验证结果: ${isValid ? '成功 ✓' : '失败 ✗'}`);
    return isValid;
  } catch (error) {
    console.error('直接验证签名时出错:', error);
    return false;
  }
}

/**
 * 方法2：使用带前缀的哈希验证签名
 */
function verifySignaturePrefixHash(message, signature, publicKey) {
  try {
    console.log("\n方法2：带前缀哈希验证签名");
    
    // 添加前缀（许多钱包使用此格式）
    const prefixedMessage = `APTOS\nmessage: ${message}`;
    console.log(`带前缀消息: "${prefixedMessage}"`);
    
    // 将消息转换为字节数组
    const messageBytes = new TextEncoder().encode(prefixedMessage);
    console.log(`前缀消息字节长度: ${messageBytes.length}`);
    
    // 计算SHA3-256哈希
    const hash = createHash('sha3-256').update(messageBytes).digest();
    console.log(`哈希长度: ${hash.length} 字节`);
    console.log(`哈希值: ${bytesToHex(hash)}`);
    
    // 将签名和公钥转换为Uint8Array
    const signatureBytes = HexString.ensure(signature).toUint8Array();
    const publicKeyBytes = HexString.ensure(publicKey).toUint8Array();
    
    // 使用nacl验证签名
    const isValid = nacl.sign.detached.verify(
      hash,
      signatureBytes,
      publicKeyBytes
    );
    
    console.log(`验证结果: ${isValid ? '成功 ✓' : '失败 ✗'}`);
    return isValid;
  } catch (error) {
    console.error('前缀哈希验证签名时出错:', error);
    return false;
  }
}

/**
 * 方法3：使用BCS序列化验证签名
 */
function verifySignatureBCS(message, signature, publicKey) {
  try {
    console.log("\n方法3：BCS序列化验证签名");
    
    // 创建BCS序列化器
    const serializer = new BCS.Serializer();
    // 序列化消息字符串
    serializer.serializeStr(message);
    // 获取序列化后的字节
    const messageBytes = serializer.getBytes();
    
    console.log(`BCS序列化消息字节长度: ${messageBytes.length}`);
    console.log(`BCS序列化消息字节: ${bytesToHex(messageBytes)}`);
    
    // 将签名和公钥转换为Uint8Array
    const signatureBytes = HexString.ensure(signature).toUint8Array();
    const publicKeyBytes = HexString.ensure(publicKey).toUint8Array();
    
    // 使用nacl验证签名
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
    
    console.log(`验证结果: ${isValid ? '成功 ✓' : '失败 ✗'}`);
    return isValid;
  } catch (error) {
    console.error('BCS序列化验证签名时出错:', error);
    return false;
  }
}

/**
 * 方法4：常见的Aptos钱包格式处理
 */
function verifySignatureCommonFormats(message, signature, publicKey) {
  try {
    console.log("\n方法4：常见Aptos钱包格式处理");
    
    // 去除0x前缀
    const signatureHex = signature.startsWith('0x') ? signature.substring(2) : signature;
    const publicKeyHex = publicKey.startsWith('0x') ? publicKey.substring(2) : publicKey;
    
    // 某些钱包可能在签名中添加额外信息
    // 尝试不同长度的签名部分
    const signatureParts = [
      signatureHex.substring(0, 128), // 标准长度签名 (64字节)
      signatureHex, // 完整签名
    ];
    
    let success = false;
    
    for (let i = 0; i < signatureParts.length; i++) {
      const sigPart = signatureParts[i];
      console.log(`\n尝试签名部分 ${i+1}/${signatureParts.length}, 长度: ${sigPart.length/2} 字节`);
      
      try {
        // 将消息转换为字节数组
        const messageBytes = new TextEncoder().encode(message);
        
        // 将签名和公钥转换为Uint8Array
        const signatureBytes = hexToBytes(sigPart);
        const publicKeyBytes = hexToBytes(publicKeyHex);
        
        console.log(`签名片段: 0x${sigPart.substring(0, 10)}...`);
        
        // 使用nacl验证签名
        const isValid = nacl.sign.detached.verify(
          messageBytes,
          signatureBytes,
          publicKeyBytes
        );
        
        console.log(`验证结果: ${isValid ? '成功 ✓' : '失败 ✗'}`);
        
        if (isValid) {
          success = true;
          break;
        }
      } catch (err) {
        console.error(`尝试签名部分 ${i+1} 时出错:`, err.message);
      }
    }
    
    return success;
  } catch (error) {
    console.error('常见格式验证签名时出错:', error);
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log("=================================================");
  console.log("Aptos 签名验证测试工具");
  console.log("=================================================");
  
  console.log("\n测试数据:");
  console.log(`钱包地址: ${testData.walletAddress}`);
  console.log(`签名: ${testData.signature}`);
  console.log(`公钥: ${testData.publicKey}`);
  console.log(`消息: "${testData.message}"`);
  
  // 尝试所有验证方法
  const result1 = verifySignatureDirect(testData.message, testData.signature, testData.publicKey);
  const result2 = verifySignaturePrefixHash(testData.message, testData.signature, testData.publicKey);
  const result3 = verifySignatureBCS(testData.message, testData.signature, testData.publicKey);
  const result4 = verifySignatureCommonFormats(testData.message, testData.signature, testData.publicKey);
  
  console.log("\n=================================================");
  console.log("验证结果摘要:");
  console.log("=================================================");
  console.log(`方法1 (直接验证): ${result1 ? '成功 ✓' : '失败 ✗'}`);
  console.log(`方法2 (前缀哈希): ${result2 ? '成功 ✓' : '失败 ✗'}`);
  console.log(`方法3 (BCS序列化): ${result3 ? '成功 ✓' : '失败 ✗'}`);
  console.log(`方法4 (常见格式处理): ${result4 ? '成功 ✓' : '失败 ✗'}`);
  
  console.log("\n任一方法成功: " + (result1 || result2 || result3 || result4 ? '是 ✓' : '否 ✗'));
  
  if (!(result1 || result2 || result3 || result4)) {
    console.log("\n所有验证方法均失败。可能的原因:");
    console.log("1. 签名与所提供的公钥不匹配");
    console.log("2. 使用了不同的签名格式或算法");
    console.log("3. 消息格式不一致（如额外的前缀、后缀或编码差异）");
    console.log("4. 签名或公钥数据格式有问题");
  }
}

// 运行主函数
main().catch(console.error); 