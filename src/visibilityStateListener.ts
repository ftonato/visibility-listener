import {createEventEmitter} from './eventEmitter';
import {findPrefix} from './utils';
import {
  VisibilityStateListenerOptions,
  VisibilityState,
  VisibilityStateListener,
  ExtendDocument,
} from './interfaces';
import {Strategy} from './types';
import {ErrorCodes} from './constants';

/**
 * Creates a visibility state listener instance to track document visibility changes.
 * 
 * @param opts - Configuration options for the listener
 * @param opts.window - Custom window object (defaults to global window)
 * @param opts.document - Custom document object (defaults to global document)
 * @param opts.eventNames - Custom event names
 * @param opts.eventNames.update - Custom name for the update event (defaults to 'update')
 * @returns A VisibilityStateListener instance with methods to control and query visibility state
 * 
 * @example
 * ```typescript
 * const listener = createVisibilityStateListener();
 * 
 * listener.on('update', (state) => {
 *   console.log('Visibility changed to:', state);
 * });
 * 
 * listener.start();
 * ```
 */
function createVisibilityStateListener(
  opts: VisibilityStateListenerOptions = {},
): VisibilityStateListener {
  const emitter = createEventEmitter();
  const win = opts.window || (typeof window === 'undefined' ? undefined : window);
  const doc =
    opts.document || ((typeof document === 'undefined' ? undefined : document) as Document);
  const state: VisibilityState = {
    error: null,
    started: false,
    isPaused: false,
    value: 'visible',
    prefix: '',
    visibilityProp: '',
    hiddenProp: '',
    lastStateChangeTime: null,
    stateChangeCount: 0,
  };

  const eventNames = {
    update: opts.eventNames && opts.eventNames.update ? opts.eventNames.update : 'update',
  };

  if (typeof win === 'undefined' || typeof doc === 'undefined') {
    state.error = ErrorCodes.INVALID_GLOBALS;
  }

  if (!state.error) {
    state.prefix = findPrefix(doc!);
    state.hiddenProp = state.prefix + (state.prefix.length > 0 ? 'Hidden' : 'hidden');
    state.visibilityProp =
      state.prefix + (state.prefix.length > 0 ? 'VisibilityState' : 'visibilityState');
  }

  // Determine the best strategy based on browser capabilities
  const determineStrategy = (): Strategy | '' => {
    if (!doc) {
      return '';
    }
    if (state.hiddenProp in doc) {
      return 'modern';
    }
    if (typeof doc.addEventListener === 'function') {
      return 'focus-blur';
    }
    return 'focus-blur-ie';
  };

  const strategy: Strategy | '' = determineStrategy();

  // Read initial visibility state from document
  if (!state.error && doc) {
    if (strategy === 'modern' && state.visibilityProp in doc) {
      // @ts-ignore
      state.value = doc[state.visibilityProp] || 'visible';
    } else if (doc.hasFocus && typeof doc.hasFocus === 'function') {
      state.value = doc.hasFocus() ? 'visible' : 'hidden';
    }
  }

  function onChange() {
    // @ts-ignore
    updateState(doc[state.visibilityProp]);
  }

  function onFocus() {
    updateState('visible');
  }

  function onBlur() {
    updateState('hidden');
  }

  function updateState(newState: string) {
    if (state.isPaused) {
      return;
    }

    if (newState !== state.value) {
      state.value = newState;
      state.lastStateChangeTime = Date.now();
      state.stateChangeCount++;

      emitter.emit(eventNames.update, [newState]);
    }
  }

  /**
   * Starts listening for visibility state changes.
   * Can be called multiple times safely - subsequent calls have no effect if already started.
   * 
   * @returns `true` if started successfully, `false` if there was an initialization error
   */
  function start(): boolean {
    if (state.error) {
      return false;
    }

    if (state.started === true) {
      return true;
    }

    if (strategy === 'modern') {
      doc!.addEventListener(state.prefix + 'visibilitychange', onChange, false);
    } else if (strategy === 'focus-blur') {
      win!.addEventListener('focus', onFocus, true);
      win!.addEventListener('blur', onBlur, true);
    } else if (strategy === 'focus-blur-ie') {
      (doc as ExtendDocument).attachEvent('onfocusin', onFocus);
      (doc as ExtendDocument).attachEvent('onfocusout', onBlur);
    }

    state.started = true;
    state.isPaused = false;

    return true;
  }

  /**
   * Pauses the listener, preventing emission of update events.
   * The listener remains attached but won't emit events or track state changes.
   * Call `start()` to resume.
   * 
   * @returns `true` if paused successfully, `false` if there was an error
   */
  function pause(): boolean {
    if (state.error) {
      return false;
    }

    if (state.started === false) {
      return true;
    }

    if (strategy === 'modern') {
      doc!.removeEventListener(state.prefix + 'visibilitychange', onChange, false);
    } else if (strategy === 'focus-blur') {
      win!.removeEventListener('focus', onFocus, true);
      win!.removeEventListener('blur', onBlur, true);
    } else if (strategy === 'focus-blur-ie') {
      (doc as ExtendDocument).detachEvent('onfocusin', onFocus);
      (doc as ExtendDocument).detachEvent('onfocusout', onBlur);
    }

    state.started = false;
    state.isPaused = true;

    return true;
  }

  /**
   * Destroys the listener and removes all event listeners.
   * After calling destroy, you can call `start()` again to restart the listener.
   * Use this for proper cleanup when you're done with the listener.
   */
  function destroy(): void {
    if (state.started) {
      if (strategy === 'modern') {
        doc!.removeEventListener(state.prefix + 'visibilitychange', onChange, false);
      } else if (strategy === 'focus-blur') {
        win!.removeEventListener('focus', onFocus, true);
        win!.removeEventListener('blur', onBlur, true);
      } else if (strategy === 'focus-blur-ie') {
        (doc as ExtendDocument).detachEvent('onfocusin', onFocus);
        (doc as ExtendDocument).detachEvent('onfocusout', onBlur);
      }
    }

    state.started = false;
    state.isPaused = false;
  }

  /**
   * Checks if there is an initialization error.
   * 
   * @returns `true` if there is an error, `false` otherwise
   */
  function hasError(): boolean {
    return typeof state.error === 'string' && state.error.length > 0;
  }

  /**
   * Gets the error message if there was an initialization error.
   * 
   * @returns The error code as a string, or `null` if there is no error
   */
  function getError(): string | null {
    return state.error;
  }

  /**
   * Gets the current visibility state.
   * 
   * @returns The current visibility state (e.g., 'visible', 'hidden', 'prerender')
   */
  function getState(): string {
    return state.value;
  }

  /**
   * Gets the timestamp of the last state change.
   * 
   * @returns The timestamp in milliseconds, or `null` if no state change has occurred
   */
  function getLastStateChangeTime(): number | null {
    return state.lastStateChangeTime;
  }

  /**
   * Gets the total number of state changes since the listener started.
   * 
   * @returns The count of state changes
   */
  function getStateChangeCount(): number {
    return state.stateChangeCount;
  }

  return {
    on: emitter.on,
    start,
    pause,
    destroy,
    hasError,
    getError,
    getState,
    getLastStateChangeTime,
    getStateChangeCount,
  };
}

export default createVisibilityStateListener;
