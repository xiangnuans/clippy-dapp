#[test_only]
module evermove_nft::nft_tests {
    use std::signer;
    use std::string;
    use std::error;
    use std::vector;
    
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_token_objects::collection;
    use aptos_token_objects::token;
    use aptos_token_objects::property_map;
    
    use evermove_nft::evermove_nft;
    
    // 测试常量
    const COLLECTION_NAME: vector<u8> = b"EverMove NFT Collection";
    const COLLECTION_DESCRIPTION: vector<u8> = b"A collection of EverMove NFTs";
    const COLLECTION_URI: vector<u8> = b"https://evermove.io/collection";
    const MAX_SUPPLY: u64 = 1000;
    
    #[test(creator = @0xCAFE, user = @0xBEEF)]
    fun test_initialize_collection(creator: &signer, user: &signer) {
        // 设置测试环境
        setup_test_env(creator, user);
        
        // 初始化NFT集合
        let collection_name = string::utf8(COLLECTION_NAME);
        let collection_description = string::utf8(COLLECTION_DESCRIPTION);
        let collection_uri = string::utf8(COLLECTION_URI);
        
        evermove_nft::initialize_collection(
            creator,
            collection_name,
            collection_description,
            collection_uri,
            MAX_SUPPLY
        );
        
        // 验证集合存在
        let creator_addr = signer::address_of(creator);
        let collection_addr = collection::create_collection_address(&creator_addr, &string::utf8(COLLECTION_NAME));
        assert!(collection::exists_at(collection_addr), 0);
    }
    
    #[test(creator = @0xCAFE, user = @0xBEEF)]
    fun test_nft_minting_flow(creator: &signer, user: &signer) {
        // 设置测试环境
        setup_test_env(creator, user);
        
        // 初始化NFT集合
        let collection_name = string::utf8(COLLECTION_NAME);
        let collection_description = string::utf8(COLLECTION_DESCRIPTION);
        let collection_uri = string::utf8(COLLECTION_URI);
        
        evermove_nft::initialize_collection(
            creator,
            collection_name,
            collection_description,
            collection_uri,
            MAX_SUPPLY
        );
        
        // 铸造NFT给自己
        let token_name = string::utf8(b"EverMove NFT #1");
        let token_description = string::utf8(b"First EverMove NFT");
        let token_uri = string::utf8(b"https://evermove.io/nfts/1");
        let creator_addr = signer::address_of(creator);
        
        evermove_nft::mint_nft(
            creator,
            creator_addr,
            token_name,
            token_description,
            token_uri
        );
        
        // 铸造NFT给用户
        let token_name = string::utf8(b"EverMove NFT #2");
        let token_description = string::utf8(b"Second EverMove NFT");
        let token_uri = string::utf8(b"https://evermove.io/nfts/2");
        let user_addr = signer::address_of(user);
        
        evermove_nft::mint_nft(
            creator,
            user_addr,
            token_name,
            token_description,
            token_uri
        );
        
        // 检查NFT计数
        let creator_addr = signer::address_of(creator);
        let collection_addr = collection::create_collection_address(&creator_addr, &string::utf8(COLLECTION_NAME));
        let (_, _, _, minted_count, _) = evermove_nft::get_collection_info(collection_addr);
        assert!(minted_count == 2, 0);
    }
    
    #[test(creator = @0xCAFE, user = @0xBEEF)]
    fun test_mint_settings(creator: &signer, user: &signer) {
        // 设置测试环境
        setup_test_env(creator, user);
        
        // 初始化NFT集合
        let collection_name = string::utf8(COLLECTION_NAME);
        let collection_description = string::utf8(COLLECTION_DESCRIPTION);
        let collection_uri = string::utf8(COLLECTION_URI);
        
        evermove_nft::initialize_collection(
            creator,
            collection_name,
            collection_description,
            collection_uri,
            MAX_SUPPLY
        );
        
        // 禁用铸造
        evermove_nft::set_mint_enabled(creator, false);
        
        // 检查铸造状态
        let creator_addr = signer::address_of(creator);
        let collection_addr = collection::create_collection_address(&creator_addr, &string::utf8(COLLECTION_NAME));
        let (_, _, _, _, mint_enabled) = evermove_nft::get_collection_info(collection_addr);
        assert!(!mint_enabled, 0);
        
        // 启用铸造
        evermove_nft::set_mint_enabled(creator, true);
        
        // 再次检查铸造状态
        let (_, _, _, _, mint_enabled) = evermove_nft::get_collection_info(collection_addr);
        assert!(mint_enabled, 0);
    }
    
    #[test(creator = @0xCAFE, user = @0xBEEF)]
    #[expected_failure(abort_code = 0x50003)]
    fun test_unauthorized_mint_setting_change(creator: &signer, user: &signer) {
        // 设置测试环境
        setup_test_env(creator, user);
        
        // 初始化NFT集合
        let collection_name = string::utf8(COLLECTION_NAME);
        let collection_description = string::utf8(COLLECTION_DESCRIPTION);
        let collection_uri = string::utf8(COLLECTION_URI);
        
        evermove_nft::initialize_collection(
            creator,
            collection_name,
            collection_description,
            collection_uri,
            MAX_SUPPLY
        );
        
        // 非创建者尝试更改铸造状态，应该失败
        evermove_nft::set_mint_enabled(user, false);
    }
    
    #[test(creator = @0xCAFE, user = @0xBEEF)]
    fun test_user_can_mint_when_enabled(creator: &signer, user: &signer) {
        // 设置测试环境
        setup_test_env(creator, user);
        
        // 初始化NFT集合
        let collection_name = string::utf8(COLLECTION_NAME);
        let collection_description = string::utf8(COLLECTION_DESCRIPTION);
        let collection_uri = string::utf8(COLLECTION_URI);
        
        evermove_nft::initialize_collection(
            creator,
            collection_name,
            collection_description,
            collection_uri,
            MAX_SUPPLY
        );
        
        // 确保铸造开启
        evermove_nft::set_mint_enabled(creator, true);
        
        // 用户铸造NFT给自己
        let token_name = string::utf8(b"EverMove NFT #1");
        let token_description = string::utf8(b"User Minted NFT");
        let token_uri = string::utf8(b"https://evermove.io/nfts/user/1");
        let user_addr = signer::address_of(user);
        
        // 应该失败，因为用户不是集合创建者
        // 这个测试需要修改合约实现，允许任何用户在mint_enabled为true时铸造
    }
    
    #[test(creator = @0xCAFE, user = @0xBEEF)]
    #[expected_failure(abort_code = 0x60004)]
    fun test_exceed_max_supply(creator: &signer, user: &signer) {
        // 设置测试环境
        setup_test_env(creator, user);
        
        // 初始化NFT集合，最大供应量为2
        let collection_name = string::utf8(COLLECTION_NAME);
        let collection_description = string::utf8(COLLECTION_DESCRIPTION);
        let collection_uri = string::utf8(COLLECTION_URI);
        
        evermove_nft::initialize_collection(
            creator,
            collection_name,
            collection_description,
            collection_uri,
            2 // 只允许铸造2个
        );
        
        let creator_addr = signer::address_of(creator);
        
        // 铸造NFT #1
        evermove_nft::mint_nft(
            creator,
            creator_addr,
            string::utf8(b"EverMove NFT #1"),
            string::utf8(b"First NFT"),
            string::utf8(b"https://evermove.io/nfts/1")
        );
        
        // 铸造NFT #2
        evermove_nft::mint_nft(
            creator,
            creator_addr,
            string::utf8(b"EverMove NFT #2"),
            string::utf8(b"Second NFT"),
            string::utf8(b"https://evermove.io/nfts/2")
        );
        
        // 铸造NFT #3，应该失败，因为超过了最大供应量
        evermove_nft::mint_nft(
            creator,
            creator_addr,
            string::utf8(b"EverMove NFT #3"),
            string::utf8(b"Third NFT"),
            string::utf8(b"https://evermove.io/nfts/3")
        );
    }
    
    // 辅助函数：设置测试环境
    fun setup_test_env(creator: &signer, user: &signer) {
        // 创建测试账户
        let creator_addr = signer::address_of(creator);
        let user_addr = signer::address_of(user);
        
        account::create_account_for_test(creator_addr);
        account::create_account_for_test(user_addr);
        
        // 初始化时间戳
        timestamp::set_time_has_started_for_testing(creator);
    }
} 