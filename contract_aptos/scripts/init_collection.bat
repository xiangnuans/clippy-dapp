@echo off
setlocal enabledelayedexpansion

:: 检查参数
if "%~1"=="" (
    echo 使用方法: %0 [testnet^|mainnet]
    exit /b 1
)

set NETWORK=%~1

:: 检查网络参数是否有效
if not "%NETWORK%"=="testnet" if not "%NETWORK%"=="mainnet" (
    echo 错误: 网络参数必须是 'testnet' 或 'mainnet'
    exit /b 1
)

:: 设置网络配置
if "%NETWORK%"=="testnet" (
    set NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
) else (
    set NODE_URL=https://fullnode.mainnet.aptoslabs.com/v1
)

:: 获取部署账户地址
for /f "tokens=2" %%a in ('aptos config show-profiles --profile default ^| findstr "account:"') do (
    set ACCOUNT_ADDRESS=%%a
)

echo 准备初始化NFT集合...
echo 部署账户: %ACCOUNT_ADDRESS%

:: 初始化集合
echo 正在初始化NFT集合...
aptos move run --function-id %ACCOUNT_ADDRESS%::evermove_nft::initialize_collection ^
    --args string:"EverMove NFT Collection" ^
    --args string:"A collection of EverMove NFTs" ^
    --args string:"https://evermove.io/collection" ^
    --args u64:1000 ^
    --profile default ^
    --url %NODE_URL%

echo 🎉 NFT集合已成功初始化!
echo 集合名称: EverMove NFT Collection
echo 最大供应量: 1000
echo 集合URI: https://evermove.io/collection

endlocal 