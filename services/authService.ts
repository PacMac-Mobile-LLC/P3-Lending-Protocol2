
import { frontendEnv } from './env';

// services/authService.ts

declare global {
  interface Window {
    google?: any;
  }
}

// Keep track of the login callback for Demo Mode bypass
let storedOnLogin: ((user: any) => void) | null = null;

export const GoogleAuthService = {
  // Initialize the Google Identity Services Client
  init: (onLogin: (user: any) => void) => {
    storedOnLogin = onLogin;

    if (!window.google) {
      // Script loading is handled in index.html, but if offline or blocked:
      return;
    }

    try {
      const clientId = frontendEnv.VITE_GOOGLE_CLIENT_ID;
      
      console.log("AuthService Init - Client ID Status:", clientId ? "Present" : "Missing");

      // Note: We don't error block here in init, we block in renderButton to allow for graceful UI fallback
      if (clientId && clientId !== 'undefined' && clientId !== '') {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response.credential) {
              const userProfile = parseJwt(response.credential);
              
              // Normalize to match the structure the app expects
              const appUser = {
                id: userProfile.sub, // Google unique ID
                email: userProfile.email,
                user_metadata: {
                  full_name: userProfile.name,
                  avatar_url: userProfile.picture
                },
                token: response.credential
              };
              
              onLogin(appUser);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });
      }
    } catch (e) {
      console.error("Google Auth Init Error:", e);
    }
  },

  // Render the official "Sign in with Google" button
  renderButton: (elementId: string) => {
    const el = document.getElementById(elementId);
    if (!el) return; // Element not ready

    // Check if initialized before rendering
    const clientId = frontendEnv.VITE_GOOGLE_CLIENT_ID;

    if (!clientId || clientId === 'undefined' || clientId === '') {
        console.warn("AuthService: Render skipped due to missing Client ID");
        el.innerHTML = `
          <div style="color: #ef4444; font-family: sans-serif; font-size: 12px; text-align: center; background: rgba(239, 68, 68, 0.1); padding: 16px; border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.2);">
              <strong style="display:block; margin-bottom:6px; font-size: 13px;">Configuration Missing</strong>
              <span style="opacity: 0.8; display:block; margin-bottom: 8px;">Google Client ID not found.</span>
              <div style="font-size: 10px; opacity: 0.6; font-family: monospace; margin-bottom: 12px; background: rgba(0,0,0,0.3); padding: 4px; rounded;">
                 Set CLIENT_ID in .env & restart
              </div>
              <button id="demo-bypass-btn" style="width: 100%; padding: 10px; background: #00e599; color: black; border: none; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: bold; transition: opacity 0.2s;">
                Enter Demo Mode &rarr;
              </button>
          </div>
        `;
        
        // Attach listener for the bypass button
        setTimeout(() => {
            const btn = document.getElementById('demo-bypass-btn');
            if (btn) {
                btn.onclick = () => {
                    if (storedOnLogin) {
                        console.log("Entering Demo Mode...");
                        storedOnLogin({
                            email: 'demo@p3lending.space',
                            id: 'demo-user-123',
                            user_metadata: {
                                full_name: 'Demo User',
                                avatar_url: ''
                            }
                        });
                    } else {
                        alert("Auth service not initialized properly. Please refresh.");
                    }
                };
            }
        }, 100);
        return;
    }

    if (window.google) {
      try {
        window.google.accounts.id.renderButton(
          el,
          { 
            theme: "filled_black", 
            size: "large", 
            shape: "pill",
            text: "continue_with",
            width: "280" 
          } 
        );
      } catch (e) {
        console.error("Failed to render Google button", e);
      }
    } else {
      // Retry in case script is still loading
      setTimeout(() => GoogleAuthService.renderButton(elementId), 500);
    }
  },

  logout: () => {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  }
};

// Helper to decode the JWT payload
function parseJwt (token: string) {
    try {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Failed to parse JWT", e);
      return {};
    }
}
