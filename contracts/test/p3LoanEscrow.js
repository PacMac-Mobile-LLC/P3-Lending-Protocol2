const { expect } = require('chai');
const { ethers } = require('hardhat');

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

describe('P3LoanEscrow', function () {
  async function deployFixture() {
    const [owner, authority, lender, borrower, outsider] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory('ReputationAnchorRegistry');
    const registry = await Registry.deploy(owner.address, authority.address);
    await registry.waitForDeployment();

    const Escrow = await ethers.getContractFactory('P3LoanEscrow');
    const escrow = await Escrow.deploy(await registry.getAddress());
    await escrow.waitForDeployment();

    return { registry, escrow, owner, authority, lender, borrower, outsider };
  }

  async function anchorBorrowerTier(registry, authority, borrower, tier, nonce, expiresAt) {
    const update = {
      subject: borrower.address,
      tier,
      snapshotHash: ethers.keccak256(ethers.toUtf8Bytes(`snapshot-${tier}-${nonce}`)),
      expiresAt,
      nonce,
    };

    const signature = await signUpdate(registry, authority, update);
    await registry.updateReputation(update, signature);
  }

  it('submits and funds a loan with expected events', async function () {
    const { escrow, lender, borrower } = await deployFixture();

    const loanAmount = ethers.parseEther('1');

    await expect(escrow.connect(lender).submitLoan(borrower.address, loanAmount, 2))
      .to.emit(escrow, 'LoanSubmitted')
      .withArgs(1n, borrower.address, lender.address, loanAmount, 2);

    await expect(escrow.connect(lender).fundLoan(1n, { value: loanAmount }))
      .to.emit(escrow, 'LoanFunded')
      .withArgs(1n, lender.address, loanAmount);
  });

  it('rejects funding by non-lender addresses', async function () {
    const { escrow, lender, borrower, outsider } = await deployFixture();

    const loanAmount = ethers.parseEther('1');
    await escrow.connect(lender).submitLoan(borrower.address, loanAmount, 2);

    await expect(escrow.connect(outsider).fundLoan(1n, { value: loanAmount })).to.be.revertedWithCustomError(
      escrow,
      'Unauthorized'
    );
  });

  it('releases funds only when borrower tier satisfies minimum tier', async function () {
    const { registry, escrow, authority, lender, borrower } = await deployFixture();

    const loanAmount = ethers.parseEther('1');
    await escrow.connect(lender).submitLoan(borrower.address, loanAmount, 2);
    await escrow.connect(lender).fundLoan(1n, { value: loanAmount });

    const now = (await ethers.provider.getBlock('latest')).timestamp;
    await anchorBorrowerTier(registry, authority, borrower, 1, 1n, now + 3600);

    await expect(escrow.connect(lender).releaseLoan(1n))
      .to.emit(escrow, 'LoanReleased')
      .withArgs(1n, borrower.address, loanAmount);

    const loan = await escrow.loans(1n);
    expect(loan.status).to.equal(3n); // ACTIVE
  });

  it('rejects release when reputation snapshot is expired', async function () {
    const { registry, escrow, authority, lender, borrower } = await deployFixture();

    const loanAmount = ethers.parseEther('1');
    await escrow.connect(lender).submitLoan(borrower.address, loanAmount, 2);
    await escrow.connect(lender).fundLoan(1n, { value: loanAmount });

    const now = (await ethers.provider.getBlock('latest')).timestamp;
    await anchorBorrowerTier(registry, authority, borrower, 1, 1n, now - 1);

    await expect(escrow.connect(lender).releaseLoan(1n)).to.be.revertedWithCustomError(escrow, 'SnapshotExpired');
  });

  it('emits repayment event and marks loan as REPAID after full repayment', async function () {
    const { registry, escrow, authority, lender, borrower } = await deployFixture();

    const loanAmount = ethers.parseEther('1');
    await escrow.connect(lender).submitLoan(borrower.address, loanAmount, 2);
    await escrow.connect(lender).fundLoan(1n, { value: loanAmount });

    const now = (await ethers.provider.getBlock('latest')).timestamp;
    await anchorBorrowerTier(registry, authority, borrower, 1, 1n, now + 3600);

    await escrow.connect(lender).releaseLoan(1n);

    await expect(escrow.connect(borrower).repayLoan(1n, { value: loanAmount }))
      .to.emit(escrow, 'RepaymentMade')
      .withArgs(1n, borrower.address, loanAmount, true);

    const loan = await escrow.loans(1n);
    expect(loan.status).to.equal(4n); // REPAID
  });

  it('rejects zero-amount loan submission boundary case', async function () {
    const { escrow, lender, borrower } = await deployFixture();

    await expect(escrow.connect(lender).submitLoan(borrower.address, 0, 2)).to.be.revertedWithCustomError(
      escrow,
      'InvalidAmount'
    );
  });
});
