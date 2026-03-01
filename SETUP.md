# Setup Instructions

## Nothing works as expected? Copy `amplify_outputs.json` to your local

**Yes — you should copy the Amplify outputs file to your machine.** The app will not work correctly without it.

- **Where to put it:** In your **project root** (same folder as `package.json`), as a file named **`amplify_outputs.json`**.
- **Why:** This file is in `.gitignore`, so it is **not in the repo**. Every developer (and your local run) needs a copy. It tells the app:
  - which **Cognito** user pool to use (sign-in/sign-up),
  - which **AppSync** API and database to use (users, sessions, goals, etc.).
- **Where to get it:**
  1. From whoever deploys the Amplify backend (teammate or CI), or  
  2. From **Amplify Console** → your app → **Backend** (or Hosting) → download/copy the generated `amplify_outputs.json`, or  
  3. By running **`npx ampx sandbox --outputs-out-dir .`** from the project root (creates the file locally; requires AWS credentials).

After you put `amplify_outputs.json` in the project root, run `npm run dev` again. Auth and data will use the same backend as the server.

---

## Sessions (or other data) not storing properly?

**Yes — you need to deploy the backend** so that the Session model (and User, Goal, etc.) actually exist in AWS. The app sends sessions to AppSync/DynamoDB; if the backend is not deployed, there is no Session table and nothing is stored.

1. **Deploy the backend** (at least once):
   - **Option A – Sandbox (good for local dev):**  
     From project root: **`npx ampx sandbox --outputs-out-dir .`**  
     This deploys the backend (Auth + Data, including Session) and writes `amplify_outputs.json`. Then run `npm run dev`; sessions will be stored in the cloud.
   - **Option B – Amplify Console:**  
     Connect your repo to Amplify and ensure the app has a **backend** build (Amplify Gen 2 backend). When that build runs and succeeds, the Session table exists. Use the `amplify_outputs.json` from that deploy (or from sandbox) in your project root.

2. **Use the right `amplify_outputs.json`**  
   The file must point to the **same** backend you deployed. If you use a file from another app or an old deploy, the app may talk to the wrong API and sessions won’t show up where you expect.

3. **If sessions still don’t persist:**  
   - Open DevTools → **Console** and **Network** when you book a session. Look for failed requests (e.g. to the AppSync/graphql endpoint) or errors in the console.  
   - Confirm you’re signed in; the Session model uses `allow.owner()` so auth may be required.  
   - Confirm the mentor’s **id** exists in the backend User table (e.g. they signed up or were created via the app).

---

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

**Note:** The app’s data layer (`src/services/api.ts`) uses **Amplify Data** (AppSync) when `amplify_outputs.json` is present. Without the correct file, API calls go nowhere and nothing works as expected.

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

