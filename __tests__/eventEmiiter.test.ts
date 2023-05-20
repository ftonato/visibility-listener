import {Listener} from '../src/types';
import {EventEmitter} from '../src/interfaces';
import {createEventEmitter} from '../src/eventEmitter';

describe('createEventEmitter', () => {
  let eventEmitter: EventEmitter;

  beforeEach(() => {
    eventEmitter = createEventEmitter();
  });

  it('should register and trigger event listeners', () => {
    const event = 'testEvent';
    const listener1: Listener = jest.fn();
    const listener2: Listener = jest.fn();
    const args = [1, 2, 3];

    eventEmitter.on(event, listener1);
    eventEmitter.on(event, listener2);
    eventEmitter.emit(event, args);

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener1).toHaveBeenCalledWith(...args);
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledWith(...args);
  });

  it('should unregister event listeners', () => {
    const event = 'testEvent';
    const listener1: Listener = jest.fn();
    const listener2: Listener = jest.fn();

    eventEmitter.on(event, listener1);
    eventEmitter.on(event, listener2);

    eventEmitter.off(event, listener1);
    eventEmitter.emit(event, []);

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });

  it('should not throw an error when unregistering an unknown listener', () => {
    const event = 'testEvent';
    const listener: Listener = jest.fn();

    expect(() => {
      eventEmitter.off(event, listener);
    }).not.toThrow();
  });

  it('should add listeners to different events', () => {
    const event1 = 'testEvent1';
    const event2 = 'testEvent2';
    const listener1: Listener = jest.fn();
    const listener2: Listener = jest.fn();

    eventEmitter.on(event1, listener1);
    eventEmitter.on(event2, listener2);

    eventEmitter.emit(event1, []);
    eventEmitter.emit(event2, []);

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });
});
