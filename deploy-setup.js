/**
 * Run this once: node deploy-setup.js
 * Sets up .github/workflows, git repo, and pushes to GitHub.
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const GITHUB_USERNAME = "Aishu-245";
const REPO_NAME = "salon-app";
const ROOT = path.join(__dirname);

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: ROOT, ...opts });
}

// ── 1. Create .github/workflows/deploy.yml ────────────────────────────────
const workflowDir = path.join(ROOT, ".github", "workflows");
fs.mkdirSync(workflowDir, { recursive: true });

const workflow = `name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: client/package.json

      - name: Install client dependencies
        working-directory: ./client
        run: npm install

      - name: Build client
        working-directory: ./client
        env:
          VITE_API_BASE_URL: \${{ vars.VITE_API_BASE_URL }}
          VITE_BASE: /\${{ github.event.repository.name }}/
        run: npm run build

      - name: Setup GitHub Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./client/dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

fs.writeFileSync(path.join(workflowDir, "deploy.yml"), workflow, "utf8");
console.log("✓ Created .github/workflows/deploy.yml");

// ── 2. Git init, add, commit ──────────────────────────────────────────────
try {
  run("git init");
  run("git add .");
  run(`git commit -m "Initial commit: Beauty Salon Appointment & Stylist Management System"`);
  console.log("✓ Git commit done");
} catch (e) {
  // If already committed, continue
  console.log("(git commit skipped - may already exist)");
}

// ── 3. Set remote and push ────────────────────────────────────────────────
const remoteUrl = `https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git`;
try {
  run(`git remote add origin ${remoteUrl}`);
} catch {
  run(`git remote set-url origin ${remoteUrl}`);
}

run("git branch -M main");
run("git push -u origin main");

console.log("");
console.log("===========================================");
console.log("✅ Code pushed to GitHub!");
console.log(`   https://github.com/${GITHUB_USERNAME}/${REPO_NAME}`);
console.log("");
console.log("NEXT STEPS (manual - takes 2 minutes):");
console.log("1. GitHub repo → Settings → Pages → Source → GitHub Actions");
console.log(`2. Deploy backend on https://render.com`);
console.log("   New Web Service → connect salon-app repo → it uses render.yaml");
console.log("3. Copy your Render URL, then in GitHub repo:");
console.log("   Settings → Variables → New variable:");
console.log("   Name: VITE_API_BASE_URL");
console.log("   Value: https://salon-app-backend.onrender.com (your Render URL)");
console.log("4. GitHub → Actions tab → re-run the workflow");
console.log("");
console.log(`🌐 Your live app: https://${GITHUB_USERNAME}.github.io/${REPO_NAME}/`);
console.log("===========================================");
