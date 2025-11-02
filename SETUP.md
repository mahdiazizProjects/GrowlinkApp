# Setup Instructions

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

