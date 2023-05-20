import {Listener} from './types';
import {EventEmitter} from './interfaces';

function createEventEmitter(): EventEmitter {
  const events: Record<string, Listener[]> = {};

  function on(event: string, listener: Listener): void {
    if (!events[event]) {
      events[event] = [];
    }
    events[event]?.push(listener);
  }

  function emit(event: string, args: any[]): void {
    const listeners = events[event];
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
  }

  // TODO: shaw we remove this method?
  function off(event: string, listener: Listener): void {
    const listeners = events[event];
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  return {
    on,
    emit,
    off,
  };
}

export {createEventEmitter};
