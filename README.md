# Abuja Life

Browser-based 2.5D Abuja life simulation with Supabase-backed registration/login and a Render/Node server.

## What's included in this update

- Preserves the existing entry page, admin page, Supabase registration/login, and current API route names.
- Fixes the game client's player response parsing so it reads `player.profile` and `player.wallet` returned by the existing server.
- Adds a starter apartment in the Wuse spawn area, an explorable interior, furniture props, sleep/change-clothes/decor interactions, and a warm/minimal room style toggle.
- Adds character skin, hair, and outfit selection saved to this device.
- Adds a distant Central Area skyline to the existing isometric city, while retaining its roads, trees, lamps, traffic, pedestrians, minimap, and vehicle controls.
- Removes frontend-only wallet deductions and mission reward grants. Vehicle purchases/rewards now require server-confirmed success.
- Adds authenticated server routes for vehicle purchases and the starter delivery mission reward. These call atomic Supabase RPC functions defined in `migrations/001_gameplay_economy.sql`.

## Deploy steps

1. Back up the current GitHub repository.
2. In Supabase SQL Editor, review and run `migrations/001_gameplay_economy.sql`. It creates two isolated game tables and the atomic wallet RPCs. It expects the existing `vehicles` table to have `id`, `name`, and `price`, and existing `wallets`/`transactions` columns consistent with the current `server.js` registration flow. If your live `vehicles` table uses a different name column, adjust the one reference in the SQL before running it.
3. Keep the current Render environment variables: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Never expose the service-role key in browser code.
4. Replace `game.html` and `server.js` with these files, add the `migrations` folder, and deploy normally using `npm start`.
5. Test with a test account: register/login, confirm the wallet, enter the starter apartment, change appearance, drive around, and test one purchase/reward. A failed purchase must not deduct money.

## Important current limits

- The house, character appearance, and room style are currently client-side/session features; house ownership, furniture inventory, and appearance are not yet saved to Supabase.
- The first playable area remains a stylized isometric Wuse map, not a full photorealistic 3D world. Other Abuja districts are represented as rough map zones, not separately hand-built neighbourhoods yet.
- Social messaging, true multiplayer synchronization, jobs beyond the starter delivery, and persistent owned-vehicle inventory still need further implementation.
- I can syntax-check the JavaScript in this environment, but I cannot connect to your private Supabase project or test live database migrations without your deployment environment.
