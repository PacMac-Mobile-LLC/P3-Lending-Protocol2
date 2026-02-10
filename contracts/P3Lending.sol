// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title P3Lending
 * @dev Simple lending vault for P3 Protocol. 
 *      Allows lenders to fund loans and borrowers to repay.
 *      NOTE: This is a simplified version for hackathon/demo purposes.
 */
contract P3Lending {
    
    struct Loan {
        uint256 id;
        address borrower;
        address lender;
        uint256 amount;
        uint256 interestRate;
        uint256 duration;
        uint256 startTime;
        bool isFunded;
        bool isRepaid;
    }

    mapping(uint256 => Loan) public loans;
    uint256 public nextLoanId;

    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanFunded(uint256 indexed loanId, address indexed lender, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, address indexed payer, uint256 amount);

    /**
     * @dev Create a loan request (on-chain record).
     */
    function createLoanRequest(uint256 amount, uint256 interestRate, uint256 duration) external {
        loans[nextLoanId] = Loan({
            id: nextLoanId,
            borrower: msg.sender,
            lender: address(0),
            amount: amount,
            interestRate: interestRate,
            duration: duration,
            startTime: 0,
            isFunded: false,
            isRepaid: false
        });

        emit LoanCreated(nextLoanId, msg.sender, amount);
        nextLoanId++;
    }

    /**
     * @dev Fund a specific loan. Lender sends ETH impacting the loan amount.
     */
    function fundLoan(uint256 loanId) external payable {
        Loan storage loan = loans[loanId];
        require(loan.borrower != address(0), "Loan does not exist");
        require(!loan.isFunded, "Loan already funded");
        require(msg.value == loan.amount, "Incorrect ETH amount sent");

        loan.lender = msg.sender;
        loan.isFunded = true;
        loan.startTime = block.timestamp;

        // Transfer funds to borrower immediately
        payable(loan.borrower).transfer(msg.value);

        emit LoanFunded(loanId, msg.sender, msg.value);
    }

    /**
     * @dev Repay a loan. Borrower sends ETH + Interest.
     */
    function repayLoan(uint256 loanId) external payable {
        Loan storage loan = loans[loanId];
        require(loan.isFunded, "Loan not funded");
        require(!loan.isRepaid, "Loan already repaid");

        // Calculate simple interest: Principal + (Principal * Rate / 100)
        // In production, use precise math libraries
        uint256 repaymentAmount = loan.amount + (loan.amount * loan.interestRate / 100);
        require(msg.value >= repaymentAmount, "Insufficient repayment amount");

        loan.isRepaid = true;

        // Transfer funds to lender
        payable(loan.lender).transfer(msg.value);

        emit LoanRepaid(loanId, msg.sender, msg.value);
    }

    /**
     * @dev Fallback to receive ETH
     */
    receive() external payable {}
}
