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
  on: (event: string, callback: (user?: any) => void) => {
    netlifyIdentity.on(event as any, callback as any);
  },

  off: (event: string, callback: (user?: any) => void) => {
    netlifyIdentity.off(event as any, callback as any);
  }
};
