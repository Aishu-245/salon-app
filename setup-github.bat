@echo off
cd /d d:\project\salon-app

REM ── Create GitHub Actions workflow directory and file ──────────────────────
mkdir .github\workflows 2>nul

echo name: Deploy Frontend to GitHub Pages > .github\workflows\deploy.yml
echo. >> .github\workflows\deploy.yml
echo on: >> .github\workflows\deploy.yml
echo   push: >> .github\workflows\deploy.yml
echo     branches: [main] >> .github\workflows\deploy.yml
echo   workflow_dispatch: >> .github\workflows\deploy.yml
echo. >> .github\workflows\deploy.yml
echo permissions: >> .github\workflows\deploy.yml
echo   contents: read >> .github\workflows\deploy.yml
echo   pages: write >> .github\workflows\deploy.yml
echo   id-token: write >> .github\workflows\deploy.yml
echo. >> .github\workflows\deploy.yml
echo concurrency: >> .github\workflows\deploy.yml
echo   group: pages >> .github\workflows\deploy.yml
echo   cancel-in-progress: false >> .github\workflows\deploy.yml
echo. >> .github\workflows\deploy.yml
echo jobs: >> .github\workflows\deploy.yml
echo   build-and-deploy: >> .github\workflows\deploy.yml
echo     runs-on: ubuntu-latest >> .github\workflows\deploy.yml
echo     environment: >> .github\workflows\deploy.yml
echo       name: github-pages >> .github\workflows\deploy.yml
echo       url: ${{ steps.deployment.outputs.page_url }} >> .github\workflows\deploy.yml
echo. >> .github\workflows\deploy.yml
echo     steps: >> .github\workflows\deploy.yml
echo       - name: Checkout >> .github\workflows\deploy.yml
echo         uses: actions/checkout@v4 >> .github\workflows\deploy.yml
echo. >> .github\workflows\deploy.yml
echo       - name: Setup Node.js >> .github\workflows\deploy.yml
echo         uses: actions/setup-node@v4 >> .github\workflows\deploy.yml
echo         with: >> .github\workflows\deploy.yml
echo           node-version: 20 >> .github\workflows\deploy.yml
echo           cache: npm >> .github\workflows\deploy.yml
echo           cache-dependency-path: client/package.json >> .github\workflows\deploy.yml
echo. >> .github\workflows\deploy.yml
echo       - name: Install client dependencies >> .github\workflows\deploy.yml
echo         working-directory: ./client >> .github\workflows\deploy.yml
echo         run: npm install >> .github\workflows\deploy.yml
echo. >> .github\workflows\deploy.yml
echo       - name: Build client >> .github\workflows\deploy.yml
echo         working-directory: ./client >> .github\workflows\deploy.yml
echo         env: >> .github\workflows\deploy.yml
echo           VITE_API_BASE_URL: ${{ vars.VITE_API_BASE_URL }} >> .github\workflows\deploy.yml
echo           VITE_BASE: /${{ github.event.repository.name }}/ >> .github\workflows\deploy.yml
echo         run: npm run build >> .github\workflows\deploy.yml
echo. >> .github\workflows\deploy.yml
echo       - name: Setup GitHub Pages >> .github\workflows\deploy.yml
echo         uses: actions/configure-pages@v4 >> .github\workflows\deploy.yml
echo. >> .github\workflows\deploy.yml
echo       - name: Upload artifact >> .github\workflows\deploy.yml
echo         uses: actions/upload-pages-artifact@v3 >> .github\workflows\deploy.yml
echo         with: >> .github\workflows\deploy.yml
echo           path: ./client/dist >> .github\workflows\deploy.yml
echo. >> .github\workflows\deploy.yml
echo       - name: Deploy to GitHub Pages >> .github\workflows\deploy.yml
echo         id: deployment >> .github\workflows\deploy.yml
echo         uses: actions/deploy-pages@v4 >> .github\workflows\deploy.yml

echo ── Workflow file created ──

REM ── Initialize git repo and push ──────────────────────────────────────────
git init
git add .
git commit -m "Initial commit: Beauty Salon Appointment System"

echo.
echo ── Done! Now run these commands to push to GitHub: ──
echo.
echo   git remote add origin https://github.com/YOUR_USERNAME/salon-app.git
echo   git branch -M main
echo   git push -u origin main
echo.
echo Replace YOUR_USERNAME with your GitHub username.
echo After pushing:
echo   1. Go to GitHub repo Settings - Pages - Source - GitHub Actions
echo   2. Go to Settings - Variables - Add VITE_API_BASE_URL with your Render backend URL
pause
