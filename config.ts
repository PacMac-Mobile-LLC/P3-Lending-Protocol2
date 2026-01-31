export const CONFIG = {
  // Replace these with your actual Project IDs from Infura/WalletConnect
  INFURA_PROJECT_ID: '00000000000000000000000000000000', 
  WALLETCONNECT_PROJECT_ID: '00000000000000000000000000000000',
  APP_URL: window.location.origin,
  APP_NAME: 'P3 Lending Protocol',
  SUPPORTED_CHAINS: [1, 5, 11155111], // Mainnet, Goerli, Sepolia

  // Slack Integration
  SLACK_WEBHOOK_URL: '', // https://hooks.slack.com/services/...
  SLACK_CHANNEL: '#p3-lending',
  SLACK_USERNAME: 'P3 Lending Bot',
  SLACK_ICON_EMOJI: ':robot_face:'
};
