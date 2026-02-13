import {Listener} from './types';

interface VisibilityStateListenerOptions {
  window?: Window;
  document?: Document;
  eventNames?: {
    update?: string;
  };
}

interface VisibilityState {
  error: string | null;
  started: boolean;
  isPaused: boolean;
  value: string;
  prefix: string;
  visibilityProp: string;
  hiddenProp: string;
  lastStateChangeTime: number | null;
  stateChangeCount: number;
}

interface VisibilityStateListener {
  on(event: string, listener: Listener): void;
  start(): boolean;
  pause(): boolean;
  destroy(): void;
  hasError(): boolean;
  getError(): string | null;
  getState(): string;
  getLastStateChangeTime(): number | null;
  getStateChangeCount(): number;
}

interface ExtendDocument extends Document {
  attachEvent(event: string, listener: EventListener): boolean;
  detachEvent(event: string, listener: EventListener): void;
}

interface EventEmitter {
  on(event: string, listener: Listener): void;
  emit(event: string, args: any[]): void;
  off(event: string, listener: Listener): void;
}

export {
  VisibilityStateListenerOptions,
  VisibilityState,
  VisibilityStateListener,
  ExtendDocument,
  EventEmitter,
};
