# visibility-listener

[![npm version](https://img.shields.io/npm/v/visibility-listener.svg)](https://www.npmjs.com/package/visibility-listener)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ftonato/visibility-listener/blob/main/LICENSE)

Track document visibility state seamlessly across browsers.

## Installation

You can install the package using npm/yarn/pnpm:

```bash
npm install visibility-listener
# or
yarn add visibility-listener
# or
pnpm add visibility-listener
```

## Examples

```js
import createVisibilityStateListener from 'visibility-listener';

const listener = createVisibilityStateListener();

listener.on('update', (state) => {
  console.log('🔄️ current state =>', state);

  if (state === 'visible') {
    // do something
  } else if (state === 'hidden') {
    // do another thing
  }

  const lastChangeTime = listener.getLastStateChangeTime();
  console.log('🕒 last change time =>', new Date(lastChangeTime));
});


listener.start();
```

----

## API

### `createVisibilityStateListener(opts?: VisibilityStateListenerOptions): VisibilityStateListener`

Creates a visibility state listener instance.

- `opts` (optional): Options object to customize the listener. Available options:
  - `window`: Custom window object to use for the listener.
  - `document`: Custom document object to use for the listener.
  - `eventNames`: Custom event names to use. Supported key:
    - `update`: Custom name for the update event.

Returns a `VisibilityStateListener` object with the following methods:

#### `on(eventName: string, handler: Function): void`

Adds an event listener for the specified event.

- `eventName` (required): The name of the event to listen for.
- `handler` (required): The event handler function.

#### `start(): boolean`

Starts the visibility state listener.

Returns `true` if the listener started successfully, or `false` if there was an error during initialization.

#### `pause(): boolean`

Pauses the visibility state listener, preventing the emission of events.

Returns `true` if the listener was paused successfully, or `false` if there was an error.

#### `hasError(): boolean`

Checks if there is an error with the listener.

Returns `true` if there is an error, or `false` if there is no error.

#### `getError(): string | null`

Gets the error message associated with the listener, if any.

Returns the error message as a string, or `null` if there is no error.

#### `getState(): string`

Gets the current visibility state.

Returns the current visibility state as a string.

#### `getLastStateChangeTime(): number`

Gets the timestamp of the last state change in milliseconds.

Returns the timestamp of the last state change as a number.

#### `getStateChangeCount(): number`

Gets the total number of state changes since the listener started.

Returns the total number of state changes as a number.

----

## License

This package is released under the [MIT License](https://github.com/ftonato/visibility-listener/blob/main/LICENSE).