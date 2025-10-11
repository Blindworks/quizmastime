const puppeteer = require('puppeteer');

async function testFrontend() {
  console.log('Starting Puppeteer tests for QuizmasTime Frontend...\n');

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 }); // Tablet size

  const results = {
    passed: [],
    failed: []
  };

  try {
    // Test 1: Navigate to the app
    console.log('Test 1: Loading application...');
    await page.goto('http://localhost:4200', { waitUntil: 'networkidle2' });
    results.passed.push('✓ Application loads successfully');

    // Test 2: Check if player selection page is displayed
    console.log('Test 2: Checking player selection page...');
    const playerSelectionTitle = await page.$eval('h2', el => el.textContent);
    if (playerSelectionTitle.includes('Wer spielt heute')) {
      results.passed.push('✓ Player selection page displays correctly');
    } else {
      results.failed.push('✗ Player selection title not found');
    }

    // Test 3: Check logo/title
    console.log('Test 3: Checking game title...');
    const gameTitle = await page.$eval('h1', el => el.textContent);
    if (gameTitle.includes('QuizmasTime')) {
      results.passed.push('✓ Game title displayed');
    } else {
      results.failed.push('✗ Game title not found');
    }

    // Test 4: Check "Neuer Spieler" button
    console.log('Test 4: Testing new player button...');
    const newPlayerButton = await page.$('.player-card.new-player');
    if (newPlayerButton) {
      results.passed.push('✓ New player button exists');

      // Click new player button
      await newPlayerButton.click();
      await page.waitForSelector('.new-player-form', { timeout: 2000 });
      results.passed.push('✓ New player form appears after click');

      // Test 5: Fill in new player name
      console.log('Test 5: Testing player name input...');
      const nameInput = await page.$('input[matInput]');
      if (nameInput) {
        await nameInput.type('TestSpieler');
        const inputValue = await page.$eval('input[matInput]', el => el.value);
        if (inputValue === 'TestSpieler') {
          results.passed.push('✓ Player name input works');
        } else {
          results.failed.push('✗ Player name input failed');
        }
      } else {
        results.failed.push('✗ Name input field not found');
      }

      // Test 6: Check if "Spielen!" button is enabled
      console.log('Test 6: Checking submit button state...');
      const submitButton = await page.$('button[color="primary"]');
      const isDisabled = await page.$eval('button[color="primary"]', el => el.disabled);
      if (!isDisabled) {
        results.passed.push('✓ Submit button is enabled when name is entered');
      } else {
        results.failed.push('✗ Submit button should be enabled');
      }

    } else {
      results.failed.push('✗ New player button not found');
    }

    // Test 7: Check responsive design elements
    console.log('Test 7: Checking responsive design...');
    const container = await page.$('.player-selection-container');
    if (container) {
      const styles = await page.$eval('.player-selection-container', el => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          background: computed.background
        };
      });
      if (styles.display === 'flex') {
        results.passed.push('✓ Responsive layout is applied');
      } else {
        results.failed.push('✗ Responsive layout issue');
      }
    }

    // Test 8: Take screenshots
    console.log('Test 8: Taking screenshots...');
    await page.screenshot({
      path: 'quizmastime-frontend/screenshot-player-selection.png',
      fullPage: true
    });
    results.passed.push('✓ Screenshot saved: screenshot-player-selection.png');

    // Note: We can't test navigation to calendar without backend API
    console.log('\nNote: Calendar navigation requires backend API to be running');

  } catch (error) {
    results.failed.push(`✗ Error during testing: ${error.message}`);
    console.error('Error:', error);
  }

  // Print results
  console.log('\n' + '='.repeat(50));
  console.log('TEST RESULTS');
  console.log('='.repeat(50));

  console.log('\nPassed Tests (' + results.passed.length + '):');
  results.passed.forEach(test => console.log(test));

  if (results.failed.length > 0) {
    console.log('\nFailed Tests (' + results.failed.length + '):');
    results.failed.forEach(test => console.log(test));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${results.passed.length + results.failed.length} tests`);
  console.log(`Success Rate: ${Math.round((results.passed.length / (results.passed.length + results.failed.length)) * 100)}%`);
  console.log('='.repeat(50) + '\n');

  await browser.close();

  // Exit with error code if tests failed
  process.exit(results.failed.length > 0 ? 1 : 0);
}

testFrontend().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
