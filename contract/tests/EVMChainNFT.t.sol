// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/src/Test.sol";
import "../src/EVMChainNFT.sol";

contract EVMChainNFTTest is Test {
    EVMChainNFT public nft;
    address public owner;
    address public user1;
    address public user2;
    address public signer;
    address public da0GAddress;

    uint256 signerPrivateKey = 0xA11CE;

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        signer = vm.addr(signerPrivateKey);
        da0GAddress = address(0xDA06);

        nft = new EVMChainNFT("EVMChainNFT", "EVMNFT", signer, da0GAddress);

        vm.label(owner, "Owner");
        vm.label(user1, "User1");
        vm.label(user2, "User2");
        vm.label(signer, "Signer");
        vm.label(da0GAddress, "DA0G");
    }

    function testMint() public {
        string memory tokenURI = "https://example.com/token/1";
        uint256 tokenId = nft.mint(user1, tokenURI);

        assertEq(nft.ownerOf(tokenId), user1);
        assertEq(nft.tokenURI(tokenId), tokenURI);
        assertEq(tokenId, 1);
        assertEq(nft.getCurrentTokenId(), 2);
    }

    function testUpdateSigner() public {
        address newSigner = address(0x999);

        assertEq(nft.authorizedSigner(), signer);

        nft.updateSigner(newSigner);

        assertEq(nft.authorizedSigner(), newSigner);
    }

    function testUpdateSignerRevertOnZeroAddress() public {
        vm.expectRevert("Invalid signer address");
        nft.updateSigner(address(0));
    }

    function testUpdateDA0GAddress() public {
        address newDA0GAddress = address(0x888);

        assertEq(nft.da0GAddress(), da0GAddress);

        nft.updateDA0GAddress(newDA0GAddress);

        assertEq(nft.da0GAddress(), newDA0GAddress);
    }

    function testUpdateDA0GAddressRevertOnZeroAddress() public {
        vm.expectRevert("Invalid 0G DA address");
        nft.updateDA0GAddress(address(0));
    }

    function testLockAndUnlockNFT() public {
        // Mint a token to user1
        uint256 tokenId = nft.mint(user1, "https://example.com/token/1");

        // Create cross-chain ID and signature
        bytes32 crossChainId = keccak256(abi.encodePacked("cross-chain-id-1"));
        bytes32 message = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encodePacked(tokenId, crossChainId)))
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, message);
        bytes memory signature = abi.encodePacked(r, s, v);

        // User1 approves the NFT contract to transfer the token
        vm.prank(user1);
        nft.approve(address(nft), tokenId);

        // Lock the NFT
        vm.prank(user1);
        nft.lockNFT(tokenId, crossChainId, signature);

        // Verify token is locked
        assertTrue(nft.lockedTokens(tokenId));
        assertEq(nft.tokenToCrossChainId(tokenId), crossChainId);
        assertEq(nft.crossChainIdToToken(crossChainId), tokenId);

        // Unlock the NFT
        vm.prank(user1);
        nft.unlockNFT(tokenId, crossChainId, signature);

        // Verify token is unlocked
        assertFalse(nft.lockedTokens(tokenId));
        assertEq(nft.ownerOf(tokenId), user1);
    }

    function testValidateSignature() public {
        uint256 tokenId = 1;
        bytes32 crossChainId = keccak256(abi.encodePacked("cross-chain-id-1"));

        bytes32 message = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encodePacked(tokenId, crossChainId)))
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, message);
        bytes memory signature = abi.encodePacked(r, s, v);

        bool isValid = nft.validateSignature(tokenId, crossChainId, signature);
        assertTrue(isValid);

        // Test with wrong signer
        uint256 wrongPrivateKey = 0xB0B;
        (v, r, s) = vm.sign(wrongPrivateKey, message);
        bytes memory wrongSignature = abi.encodePacked(r, s, v);

        isValid = nft.validateSignature(tokenId, crossChainId, wrongSignature);
        assertFalse(isValid);
    }

    function testLockNFTRevertIfNotOwnerOrApproved() public {
        uint256 tokenId = nft.mint(user1, "https://example.com/token/1");
        bytes32 crossChainId = keccak256(abi.encodePacked("cross-chain-id-1"));

        bytes32 message = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encodePacked(tokenId, crossChainId)))
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, message);
        bytes memory signature = abi.encodePacked(r, s, v);

        // User2 tries to lock User1's NFT
        vm.prank(user2);
        vm.expectRevert("Not owner or approved");
        nft.lockNFT(tokenId, crossChainId, signature);
    }

    function testLockNFTRevertIfAlreadyLocked() public {
        uint256 tokenId = nft.mint(user1, "https://example.com/token/1");
        bytes32 crossChainId = keccak256(abi.encodePacked("cross-chain-id-1"));

        bytes32 message = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encodePacked(tokenId, crossChainId)))
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, message);
        bytes memory signature = abi.encodePacked(r, s, v);

        // User1 approves and locks the NFT
        vm.startPrank(user1);
        nft.approve(address(nft), tokenId);
        nft.lockNFT(tokenId, crossChainId, signature);

        // Try to lock again
        vm.expectRevert("Token already locked");
        nft.lockNFT(tokenId, crossChainId, signature);
        vm.stopPrank();
    }

    function testUnlockNFTRevertIfNotLocked() public {
        uint256 tokenId = nft.mint(user1, "https://example.com/token/1");
        bytes32 crossChainId = keccak256(abi.encodePacked("cross-chain-id-1"));

        bytes32 message = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encodePacked(tokenId, crossChainId)))
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, message);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Try to unlock a token that's not locked
        vm.prank(user1);
        vm.expectRevert("Token not locked");
        nft.unlockNFT(tokenId, crossChainId, signature);
    }

    function testTransferRevertIfTokenLocked() public {
        uint256 tokenId = nft.mint(user1, "https://example.com/token/1");
        bytes32 crossChainId = keccak256(abi.encodePacked("cross-chain-id-1"));

        bytes32 message = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encodePacked(tokenId, crossChainId)))
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, message);
        bytes memory signature = abi.encodePacked(r, s, v);

        // User1 approves and locks the NFT
        vm.startPrank(user1);
        nft.approve(address(nft), tokenId);
        nft.lockNFT(tokenId, crossChainId, signature);

        // Try to transfer the locked token
        vm.expectRevert("Token is locked");
        nft.transferFrom(user1, user2, tokenId);
        vm.stopPrank();
    }
}
