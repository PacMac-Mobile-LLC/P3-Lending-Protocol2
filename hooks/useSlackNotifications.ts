import { sendSlackNotification, SlackField } from '../client-services/slackService';

export const useSlackNotifications = () => {

  const notifyLoanCreated = async (loan: { id: string; amount: number; purpose: string; borrower: string }) => {
    return sendSlackNotification({
      title: 'New Loan Request Created',
      text: `A new loan request for $${loan.amount} is available in the marketplace.`,
      type: 'info',
      fields: [
        { title: 'Loan ID', value: loan.id, short: true },
        { title: 'Amount', value: `$${loan.amount}`, short: true },
        { title: 'Borrower', value: loan.borrower, short: true },
        { title: 'Purpose', value: loan.purpose, short: true }
      ]
    });
  };

  const notifyLoanFunded = async (loan: { id: string; amount: number; lender: string }) => {
    return sendSlackNotification({
      title: 'Loan Funded! 🚀',
      text: `Loan #${loan.id} has been successfully funded.`,
      type: 'success',
      fields: [
        { title: 'Loan ID', value: loan.id, short: true },
        { title: 'Amount', value: `$${loan.amount}`, short: true },
        { title: 'Lender', value: loan.lender, short: true }
      ]
    });
  };

  const notifySecurityAlert = async (alert: { type: string; description: string; userId: string }) => {
    return sendSlackNotification({
      title: '🚨 Security Alert',
      text: alert.description,
      type: 'error',
      fields: [
        { title: 'Alert Type', value: alert.type, short: true },
        { title: 'User ID', value: alert.userId, short: true },
        { title: 'Time', value: new Date().toISOString(), short: false }
      ]
    });
  };

  const notifyTipSent = async (tip: { from: string; to: string; amount: number; message?: string }) => {
    return sendSlackNotification({
      title: 'Micro-Tip Sent 💸',
      text: `${tip.from} sent a tip to ${tip.to}`,
      type: 'success',
      fields: [
        { title: 'Amount', value: `${tip.amount} ETH`, short: true },
        { title: 'Message', value: tip.message || 'No message', short: true }
      ]
    });
  };

  return {
    notifyLoanCreated,
    notifyLoanFunded,
    notifySecurityAlert,
    notifyTipSent
  };
};
