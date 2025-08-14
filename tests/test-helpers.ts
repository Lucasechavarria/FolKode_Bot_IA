let currentSuite = '';
let passedTests = 0;
let failedTests = 0;
let beforeCallbacks: (() => void)[] = [];
let afterCallbacks: (() => void)[] = [];

const log = (message: string, color: string = '#d4d4d4') => {
  console.log(`%c${message}`, `color: ${color}`);
};

export const describe = (description: string, callback: () => void) => {
  currentSuite = description;
  log(`\n[SUITE] ${description}`, '#dcdcaa');
  beforeCallbacks = [];
  afterCallbacks = [];
  callback();
};

export const beforeEach = (callback: () => void) => {
    beforeCallbacks.push(callback);
}

export const afterEach = (callback: () => void) => {
    afterCallbacks.push(callback);
}

export const it = (description: string, callback: () => void) => {
  beforeCallbacks.forEach(cb => cb());
  try {
    callback();
    log(`  ✅ PASS: ${description}`, '#4ec9b0');
    passedTests++;
  } catch (error: any) {
    log(`  ❌ FAIL: ${description}`, '#f44747');
    console.error(`    ${error.message}`);
    if(error.stack) {
        console.error(`    ${error.stack.split('\n').slice(1, 3).join('\n').trim()}`);
    }
    failedTests++;
  }
  afterCallbacks.forEach(cb => cb());
};

export const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
    }
  },
  toEqual: (expected: any) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
    }
  },
  toContain: (expected: any) => {
    if (!actual.includes(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
    }
  },
  toHaveBeenCalledWith: (expected: any) => {
     if (actual.mock?.calls?.[0]?.[0] !== expected) {
         throw new Error(`Expected function to have been called with ${JSON.stringify(expected)}`);
     }
  },
  toHaveBeenCalled: () => {
    if(actual.mock?.calls?.length === 0) {
        throw new Error('Expected function to have been called');
    }
  }
  // Add more assertions here as needed
});

export const getResults = () => ({
  passed: passedTests,
  failed: failedTests,
});

export const resetResults = () => {
    passedTests = 0;
    failedTests = 0;
}

export const mockFn = () => {
    const mock = (...args: any[]) => {
        mock.mock.calls.push(args);
    };
    mock.mock = {
        calls: [] as any[][],
    };
    return mock;
}