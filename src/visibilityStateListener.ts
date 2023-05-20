import {createEventEmitter} from './eventEmitter';
import {findPrefix} from './utils';
import {
  VisibilityStateListenerOptions,
  VisibilityState,
  VisibilityStateListener,
  ExtendDocument,
} from './interfaces';
import {Strategy} from './types';

function createVisibilityStateListener(
  opts: VisibilityStateListenerOptions = {},
): VisibilityStateListener {
  const emitter = createEventEmitter();
  const win = opts.window || (typeof window == 'undefined' ? undefined : window);
  const doc =
    opts.document || ((typeof document == 'undefined' ? undefined : document) as Document);
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

  if (typeof win == 'undefined' || typeof doc == 'undefined') {
    state.error = 'INVALID_GLOBALS';
  }

  if (!state.error) {
    state.prefix = findPrefix(doc!);
    state.hiddenProp = state.prefix + (state.prefix.length > 0 ? 'Hidden' : 'hidden');
    state.visibilityProp =
      state.prefix + (state.prefix.length > 0 ? 'VisibilityState' : 'visibilityState');
  }

  const strategy: Strategy | '' = !doc
    ? ''
    : state.hiddenProp in doc
    ? 'modern'
    : typeof doc.addEventListener === 'function'
    ? 'focus-blur'
    : 'focus-blur-ie';

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

  function start() {
    if (state.error) {
      return false;
    }

    if (state.started === true) {
      return true;
    }

    if (strategy == 'modern') {
      doc!.addEventListener(state.prefix + 'visibilitychange', onChange, false);
    } else if (strategy == 'focus-blur') {
      win!.addEventListener('focus', onFocus, true);
      win!.addEventListener('blur', onBlur, true);
    } else if (strategy == 'focus-blur-ie') {
      (doc as ExtendDocument).attachEvent('onfocusin', onFocus);
      (doc as ExtendDocument).attachEvent('onfocusout', onBlur);
    }

    state.started = true;
    state.isPaused = false;

    return true;
  }

  function pause() {
    if (state.error) {
      return false;
    }

    if (state.started === false) {
      return true;
    }

    if (strategy == 'modern') {
      doc!.removeEventListener(state.prefix + 'visibilitychange', onChange, true);
    } else if (strategy == 'focus-blur') {
      console.log('pause focus-blur');
      win!.removeEventListener('focus', onFocus, true);
      win!.removeEventListener('blur', onBlur, true);
    } else if (strategy == 'focus-blur-ie') {
      console.log('pause focus-blur-ie');
      (doc as ExtendDocument).detachEvent('onfocusin', onFocus);
      (doc as ExtendDocument).detachEvent('onfocusout', onBlur);
    }

    state.started = false;
    state.isPaused = true;

    return true;
  }

  function getLastStateChangeTime() {
    return state.lastStateChangeTime;
  }

  function getStateChangeCount() {
    return state.stateChangeCount;
  }

  return {
    on: emitter.on,
    start: start,
    pause: pause,
    hasError: function (): boolean {
      return typeof state.error == 'string' && state.error.length > 0;
    },
    getError: function (): string | null {
      return state.error;
    },
    getState: function (): string {
      return state.value;
    },
    getLastStateChangeTime: getLastStateChangeTime,
    getStateChangeCount: getStateChangeCount,
  };
}

export default createVisibilityStateListener;
