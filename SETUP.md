# Setup Instructions

## If Amplify deployment failed — do this before copying amplify_outputs

1. **Get the backend deployed first**  
   `amplify_outputs.json` is generated when the **Amplify backend** (Auth + Data) is deployed. If deployment failed, you don’t have a valid file to copy yet. Fix and re-run the backend deploy:
   - **Option A – Local sandbox:**  
     `npx ampx sandbox --outputs-out-dir .`  
     (Run from project root; requires AWS CLI/credentials.) This creates/updates `amplify_outputs.json` in the project.
   - **Option B – Amplify Console:**  
     In AWS Amplify Console, open your app → **Backend** (or the build that deploys the backend). Fix the failing step, then re-run the backend deployment. After it succeeds, get `amplify_outputs.json` from the build artifacts or from “Hosting” / “Backend” in the Console.

2. **Make sure the frontend build passes locally**  
   So when you deploy (or use the copied outputs), the app at least builds:
   ```bash
   npm ci
   npm run build
   ```
   If this fails, fix the errors (TypeScript, missing deps, etc.) before relying on Amplify Hosting.

3. **If the failure was Amplify Hosting (frontend) only**  
   Your `amplify.yml` only runs `npm ci` and `npm run build`. Common fixes:
   - **Node version:** In Amplify Console → App → Hosting → Build settings, set Node to **18** or **20** (e.g. `nvm use 18` or use the “Build image” that has Node 18+).
   - **Lockfile:** Ensure `package-lock.json` is committed so `npm ci` works.
   - **Build command:** Leave as `npm run build` (or match what works locally).

4. **After a successful backend deploy**  
   You can then copy the generated `amplify_outputs.json` from that environment (sandbox or Console) into your project root so the app uses the correct Auth and Data endpoints.

---

## Amplify backend (Auth + Data)

**Yes — copy the server’s `amplify_outputs.json` into your project** (replace the one in the repo root). That file configures:

- **Auth**: same Cognito user pool as the server, so you can sign in with the same users.
- **Data**: same AppSync API and database, so when the app uses the backend for data, it will see the data already in the DB.

Steps:

1. Get `amplify_outputs.json` from the server (or from the team that deploys the Amplify backend).
2. Put it in the project root, replacing the existing `amplify_outputs.json`.
3. Run the app as usual (`npm run dev`). Auth will use the server’s Cognito.

**Note:** The app’s data layer (`src/services/api.ts`) is currently using an **in-memory store** plus mock data, so sessions/goals/journeys etc. are not yet read from the Amplify Data (AppSync) backend. To see data that’s already in the database, `api.ts` would need to be wired to use Amplify Data (e.g. `generateClient` and the generated models). Until then, only Auth uses the server config; list/create/update of sessions, users, goals, etc. stay local.

---

## Issue: Old Node.js Version

Your current Node.js version (v10.2.0) is too old for this project. This project requires **Node.js 16 or higher** (recommended: Node.js 18 LTS or Node.js 20 LTS).

## Solution: Update Node.js

### Option 1: Download from Official Website (Recommended)

1. Go to [nodejs.org](https://nodejs.org/)
2. Download the **LTS version** (currently Node.js 20.x or 18.x)
3. Run the installer
4. Restart your terminal/command prompt
5. Verify installation:
   ```bash
   node --version  # Should show v18.x.x or v20.x.x
   npm --version   # Should show 9.x.x or 10.x.x
   ```

### Option 2: Using nvm (Node Version Manager) - For Windows

1. Download nvm-windows from: https://github.com/coreybutler/nvm-windows/releases
2. Install nvm-windows
3. Open a new terminal and run:
   ```bash
   nvm install 20
   nvm use 20
   ```

### After Updating Node.js

Once you have Node.js 18+ installed, run:

```bash
npm install
npm run dev
```

## Alternative: Use Older Compatible Versions (Not Recommended)

If you absolutely cannot update Node.js, we can downgrade the project dependencies, but this is **not recommended** as it will limit functionality and security updates.

---

**Note**: Node.js v10 reached end-of-life in 2021. Updating is strongly recommended for security and compatibility reasons.

