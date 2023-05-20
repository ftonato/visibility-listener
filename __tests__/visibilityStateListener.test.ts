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
});
