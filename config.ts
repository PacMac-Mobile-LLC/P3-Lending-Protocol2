export const CONFIG = {
  // Replace these with your actual Project IDs from Infura/WalletConnect
  INFURA_PROJECT_ID: '6b945ed6e0494a1c9ce16b118cd60aac', 
  WALLETCONNECT_PROJECT_ID: '92c5c0de4b96efe5c4b54dfa66874c19',
  APP_URL: window.location.origin,
  APP_NAME: 'P3 Lending Dashboard',
  SUPPORTED_CHAINS: [1, 5, 11155111], // Mainnet, Goerli, Sepolia

  // Slack Integration
  SLACK_WEBHOOK_URL: '', // https://hooks.slack.com/services/...
  SLACK_CHANNEL: '#p3-lending',
  SLACK_USERNAME: 'P3 Lending Bot',
  SLACK_ICON_EMOJI: ':robot_face:'
};