@echo off
setlocal enabledelayedexpansion

:: 检查参数
if "%~1"=="" (
    echo 使用方法: %0 [testnet^|mainnet] [token_name] [token_description] [token_uri]
    exit /b 1
)

set NETWORK=%~1
set TOKEN_NAME=%~2
set TOKEN_DESCRIPTION=%~3
set TOKEN_URI=%~4

:: 检查网络参数是否有效
if not "%NETWORK%"=="testnet" if not "%NETWORK%"=="mainnet" (
    echo 错误: 网络参数必须是 'testnet' 或 'mainnet'
    exit /b 1
)

:: 检查其他参数
if "%TOKEN_NAME%"=="" (
    echo 错误: 必须提供代币名称
    exit /b 1
)

if "%TOKEN_DESCRIPTION%"=="" (
    echo 错误: 必须提供代币描述
    exit /b 1
)

if "%TOKEN_URI%"=="" (
    echo 错误: 必须提供代币URI
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

echo 准备铸造NFT...
echo 部署账户: %ACCOUNT_ADDRESS%
echo 代币名称: %TOKEN_NAME%
echo 代币描述: %TOKEN_DESCRIPTION%
echo 代币URI: %TOKEN_URI%

:: 铸造NFT
echo 正在铸造NFT...
aptos move run --function-id %ACCOUNT_ADDRESS%::evermove_nft::mint_nft ^
    --args address:%ACCOUNT_ADDRESS% ^
    --args string:"%TOKEN_NAME%" ^
    --args string:"%TOKEN_DESCRIPTION%" ^
    --args string:"%TOKEN_URI%" ^
    --profile default ^
    --url %NODE_URL%

echo 🎉 NFT已成功铸造!
echo 代币名称: %TOKEN_NAME%
echo 代币描述: %TOKEN_DESCRIPTION%
echo 代币URI: %TOKEN_URI%

endlocal 