# SR Dairy Fresh — production-ready commerce foundation

This project keeps the original React/Vite storefront and adds a real backend architecture:

- **Supabase** for customer authentication, PostgreSQL catalog/order data and Row Level Security.
- **Node/Express** API for trusted order creation, server-side price validation and Razorpay calls.
- **Razorpay Standard Checkout** for UPI/card payments. The Razorpay secret never enters the browser.
- **Customer account** with order history and live fulfillment status.
- **Admin dashboard** for searching orders and changing fulfillment status.
- **Razorpay webhook endpoint** for payment status synchronization.

## Local setup

### 1. Supabase

Create a Supabase project and run `supabase/schema.sql` in the SQL Editor. Enable Email + Password authentication. Configure `http://localhost:5173` as a local site/redirect URL.

After the first signup, promote that account to admin using the SQL comment at the bottom of `schema.sql`.

### 2. Environment variables

Copy `.env.example` to `.env` and fill in the Supabase and Razorpay values.

`VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_RAZORPAY_KEY_ID` are browser-safe public values.

**Never put `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `RAZORPAY_KEY_SECRET` in a `VITE_*` variable or commit them to Git.**

### 3. Install and run

```bash
npm install
npm run dev
```

In another terminal:

```bash
npm run server
```

The Vite app defaults to `http://localhost:5173` and the API to `http://localhost:8787`.

## Production deployment

Deploy the Vite frontend and Express API separately (for example, Vercel/Netlify for the frontend and Render/Railway/Fly.io for the API). Set:

- Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_API_URL`, `VITE_RAZORPAY_KEY_ID`
- API: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `FRONTEND_URL`

Configure a Razorpay webhook pointing to:

`https://YOUR_API_DOMAIN/api/razorpay/webhook`

Use the same webhook secret in the Razorpay dashboard and `RAZORPAY_WEBHOOK_SECRET`.

## Payment flow

1. Customer signs in.
2. Checkout sends the cart to the Express API.
3. The API reads product prices from Supabase and calculates the total; it does not trust browser-supplied prices.
4. For online payment, the API creates a Razorpay order server-side.
5. The browser opens Razorpay Checkout with the public key ID and server-created order ID.
6. The browser sends Razorpay's payment ID/order ID/signature to the API.
7. The API verifies the HMAC signature and marks the order paid.
8. Razorpay webhooks keep the payment state synchronized after the checkout response.

## Important launch checklist

- Replace the FSSAI placeholder in the footer with the real license details.
- Add your real business address, delivery coverage and refund/cancellation policy.
- Test Razorpay in **Test Mode** before switching to Live Mode.
- Configure a production SMTP provider for reliable Supabase email verification/password emails.
- Add rate limiting and request logging at the API/hosting layer before a public launch.
- Configure Razorpay webhook events such as `payment.captured`, `payment.failed`, `order.paid`, and `refund.processed` as needed.
