#!/bin/bash
# Lighthouse CI script for Korean blog site
# Run this script to audit Core Web Vitals

echo "Starting Lighthouse audit for Korean blog site..."

# Start development server
pnpm dev &
DEV_PID=$!

# Wait for server to start
sleep 5

# Run Lighthouse audits
npx lighthouse http://localhost:3000 \
  --chrome-flags="--headless --lang=ko-KR" \
  --locale=ko \
  --output=html \
  --output-path=./lighthouse-report.html \
  --view

# Audit blog post page
npx lighthouse http://localhost:3000/blog/react-hooks-guide \
  --chrome-flags="--headless --lang=ko-KR" \
  --locale=ko \
  --output=html \
  --output-path=./lighthouse-blog-report.html

# Stop development server
kill $DEV_PID

echo "Lighthouse reports generated:"
echo "- lighthouse-report.html (Homepage)"
echo "- lighthouse-blog-report.html (Blog Post)"
