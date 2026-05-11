#!/usr/bin/env pwsh
# setup.ps1 — VideoScribe Phase 0 scaffold
# Run from repo root in PowerShell

$ErrorActionPreference = "Stop"
Write-Host "🚀 VideoScribe Setup — Phase 0" -ForegroundColor Cyan

# Check prerequisites
if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ pnpm not found. Install: https://pnpm.io/installation" -ForegroundColor Red
    exit 1
}

if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found. Install LTS: https://nodejs.org" -ForegroundColor Red
    exit 1
}

$nodeVersion = node --version
Write-Host "✓ Node: $nodeVersion" -ForegroundColor Green

$pnpmVersion = pnpm --version
Write-Host "✓ pnpm: $pnpmVersion" -ForegroundColor Green

# Create Next.js 16.2.6 app with Turbopack (skip install, we'll do it manually)
Write-Host "`n📦 Creating Next.js 16.2.6 app..." -ForegroundColor Yellow
pnpm create next-app@16.2.6 . --typescript --tailwind --eslint --app --turbopack --use-pnpm --skip-install

# Install production dependencies
Write-Host "`n📦 Installing production dependencies..." -ForegroundColor Yellow
pnpm add @google/genai @ffmpeg/ffmpeg @ffmpeg/util @supabase/supabase-js @supabase/ssr stripe lucide-react

# Install dev dependencies
Write-Host "`n📦 Installing dev dependencies..." -ForegroundColor Yellow
pnpm add -D vitest @vitest/ui @playwright/test prettier

# Create essential directories
Write-Host "`n📁 Creating project structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "lib/gemini" | Out-Null
New-Item -ItemType Directory -Force -Path "lib/audio" | Out-Null
New-Item -ItemType Directory -Force -Path "lib/analyses/prompts" | Out-Null
New-Item -ItemType Directory -Force -Path "lib/i18n" | Out-Null
New-Item -ItemType Directory -Force -Path "lib/supabase" | Out-Null
New-Item -ItemType Directory -Force -Path "lib/stripe" | Out-Null
New-Item -ItemType Directory -Force -Path "app/api/transcribe" | Out-Null
New-Item -ItemType Directory -Force -Path "app/api/analyze" | Out-Null
New-Item -ItemType Directory -Force -Path "app/api/auth/callback" | Out-Null
New-Item -ItemType Directory -Force -Path "app/api/stripe/webhook" | Out-Null
New-Item -ItemType Directory -Force -Path "app/(app)/transcribe" | Out-Null
New-Item -ItemType Directory -Force -Path "app/(app)/analysis" | Out-Null
New-Item -ItemType Directory -Force -Path "app/(app)/archive" | Out-Null
New-Item -ItemType Directory -Force -Path "app/(app)/settings" | Out-Null
New-Item -ItemType Directory -Force -Path "app/(app)/billing" | Out-Null
New-Item -ItemType Directory -Force -Path "app/(marketing)" | Out-Null
New-Item -ItemType Directory -Force -Path "_prototype-reference" | Out-Null
New-Item -ItemType Directory -Force -Path "chrome-extension" | Out-Null
New-Item -ItemType Directory -Force -Path "supabase/migrations" | Out-Null

# Copy placeholder for prototype reference
@"
# Prototype Reference (READ-ONLY)

This directory contains working v0 logic from the prototype.
Use it as reference when porting to the Next.js structure.

Do NOT edit files here. Copy logic to /lib or /app as needed.
"@ | Out-File -FilePath "_prototype-reference/README.md" -Encoding utf8

# Copy placeholder for Chrome extension
@"
# Chrome Extension (MV3)

Build target: zip this folder for Chrome Web Store.

For v1: extension downloads .webm locally → user uploads to web app.
For v2: direct handoff via signed URL (future).

See docs/extension.md for details.
"@ | Out-File -FilePath "chrome-extension/README.md" -Encoding utf8

# Initialize git
Write-Host "`n🔀 Initializing git..." -ForegroundColor Yellow
if (!(Test-Path ".git")) {
    git init
    git add .
    git commit -m "chore: initial scaffold — Phase 0"
    Write-Host "✓ Git initialized with initial commit" -ForegroundColor Green
}

# Final instructions
Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Copy .env.example to .env.local and fill in your keys" -ForegroundColor White
Write-Host "  2. Run: pnpm install" -ForegroundColor White
Write-Host "  3. Run: pnpm dev" -ForegroundColor White
Write-Host "  4. Visit: http://localhost:3000" -ForegroundColor White
Write-Host "`nThen read BACKLOG.md and start Phase 1 🛠️" -ForegroundColor Cyan
