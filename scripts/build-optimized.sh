#!/bin/bash
# Optimized build script for Korean tech blog

set -e

echo "🚀 Starting optimized build process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next out

# Generate static data
echo "📊 Generating static data..."
node scripts/generate-static-data.js

# Type check
echo "🔍 Running TypeScript checks..."
pnpm type-check

# Lint
echo "📝 Running ESLint..."
pnpm lint

# Build with optimizations
echo "🔨 Building with optimizations..."
NODE_ENV=production pnpm build

# Performance check
echo "⚡ Running performance checks..."
node scripts/performance-check.js

# Static export (if configured)
if grep -q '"output": "export"' next.config.js; then
  echo "📤 Generating static export..."
  pnpm export
  
  echo "🔍 Validating static export..."
  if [ -d "out" ]; then
    echo "✅ Static export successful"
    echo "📊 Export size: $(du -sh out | cut -f1)"
  else
    echo "❌ Static export failed"
    exit 1
  fi
fi

echo "✅ Build process completed successfully!"
