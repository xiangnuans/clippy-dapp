// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title ZeroGDA
 * @dev Implementation of 0G Data Availability Layer for cross-chain NFT transfers
 */
contract ZeroGDA is Ownable, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;

    // Events
    event DataStored(bytes32 dataHash, bytes32 indexed crossChainId, address indexed chain);
    event DataVerified(bytes32 dataHash, bytes32 indexed crossChainId, bool result);
    event NodeAdded(address indexed node, string nodeUrl);
    event NodeRemoved(address indexed node);
    event ChainAdded(address indexed chain, string chainName);
    event ChainRemoved(address indexed chain);
    event NodeRewardDistributed(address indexed node, uint256 amount);
    event DataChallenged(bytes32 dataHash, address indexed challenger);
    event DataChallengeSolved(bytes32 dataHash, bool validated);

    // Struct to store NFT cross-chain data
    struct NFTData {
        uint256 originalTokenId;
        uint256 targetTokenId;
        address originalChain;
        address targetChain;
        address owner;
        bytes32 crossChainId;
        uint256 timestamp;
        bool verified;
        bool exists;
    }

    // Struct to store DA node information
    struct DANode {
        string url;
        uint256 stakedAmount;
        uint256 dataCount;
        bool active;
    }

    // Struct for chain information
    struct ChainInfo {
        string name;
        bool active;
    }

    // Authorized DA nodes
    mapping(address => DANode) public daNodes;
    address[] public nodeList;

    // Registered blockchain networks
    mapping(address => ChainInfo) public registeredChains;
    address[] public chainList;

    // NFT data storage (dataHash => NFTData)
    mapping(bytes32 => NFTData) public nftDataStore;

    // Cross-chain ID to data hash mapping
    mapping(bytes32 => bytes32) public crossChainToDataHash;

    // Data hash to availability proofs mapping (dataHash => nodeAddress => proof)
    mapping(bytes32 => mapping(address => bytes32)) public dataProofs;

    // Data challenges tracking
    mapping(bytes32 => bool) public challengedData;

    // Minimum number of nodes required for data verification
    uint256 public minVerificationNodes;

    // Minimum stake required for DA nodes
    uint256 public minNodeStake;

    // Reward per data verification
    uint256 public verificationReward;

    /**
     * @dev Constructor initializes the 0G DA contract with default parameters
     * @param _minVerificationNodes Minimum number of nodes required for data verification
     * @param _minNodeStake Minimum stake required for DA nodes
     * @param _verificationReward Reward per data verification
     */
    constructor(
        uint256 _minVerificationNodes,
        uint256 _minNodeStake,
        uint256 _verificationReward
    )
        Ownable(msg.sender)
    {
        minVerificationNodes = _minVerificationNodes;
        minNodeStake = _minNodeStake;
        verificationReward = _verificationReward;
    }

    /**
     * @dev Updates the minimum number of nodes required for data verification
     * @param _minVerificationNodes New minimum number of nodes
     */
    function updateMinVerificationNodes(uint256 _minVerificationNodes) external onlyOwner {
        require(_minVerificationNodes > 0, "Min nodes must be greater than 0");
        minVerificationNodes = _minVerificationNodes;
    }

    /**
     * @dev Updates the minimum stake required for DA nodes
     * @param _minNodeStake New minimum stake
     */
    function updateMinNodeStake(uint256 _minNodeStake) external onlyOwner {
        minNodeStake = _minNodeStake;
    }

    /**
     * @dev Updates the reward per data verification
     * @param _verificationReward New verification reward
     */
    function updateVerificationReward(uint256 _verificationReward) external onlyOwner {
        verificationReward = _verificationReward;
    }

    /**
     * @dev Pauses all contract functions
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses all contract functions
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Registers a new DA node
     * @param nodeUrl URL of the DA node
     */
    function registerNode(string memory nodeUrl) external payable nonReentrant whenNotPaused {
        require(msg.value >= minNodeStake, "Insufficient stake");
        require(bytes(nodeUrl).length > 0, "Empty URL not allowed");
        require(!daNodes[msg.sender].active, "Node already registered");

        daNodes[msg.sender] = DANode({ url: nodeUrl, stakedAmount: msg.value, dataCount: 0, active: true });

        nodeList.push(msg.sender);

        emit NodeAdded(msg.sender, nodeUrl);
    }

    /**
     * @dev Removes a DA node
     * @param nodeAddress Address of the node to remove
     */
    function removeNode(address nodeAddress) external nonReentrant {
        require(msg.sender == nodeAddress || msg.sender == owner(), "Unauthorized");
        require(daNodes[nodeAddress].active, "Node not active");

        // Transfer staked amount back to node owner
        uint256 stakedAmount = daNodes[nodeAddress].stakedAmount;
        daNodes[nodeAddress].active = false;
        daNodes[nodeAddress].stakedAmount = 0;

        // Transfer stake back to node owner
        (bool success,) = nodeAddress.call{ value: stakedAmount }("");
        require(success, "Transfer failed");

        emit NodeRemoved(nodeAddress);
    }

    /**
     * @dev Adds a new blockchain network
     * @param chainAddress Contract address representing the chain
     * @param chainName Name of the chain
     */
    function addChain(address chainAddress, string memory chainName) external onlyOwner {
        require(chainAddress != address(0), "Invalid chain address");
        require(bytes(chainName).length > 0, "Empty name not allowed");
        require(!registeredChains[chainAddress].active, "Chain already registered");

        registeredChains[chainAddress] = ChainInfo({ name: chainName, active: true });

        chainList.push(chainAddress);

        emit ChainAdded(chainAddress, chainName);
    }

    /**
     * @dev Removes a blockchain network
     * @param chainAddress Contract address of the chain to remove
     */
    function removeChain(address chainAddress) external onlyOwner {
        require(registeredChains[chainAddress].active, "Chain not active");

        registeredChains[chainAddress].active = false;

        emit ChainRemoved(chainAddress);
    }

    /**
     * @dev Stores NFT data for cross-chain transfer
     * @param originalTokenId Token ID on the original chain
     * @param targetTokenId Token ID on the target chain (0 if not yet minted)
     * @param originalChain Address of the original chain contract
     * @param targetChain Address of the target chain contract
     * @param owner Address of the NFT owner
     * @param crossChainId Cross-chain identifier for tracking
     * @return dataHash Hash of the stored data
     */
    function storeNFTData(
        uint256 originalTokenId,
        uint256 targetTokenId,
        address originalChain,
        address targetChain,
        address owner,
        bytes32 crossChainId
    )
        external
        nonReentrant
        whenNotPaused
        returns (bytes32)
    {
        require(registeredChains[msg.sender].active, "Caller not a registered chain");
        require(registeredChains[originalChain].active, "Original chain not registered");
        require(registeredChains[targetChain].active, "Target chain not registered");
        require(owner != address(0), "Invalid owner address");
        require(crossChainId != bytes32(0), "Invalid cross-chain ID");

        // Create data hash
        bytes32 dataHash = keccak256(
            abi.encodePacked(
                originalTokenId, targetTokenId, originalChain, targetChain, owner, crossChainId, block.timestamp
            )
        );

        // Ensure data hash is unique
        require(nftDataStore[dataHash].exists == false, "Data hash already exists");

        // Store NFT data
        nftDataStore[dataHash] = NFTData({
            originalTokenId: originalTokenId,
            targetTokenId: targetTokenId,
            originalChain: originalChain,
            targetChain: targetChain,
            owner: owner,
            crossChainId: crossChainId,
            timestamp: block.timestamp,
            verified: false,
            exists: true
        });

        // Map cross-chain ID to data hash
        crossChainToDataHash[crossChainId] = dataHash;

        emit DataStored(dataHash, crossChainId, msg.sender);

        return dataHash;
    }

    /**
     * @dev Updates the target token ID after minting on target chain
     * @param crossChainId Cross-chain identifier
     * @param targetTokenId New target token ID
     */
    function updateTargetTokenId(bytes32 crossChainId, uint256 targetTokenId) external nonReentrant whenNotPaused {
        require(registeredChains[msg.sender].active, "Caller not a registered chain");

        bytes32 dataHash = crossChainToDataHash[crossChainId];
        require(dataHash != bytes32(0), "Cross-chain ID not found");
        require(nftDataStore[dataHash].exists, "Data not found");
        require(nftDataStore[dataHash].targetChain == msg.sender, "Not the target chain");

        // Update target token ID
        nftDataStore[dataHash].targetTokenId = targetTokenId;
    }

    /**
     * @dev Provides proof of data availability from a DA node
     * @param dataHash Hash of the data
     * @param proof Proof of data availability
     */
    function provideDataProof(bytes32 dataHash, bytes32 proof) external nonReentrant whenNotPaused {
        require(daNodes[msg.sender].active, "Not an active DA node");
        require(nftDataStore[dataHash].exists, "Data not found");

        // Store the proof
        dataProofs[dataHash][msg.sender] = proof;

        // Increment node data count
        daNodes[msg.sender].dataCount++;

        // Distribute reward to the node
        distributeReward(msg.sender);
    }

    /**
     * @dev Verifies data availability for a cross-chain operation
     * @param crossChainId Cross-chain identifier
     * @return result Boolean indicating if verification was successful
     * @return dataHash Hash of the verified data
     */
    function verifyData(bytes32 crossChainId) external view returns (bool result, bytes32 dataHash) {
        dataHash = crossChainToDataHash[crossChainId];
        require(dataHash != bytes32(0), "Cross-chain ID not found");
        require(nftDataStore[dataHash].exists, "Data not found");

        // Count how many nodes have provided proofs
        uint256 proofCount = 0;
        for (uint256 i = 0; i < nodeList.length; i++) {
            address node = nodeList[i];
            if (daNodes[node].active && dataProofs[dataHash][node] != bytes32(0)) {
                proofCount++;
            }
        }

        // Verify if enough nodes have provided proofs
        result = proofCount >= minVerificationNodes && !challengedData[dataHash];

        return (result, dataHash);
    }

    /**
     * @dev Challenges data validity
     * @param dataHash Hash of the data to challenge
     * @param evidence Evidence supporting the challenge
     */
    function challengeData(bytes32 dataHash, bytes memory evidence) external nonReentrant whenNotPaused {
        require(nftDataStore[dataHash].exists, "Data not found");
        require(!challengedData[dataHash], "Data already challenged");

        // Mark data as challenged
        challengedData[dataHash] = true;

        emit DataChallenged(dataHash, msg.sender);

        // Logic to process the challenge would go here
        // This could involve a dispute resolution mechanism
    }

    /**
     * @dev Resolves a data challenge
     * @param dataHash Hash of the challenged data
     * @param validated Whether the data was validated after challenge
     */
    function resolveChallenge(bytes32 dataHash, bool validated) external onlyOwner {
        require(challengedData[dataHash], "Data not challenged");

        // If validated, remove challenge flag
        // If not validated, data remains challenged
        if (validated) {
            challengedData[dataHash] = false;
        }

        emit DataChallengeSolved(dataHash, validated);
    }

    /**
     * @dev Distributes reward to a DA node
     * @param nodeAddress Address of the node to reward
     */
    function distributeReward(address nodeAddress) internal {
        // Simple reward distribution
        // In a real implementation, this could be more complex
        // For example, based on quality of service, uptime, etc.

        // Emit event for reward distribution
        emit NodeRewardDistributed(nodeAddress, verificationReward);

        // Actual token transfer would happen here in a real implementation
    }

    /**
     * @dev Gets the total number of registered DA nodes
     * @return count Total number of nodes
     */
    function getNodeCount() external view returns (uint256 count) {
        return nodeList.length;
    }

    /**
     * @dev Gets the total number of registered chains
     * @return count Total number of chains
     */
    function getChainCount() external view returns (uint256 count) {
        return chainList.length;
    }

    /**
     * @dev Gets the complete NFT data by cross-chain ID
     * @param crossChainId Cross-chain identifier
     * @return data NFT data structure
     */
    function getNFTDataByChainId(bytes32 crossChainId) external view returns (NFTData memory data) {
        bytes32 dataHash = crossChainToDataHash[crossChainId];
        require(dataHash != bytes32(0), "Cross-chain ID not found");

        return nftDataStore[dataHash];
    }

    /**
     * @dev Gets the complete NFT data by data hash
     * @param dataHash Hash of the data
     * @return data NFT data structure
     */
    function getNFTDataByHash(bytes32 dataHash) external view returns (NFTData memory data) {
        require(nftDataStore[dataHash].exists, "Data not found");

        return nftDataStore[dataHash];
    }

    /**
     * @dev Checks if a DA node has provided proof for specific data
     * @param dataHash Hash of the data
     * @param nodeAddress Address of the node
     * @return hasProof Boolean indicating if the node provided a proof
     * @return proof The proof provided by the node
     */
    function checkNodeProof(
        bytes32 dataHash,
        address nodeAddress
    )
        external
        view
        returns (bool hasProof, bytes32 proof)
    {
        require(nftDataStore[dataHash].exists, "Data not found");

        proof = dataProofs[dataHash][nodeAddress];
        hasProof = proof != bytes32(0);

        return (hasProof, proof);
    }

    /**
     * @dev Fallback function to receive Ether
     */
    receive() external payable { }

    /**
     * @dev Fallback function to receive Ether via data
     */
    fallback() external payable { }
}
