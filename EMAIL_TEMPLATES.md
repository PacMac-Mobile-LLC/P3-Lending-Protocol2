
# P3 Lending Protocol - Email Templates

Copy and paste the HTML code below into your Authentication Provider's settings (Netlify Identity, Supabase, Auth0, etc.).

---

## 1. Invitation Template
**Subject:** You have been invited to join the P3 Protocol

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #050505; margin: 0; padding: 0; color: #e4e4e7; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 40px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5); }
    .logo { font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: -1px; margin-bottom: 30px; display: inline-block; }
    .logo span { color: #00e599; }
    h1 { color: #ffffff; font-size: 24px; margin-bottom: 16px; letter-spacing: -0.5px; }
    p { font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 32px; }
    .btn { background-color: #00e599; color: #000000; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block; transition: background 0.2s; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; }
    .btn:hover { background-color: #00cc88; }
    .footer { margin-top: 32px; font-size: 12px; color: #52525b; text-align: center; }
    .footer a { color: #52525b; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">P<span>3</span> Securities</div>
      <h1>You're Invited to the Future of Credit.</h1>
      <p>You have been selected to join the P3 Lending Protocol. We are building a financial system based on reputation and character, not FICO scores.</p>
      <p>Click the button below to accept your invitation and create your decentralized identity.</p>
      <a href="{{ .SiteURL }}/#invite_token={{ .Token }}" class="btn">Accept Invitation</a>
    </div>
    <div class="footer">
      <p>P3 Lending Protocol • Decentralized Social Finance<br/>
      If you did not expect this invitation, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>
```

---

## 2. Confirmation Template
**Subject:** Verify your P3 Identity

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #050505; margin: 0; padding: 0; color: #e4e4e7; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 40px; text-align: center; }
    .logo { font-size: 24px; font-weight: bold; color: #ffffff; margin-bottom: 30px; }
    .logo span { color: #00e599; }
    h1 { color: #ffffff; font-size: 22px; margin-bottom: 16px; }
    p { font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 32px; }
    .btn { background-color: #00e599; color: #000000; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; }
    .footer { margin-top: 32px; font-size: 12px; color: #52525b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">P<span>3</span></div>
      <h1>Verify Your Email</h1>
      <p>Welcome to the P3 Protocol. To activate your reputation score and begin lending or borrowing, please verify your email address.</p>
      <a href="{{ .SiteURL }}/#confirmation_token={{ .Token }}" class="btn">Verify Account</a>
    </div>
    <div class="footer">
      <p>P3 Lending Protocol</p>
    </div>
  </div>
</body>
</html>
```

---

## 3. Recovery Template
**Subject:** Reset your P3 Security Password

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #050505; margin: 0; padding: 0; color: #e4e4e7; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #18181b; border: 1px solid #ef4444; border-radius: 16px; padding: 40px; text-align: center; }
    .logo { font-size: 24px; font-weight: bold; color: #ffffff; margin-bottom: 30px; }
    .logo span { color: #ef4444; }
    h1 { color: #ffffff; font-size: 22px; margin-bottom: 16px; }
    p { font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 32px; }
    .btn { background-color: #ef4444; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; }
    .footer { margin-top: 32px; font-size: 12px; color: #52525b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">P<span>3</span> Security</div>
      <h1>Reset Your Password</h1>
      <p>We received a request to recover access to your P3 Lending account. If this was you, click the button below to set a new password.</p>
      <a href="{{ .SiteURL }}/#recovery_token={{ .Token }}" class="btn">Reset Password</a>
      <p style="font-size: 12px; margin-top: 20px; color: #52525b;">If you did not request this, please ignore this email. Your account remains secure.</p>
    </div>
    <div class="footer">
      <p>P3 Lending Protocol • Security Team</p>
    </div>
  </div>
</body>
</html>
```

---

## 4. Email Change Template
**Subject:** Confirm New Email Address

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #050505; margin: 0; padding: 0; color: #e4e4e7; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 40px; text-align: center; }
    .logo { font-size: 24px; font-weight: bold; color: #ffffff; margin-bottom: 30px; }
    .logo span { color: #00e599; }
    h1 { color: #ffffff; font-size: 22px; margin-bottom: 16px; }
    p { font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 32px; }
    .btn { background-color: #27272a; border: 1px solid #00e599; color: #00e599; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; }
    .footer { margin-top: 32px; font-size: 12px; color: #52525b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">P<span>3</span></div>
      <h1>Confirm Email Change</h1>
      <p>You requested to change your login email for P3 Lending. Please click the link below to confirm this change.</p>
      <a href="{{ .SiteURL }}/#email_change_token={{ .Token }}" class="btn">Confirm Change</a>
    </div>
    <div class="footer">
      <p>P3 Lending Protocol</p>
    </div>
  </div>
</body>
</html>
```
