// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract ReputationAnchorRegistry is Ownable {
    using ECDSA for bytes32;

    struct ReputationRecord {
        uint8 tier;
        bytes32 snapshotHash;
        uint64 expiresAt;
        uint256 nonce;
    }

    struct UpdateRequest {
        address subject;
        uint8 tier;
        bytes32 snapshotHash;
        uint64 expiresAt;
        uint256 nonce;
    }

    mapping(address => ReputationRecord) private records;
    mapping(bytes32 => bool) public usedDigests;

    address public authoritySigner;

    event AuthoritySignerUpdated(address indexed previousSigner, address indexed newSigner);
    event ReputationUpdated(
        address indexed subject,
        uint8 tier,
        bytes32 snapshotHash,
        uint64 expiresAt,
        uint256 nonce,
        address indexed signer
    );

    error InvalidSubject();
    error InvalidAuthoritySignature();
    error ReplayDetected();
    error NonceNotIncreasing();

    constructor(address initialOwner, address initialAuthoritySigner) Ownable(initialOwner) {
        require(initialAuthoritySigner != address(0), "Authority signer cannot be zero address.");
        authoritySigner = initialAuthoritySigner;
    }

    function setAuthoritySigner(address newAuthoritySigner) external onlyOwner {
        require(newAuthoritySigner != address(0), "Authority signer cannot be zero address.");
        address previous = authoritySigner;
        authoritySigner = newAuthoritySigner;
        emit AuthoritySignerUpdated(previous, newAuthoritySigner);
    }

    function getReputation(address subject) external view returns (ReputationRecord memory) {
        return records[subject];
    }

    function getTier(address subject) external view returns (uint8) {
        return records[subject].tier;
    }

    function getSnapshotHash(address subject) external view returns (bytes32) {
        return records[subject].snapshotHash;
    }

    function isExpired(address subject) external view returns (bool) {
        uint64 expiresAt = records[subject].expiresAt;
        return expiresAt != 0 && expiresAt < block.timestamp;
    }

    function updateReputation(UpdateRequest calldata req, bytes calldata signature) external {
        if (req.subject == address(0)) {
            revert InvalidSubject();
        }

        ReputationRecord storage current = records[req.subject];

        if (req.nonce <= current.nonce) {
            revert NonceNotIncreasing();
        }

        bytes32 digest = _computeDigest(req);

        if (usedDigests[digest]) {
            revert ReplayDetected();
        }

        bytes32 ethSignedDigest = MessageHashUtils.toEthSignedMessageHash(digest);
        address recoveredSigner = ethSignedDigest.recover(signature);

        if (recoveredSigner != authoritySigner) {
            revert InvalidAuthoritySignature();
        }

        usedDigests[digest] = true;

        current.tier = req.tier;
        current.snapshotHash = req.snapshotHash;
        current.expiresAt = req.expiresAt;
        current.nonce = req.nonce;

        emit ReputationUpdated(req.subject, req.tier, req.snapshotHash, req.expiresAt, req.nonce, recoveredSigner);
    }

    function computeDigest(UpdateRequest calldata req) external view returns (bytes32) {
        return _computeDigest(req);
    }

    function _computeDigest(UpdateRequest calldata req) internal view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                address(this),
                block.chainid,
                req.subject,
                req.tier,
                req.snapshotHash,
                req.expiresAt,
                req.nonce
            )
        );
    }
}
