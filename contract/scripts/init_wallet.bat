@echo off
setlocal

echo 开始初始化钱包配置...

:: 使用提供的助记词
set MNEMONIC=faculty trust topple change october alter swamp hazard unfair balance move glory

:: 创建临时文件存储助记词
set TEMP_FILE=%TEMP%\mnemonic.txt
echo %MNEMONIC% > %TEMP_FILE%

:: 初始化Aptos配置
echo 使用助记词初始化Aptos账户...
aptos init --profile default --from-mnemonic-file %TEMP_FILE%

:: 删除临时文件
del %TEMP_FILE%

:: 显示账户信息
echo 账户初始化完成，显示账户信息:
aptos account lookup-address

echo 钱包初始化完成!

endlocal 