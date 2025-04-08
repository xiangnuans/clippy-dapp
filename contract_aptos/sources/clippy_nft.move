module clippy_nft::clippy_nft {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use std::option;
    
    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_framework::object;
    use aptos_token_objects::collection;
    use aptos_token_objects::token;
    use aptos_token_objects::property_map;
    
    /// 错误代码
    const ECOLLECTION_ALREADY_EXISTS: u64 = 1;
    const ECOLLECTION_DOES_NOT_EXIST: u64 = 2;
    const ENOT_AUTHORIZED: u64 = 3;
    const EINVALID_TOKEN_ID: u64 = 4;
    
    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// NFT合约的配置信息
    struct CollectionConfig has key {
        /// 创建者地址
        creator: address,
        /// 集合名称
        collection_name: String,
        /// 最大供应量
        max_supply: u64,
        /// 当前铸造数量
        minted_count: u64,
        /// 是否开启铸造
        mint_enabled: bool,
    }
    
    /// NFT属性结构
    struct TokenMetadata has copy, drop, store {
        /// 名称
        name: String,
        /// 描述
        description: String,
        /// URI
        uri: String,
    }
    
    /// 事件：集合创建事件
    struct CollectionCreatedEvent has drop, store {
        creator: address,
        collection_name: String,
        max_supply: u64,
        timestamp: u64,
    }
    
    /// 事件：NFT铸造事件
    struct TokenMintedEvent has drop, store {
        receiver: address,
        token_id: u64,
        timestamp: u64,
    }
    
    /// 初始化NFT合约
    public entry fun initialize_collection(
        creator: &signer,
        collection_name: String,
        collection_description: String,
        collection_uri: String,
        max_supply: u64,
    ) {
        let creator_addr = signer::address_of(creator);
        
        // 创建集合
        let collection_constructor_ref = collection::create_unlimited_collection(
            creator,
            collection_description,
            collection_name,
            option::none(),
            collection_uri,
        );
        
        // 创建配置
        let config = CollectionConfig {
            creator: creator_addr,
            collection_name,
            max_supply,
            minted_count: 0,
            mint_enabled: true,
        };
        
        // 存储配置到集合对象
        let collection_signer = object::generate_signer(&collection_constructor_ref);
        move_to(&collection_signer, config);
        
        // 发出事件
        event::emit(CollectionCreatedEvent {
            creator: creator_addr,
            collection_name,
            max_supply,
            timestamp: timestamp::now_seconds(),
        });
    }
    
    /// 铸造NFT
    public entry fun mint_nft(
        minter: &signer, 
        receiver_addr: address,
        token_name: String,
        token_description: String,
        token_uri: String,
    ) acquires CollectionConfig {
        let minter_addr = signer::address_of(minter);
        
        // 获取集合对象
        let collection_addr = collection::create_collection_address(&minter_addr, &string::utf8(b"Clippy NFT Collection"));
        assert!(exists<CollectionConfig>(collection_addr), error::not_found(ECOLLECTION_DOES_NOT_EXIST));
        
        // 获取集合配置
        let config = borrow_global_mut<CollectionConfig>(collection_addr);
        
        // 验证条件
        assert!(minter_addr == config.creator || config.mint_enabled, error::permission_denied(ENOT_AUTHORIZED));
        assert!(config.minted_count < config.max_supply, error::resource_exhausted(EINVALID_TOKEN_ID));
        
        // 当前token id
        let token_id = config.minted_count + 1;
        config.minted_count = token_id;
        
        // 创建token
        let token_constructor_ref = token::create_numbered_token(
            minter,
            config.collection_name,
            token_description,
            token_name,
            option::none(),
            token_uri,
        );
        
        // 设置属性
        let token_signer = object::generate_signer(&token_constructor_ref);
        let properties = property_map::prepare_input(vector[], vector[], vector[]);
        property_map::init(&token_constructor_ref, properties);
        
        // 如果接收者不是铸造者，则转移token
        if (minter_addr != receiver_addr) {
            let token_object = object::object_from_constructor_ref<token::Token>(&token_constructor_ref);
            object::transfer(minter, token_object, receiver_addr);
        }
        
        // 发出事件
        event::emit(TokenMintedEvent {
            receiver: receiver_addr,
            token_id,
            timestamp: timestamp::now_seconds(),
        });
    }
    
    /// 设置铸造状态
    public entry fun set_mint_enabled(admin: &signer, enabled: bool) acquires CollectionConfig {
        let admin_addr = signer::address_of(admin);
        
        // 获取集合对象
        let collection_addr = collection::create_collection_address(&admin_addr, &string::utf8(b"Clippy NFT Collection"));
        assert!(exists<CollectionConfig>(collection_addr), error::not_found(ECOLLECTION_DOES_NOT_EXIST));
        
        // 获取集合配置
        let config = borrow_global_mut<CollectionConfig>(collection_addr);
        
        // 验证是否为创建者
        assert!(admin_addr == config.creator, error::permission_denied(ENOT_AUTHORIZED));
        
        // 更新状态
        config.mint_enabled = enabled;
    }
    
    /// 获取NFT的元数据
    #[view]
    public fun get_token_metadata(token_address: address): TokenMetadata acquires TokenMetadata {
        assert!(exists<TokenMetadata>(token_address), error::not_found(EINVALID_TOKEN_ID));
        *borrow_global<TokenMetadata>(token_address)
    }
    
    /// 获取集合信息
    #[view]
    public fun get_collection_info(collection_address: address): (address, String, u64, u64, bool) acquires CollectionConfig {
        assert!(exists<CollectionConfig>(collection_address), error::not_found(ECOLLECTION_DOES_NOT_EXIST));
        let config = borrow_global<CollectionConfig>(collection_address);
        (config.creator, config.collection_name, config.max_supply, config.minted_count, config.mint_enabled)
    }
} 