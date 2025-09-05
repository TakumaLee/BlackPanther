const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();
  
  // Listen to console logs
  page.on('console', msg => {
    console.log('[BROWSER CONSOLE]', msg.type().toUpperCase(), msg.text());
  });
  
  // Listen to errors
  page.on('error', err => {
    console.log('[PAGE ERROR]', err.message);
  });
  
  // Listen to network requests
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log('[NETWORK ERROR]', response.status(), response.url());
    }
  });
  
  try {
    console.log('Navigating to http://localhost:3000');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Take screenshot of login page
    await page.screenshot({ path: 'login-page.png' });
    console.log('Screenshot saved: login-page.png');
    
    // Check localStorage before login
    const localStorageBefore = await page.evaluate(() => {
      return {
        auth_token: localStorage.getItem('auth_token'),
        auth_user: localStorage.getItem('auth_user'),
        allKeys: Object.keys(localStorage)
      };
    });
    console.log('localStorage before login:', localStorageBefore);
    
    // Login
    console.log('Attempting login...');
    await page.type('input[name="email"]', 'admin@blackswamp.app');
    await page.type('input[name="password"]', 'Admin@123456');
    await page.click('button[type="submit"]');
    
    // Wait for redirect or login to complete
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if we're on dashboard
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Check localStorage after login
    const localStorageAfter = await page.evaluate(() => {
      return {
        auth_token: localStorage.getItem('auth_token'),
        auth_user: localStorage.getItem('auth_user'),
        allKeys: Object.keys(localStorage)
      };
    });
    console.log('localStorage after login:', localStorageAfter);
    
    // Take screenshot after login
    await page.screenshot({ path: 'after-login.png' });
    console.log('Screenshot saved: after-login.png');
    
    if (currentUrl.includes('dashboard')) {
      console.log('Login successful! Testing menu items...');
      
      // Test menu items one by one
      const menuItems = [
        { name: 'Reviews', selector: 'a[href*="reviews"]' },
        { name: 'Stats', selector: 'a[href*="stats"]' },
        { name: 'Users', selector: 'a[href*="users"]' },
        { name: 'Blocks', selector: 'a[href*="blocks"]' }
      ];
      
      for (const menuItem of menuItems) {
        console.log(`\nTesting menu item: ${menuItem.name}`);
        
        // Check localStorage before clicking
        const localStorageBeforeClick = await page.evaluate(() => {
          return {
            auth_token: localStorage.getItem('auth_token'),
            auth_user: localStorage.getItem('auth_user'),
            allKeys: Object.keys(localStorage)
          };
        });
        console.log(`localStorage before ${menuItem.name}:`, localStorageBeforeClick);
        
        try {
          // Click menu item
          await page.click(menuItem.selector);
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait longer for API calls
          
          // Check localStorage after clicking
          const localStorageAfterClick = await page.evaluate(() => {
            return {
              auth_token: localStorage.getItem('auth_token'),
              auth_user: localStorage.getItem('auth_user'),
              allKeys: Object.keys(localStorage)
            };
          });
          console.log(`localStorage after ${menuItem.name}:`, localStorageAfterClick);
          
          // Check if localStorage was cleared
          const wasCleared = !localStorageAfterClick.auth_token && localStorageBeforeClick.auth_token;
          
          // Check if we got logged out
          const newUrl = page.url();
          if (newUrl.includes('login') || !newUrl.includes('dashboard') || wasCleared) {
            console.log(`❌ LOGOUT DETECTED after clicking ${menuItem.name}!`);
            console.log(`  URL changed to: ${newUrl}`);
            console.log(`  localStorage cleared: ${wasCleared}`);
            await page.screenshot({ path: `logout-after-${menuItem.name.replace(' ', '-')}.png` });
          } else {
            console.log(`✅ ${menuItem.name} - No logout detected`);
          }
          
          // Take screenshot
          await page.screenshot({ path: `menu-${menuItem.name.replace(' ', '-')}.png` });
          
        } catch (error) {
          console.log(`Error testing ${menuItem.name}:`, error.message);
        }
        
        // Go back to dashboard home
        try {
          await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.log('Error navigating back to dashboard:', error.message);
        }
      }
    } else {
      console.log('Login failed or redirected somewhere else');
      await page.screenshot({ path: 'login-failed.png' });
    }
    
  } catch (error) {
    console.error('Test error:', error);
    await page.screenshot({ path: 'test-error.png' });
  }
  
  console.log('\nTest completed. Keeping browser open for 30 seconds for manual inspection...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  await browser.close();
})();