#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { gzipSync } = require('zlib')

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getFileSize(filePath) {
  try {
    const content = fs.readFileSync(filePath)
    const gzipped = gzipSync(content)
    return {
      raw: content.length,
      gzipped: gzipped.length
    }
  } catch (error) {
    return null
  }
}

function analyzeBuildDir() {
  const buildDir = path.join(process.cwd(), '.next')
  const staticDir = path.join(buildDir, 'static')
  
  if (!fs.existsSync(buildDir)) {
    console.log('❌ Build directory not found. Run `npm run build` first.')
    return
  }

  console.log('📊 Bundle Size Analysis\n')
  console.log('=' * 50)

  // Analyze JavaScript chunks
  const chunksDir = path.join(staticDir, 'chunks')
  if (fs.existsSync(chunksDir)) {
    console.log('\n📦 JavaScript Chunks:')
    const chunks = fs.readdirSync(chunksDir)
      .filter(file => file.endsWith('.js'))
      .map(file => {
        const filePath = path.join(chunksDir, file)
        const sizes = getFileSize(filePath)
        return {
          name: file,
          ...sizes
        }
      })
      .sort((a, b) => b.raw - a.raw)

    chunks.forEach(chunk => {
      console.log(`  ${chunk.name}: ${formatBytes(chunk.raw)} (${formatBytes(chunk.gzipped)} gzipped)`)
    })

    const totalJS = chunks.reduce((total, chunk) => total + chunk.raw, 0)
    const totalJSGzipped = chunks.reduce((total, chunk) => total + chunk.gzipped, 0)
    console.log(`\n  Total JS: ${formatBytes(totalJS)} (${formatBytes(totalJSGzipped)} gzipped)`)
  }

  // Analyze CSS files
  const cssDir = path.join(staticDir, 'css')
  if (fs.existsSync(cssDir)) {
    console.log('\n🎨 CSS Files:')
    const cssFiles = fs.readdirSync(cssDir)
      .filter(file => file.endsWith('.css'))
      .map(file => {
        const filePath = path.join(cssDir, file)
        const sizes = getFileSize(filePath)
        return {
          name: file,
          ...sizes
        }
      })

    cssFiles.forEach(file => {
      console.log(`  ${file.name}: ${formatBytes(file.raw)} (${formatBytes(file.gzipped)} gzipped)`)
    })

    const totalCSS = cssFiles.reduce((total, file) => total + file.raw, 0)
    const totalCSSGzipped = cssFiles.reduce((total, file) => total + file.gzipped, 0)
    console.log(`\n  Total CSS: ${formatBytes(totalCSS)} (${formatBytes(totalCSSGzipped)} gzipped)`)
  }

  // Check for large files (> 100KB)
  console.log('\n⚠️  Large Files (>100KB):')
  const allFiles = []
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir)
    items.forEach(item => {
      const itemPath = path.join(dir, item)
      const stat = fs.statSync(itemPath)
      
      if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.css'))) {
        const sizes = getFileSize(itemPath)
        if (sizes && sizes.raw > 100 * 1024) { // 100KB
          allFiles.push({
            path: path.relative(buildDir, itemPath),
            ...sizes
          })
        }
      } else if (stat.isDirectory()) {
        scanDirectory(itemPath)
      }
    })
  }

  scanDirectory(staticDir)
  
  if (allFiles.length > 0) {
    allFiles.sort((a, b) => b.raw - a.raw)
    allFiles.forEach(file => {
      console.log(`  ${file.path}: ${formatBytes(file.raw)} (${formatBytes(file.gzipped)} gzipped)`)
    })
  } else {
    console.log('  ✅ No large files found!')
  }

  // Recommendations
  console.log('\n💡 Optimization Recommendations:')
  
  if (allFiles.some(f => f.raw > 500 * 1024)) {
    console.log('  - Consider code splitting for files larger than 500KB')
  }
  
  console.log('  - Use dynamic imports for non-critical components')
  console.log('  - Enable tree shaking for unused exports')
  console.log('  - Consider using a CDN for static assets')
  console.log('  - Optimize images with Next.js Image component')
  
  console.log('\n✨ Run `npm run build:analyze` to open bundle analyzer')
}

analyzeBuildDir()