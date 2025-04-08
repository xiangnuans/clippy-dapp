// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EVMChainNFT
 * @dev Implementation of cross-chain ERC721 NFT contract with 0G DA layer integration
 */
contract EVMChainNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    // Events
    event NFTLocked(uint256 tokenId, address owner, bytes32 crossChainId);
    event NFTUnlocked(uint256 tokenId, address owner, bytes32 crossChainId);
    event SignerUpdated(address oldSigner, address newSigner);
    event DA0GAddressUpdated(address oldAddress, address newAddress);

    // 0G DA layer address
    address public da0GAddress;

    // Authorized signer for cross-chain validations
    address public authorizedSigner;

    // Mapping from tokenId to lock status
    mapping(uint256 => bool) public lockedTokens;

    // Mapping from tokenId to cross-chain identifier
    mapping(uint256 => bytes32) public tokenToCrossChainId;

    // Mapping from cross-chain identifier to tokenId
    mapping(bytes32 => uint256) public crossChainIdToToken;

    // Counter for minting new tokens
    uint256 private _tokenIdCounter;

    /**
     * @dev Constructor initializes the NFT contract with name, symbol, and authorized signer
     * @param name Name of the NFT collection
     * @param symbol Symbol of the NFT collection
     * @param signer Address of the authorized signer for cross-chain operations
     * @param _da0GAddress Address of the 0G DA layer contract
     */
    constructor(
        string memory name,
        string memory symbol,
        address signer,
        address _da0GAddress
    )
        ERC721(name, symbol)
        Ownable(msg.sender)
    {
        require(signer != address(0), "Invalid signer address");
        require(_da0GAddress != address(0), "Invalid 0G DA address");

        authorizedSigner = signer;
        da0GAddress = _da0GAddress;
        _tokenIdCounter = 1;
    }

    /**
     * @dev Updates the authorized signer address
     * @param newSigner Address of the new authorized signer
     */
    function updateSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "Invalid signer address");

        address oldSigner = authorizedSigner;
        authorizedSigner = newSigner;

        emit SignerUpdated(oldSigner, newSigner);
    }

    /**
     * @dev Updates the 0G DA layer address
     * @param newDA0GAddress Address of the new 0G DA layer contract
     */
    function updateDA0GAddress(address newDA0GAddress) external onlyOwner {
        require(newDA0GAddress != address(0), "Invalid 0G DA address");

        address oldAddress = da0GAddress;
        da0GAddress = newDA0GAddress;

        emit DA0GAddressUpdated(oldAddress, newDA0GAddress);
    }

    /**
     * @dev Mints a new NFT
     * @param to Address to mint the NFT to
     * @param uri URI for the NFT metadata
     * @return tokenId The ID of the newly minted NFT
     */
    function mint(address to, string memory uri) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);

        return tokenId;
    }

    /**
     * @dev Locks an NFT for cross-chain transfer
     * @param tokenId ID of the token to lock
     * @param crossChainId Identifier for cross-chain tracking
     * @param signature Signature from authorized signer validating the operation
     */
    function lockNFT(uint256 tokenId, bytes32 crossChainId, bytes memory signature) external nonReentrant {
        require(_isAuthorized(ownerOf(tokenId), msg.sender, tokenId), "Not owner or approved");
        require(!lockedTokens[tokenId], "Token already locked");
        require(validateSignature(tokenId, crossChainId, signature), "Invalid signature");

        // Store cross-chain mappings
        tokenToCrossChainId[tokenId] = crossChainId;
        crossChainIdToToken[crossChainId] = tokenId;

        // Mark token as locked
        lockedTokens[tokenId] = true;

        // Store lock information on 0G DA layer
        storeDataOn0GDA(tokenId, crossChainId, msg.sender);

        emit NFTLocked(tokenId, msg.sender, crossChainId);
    }

    /**
     * @dev Unlocks an NFT after cross-chain transfer
     * @param tokenId ID of the token to unlock
     * @param crossChainId Identifier for cross-chain tracking
     * @param signature Signature from authorized signer validating the operation
     */
    function unlockNFT(uint256 tokenId, bytes32 crossChainId, bytes memory signature) external nonReentrant {
        require(lockedTokens[tokenId], "Token not locked");
        require(tokenToCrossChainId[tokenId] == crossChainId, "Cross-chain ID mismatch");
        require(validateSignature(tokenId, crossChainId, signature), "Invalid signature");

        // Verify data from 0G DA layer
        require(verifyDataFrom0GDA(tokenId, crossChainId), "0G DA verification failed");

        // Mark token as unlocked
        lockedTokens[tokenId] = false;

        // Transfer token back to original owner
        _transfer(address(this), msg.sender, tokenId);

        emit NFTUnlocked(tokenId, msg.sender, crossChainId);
    }

    /**
     * @dev Validates the signature for a cross-chain operation
     * @param tokenId ID of the token involved
     * @param crossChainId Identifier for cross-chain tracking
     * @param signature Signature to validate
     * @return bool indicating if the signature is valid
     */
    function validateSignature(
        uint256 tokenId,
        bytes32 crossChainId,
        bytes memory signature
    )
        public
        view
        returns (bool)
    {
        bytes32 message = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encodePacked(tokenId, crossChainId)))
        );

        address recoveredSigner = message.recover(signature);
        return recoveredSigner == authorizedSigner;
    }

    /**
     * @dev Stores NFT lock data on 0G DA layer
     * @param tokenId ID of the token to store data for
     * @param crossChainId Identifier for cross-chain tracking
     * @param owner Address of the token owner
     */
    function storeDataOn0GDA(uint256 tokenId, bytes32 crossChainId, address owner) internal {
        // Interface with 0G DA layer contract
        // This is a placeholder for the actual integration
        // In a real implementation, this would call methods on the DA0G contract

        // Example:
        // IDA0G da0g = IDA0G(da0GAddress);
        // da0g.storeNFTData(tokenId, crossChainId, owner, block.timestamp);
    }

    /**
     * @dev Verifies NFT data from 0G DA layer
     * @param tokenId ID of the token to verify
     * @param crossChainId Identifier for cross-chain tracking
     * @return bool indicating if the verification was successful
     */
    function verifyDataFrom0GDA(uint256 tokenId, bytes32 crossChainId) internal view returns (bool) {
        // Interface with 0G DA layer contract
        // This is a placeholder for the actual integration
        // In a real implementation, this would call methods on the DA0G contract

        // Example:
        // IDA0G da0g = IDA0G(da0GAddress);
        // return da0g.verifyNFTData(tokenId, crossChainId);

        // Temporary placeholder return
        return true;
    }

    /**
     * @dev Hook that is called before any token transfer
     * @param to Address receiving the token
     * @param tokenId ID of the token being transferred
     * @param auth Address of the authorized operator
     * @return address Address of the authorized operator
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        require(!lockedTokens[tokenId] || to == address(this), "Token is locked");
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Returns the current token ID counter value
     * @return uint256 Current token ID counter
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }
}

/**
 * @dev Interface for the 0G DA layer contract
 * This would be implemented by the actual 0G DA layer contract
 */
interface IDA0G {
    function storeNFTData(uint256 tokenId, bytes32 crossChainId, address owner, uint256 timestamp) external;

    function verifyNFTData(uint256 tokenId, bytes32 crossChainId) external view returns (bool);
}
