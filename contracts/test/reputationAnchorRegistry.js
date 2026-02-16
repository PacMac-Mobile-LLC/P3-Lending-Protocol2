const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ReputationAnchorRegistry', function () {
  async function deployFixture() {
    const [owner, authority, borrower, attacker] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory('ReputationAnchorRegistry');
    const registry = await Registry.deploy(owner.address, authority.address);
    await registry.waitForDeployment();

    return { registry, owner, authority, borrower, attacker };
  }

  async function signUpdate(registry, authoritySigner, update) {
    const network = await ethers.provider.getNetwork();

    const digest = ethers.solidityPackedKeccak256(
      ['address', 'uint256', 'address', 'uint8', 'bytes32', 'uint64', 'uint256'],
      [
        await registry.getAddress(),
        network.chainId,
        update.subject,
        update.tier,
        update.snapshotHash,
        update.expiresAt,
        update.nonce,
      ]
    );

    return authoritySigner.signMessage(ethers.getBytes(digest));
  }

  it('updates reputation with valid attestation signature', async function () {
    const { registry, authority, borrower } = await deployFixture();

    const now = (await ethers.provider.getBlock('latest')).timestamp;
    const update = {
      subject: borrower.address,
      tier: 1,
      snapshotHash: ethers.keccak256(ethers.toUtf8Bytes('snapshot-1')),
      expiresAt: now + 3600,
      nonce: 1n,
    };

    const signature = await signUpdate(registry, authority, update);

    await expect(registry.updateReputation(update, signature))
      .to.emit(registry, 'ReputationUpdated')
      .withArgs(update.subject, update.tier, update.snapshotHash, update.expiresAt, update.nonce, authority.address);

    const stored = await registry.getReputation(update.subject);
    expect(stored.tier).to.equal(update.tier);
    expect(stored.snapshotHash).to.equal(update.snapshotHash);
    expect(stored.nonce).to.equal(update.nonce);
  });

  it('rejects invalid authority signatures', async function () {
    const { registry, attacker, borrower } = await deployFixture();

    const now = (await ethers.provider.getBlock('latest')).timestamp;
    const update = {
      subject: borrower.address,
      tier: 2,
      snapshotHash: ethers.keccak256(ethers.toUtf8Bytes('snapshot-invalid')),
      expiresAt: now + 3600,
      nonce: 1n,
    };

    const forgedSignature = await signUpdate(registry, attacker, update);

    await expect(registry.updateReputation(update, forgedSignature)).to.be.revertedWithCustomError(
      registry,
      'InvalidAuthoritySignature'
    );
  });

  it('rejects replay attempts for identical attestation digest', async function () {
    const { registry, authority, borrower } = await deployFixture();

    const now = (await ethers.provider.getBlock('latest')).timestamp;
    const update = {
      subject: borrower.address,
      tier: 1,
      snapshotHash: ethers.keccak256(ethers.toUtf8Bytes('snapshot-replay')),
      expiresAt: now + 3600,
      nonce: 1n,
    };

    const signature = await signUpdate(registry, authority, update);

    await registry.updateReputation(update, signature);

    await expect(registry.updateReputation(update, signature)).to.be.revertedWithCustomError(
      registry,
      'NonceNotIncreasing'
    );
  });

  it('rejects stale nonces even with fresh signatures', async function () {
    const { registry, authority, borrower } = await deployFixture();

    const now = (await ethers.provider.getBlock('latest')).timestamp;
    const firstUpdate = {
      subject: borrower.address,
      tier: 1,
      snapshotHash: ethers.keccak256(ethers.toUtf8Bytes('snapshot-first')),
      expiresAt: now + 3600,
      nonce: 2n,
    };

    const secondUpdateWithStaleNonce = {
      subject: borrower.address,
      tier: 0,
      snapshotHash: ethers.keccak256(ethers.toUtf8Bytes('snapshot-second')),
      expiresAt: now + 7200,
      nonce: 2n,
    };

    const firstSig = await signUpdate(registry, authority, firstUpdate);
    const staleSig = await signUpdate(registry, authority, secondUpdateWithStaleNonce);

    await registry.updateReputation(firstUpdate, firstSig);

    await expect(registry.updateReputation(secondUpdateWithStaleNonce, staleSig)).to.be.revertedWithCustomError(
      registry,
      'NonceNotIncreasing'
    );
  });
});
