const {JSDOM} = require('jsdom');
import createVisibilityStateListener from '../src/visibilityStateListener';
import {VisibilityStateListener} from '../src/interfaces';

describe('createVisibilityStateListener', () => {
  let listener: VisibilityStateListener | null;
  let jsdom: any;

  beforeEach(() => {
    jest.useFakeTimers();

    jsdom = new JSDOM('<!doctype html><html><body></body></html>', {
      url: 'http://localhost',
    });

    Object.defineProperty(jsdom.window.document, 'visibilityState', {
      value: 'visible',
      writable: true,
    });

    listener = createVisibilityStateListener({
      document: jsdom.window.document,
      window: jsdom.window,
    });
  });

  afterEach(() => {
    listener = null;
    jsdom = null;
  });

  it('should trigger update event when visibility state changes', () => {
    const updateHandler = jest.fn();

    listener!.on('update', updateHandler);
    listener!.start();

    jsdom.window.document.visibilityState = 'hidden';
    jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

    expect(updateHandler).toHaveBeenCalledTimes(1);
    expect(updateHandler).toHaveBeenCalledWith('hidden');

    jsdom.window.document.visibilityState = 'visible';
    jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

    expect(updateHandler).toHaveBeenCalledTimes(2);
    expect(updateHandler).toHaveBeenCalledWith('visible');
  });

  it('should start the listener', () => {
    expect(listener!.start()).toBe(true);
    expect(listener!.start()).toBe(true); // Starting again should return true
  });

  it('should pause the listener', () => {
    listener!.start();

    expect(listener!.pause()).toBe(true);
    expect(listener!.pause()).toBe(true); // Pausing again should return true
  });

  it('should get the current state', () => {
    listener!.start();

    expect(listener!.getState()).toBe('visible');

    jsdom.window.document.visibilityState = 'hidden';
    jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

    expect(listener!.getState()).toBe('hidden');
  });

  it('should get the last state change time', () => {
    listener!.start();

    const time1 = listener!.getLastStateChangeTime();

    expect(time1).toBeNull();

    jsdom.window.document.visibilityState = 'hidden';
    jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

    jest.advanceTimersByTime(1000);

    jsdom.window.document.visibilityState = 'visible';
    jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

    const time2 = JSON.parse(JSON.stringify(listener!.getLastStateChangeTime()));

    expect(time2).not.toBeNull();
    expect(time2).toBeLessThanOrEqual(Date.now());

    jsdom.window.document.visibilityState = 'hidden';
    jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

    jest.advanceTimersByTime(1000);

    jsdom.window.document.visibilityState = 'visible';
    jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

    const time3 = listener!.getLastStateChangeTime();

    expect(time3).not.toBeNull();
    expect(time3).toBeLessThanOrEqual(Date.now());

    expect(time3).toBeGreaterThan(time2 as number);
  });

  it('should get the state change count', () => {
    listener!.start();

    expect(listener!.getStateChangeCount()).toBe(0);

    jsdom.window.document.visibilityState = 'hidden';
    jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

    expect(listener!.getStateChangeCount()).toBe(1);
  });

  it('should register and trigger event listeners', () => {
    listener!.start();

    const updateHandler = jest.fn();

    listener!.on('update', updateHandler);

    jsdom.window.document.visibilityState = 'hidden';
    jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

    expect(updateHandler).toHaveBeenCalledTimes(1);
    expect(updateHandler).toHaveBeenCalledWith('hidden');
  });

  it('should handle invalid globals', () => {
    Object.defineProperty(global, 'window', {
      value: undefined,
    });

    listener = createVisibilityStateListener();

    expect(listener.hasError()).toBe(true);
    expect(listener.getError()).toBe('INVALID_GLOBALS');
    expect(listener.start()).toBe(false);
    expect(listener.pause()).toBe(false);
  });

  it('should not emit the event when the listener is paused', () => {
    const updateHandler = jest.fn();

    listener!.on('update', updateHandler);
    listener!.start();

    listener!.pause();

    jsdom.window.document.visibilityState = 'hidden';
    jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

    expect(updateHandler).not.toHaveBeenCalled();
  });

  describe('destroy()', () => {
    it('should remove all event listeners when destroyed', () => {
      const updateHandler = jest.fn();

      listener!.on('update', updateHandler);
      listener!.start();

      // Verify listener is working
      jsdom.window.document.visibilityState = 'hidden';
      jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));
      expect(updateHandler).toHaveBeenCalledTimes(1);

      // Destroy the listener
      listener!.destroy();

      // Events should no longer trigger
      jsdom.window.document.visibilityState = 'visible';
      jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));
      expect(updateHandler).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it('should allow restarting after destroy', () => {
      const updateHandler = jest.fn();

      listener!.on('update', updateHandler);
      listener!.start();
      listener!.destroy();

      // Should be able to start again
      expect(listener!.start()).toBe(true);

      jsdom.window.document.visibilityState = 'hidden';
      jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

      expect(updateHandler).toHaveBeenCalledTimes(1);
    });

    it('should handle destroy when listener is not started', () => {
      expect(() => {
        listener!.destroy();
      }).not.toThrow();
    });

    it('should handle destroy when listener is paused', () => {
      listener!.start();
      listener!.pause();

      expect(() => {
        listener!.destroy();
      }).not.toThrow();
    });
  });

  describe('initial visibility state', () => {
    it('should read initial state as visible when document.visibilityState is visible', () => {
      const customJsdom = new JSDOM('<!doctype html><html><body></body></html>', {
        url: 'http://localhost',
      });

      Object.defineProperty(customJsdom.window.document, 'visibilityState', {
        value: 'visible',
        writable: true,
        configurable: true,
      });

      Object.defineProperty(customJsdom.window.document, 'hidden', {
        value: false,
        writable: true,
        configurable: true,
      });

      const customListener = createVisibilityStateListener({
        document: customJsdom.window.document,
        window: customJsdom.window,
      });

      expect(customListener.getState()).toBe('visible');
    });

    it('should read initial state as hidden when document.visibilityState is hidden', () => {
      const customJsdom = new JSDOM('<!doctype html><html><body></body></html>', {
        url: 'http://localhost',
      });

      Object.defineProperty(customJsdom.window.document, 'visibilityState', {
        value: 'hidden',
        writable: true,
        configurable: true,
      });

      Object.defineProperty(customJsdom.window.document, 'hidden', {
        value: true,
        writable: true,
        configurable: true,
      });

      const customListener = createVisibilityStateListener({
        document: customJsdom.window.document,
        window: customJsdom.window,
      });

      expect(customListener.getState()).toBe('hidden');
    });

    it('should read prerender state from document.visibilityState', () => {
      const customJsdom = new JSDOM('<!doctype html><html><body></body></html>', {
        url: 'http://localhost',
      });

      // JSDOM defaults to 'prerender' state
      const customListener = createVisibilityStateListener({
        document: customJsdom.window.document,
        window: customJsdom.window,
      });

      // Should read the actual state from document, not default to 'visible'
      expect(customListener.getState()).toBe('prerender');
    });

    it('should fallback to visible when visibilityState returns empty or falsy value', () => {
      const customJsdom = new JSDOM('<!doctype html><html><body></body></html>', {
        url: 'http://localhost',
      });

      Object.defineProperty(customJsdom.window.document, 'visibilityState', {
        value: '',
        writable: true,
        configurable: true,
      });

      Object.defineProperty(customJsdom.window.document, 'hidden', {
        value: false,
        writable: true,
        configurable: true,
      });

      const customListener = createVisibilityStateListener({
        document: customJsdom.window.document,
        window: customJsdom.window,
      });

      expect(customListener.getState()).toBe('visible');
    });
  });

  describe('pause and resume behavior', () => {
    it('should not track state changes while paused', () => {
      listener!.start();

      jsdom.window.document.visibilityState = 'hidden';
      jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

      expect(listener!.getStateChangeCount()).toBe(1);

      listener!.pause();

      // Changes while paused
      jsdom.window.document.visibilityState = 'visible';
      jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

      jsdom.window.document.visibilityState = 'hidden';
      jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

      // Count should still be 1
      expect(listener!.getStateChangeCount()).toBe(1);
    });

    it('should resume tracking after pause', () => {
      listener!.start();
      listener!.pause();
      listener!.start();

      jsdom.window.document.visibilityState = 'hidden';
      jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

      expect(listener!.getStateChangeCount()).toBe(1);
    });
  });

  describe('focus-blur-ie strategy (legacy IE)', () => {
    it('should use attachEvent/detachEvent for legacy IE', () => {
      // Create a minimal mock document for IE
      const mockDoc: any = {
        attachEvent: jest.fn().mockReturnValue(true),
        detachEvent: jest.fn(),
      };

      const mockWin: any = {};

      const ieListener = createVisibilityStateListener({
        document: mockDoc,
        window: mockWin,
      });

      ieListener.start();

      // Should have called attachEvent twice (for focusin and focusout)
      expect(mockDoc.attachEvent).toHaveBeenCalledTimes(2);
      expect(mockDoc.attachEvent).toHaveBeenCalledWith('onfocusin', expect.any(Function));
      expect(mockDoc.attachEvent).toHaveBeenCalledWith('onfocusout', expect.any(Function));

      ieListener.pause();

      // Should have called detachEvent
      expect(mockDoc.detachEvent).toHaveBeenCalledTimes(2);
      expect(mockDoc.detachEvent).toHaveBeenCalledWith('onfocusin', expect.any(Function));
      expect(mockDoc.detachEvent).toHaveBeenCalledWith('onfocusout', expect.any(Function));
    });

    it('should handle destroy with focus-blur-ie strategy', () => {
      const mockDoc: any = {
        attachEvent: jest.fn().mockReturnValue(true),
        detachEvent: jest.fn(),
      };

      const mockWin: any = {};

      const ieListener = createVisibilityStateListener({
        document: mockDoc,
        window: mockWin,
      });

      ieListener.start();
      ieListener.destroy();

      expect(mockDoc.detachEvent).toHaveBeenCalledTimes(2);
    });
  });

  describe('focus-blur strategy (older browsers)', () => {
    it('should use focus/blur events when visibilityState is not available', () => {
      // Create minimal mocks for older browsers
      const mockDoc: any = {
        addEventListener: jest.fn(),
      };

      const mockWin: any = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };

      const focusBlurListener = createVisibilityStateListener({
        document: mockDoc,
        window: mockWin,
      });

      focusBlurListener.start();

      // Should have called addEventListener for focus and blur
      expect(mockWin.addEventListener).toHaveBeenCalledTimes(2);
      expect(mockWin.addEventListener).toHaveBeenCalledWith('focus', expect.any(Function), true);
      expect(mockWin.addEventListener).toHaveBeenCalledWith('blur', expect.any(Function), true);

      focusBlurListener.pause();

      expect(mockWin.removeEventListener).toHaveBeenCalledTimes(2);
    });
  });

  describe('custom event names', () => {
    it('should use custom event name when provided', () => {
      const updateHandler = jest.fn();
      const customEventName = 'visibilityChanged';

      const customListener = createVisibilityStateListener({
        document: jsdom.window.document,
        window: jsdom.window,
        eventNames: {
          update: customEventName,
        },
      });

      customListener.on(customEventName, updateHandler);
      customListener.start();

      jsdom.window.document.visibilityState = 'hidden';
      jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

      expect(updateHandler).toHaveBeenCalledTimes(1);
      expect(updateHandler).toHaveBeenCalledWith('hidden');
    });

    it('should not trigger listeners on default event name when custom name is used', () => {
      const defaultHandler = jest.fn();
      const customHandler = jest.fn();
      const customEventName = 'customUpdate';

      const customListener = createVisibilityStateListener({
        document: jsdom.window.document,
        window: jsdom.window,
        eventNames: {
          update: customEventName,
        },
      });

      customListener.on('update', defaultHandler);
      customListener.on(customEventName, customHandler);
      customListener.start();

      jsdom.window.document.visibilityState = 'hidden';
      jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

      expect(defaultHandler).not.toHaveBeenCalled();
      expect(customHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('rapid state changes', () => {
    it('should handle multiple rapid state changes correctly', () => {
      const updateHandler = jest.fn();

      listener!.on('update', updateHandler);
      listener!.start();

      // Rapidly change states
      jsdom.window.document.visibilityState = 'hidden';
      jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

      jsdom.window.document.visibilityState = 'visible';
      jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

      jsdom.window.document.visibilityState = 'hidden';
      jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

      jsdom.window.document.visibilityState = 'visible';
      jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

      expect(updateHandler).toHaveBeenCalledTimes(4);
      expect(listener!.getStateChangeCount()).toBe(4);
      expect(listener!.getState()).toBe('visible');
    });

    it('should not increment count for duplicate state changes', () => {
      const updateHandler = jest.fn();

      listener!.on('update', updateHandler);
      listener!.start();

      jsdom.window.document.visibilityState = 'hidden';
      jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

      // Dispatch same state multiple times
      jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));
      jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

      expect(updateHandler).toHaveBeenCalledTimes(1);
      expect(listener!.getStateChangeCount()).toBe(1);
    });

    it('should track last state change time accurately with rapid changes', () => {
      listener!.start();

      jsdom.window.document.visibilityState = 'hidden';
      jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

      const firstChangeTime = listener!.getLastStateChangeTime();

      jest.advanceTimersByTime(100);

      jsdom.window.document.visibilityState = 'visible';
      jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

      const secondChangeTime = listener!.getLastStateChangeTime();

      expect(secondChangeTime).toBeGreaterThan(firstChangeTime as number);
      expect(secondChangeTime! - firstChangeTime!).toBeGreaterThanOrEqual(100);
    });
  });

  describe('multiple listeners on same event', () => {
    it('should call all registered listeners when state changes', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();

      listener!.on('update', handler1);
      listener!.on('update', handler2);
      listener!.on('update', handler3);
      listener!.start();

      jsdom.window.document.visibilityState = 'hidden';
      jsdom.window.document.dispatchEvent(new jsdom.window.Event('visibilitychange'));

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);

      expect(handler1).toHaveBeenCalledWith('hidden');
      expect(handler2).toHaveBeenCalledWith('hidden');
      expect(handler3).toHaveBeenCalledWith('hidden');
    });
  });
});
