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
    Create a `.env` file in the root directory (see `.env.example`):
    ```env
    API_KEY=your_google_genai_api_key_here
    GOOGLE_CLIENT_ID=your_google_cloud_client_id
    ```

3.  **Run Application**
    ```bash
    npm start
    ```

---

## 🛠️ Development

**Open in VS Code Dev:**
[https://vscode.dev/github/PacMac-Mobile-LLC/P3-Lending-Protocol2/blob/main](https://vscode.dev/github/PacMac-Mobile-LLC/P3-Lending-Protocol2/blob/main)

---

## 🔐 Google OAuth Setup (Required for Login)

To enable the "Sign in with Google" button, you must set up a project in Google Cloud:

1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  **Create a Project**.
3.  Go to **APIs & Services > OAuth consent screen**.
    *   Select **External**.
    *   Fill in App Name and Support Email.
    *   Save.
4.  Go to **Credentials > Create Credentials > OAuth client ID**.
    *   Type: **Web application**.
    *   **Authorized JavaScript origins**: `http://localhost:5173`
    *   **Authorized redirect URIs**: `http://localhost:5173`
5.  Copy the **Client ID** and paste it into your `.env` file as `GOOGLE_CLIENT_ID`.

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