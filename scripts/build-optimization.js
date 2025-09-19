#!/usr/bin/env node

/**
 * Build process optimization and static export validation
 * Optimizes build configuration and validates static generation
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const BUILD_TARGETS = {
  PAGES: 'pages',
  STATIC: 'static',
  EXPORT: 'export',
}

function validateEnvironment() {
  console.log('🔍 Validating build environment...')

  const checks = [
    {
      name: 'Node.js version',
      check: () => {
        const version = process.version
        const majorVersion = parseInt(version.slice(1).split('.')[0])
        return majorVersion >= 18
      },
      error: 'Node.js 18+ required for optimal Next.js performance',
    },
    {
      name: 'Package manager',
      check: () => {
        try {
          execSync('pnpm --version', { stdio: 'ignore' })
          return true
        } catch {
          return false
        }
      },
      error: 'pnpm is recommended for faster builds and smaller node_modules',
    },
    {
      name: 'TypeScript configuration',
      check: () => {
        const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')
        if (fs.existsSync(tsconfigPath)) {
          const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'))
          return tsconfig.compilerOptions && tsconfig.compilerOptions.strict
        }
        return false
      },
      error: 'TypeScript strict mode should be enabled for better optimization',
    },
  ]

  let allPassed = true
  checks.forEach(({ name, check, error }) => {
    const passed = check()
    const icon = passed ? '✅' : '❌'
    console.log(`${icon} ${name}`)

    if (!passed) {
      console.log(`   ⚠️  ${error}`)
      allPassed = false
    }
  })

  return allPassed
}

function optimizeNextConfig() {
  console.log('\n⚙️  Optimizing Next.js configuration...')

  const configPath = path.join(process.cwd(), 'next.config.js')
  if (!fs.existsSync(configPath)) {
    console.log('❌ next.config.js not found')
    return false
  }

  const currentConfig = fs.readFileSync(configPath, 'utf8')
  console.log('📋 Current configuration analysis:')

  const optimizations = [
    {
      name: 'Image optimization',
      check: () =>
        currentConfig.includes('images:') &&
        !currentConfig.includes('unoptimized: true'),
      recommendation:
        'Enable Next.js image optimization for better Core Web Vitals',
    },
    {
      name: 'Static export ready',
      check: () =>
        currentConfig.includes('output:') && currentConfig.includes('export'),
      recommendation: 'Configure for static export to maximize performance',
    },
    {
      name: 'Compression enabled',
      check: () =>
        currentConfig.includes('compress:') || currentConfig.includes('gzip'),
      recommendation: 'Enable gzip compression for smaller bundle sizes',
    },
    {
      name: 'Trailing slash consistency',
      check: () => currentConfig.includes('trailingSlash:'),
      recommendation: 'Set trailingSlash for consistent URL structure',
    },
    {
      name: 'SWC minification',
      check: () =>
        currentConfig.includes('swcMinify:') ||
        !currentConfig.includes('minify'),
      recommendation: 'Use SWC minifier for faster builds',
    },
  ]

  let score = 0
  optimizations.forEach(({ name, check, recommendation }) => {
    const optimized = check()
    const icon = optimized ? '✅' : '⚠️ '
    console.log(`${icon} ${name}`)

    if (optimized) score++
    else console.log(`   💡 ${recommendation}`)
  })

  console.log(`\n📊 Configuration Score: ${score}/${optimizations.length}`)

  if (score < optimizations.length) {
    console.log('\n📝 Suggested next.config.js optimizations:')
    console.log(`
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization for Core Web Vitals
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.unsplash.com' },
      { protocol: 'https', hostname: '**.githubusercontent.com' }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    minimumCacheTTL: 60,
    unoptimized: false
  },
  
  // Static export for maximum performance 
  output: 'export',
  trailingSlash: true,
  
  // SWC minification (default in Next.js 13+)
  swcMinify: true,
  
  // Compression
  compress: true,
  
  // Korean language optimization
  i18n: undefined, // Disable i18n for static export
  
  // Build optimization
  experimental: {
    // Modern bundling
    esmExternals: true,
    // Smaller builds
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
`)
  }

  return score === optimizations.length
}

function validateStaticGeneration() {
  console.log('\n📦 Validating static generation...')

  try {
    // Check for required static data files
    const publicDir = path.join(process.cwd(), 'public')
    const requiredFiles = [
      'posts-metadata.json',
      'search-index.json',
      'categories.json',
      'tags.json',
    ]

    const missingFiles = requiredFiles.filter(
      (file) => !fs.existsSync(path.join(publicDir, file))
    )

    if (missingFiles.length > 0) {
      console.log('❌ Missing static data files:')
      missingFiles.forEach((file) => console.log(`   • ${file}`))
      return false
    }

    console.log('✅ All required static data files present')

    // Validate static data integrity
    const postsMetadata = JSON.parse(
      fs.readFileSync(path.join(publicDir, 'posts-metadata.json'), 'utf8')
    )
    const searchIndex = JSON.parse(
      fs.readFileSync(path.join(publicDir, 'search-index.json'), 'utf8')
    )

    console.log(`📄 Blog posts: ${postsMetadata.length}`)
    console.log(
      `🔍 Search documents: ${Array.isArray(searchIndex) ? searchIndex.length : 'Invalid format'}`
    )

    // Validate Korean content
    const koreanPosts = postsMetadata.filter((post) =>
      /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(post.title + post.excerpt)
    )
    console.log(
      `🇰🇷 Posts with Korean content: ${koreanPosts.length}/${postsMetadata.length}`
    )

    if (koreanPosts.length === 0) {
      console.log('⚠️  No Korean content detected - check content processing')
    }

    return true
  } catch (error) {
    console.error('❌ Static generation validation failed:', error.message)
    return false
  }
}

function runBuildTest() {
  console.log('\n🔨 Running build test...')

  try {
    console.log('Building project...')
    const buildStart = Date.now()

    execSync('pnpm build', {
      stdio: 'pipe',
      encoding: 'utf8',
    })

    const buildTime = Date.now() - buildStart
    console.log(`✅ Build completed in ${(buildTime / 1000).toFixed(1)}s`)

    // Analyze build output
    const buildOutputPath = path.join(process.cwd(), '.next')
    if (fs.existsSync(buildOutputPath)) {
      const staticPath = path.join(buildOutputPath, 'static')
      const chunksPath = path.join(staticPath, 'chunks')

      if (fs.existsSync(chunksPath)) {
        const chunks = fs
          .readdirSync(chunksPath)
          .filter((file) => file.endsWith('.js'))
          .map((file) => {
            const filePath = path.join(chunksPath, file)
            const stats = fs.statSync(filePath)
            return {
              name: file,
              size: stats.size,
              sizeKB: (stats.size / 1024).toFixed(2),
            }
          })

        chunks.sort((a, b) => b.size - a.size)

        console.log('\n📊 Largest bundle chunks:')
        chunks.slice(0, 5).forEach((chunk) => {
          const icon = chunk.size > 100 * 1024 ? '🔴' : '✅'
          console.log(`${icon} ${chunk.name}: ${chunk.sizeKB} KB`)
        })

        const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0)
        console.log(
          `\n📦 Total JavaScript: ${(totalSize / 1024).toFixed(2)} KB`
        )
      }
    }

    // Test static export if configured
    const nextConfigPath = path.join(process.cwd(), 'next.config.js')
    if (fs.existsSync(nextConfigPath)) {
      const config = require(nextConfigPath)
      if (config.output === 'export') {
        console.log('\n📤 Testing static export...')

        const exportStart = Date.now()
        execSync('pnpm export', {
          stdio: 'pipe',
          encoding: 'utf8',
        })

        const exportTime = Date.now() - exportStart
        console.log(
          `✅ Static export completed in ${(exportTime / 1000).toFixed(1)}s`
        )

        const outDir = path.join(process.cwd(), 'out')
        if (fs.existsSync(outDir)) {
          const files = fs.readdirSync(outDir)
          console.log(`📁 Exported ${files.length} files`)
        }
      }
    }

    return true
  } catch (error) {
    console.error('❌ Build test failed:')
    console.error(error.stdout || error.message)
    return false
  }
}

function generateBuildScript() {
  console.log('\n📝 Generating optimized build scripts...')

  const buildScript = `#!/bin/bash
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
`

  fs.writeFileSync(
    path.join(process.cwd(), 'scripts/build-optimized.sh'),
    buildScript
  )
  fs.chmodSync(path.join(process.cwd(), 'scripts/build-optimized.sh'), '755')

  const ciScript = `name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Setup pnpm
      uses: pnpm/action-setup@v2
      with:
        version: latest
        
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
      
    - name: Generate static data
      run: node scripts/generate-static-data.js
      
    - name: Type check
      run: pnpm type-check
      
    - name: Lint
      run: pnpm lint
      
    - name: Run tests
      run: pnpm test
      
    - name: Build
      run: pnpm build
      
    - name: Performance check
      run: node scripts/performance-check.js
      
    - name: E2E tests
      run: pnpm test:e2e
      
    - name: Static export
      run: pnpm export
      if: github.event_name == 'push' && github.ref == 'refs/heads/main'
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.event_name == 'push' && github.ref == 'refs/heads/main'
      with:
        github_token: \${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./out
`

  const ciDir = path.join(process.cwd(), '.github', 'workflows')
  if (!fs.existsSync(ciDir)) {
    fs.mkdirSync(ciDir, { recursive: true })
  }
  fs.writeFileSync(path.join(ciDir, 'build-deploy.yml'), ciScript)

  console.log('✅ Build scripts generated:')
  console.log('   • scripts/build-optimized.sh')
  console.log('   • .github/workflows/build-deploy.yml')
}

function main() {
  console.log('🎯 Build Process Optimization and Static Export Validation\n')
  console.log('='.repeat(70))

  const results = {
    environment: validateEnvironment(),
    config: optimizeNextConfig(),
    static: validateStaticGeneration(),
    build: runBuildTest(),
  }

  generateBuildScript()

  console.log('\n' + '='.repeat(70))
  console.log('📊 Build Optimization Summary:')
  console.log(
    `Environment: ${results.environment ? '✅ PASS' : '❌ NEEDS ATTENTION'}`
  )
  console.log(
    `Configuration: ${results.config ? '✅ OPTIMIZED' : '⚠️  NEEDS OPTIMIZATION'}`
  )
  console.log(
    `Static Generation: ${results.static ? '✅ VALID' : '❌ ISSUES FOUND'}`
  )
  console.log(`Build Process: ${results.build ? '✅ SUCCESS' : '❌ FAILED'}`)

  const overallSuccess = Object.values(results).every((result) => result)
  console.log(
    `\n🎯 Overall Status: ${overallSuccess ? '✅ READY FOR PRODUCTION' : '⚠️  NEEDS OPTIMIZATION'}`
  )

  if (!overallSuccess) {
    console.log('\n💡 Next Steps:')
    console.log('   1. Address the issues identified above')
    console.log('   2. Run `scripts/build-optimized.sh` for production builds')
    console.log('   3. Monitor build performance in CI/CD')
    console.log('   4. Set up automated performance monitoring')
  } else {
    console.log('\n🚀 Ready for production deployment!')
    console.log('   • Use `scripts/build-optimized.sh` for builds')
    console.log('   • CI/CD pipeline configured in .github/workflows/')
    console.log('   • Performance monitoring enabled')
  }

  process.exit(overallSuccess ? 0 : 1)
}

if (require.main === module) {
  main()
}

module.exports = {
  validateEnvironment,
  optimizeNextConfig,
  validateStaticGeneration,
  runBuildTest,
}
