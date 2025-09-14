#!/usr/bin/env node

/**
 * Performance optimization and Core Web Vitals validation script
 * Checks build output, bundle sizes, and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals thresholds
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100,  // First Input Delay (ms)
  CLS: 0.1,  // Cumulative Layout Shift

  // Bundle size thresholds (KB)
  MAIN_BUNDLE: 250,
  CHUNK_BUNDLE: 150,
  CSS_BUNDLE: 50,

  // Image optimization thresholds
  MAX_IMAGE_SIZE: 500, // KB
  WEBP_SUPPORT: true
};

function analyzeBundle() {
  console.log('📊 Analyzing bundle sizes...');
  
  try {
    const nextDir = path.join(process.cwd(), '.next');
    if (!fs.existsSync(nextDir)) {
      console.error('❌ .next directory not found. Run `pnpm build` first.');
      return false;
    }

    // Check for Next.js build analyzer output
    const buildId = fs.readFileSync(path.join(nextDir, 'BUILD_ID'), 'utf8').trim();
    const staticDir = path.join(nextDir, 'static', 'chunks');
    
    if (fs.existsSync(staticDir)) {
      const chunks = fs.readdirSync(staticDir);
      const jsChunks = chunks.filter(chunk => chunk.endsWith('.js'));
      
      console.log('\n📦 Bundle Analysis:');
      
      let hasLargeChunks = false;
      jsChunks.forEach(chunk => {
        const chunkPath = path.join(staticDir, chunk);
        const stats = fs.statSync(chunkPath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        
        const isLarge = stats.size > PERFORMANCE_THRESHOLDS.MAIN_BUNDLE * 1024;
        const icon = isLarge ? '🔴' : '✅';
        
        console.log(`${icon} ${chunk}: ${sizeKB} KB`);
        
        if (isLarge) {
          hasLargeChunks = true;
          console.log(`   ⚠️  Chunk exceeds ${PERFORMANCE_THRESHOLDS.MAIN_BUNDLE} KB threshold`);
        }
      });
      
      if (hasLargeChunks) {
        console.log('\n💡 Bundle Optimization Recommendations:');
        console.log('   • Enable dynamic imports for large components');
        console.log('   • Use Next.js built-in code splitting');
        console.log('   • Consider lazy loading non-critical components');
        console.log('   • Analyze bundle with @next/bundle-analyzer');
      }
      
      return !hasLargeChunks;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
    return false;
  }
}

function analyzeImages() {
  console.log('\n🖼️  Analyzing image optimization...');
  
  const publicDir = path.join(process.cwd(), 'public');
  const contentDir = path.join(process.cwd(), 'content');
  
  let hasLargeImages = false;
  let totalImages = 0;
  
  function checkImagesInDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    items.forEach(item => {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        checkImagesInDir(fullPath);
      } else if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(item.name)) {
        totalImages++;
        const stats = fs.statSync(fullPath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        
        if (stats.size > PERFORMANCE_THRESHOLDS.MAX_IMAGE_SIZE * 1024) {
          hasLargeImages = true;
          console.log(`🔴 Large image: ${path.relative(process.cwd(), fullPath)} (${sizeKB} KB)`);
        }
      }
    });
  }
  
  checkImagesInDir(publicDir);
  checkImagesInDir(contentDir);
  
  console.log(`📸 Found ${totalImages} images`);
  
  if (hasLargeImages) {
    console.log('\n💡 Image Optimization Recommendations:');
    console.log('   • Use Next.js Image component for automatic optimization');
    console.log('   • Convert images to WebP/AVIF format');
    console.log('   • Use responsive images with srcset');
    console.log('   • Compress images before adding to repository');
    console.log('   • Consider using external image optimization services');
  } else {
    console.log('✅ No large images detected');
  }
  
  return !hasLargeImages;
}

function checkStaticGeneration() {
  console.log('\n⚡ Checking static generation...');
  
  try {
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    const nextConfig = require(nextConfigPath);
    
    const staticOptimizations = [];
    const warnings = [];
    
    // Check for static export
    if (nextConfig.output === 'export') {
      staticOptimizations.push('✅ Static export enabled');
    } else {
      warnings.push('⚠️  Static export not enabled - consider for better performance');
    }
    
    // Check for image optimization
    if (nextConfig.images) {
      if (nextConfig.images.unoptimized === false) {
        staticOptimizations.push('✅ Image optimization enabled');
      } else {
        warnings.push('⚠️  Image optimization disabled');
      }
      
      if (nextConfig.images.formats && nextConfig.images.formats.includes('image/webp')) {
        staticOptimizations.push('✅ WebP format supported');
      }
    }
    
    staticOptimizations.forEach(opt => console.log(opt));
    warnings.forEach(warning => console.log(warning));
    
    return warnings.length === 0;
  } catch (error) {
    console.error('❌ Static generation check failed:', error.message);
    return false;
  }
}

function checkCoreWebVitals() {
  console.log('\n🎯 Core Web Vitals Recommendations:');
  
  const recommendations = [
    {
      metric: 'LCP (Largest Contentful Paint)',
      target: `< ${PERFORMANCE_THRESHOLDS.LCP}ms`,
      tips: [
        'Optimize images with Next.js Image component',
        'Use font-display: swap for web fonts',
        'Minimize render-blocking resources',
        'Use CDN for static assets'
      ]
    },
    {
      metric: 'FID (First Input Delay)', 
      target: `< ${PERFORMANCE_THRESHOLDS.FID}ms`,
      tips: [
        'Minimize JavaScript execution time',
        'Use code splitting and lazy loading',
        'Remove unused JavaScript',
        'Use web workers for heavy computations'
      ]
    },
    {
      metric: 'CLS (Cumulative Layout Shift)',
      target: `< ${PERFORMANCE_THRESHOLDS.CLS}`,
      tips: [
        'Set explicit dimensions for images and embeds',
        'Reserve space for dynamic content',
        'Use CSS aspect-ratio for responsive images',
        'Avoid inserting content above existing content'
      ]
    }
  ];
  
  recommendations.forEach(({ metric, target, tips }) => {
    console.log(`\n📊 ${metric} (target: ${target}):`);
    tips.forEach(tip => console.log(`   • ${tip}`));
  });
}

function generateLighthouseScript() {
  console.log('\n🔍 Generating Lighthouse audit script...');
  
  const lighthouseScript = `#!/bin/bash
# Lighthouse CI script for Korean blog site
# Run this script to audit Core Web Vitals

echo "Starting Lighthouse audit for Korean blog site..."

# Start development server
pnpm dev &
DEV_PID=$!

# Wait for server to start
sleep 5

# Run Lighthouse audits
npx lighthouse http://localhost:3000 \\
  --chrome-flags="--headless --lang=ko-KR" \\
  --locale=ko \\
  --output=html \\
  --output-path=./lighthouse-report.html \\
  --view

# Audit blog post page
npx lighthouse http://localhost:3000/blog/react-hooks-guide \\
  --chrome-flags="--headless --lang=ko-KR" \\
  --locale=ko \\
  --output=html \\
  --output-path=./lighthouse-blog-report.html

# Stop development server
kill $DEV_PID

echo "Lighthouse reports generated:"
echo "- lighthouse-report.html (Homepage)"
echo "- lighthouse-blog-report.html (Blog Post)"
`;

  fs.writeFileSync(path.join(process.cwd(), 'scripts/lighthouse-audit.sh'), lighthouseScript);
  fs.chmodSync(path.join(process.cwd(), 'scripts/lighthouse-audit.sh'), '755');
  
  console.log('✅ Lighthouse audit script created at scripts/lighthouse-audit.sh');
}

function checkKoreanOptimizations() {
  console.log('\n🇰🇷 Korean Language Optimizations:');
  
  const checks = [
    {
      name: 'Korean font loading',
      check: () => {
        const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
        if (fs.existsSync(layoutPath)) {
          const layout = fs.readFileSync(layoutPath, 'utf8');
          return layout.includes('Noto Sans KR') || layout.includes('한글');
        }
        return false;
      },
      tip: 'Use optimized Korean fonts like Noto Sans KR with font-display: swap'
    },
    {
      name: 'Korean locale configuration',
      check: () => {
        const nextConfigPath = path.join(process.cwd(), 'next.config.js');
        if (fs.existsSync(nextConfigPath)) {
          const config = fs.readFileSync(nextConfigPath, 'utf8');
          return config.includes('ko') || config.includes('korean');
        }
        return false;
      },
      tip: 'Configure Korean locale in next.config.js for better SEO'
    },
    {
      name: 'Korean search optimization',
      check: () => {
        const searchPath = path.join(process.cwd(), 'src/lib/search.ts');
        if (fs.existsSync(searchPath)) {
          const search = fs.readFileSync(searchPath, 'utf8');
          return search.includes('korean') || search.includes('한글');
        }
        return false;
      },
      tip: 'Implement Korean-specific search optimizations (consonant/vowel matching)'
    }
  ];
  
  checks.forEach(({ name, check, tip }) => {
    const passed = check();
    const icon = passed ? '✅' : '⚠️ ';
    console.log(`${icon} ${name}`);
    if (!passed) {
      console.log(`   💡 ${tip}`);
    }
  });
}

function main() {
  console.log('🚀 Performance Optimization and Core Web Vitals Check\n');
  console.log('=' .repeat(60));
  
  const results = {
    bundle: analyzeBundle(),
    images: analyzeImages(), 
    static: checkStaticGeneration()
  };
  
  checkCoreWebVitals();
  checkKoreanOptimizations();
  generateLighthouseScript();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Performance Check Summary:');
  console.log(`Bundle Analysis: ${results.bundle ? '✅ PASS' : '❌ NEEDS IMPROVEMENT'}`);
  console.log(`Image Optimization: ${results.images ? '✅ PASS' : '❌ NEEDS IMPROVEMENT'}`);  
  console.log(`Static Generation: ${results.static ? '✅ PASS' : '⚠️  PARTIAL'}`);
  
  const overallPass = Object.values(results).every(result => result);
  console.log(`\n🎯 Overall Performance: ${overallPass ? '✅ EXCELLENT' : '⚠️  NEEDS OPTIMIZATION'}`);
  
  if (!overallPass) {
    console.log('\n💡 Next Steps:');
    console.log('   1. Address the warnings above');
    console.log('   2. Run `scripts/lighthouse-audit.sh` for detailed analysis');
    console.log('   3. Test on real devices with slower networks');
    console.log('   4. Monitor Core Web Vitals in production');
  }
  
  process.exit(overallPass ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { analyzeBundle, analyzeImages, checkStaticGeneration };