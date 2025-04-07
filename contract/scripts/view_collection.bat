@echo off
setlocal enabledelayedexpansion

:: 检查参数
if "%~1"=="" (
    echo 使用方法: %0 [testnet^|mainnet] [collection_address]
    exit /b 1
)

set NETWORK=%~1
set COLLECTION_ADDRESS=%~2

:: 检查网络参数是否有效
if not "%NETWORK%"=="testnet" if not "%NETWORK%"=="mainnet" (
    echo 错误: 网络参数必须是 'testnet' 或 'mainnet'
    exit /b 1
)

:: 检查集合地址
if "%COLLECTION_ADDRESS%"=="" (
    echo 错误: 必须提供集合地址
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

echo 准备查看NFT集合信息...
echo 部署账户: %ACCOUNT_ADDRESS%
echo 集合地址: %COLLECTION_ADDRESS%

:: 查看集合信息
echo 正在获取集合信息...
aptos move view --function-id %ACCOUNT_ADDRESS%::evermove_nft::get_collection_info ^
    --args address:%COLLECTION_ADDRESS% ^
    --profile default ^
    --url %NODE_URL%

endlocal 