// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IReputationAnchorRegistry {
    function getTier(address subject) external view returns (uint8);
    function isExpired(address subject) external view returns (bool);
}

contract P3LoanEscrow {
    enum LoanStatus {
        NONE,
        SUBMITTED,
        FUNDED,
        ACTIVE,
        REPAID
    }

    struct Loan {
        uint256 id;
        address borrower;
        address lender;
        uint256 amount;
        uint8 minTier;
        LoanStatus status;
        uint256 repaidAmount;
    }

    IReputationAnchorRegistry public immutable registry;

    mapping(uint256 => Loan) public loans;
    uint256 public nextLoanId;

    event LoanSubmitted(uint256 indexed loanId, address indexed borrower, address indexed lender, uint256 amount, uint8 minTier);
    event LoanFunded(uint256 indexed loanId, address indexed lender, uint256 amount);
    event LoanReleased(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event RepaymentMade(uint256 indexed loanId, address indexed borrower, uint256 amount, bool isFull);

    error InvalidBorrower();
    error InvalidAmount();
    error InvalidLoanState();
    error Unauthorized();
    error TierTooLow();
    error SnapshotExpired();
    error TransferFailed();

    constructor(address registryAddress) {
        require(registryAddress != address(0), "Registry cannot be zero address.");
        registry = IReputationAnchorRegistry(registryAddress);
        nextLoanId = 1;
    }

    function submitLoan(address borrower, uint256 amount, uint8 minTier) external returns (uint256 loanId) {
        if (borrower == address(0)) revert InvalidBorrower();
        if (amount == 0) revert InvalidAmount();

        loanId = nextLoanId++;

        loans[loanId] = Loan({
            id: loanId,
            borrower: borrower,
            lender: msg.sender,
            amount: amount,
            minTier: minTier,
            status: LoanStatus.SUBMITTED,
            repaidAmount: 0
        });

        emit LoanSubmitted(loanId, borrower, msg.sender, amount, minTier);
    }

    function fundLoan(uint256 loanId) external payable {
        Loan storage loan = loans[loanId];

        if (loan.status != LoanStatus.SUBMITTED) revert InvalidLoanState();
        if (msg.sender != loan.lender) revert Unauthorized();
        if (msg.value != loan.amount) revert InvalidAmount();

        loan.status = LoanStatus.FUNDED;

        emit LoanFunded(loanId, msg.sender, msg.value);
    }

    function releaseLoan(uint256 loanId) external {
        Loan storage loan = loans[loanId];

        if (loan.status != LoanStatus.FUNDED) revert InvalidLoanState();
        if (msg.sender != loan.lender) revert Unauthorized();

        uint8 currentTier = registry.getTier(loan.borrower);

        if (currentTier > loan.minTier) revert TierTooLow();
        if (registry.isExpired(loan.borrower)) revert SnapshotExpired();

        loan.status = LoanStatus.ACTIVE;

        (bool ok, ) = payable(loan.borrower).call{value: loan.amount}("");
        if (!ok) revert TransferFailed();

        emit LoanReleased(loanId, loan.borrower, loan.amount);
    }

    function repayLoan(uint256 loanId) external payable {
        Loan storage loan = loans[loanId];

        if (loan.status != LoanStatus.ACTIVE) revert InvalidLoanState();
        if (msg.sender != loan.borrower) revert Unauthorized();
        if (msg.value == 0) revert InvalidAmount();

        loan.repaidAmount += msg.value;
        bool isFullyRepaid = loan.repaidAmount >= loan.amount;

        emit RepaymentMade(loanId, msg.sender, msg.value, isFullyRepaid);

        if (isFullyRepaid) {
            loan.status = LoanStatus.REPAID;
            uint256 payout = loan.repaidAmount;
            loan.repaidAmount = 0;

            (bool ok, ) = payable(loan.lender).call{value: payout}("");
            if (!ok) revert TransferFailed();
        }
    }
}
