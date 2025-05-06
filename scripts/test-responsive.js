#!/usr/bin/env node

/**
 * Automated responsive testing script using Playwright
 * 
 * Usage: 
 * npm install playwright
 * node scripts/test-responsive.js http://localhost:3000
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const url = require('url');

// Import our device list
const deviceViewports = {
  mobileSm: { width: 320, height: 568, name: 'Small Mobile (iPhone SE)' },
  mobileMd: { width: 375, height: 667, name: 'Medium Mobile (iPhone 8)' },
  mobileLg: { width: 414, height: 896, name: 'Large Mobile (iPhone 11)' },
  tabletSm: { width: 768, height: 1024, name: 'Small Tablet (iPad)' },
  tabletLg: { width: 1024, height: 1366, name: 'Large Tablet (iPad Pro)' },
  laptopSm: { width: 1280, height: 800, name: 'Small Laptop' },
  laptopMd: { width: 1440, height: 900, name: 'Medium Laptop' },
  laptopLg: { width: 1920, height: 1080, name: 'Large Laptop/Desktop' }
};

// Parse command line arguments
const args = process.argv.slice(2);
const baseUrl = args[0] || 'http://localhost:3000';
const pagesToTest = args.slice(1).length ? args.slice(1) : ['/'];
const screenshotsDir = path.join(process.cwd(), 'test-screenshots');

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Elements to test
const elementsToTest = [
  'header', 'nav', 'main', 'footer',
  '.btn', '.card', '.container', 
  'h1', 'h2', 'p',
  '.form-control', '.table'
];

async function runTests() {
  console.log(`🔍 Starting responsive testing for ${baseUrl}`);
  console.log(`📄 Pages to test: ${pagesToTest.join(', ')}`);
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Test each page
  for (const pagePath of pagesToTest) {
    const pageUrl = new url.URL(pagePath, baseUrl).toString();
    console.log(`\n📱 Testing page: ${pageUrl}`);
    
    // Test each device viewport
    for (const [deviceName, viewport] of Object.entries(deviceViewports)) {
      console.log(`\n📐 Testing on ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      // Set viewport size
      await page.setViewportSize({ 
        width: viewport.width, 
        height: viewport.height 
      });
      
      // Navigate to the page
      await page.goto(pageUrl, { waitUntil: 'networkidle' });
      
      // Take a screenshot
      const screenshotPath = path.join(
        screenshotsDir, 
        `${pagePath.replace(/\//g, '_')}-${deviceName}.png`
      );
      await page.screenshot({ path: screenshotPath });
      console.log(`   📸 Screenshot saved: ${screenshotPath}`);
      
      // Run responsive checks
      const results = await page.evaluate((selectors) => {
        const issues = [];
        const successes = [];
        
        // Check each selector
        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          
          if (elements.length === 0) {
            return; // Skip if no elements found
          }
          
          successes.push(`Found ${elements.length} elements matching "${selector}"`);
          
          elements.forEach((el, i) => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            
            // Check if element is visible
            if (rect.width === 0 || rect.height === 0) {
              issues.push(`Element ${selector}[${i}] has zero width or height`);
            }
            
            // Check if element is within viewport or intentionally off-screen
            if (rect.bottom < 0 || rect.right < 0 || rect.left > window.innerWidth || rect.top > window.innerHeight) {
              // Only report if the element isn't meant to be hidden
              if (style.display !== 'none' && style.visibility !== 'hidden') {
                issues.push(`Element ${selector}[${i}] is outside viewport`);
              }
            }
            
            // Check for readable text size
            if (parseFloat(style.fontSize) < 12) {
              issues.push(`Element ${selector}[${i}] has font size less than 12px (${style.fontSize})`);
            }
            
            // Check for touch target size (mobile accessibility)
            if (window.innerWidth <= 768) { // Only check on mobile sizes
              if ((rect.width < 44 || rect.height < 44) && 
                  (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'INPUT')) {
                issues.push(`Element ${selector}[${i}] may be too small for touch (${rect.width}x${rect.height}px)`);
              }
            }
          });
        });
        
        return { issues, successes };
      }, elementsToTest);
      
      // Report results
      if (results.issues.length > 0) {
        console.log('   ⚠️ Issues found:');
        results.issues.forEach(issue => console.log(`   - ${issue}`));
      } else {
        console.log('   ✅ All elements appear to be responsive!');
      }
    }
  }
  
  await browser.close();
  console.log('\n✨ Responsive testing complete! ✨');
}

runTests().catch(err => {
  console.error('Error running tests:', err);
  process.exit(1);
});
