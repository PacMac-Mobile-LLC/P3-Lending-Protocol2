import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface TutorialStep {
    title: string;
    description: string;
    image?: string;
    tips?: string[];
    action?: string;
}

const tutorialSteps: TutorialStep[] = [
    {
        title: "Welcome to P3 Lending Protocol",
        description: "P3 is a decentralized peer-to-peer lending platform that connects borrowers with lenders using blockchain technology. This tutorial will guide you through all the features.",
        tips: [
            "Secure, transparent lending on the blockchain",
            "No traditional banks or credit checks required",
            "Competitive interest rates set by the market"
        ]
    },
    {
        title: "Getting Started: Connect Your Wallet",
        description: "To use P3, you'll need a Web3 wallet like MetaMask. Click 'Connect Wallet' in the top right corner to get started.",
        action: "Connect your MetaMask wallet",
        tips: [
            "Make sure you have MetaMask installed",
            "Switch to the Ethereum mainnet",
            "Keep some ETH for gas fees"
        ]
    },
    {
        title: "Add Funds to Your Account",
        description: "Before you can lend or borrow, you need to deposit funds. Click 'Add Funds' in your profile to deposit USD via credit card.",
        action: "Navigate to Profile → Add Funds",
        tips: [
            "Minimum deposit: $10",
            "Funds are instantly available",
            "Secure payment processing via Stripe"
        ]
    },
    {
        title: "Browse Available Loans",
        description: "Visit the Marketplace to see loan requests from borrowers. Each loan shows the amount, interest rate, duration, and borrower's reputation score.",
        action: "Go to Marketplace",
        tips: [
            "Filter by amount, rate, or duration",
            "Check borrower reputation scores",
            "Review loan terms carefully"
        ]
    },
    {
        title: "Fund a Loan (For Lenders)",
        description: "Found a loan you want to fund? Click 'Fund Loan' to sponsor a borrower. Your funds will be locked until the loan is repaid.",
        action: "Click 'Fund Loan' on any request",
        tips: [
            "Earn interest on your investment",
            "Loans are secured on the blockchain",
            "Track repayment progress in real-time"
        ]
    },
    {
        title: "Request a Loan (For Borrowers)",
        description: "Need funds? Click 'Request Loan' to create a loan request. Set your amount, interest rate, and repayment terms.",
        action: "Click 'Request Loan' button",
        tips: [
            "Be realistic with your terms",
            "Higher reputation = better rates",
            "Explain your use case clearly"
        ]
    },
    {
        title: "Manage Your Loans",
        description: "View all your active loans in your Profile. Track repayment schedules, make payments, and monitor your lending portfolio.",
        action: "Go to Profile → Active Loans",
        tips: [
            "Set up auto-payments to avoid late fees",
            "Early repayment is always allowed",
            "Late payments affect your reputation"
        ]
    },
    {
        title: "Build Your Reputation",
        description: "Your reputation score increases when you repay loans on time. A higher score unlocks better interest rates and larger loan amounts.",
        tips: [
            "Start with smaller loans to build trust",
            "Always repay on time",
            "Reputation is stored on the blockchain"
        ]
    },
    {
        title: "Trading Dashboard (Beta)",
        description: "Access real-time crypto market data and trading tools. Monitor prices, analyze trends, and make informed decisions.",
        action: "Navigate to Trading Dashboard",
        tips: [
            "Live price feeds from CoinGecko",
            "Technical analysis tools included",
            "Educational resources available"
        ]
    },
    {
        title: "Security & Best Practices",
        description: "P3 uses blockchain technology for maximum security, but you should also follow these best practices:",
        tips: [
            "Never share your private keys",
            "Enable 2FA on your wallet",
            "Only borrow what you can repay",
            "Diversify your lending portfolio",
            "Keep your wallet software updated"
        ]
    },
    {
        title: "Need Help?",
        description: "Our Knowledge Base and customer support are here to help you succeed on the P3 platform.",
        action: "Visit Knowledge Base or contact support",
        tips: [
            "Knowledge Base: Detailed guides and FAQs",
            "Live Chat: Available 24/7",
            "Email: support@p3lending.com",
            "Community: Join our Discord"
        ]
    }
];

export const DemoTutorial: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    const handleNext = () => {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
        if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        onClose();
    };

    const step = tutorialSteps[currentStep];
    const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-emerald-500/20">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 relative">
                    <button
                        onClick={handleSkip}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold text-white mb-2">P3 Lending Protocol Tutorial</h2>
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                        <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
                        <div className="flex-1 bg-white/20 rounded-full h-2 ml-4">
                            <div
                                className="bg-white rounded-full h-2 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-gray-300 text-lg mb-6 leading-relaxed">{step.description}</p>

                    {step.action && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                                <Check className="w-5 h-5" />
                                <span>Action Required:</span>
                            </div>
                            <p className="text-gray-300">{step.action}</p>
                        </div>
                    )}

                    {step.tips && step.tips.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-white mb-3">Key Points:</h4>
                            {step.tips.map((tip, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    <p className="text-gray-300">{tip}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-800/50 p-6 border-t border-gray-700 flex items-center justify-between">
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Previous
                    </button>

                    <div className="flex gap-2">
                        {tutorialSteps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentStep(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentStep
                                        ? 'bg-emerald-500 w-8'
                                        : completedSteps.has(index)
                                            ? 'bg-emerald-500/50'
                                            : 'bg-gray-600'
                                    }`}
                            />
                        ))}
                    </div>

                    {currentStep === tutorialSteps.length - 1 ? (
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all"
                        >
                            Get Started
                            <Check className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all"
                        >
                            Next
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
