# Run this from d:\project\salon-app
# Usage: powershell -ExecutionPolicy Bypass -File setup-github.ps1 -GitHubUsername YOUR_USERNAME

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    [string]$RepoName = "salon-app"
)

Set-Location "d:\project\salon-app"

# ── Create workflow directory ──────────────────────────────────────────────
New-Item -ItemType Directory -Force -Path ".github\workflows" | Out-Null

# ── Write GitHub Actions workflow ─────────────────────────────────────────
$workflow = @'
name: Deploy Frontend to GitHub Pages

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
      url: ${{ steps.deployment.outputs.page_url }}

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
          VITE_API_BASE_URL: ${{ vars.VITE_API_BASE_URL }}
          VITE_BASE: /${{ github.event.repository.name }}/
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
'@

Set-Content -Path ".github\workflows\deploy.yml" -Value $workflow -Encoding UTF8
Write-Host "✓ Created .github/workflows/deploy.yml"

# ── Initialize git ─────────────────────────────────────────────────────────
git init
git add .
git commit -m "Initial commit: Beauty Salon Appointment & Stylist Management System

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

Write-Host ""
Write-Host "✓ Git repository initialized and committed."
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Create a new repo at: https://github.com/new (name: $RepoName)"
Write-Host "2. Run:"
Write-Host "   git remote add origin https://github.com/$GitHubUsername/$RepoName.git"
Write-Host "   git branch -M main"
Write-Host "   git push -u origin main"
Write-Host ""
Write-Host "3. In GitHub repo: Settings → Pages → Source → GitHub Actions"
Write-Host "4. Deploy backend to Render: https://dashboard.render.com (uses render.yaml)"
Write-Host "5. In GitHub repo: Settings → Variables → VITE_API_BASE_URL = your Render URL"
Write-Host "6. Re-run the workflow (Actions tab) or push a small change"
Write-Host ""
Write-Host "Your live URL will be: https://$GitHubUsername.github.io/$RepoName/"
