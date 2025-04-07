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
    set PROFILE=testnet
    set NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
    set FAUCET_URL=https://faucet.testnet.aptoslabs.com
) else (
    set PROFILE=mainnet
    set NODE_URL=https://fullnode.mainnet.aptoslabs.com/v1
    set FAUCET_URL=
)

:: 获取部署账户地址
for /f "tokens=2" %%a in ('aptos config show-profiles --profile default ^| findstr "account:"') do (
    set ACCOUNT_ADDRESS=%%a
)

echo 准备部署到 %NETWORK%...
echo 部署账户: %ACCOUNT_ADDRESS%

:: 运行测试
echo 运行测试...
aptos move test

:: 更新Move.toml中的地址
powershell -Command "(Get-Content Move.toml) -replace 'evermove_nft = \"_\"', 'evermove_nft = \"%ACCOUNT_ADDRESS%\"' | Set-Content Move.toml"

echo 已更新Move.toml中的地址为: %ACCOUNT_ADDRESS%

:: 如果是测试网，获取测试币
if "%NETWORK%"=="testnet" (
    echo 从水龙头获取测试币...
    aptos account fund-with-faucet --account %ACCOUNT_ADDRESS% --amount 100000000
)

:: 编译合约
echo 编译合约...
aptos move compile

:: 发布合约
echo 发布合约到 %NETWORK%...
aptos move publish --assume-yes --profile default --url %NODE_URL%

:: 显示部署信息
echo 🎉 合约已成功部署到 %NETWORK%!
echo 合约地址: %ACCOUNT_ADDRESS%
echo 合约模块: evermove_nft

:: 提供后续步骤指导
echo.
echo 后续步骤:
echo 1. 初始化NFT集合:
echo    aptos move run --function-id %ACCOUNT_ADDRESS%::evermove_nft::initialize_collection --args string:"EverMove NFT Collection" --args string:"A collection of EverMove NFTs" --args string:"https://evermove.io/collection" --args u64:1000
echo.
echo 2. 铸造NFT:
echo    aptos move run --function-id %ACCOUNT_ADDRESS%::evermove_nft::mint_nft --args address:%ACCOUNT_ADDRESS% --args string:"EverMove NFT #1" --args string:"First EverMove NFT" --args string:"https://evermove.io/nfts/1"
echo.
echo 3. 查看集合信息(需要集合地址):
echo    aptos move view --function-id %ACCOUNT_ADDRESS%::evermove_nft::get_collection_info --args address:^<collection_address^>

endlocal 