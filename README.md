# P3 Lending Protocol

P3 Lending is a peer-to-peer lending marketplace that leverages AI for reputation scoring and risk analysis, allowing users to build credit through "social underwriting" rather than purely financial history.

## 🎨 Aesthetic & Design
The application features a high-contrast "Neon Green & Dark Zinc" aesthetic (inspired by Robinhood/Kalshi) designed for clarity and modern financial trust.

## 🚀 Quick Start

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    API_KEY=your_google_genai_api_key_here
    ```

3.  **Run Application**
    ```bash
    npm start
    ```

---

## 🔐 OAuth Integration Guide

Currently, the app uses a mock `INITIAL_USER` in `App.tsx`. To integrate real-world authentication (OAuth 2.0 / OIDC), follow these steps:

### 1. Choose an Identity Provider
We recommend **Auth0**, **Clerk**, or **Firebase Auth** for React applications.

### 2. Frontend Implementation (Example: Auth0)

**Install SDK:**
```bash
npm install @auth0/auth0-react
```

**Configure Provider (`index.tsx`):**
Wrap your root component with the provider.
```tsx
import { Auth0Provider } from "@auth0/auth0-react";

root.render(
  <Auth0Provider
    domain="YOUR_AUTH0_DOMAIN"
    clientId="YOUR_CLIENT_ID"
    authorizationParams={{ redirect_uri: window.location.origin }}
  >
    <App />
  </Auth0Provider>
);
```

**Replace Mock User (`App.tsx`):**
Use the hook to hydrate user data.
```tsx
import { useAuth0 } from "@auth0/auth0-react";

const App = () => {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();

  // Map Auth0 user to UserProfile type
  useEffect(() => {
    if (isAuthenticated && user) {
      setUser({
        id: user.sub,
        name: user.name,
        // ... fetch remaining profile data from your database
      });
    }
  }, [user]);
  
  // ...
}
```

### 3. Backend Token Verification
Ensure every request to your API includes the `Authorization: Bearer <token>` header. Verify this token on your backend using JWKS.

---

## 💳 Stripe Integration Guide

To enable Fiat on-ramping or loan repayments via credit card/ACH, integrate Stripe.

**⚠️ Important:** Stripe integration requires a backend server to securely generate `client_secret` keys. Do not perform administrative Stripe operations purely on the client side.

### 1. Architecture Overview
1.  **Frontend**: User clicks "Repay".
2.  **Frontend**: Calls Backend `/api/create-payment-intent` with amount.
3.  **Backend**: Calls Stripe API to create intent, returns `client_secret`.
4.  **Frontend**: Uses `client_secret` to render `<PaymentElement />`.
5.  **Stripe**: Processes payment and sends Webhook to Backend.
6.  **Backend**: Webhook updates Loan Status to `REPAID` in database.

### 2. Frontend Setup

**Install Libraries:**
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

**Initialize Stripe:**
```tsx
// services/stripeService.ts
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY');
```

**Create Payment Modal Component:**
```tsx
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: "https://your-site.com/success" },
    });
    // Handle error or success
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe}>Submit Payment</button>
    </form>
  );
};
```

### 3. Webhook Handling (Backend)
Listen for `payment_intent.succeeded` events to trigger the `handleRepayLoan` logic server-side.

```python
# Example Python/FastAPI handler
@app.post("/webhook")
async def stripe_webhook(request: Request):
    event = construct_event(await request.body(), sig_header, endpoint_secret)
    if event['type'] == 'payment_intent.succeeded':
        loan_id = event['data']['object']['metadata']['loan_id']
        # Update database: Set loan status to REPAID
        # Update database: Increment reputation score
    return {"status": "success"}
```