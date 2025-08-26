import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Howler.js
jest.mock('howler', () => ({
  Howl: jest.fn().mockImplementation(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    volume: jest.fn(),
    fade: jest.fn(),
    on: jest.fn(),
  })),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    button: 'button',
    h2: 'h2',
    p: 'p',
  },
  AnimatePresence: ({ children }) => children,
}))

// Global test utilities
global.performance = {
  now: jest.fn(() => Date.now()),
}

// Mock browser APIs not available in JSDOM
global.matchMedia = global.matchMedia || function (query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
};

// Mock crypto.randomUUID
global.crypto = global.crypto || {};
global.crypto.randomUUID = global.crypto.randomUUID || jest.fn(() => 'test-uuid-' + Math.random().toString(36).substring(2));

// Mock AudioContext for AudioManager
global.AudioContext = global.AudioContext || function AudioContext() {
  return {
    createGain: jest.fn(() => ({ connect: jest.fn(), disconnect: jest.fn() })),
    createOscillator: jest.fn(() => ({ connect: jest.fn(), start: jest.fn(), stop: jest.fn() })),
    destination: {},
    currentTime: 0,
  };
};
global.webkitAudioContext = global.AudioContext;