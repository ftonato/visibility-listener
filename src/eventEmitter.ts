import {Listener} from './types';
import {EventEmitter} from './interfaces';

/**
 * Creates a simple event emitter for managing event listeners and emitting events.
 * @returns An EventEmitter instance
 */
function createEventEmitter(): EventEmitter {
  const events: Record<string, Listener[]> = {};

  /**
   * Registers an event listener for the specified event.
   * @param event - The event name to listen for
   * @param listener - The callback function to invoke when the event is emitted
   */
  function on(event: string, listener: Listener): void {
    if (!events[event]) {
      events[event] = [];
    }
    events[event]!.push(listener);
  }

  /**
   * Emits an event with the provided arguments.
   * @param event - The event name to emit
   * @param args - Arguments to pass to the event listeners
   */
  function emit(event: string, args: any[]): void {
    const listeners = events[event];
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
  }

  /**
   * Removes an event listener for the specified event.
   * @param event - The event name
   * @param listener - The callback function to remove
   */
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
