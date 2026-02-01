const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });
  
  const htmlPath = path.join(__dirname, 'work/di_astrometry_visualizer.html');
  await page.goto(`file://${htmlPath}`);
  
  // Wait for content to load
  await page.waitForTimeout(2000);
  
  // Take screenshot
  await page.screenshot({ 
    path: path.join(__dirname, 'visualizer_screenshot.png'),
    fullPage: false
  });
  
  await browser.close();
  console.log('Screenshot saved to visualizer_screenshot.png');
})();
