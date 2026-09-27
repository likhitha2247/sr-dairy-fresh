# Supabase setup

1. Create a Supabase project.
2. Open SQL Editor and run `schema.sql`.
3. Enable Email + Password under Authentication → Providers.
4. Add your site URL and local redirect URL (`http://localhost:5173`) under Authentication → URL Configuration.
5. Copy the Supabase URL and publishable key into the frontend `.env` and the backend `.env`.
6. Keep the Supabase secret key server-side only.
7. Sign up one account, copy its auth user UUID, then run the admin SQL at the bottom of `schema.sql`.
8. Deploy the backend separately from the Vite frontend and set `VITE_API_URL` to its public URL.
