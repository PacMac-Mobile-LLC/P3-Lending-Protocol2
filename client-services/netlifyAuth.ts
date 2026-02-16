import netlifyIdentity from 'netlify-identity-widget';

export const AuthService = {
  init: () => {
    netlifyIdentity.init();
  },

  open: (tab: 'login' | 'signup' = 'login') => {
    netlifyIdentity.open(tab);
  },

  close: () => {
    netlifyIdentity.close();
  },

  logout: () => {
    netlifyIdentity.logout();
  },

  currentUser: () => {
    return netlifyIdentity.currentUser();
  },

  // Event Listeners
  on: (event: 'login' | 'logout' | 'init' | 'error' | 'open' | 'close', callback: (user?: any) => void) => {
    netlifyIdentity.on(event, callback);
  },

  off: (event: 'login' | 'logout' | 'init' | 'error' | 'open' | 'close', callback: (user?: any) => void) => {
    netlifyIdentity.off(event, callback);
  }
};