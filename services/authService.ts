
// services/authService.ts

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleAuthService = {
  // Initialize the Google Identity Services Client
  init: (onLogin: (user: any) => void) => {
    if (!window.google) {
      // Script loading is handled in index.html, but if offline or blocked:
      return;
    }

    try {
      // @ts-ignore
      const clientId = process.env.GOOGLE_CLIENT_ID;

      if (!clientId || clientId === 'undefined' || clientId === '') {
        console.error("CRITICAL AUTH ERROR: Google Client ID is missing. Check your .env file or vite.config.ts.");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response.credential) {
            const userProfile = parseJwt(response.credential);
            
            // Normalize to match the structure the app expects (similar to Netlify)
            const appUser = {
              id: userProfile.sub, // Google unique ID
              email: userProfile.email,
              user_metadata: {
                full_name: userProfile.name,
                avatar_url: userProfile.picture
              },
              token: response.credential // Store token if needed for backend
            };
            
            onLogin(appUser);
          }
        },
        auto_select: false, // Don't auto-login to prevent loops if logic fails
        cancel_on_tap_outside: true
      });
    } catch (e) {
      console.error("Google Auth Init Error:", e);
    }
  },

  // Render the official "Sign in with Google" button
  renderButton: (elementId: string) => {
    const el = document.getElementById(elementId);
    if (!el) return; // Element not ready

    // Check if initialized before rendering
    // @ts-ignore
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId || clientId === 'undefined' || clientId === '') {
        el.innerHTML = `
          <div style="color: #ef4444; font-family: sans-serif; font-size: 12px; text-align: center; background: rgba(239, 68, 68, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2);">
              <strong style="display:block; margin-bottom:4px;">Configuration Error</strong>
              Google Client ID is missing.<br/>
              <span style="font-size: 10px; opacity: 0.7; font-family: monospace;">Set CLIENT_ID in .env</span>
          </div>
        `;
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
    // No specific logout call needed for client-side only JWT, just clear local state
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
