// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BNBChainNFT
 * @dev Implementation of cross-chain ERC721 NFT contract for BNB Chain with 0G DA layer integration
 */
contract BNBChainNFT is ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;

    // Events
    event NFTMinted(uint256 tokenId, address owner, bytes32 crossChainId, address originalChain);
    event NFTBurned(uint256 tokenId, address owner, bytes32 crossChainId);
    event SignerUpdated(address oldSigner, address newSigner);
    event DA0GAddressUpdated(address oldAddress, address newAddress);
    event OriginalChainUpdated(address oldChain, address newChain);
    event MetadataBaseURIUpdated(string oldURI, string newURI);

    // 0G DA layer address
    address public da0GAddress;

    // Authorized signer for cross-chain validations
    address public authorizedSigner;

    // Original EVM chain contract address
    address public originalChainAddress;

    // Base URI for metadata
    string private _baseTokenURI;

    // Mapping from cross-chain identifier to token ID
    mapping(bytes32 => uint256) public crossChainIdToToken;

    // Mapping from token ID to cross-chain identifier
    mapping(uint256 => bytes32) public tokenToCrossChainId;

    // Mapping from token ID to original chain token ID
    mapping(uint256 => uint256) public tokenToOriginalTokenId;

    // Counter for minting new tokens
    uint256 private _tokenIdCounter;

    // Mapping to track used signatures to prevent replay attacks
    mapping(bytes => bool) public usedSignatures;

    /**
     * @dev Constructor initializes the NFT contract with name, symbol, and authorized signer
     * @param name Name of the NFT collection
     * @param symbol Symbol of the NFT collection
     * @param signer Address of the authorized signer for cross-chain operations
     * @param _da0GAddress Address of the 0G DA layer contract
     * @param _originalChainAddress Address of the original chain NFT contract
     * @param baseURI Base URI for token metadata
     */
    constructor(
        string memory name,
        string memory symbol,
        address signer,
        address _da0GAddress,
        address _originalChainAddress,
        string memory baseURI
    )
        ERC721(name, symbol)
        Ownable(msg.sender)
    {
        require(signer != address(0), "Invalid signer address");
        require(_da0GAddress != address(0), "Invalid 0G DA address");
        require(_originalChainAddress != address(0), "Invalid original chain address");

        authorizedSigner = signer;
        da0GAddress = _da0GAddress;
        originalChainAddress = _originalChainAddress;
        _baseTokenURI = baseURI;
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
     * @dev Updates the original chain contract address
     * @param newOriginalChainAddress Address of the new original chain contract
     */
    function updateOriginalChainAddress(address newOriginalChainAddress) external onlyOwner {
        require(newOriginalChainAddress != address(0), "Invalid original chain address");

        address oldChain = originalChainAddress;
        originalChainAddress = newOriginalChainAddress;

        emit OriginalChainUpdated(oldChain, newOriginalChainAddress);
    }

    /**
     * @dev Updates the base URI for token metadata
     * @param newBaseURI New base URI
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        string memory oldURI = _baseTokenURI;
        _baseTokenURI = newBaseURI;

        emit MetadataBaseURIUpdated(oldURI, newBaseURI);
    }

    /**
     * @dev Pauses all token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses all token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Base URI for computing {tokenURI}
     * @return string Base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Mints a new cross-chain NFT
     * @param to Address to mint the NFT to
     * @param originalTokenId Original token ID from the EVM chain
     * @param crossChainId Cross-chain identifier for tracking
     * @param metadataURI URI for token metadata
     * @param signature Signature from authorized signer validating the operation
     * @return tokenId The ID of the newly minted NFT
     */
    function mintCrossChainNFT(
        address to,
        uint256 originalTokenId,
        bytes32 crossChainId,
        string memory metadataURI,
        bytes memory signature
    )
        external
        nonReentrant
        whenNotPaused
        returns (uint256)
    {
        require(to != address(0), "Invalid recipient address");
        require(!usedSignatures[signature], "Signature already used");
        require(crossChainIdToToken[crossChainId] == 0, "NFT already minted for this cross-chain ID");
        require(validateMintSignature(to, originalTokenId, crossChainId, signature), "Invalid signature");

        // Verify data from 0G DA layer
        require(verifyDataFrom0GDA(originalTokenId, crossChainId, to), "0G DA verification failed");

        // Mark signature as used
        usedSignatures[signature] = true;

        // Mint new token
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _mint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // Store mappings
        crossChainIdToToken[crossChainId] = tokenId;
        tokenToCrossChainId[tokenId] = crossChainId;
        tokenToOriginalTokenId[tokenId] = originalTokenId;

        // Store mint data on 0G DA layer
        storeDataOn0GDA(tokenId, originalTokenId, crossChainId, to);

        emit NFTMinted(tokenId, to, crossChainId, originalChainAddress);

        return tokenId;
    }

    /**
     * @dev Burns a cross-chain NFT for returning to original chain
     * @param tokenId ID of the token to burn
     * @param crossChainId Cross-chain identifier for tracking
     * @param signature Signature from authorized signer validating the operation
     */
    function burnCrossChainNFT(
        uint256 tokenId,
        bytes32 crossChainId,
        bytes memory signature
    )
        external
        nonReentrant
        whenNotPaused
    {
        require(_isAuthorized(ownerOf(tokenId), msg.sender, tokenId), "Not owner or approved");
        require(tokenToCrossChainId[tokenId] == crossChainId, "Cross-chain ID mismatch");
        require(!usedSignatures[signature], "Signature already used");
        require(validateBurnSignature(tokenId, crossChainId, signature), "Invalid signature");

        // Mark signature as used
        usedSignatures[signature] = true;

        // Store burn data on 0G DA layer
        storeBurnDataOn0GDA(tokenId, tokenToOriginalTokenId[tokenId], crossChainId, msg.sender);

        emit NFTBurned(tokenId, msg.sender, crossChainId);

        // Burn the token
        _burn(tokenId);

        // Clear mappings
        delete crossChainIdToToken[crossChainId];
        delete tokenToCrossChainId[tokenId];
        delete tokenToOriginalTokenId[tokenId];
    }

    /**
     * @dev Validates the signature for minting a cross-chain NFT
     * @param to Address to mint the NFT to
     * @param originalTokenId Original token ID from the EVM chain
     * @param crossChainId Cross-chain identifier for tracking
     * @param signature Signature to validate
     * @return bool indicating if the signature is valid
     */
    function validateMintSignature(
        address to,
        uint256 originalTokenId,
        bytes32 crossChainId,
        bytes memory signature
    )
        public
        view
        returns (bool)
    {
        bytes32 message = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(abi.encodePacked(to, originalTokenId, crossChainId, originalChainAddress))
            )
        );

        address recoveredSigner = message.recover(signature);
        return recoveredSigner == authorizedSigner;
    }

    /**
     * @dev Validates the signature for burning a cross-chain NFT
     * @param tokenId ID of the token to burn
     * @param crossChainId Cross-chain identifier for tracking
     * @param signature Signature to validate
     * @return bool indicating if the signature is valid
     */
    function validateBurnSignature(
        uint256 tokenId,
        bytes32 crossChainId,
        bytes memory signature
    )
        public
        view
        returns (bool)
    {
        bytes32 message = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(abi.encodePacked(tokenId, crossChainId, originalChainAddress))
            )
        );

        address recoveredSigner = message.recover(signature);
        return recoveredSigner == authorizedSigner;
    }

    /**
     * @dev Stores NFT mint data on 0G DA layer
     * @param tokenId ID of the token to store data for
     * @param originalTokenId Original token ID from the EVM chain
     * @param crossChainId Identifier for cross-chain tracking
     * @param owner Address of the token owner
     */
    function storeDataOn0GDA(uint256 tokenId, uint256 originalTokenId, bytes32 crossChainId, address owner) internal {
        // Interface with 0G DA layer contract
        // This is a placeholder for the actual integration
        // In a real implementation, this would call methods on the DA0G contract

        // Example:
        // IDA0G da0g = IDA0G(da0GAddress);
        // da0g.storeMintData(tokenId, originalTokenId, crossChainId, owner, block.timestamp);
    }

    /**
     * @dev Stores NFT burn data on 0G DA layer
     * @param tokenId ID of the token being burned
     * @param originalTokenId Original token ID from the EVM chain
     * @param crossChainId Identifier for cross-chain tracking
     * @param owner Address of the token owner
     */
    function storeBurnDataOn0GDA(
        uint256 tokenId,
        uint256 originalTokenId,
        bytes32 crossChainId,
        address owner
    )
        internal
    {
        // Interface with 0G DA layer contract
        // This is a placeholder for the actual integration
        // In a real implementation, this would call methods on the DA0G contract

        // Example:
        // IDA0G da0g = IDA0G(da0GAddress);
        // da0g.storeBurnData(tokenId, originalTokenId, crossChainId, owner, block.timestamp);
    }

    /**
     * @dev Verifies NFT data from 0G DA layer
     * @param originalTokenId Original token ID from the EVM chain
     * @param crossChainId Identifier for cross-chain tracking
     * @param owner Address of the token owner
     * @return bool indicating if the verification was successful
     */
    function verifyDataFrom0GDA(
        uint256 originalTokenId,
        bytes32 crossChainId,
        address owner
    )
        internal
        view
        returns (bool)
    {
        // Interface with 0G DA layer contract
        // This is a placeholder for the actual integration
        // In a real implementation, this would call methods on the DA0G contract

        // Example:
        // IDA0G da0g = IDA0G(da0GAddress);
        // return da0g.verifyNFTData(originalTokenId, crossChainId, owner);

        // Temporary placeholder return
        return true;
    }

    /**
     * @dev Hook that is called before any token transfer
     * @param to Address receiving the token
     * @param tokenId ID of the token being transferred
     * @param auth Address of the authorized operator
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        override(ERC721)
        whenNotPaused
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Returns the current token ID counter value
     * @return uint256 Current token ID counter
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Checks if a signature has been used
     * @param signature Signature to check
     * @return bool indicating if the signature has been used
     */
    function isSignatureUsed(bytes memory signature) external view returns (bool) {
        return usedSignatures[signature];
    }
}

/**
 * @dev Interface for the 0G DA layer contract
 * This would be implemented by the actual 0G DA layer contract
 */
interface IDA0G {
    function storeMintData(
        uint256 tokenId,
        uint256 originalTokenId,
        bytes32 crossChainId,
        address owner,
        uint256 timestamp
    )
        external;

    function storeBurnData(
        uint256 tokenId,
        uint256 originalTokenId,
        bytes32 crossChainId,
        address owner,
        uint256 timestamp
    )
        external;

    function verifyNFTData(uint256 originalTokenId, bytes32 crossChainId, address owner) external view returns (bool);
}
