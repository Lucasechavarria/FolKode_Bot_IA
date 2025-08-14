// This file acts as the test runner.
// It imports all test files and executes them.

console.log('%c[TEST RUNNER] Starting test suite...', 'color: #569cd6; font-weight: bold;');

const testModules = [
  './i18n.locales.test.ts',
  './services.personalityService.test.ts',
  './services.backendService.test.ts',
  // Add new test files here
];

const runTests = async () => {
  let passed = 0;
  let failed = 0;

  for (const path of testModules) {
    try {
      const testModule = await import(path);
      if (testModule.run) {
        const results = testModule.run();
        passed += results.passed;
        failed += results.failed;
      }
    } catch (e) {
      console.error(`%c[TEST RUNNER] Failed to load or run test module: ${path}`, 'color: #f44747;', e);
      failed++;
    }
  }

  console.log('%c[TEST RUNNER] Test suite finished.', 'color: #569cd6; font-weight: bold;');
  if (failed === 0) {
    console.log(`%c[RESULT] All ${passed} tests passed! ✅`, 'color: #4ec9b0; font-weight: bold;');
  } else {
    console.error(`%c[RESULT] ${failed} test(s) failed out of ${passed + failed}. ❌`, 'color: #f44747; font-weight: bold;');
  }
};

runTests();