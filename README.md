# visibility-listener

[![npm version](https://img.shields.io/npm/v/visibility-listener.svg)](https://www.npmjs.com/package/visibility-listener)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ftonato/visibility-listener/blob/main/LICENSE)

> A lightweight, cross-browser library for tracking document visibility state changes with zero dependencies.

## Why visibility-listener?

Modern web applications need to know when users are actively viewing a page. Whether you're building analytics, video players, real-time dashboards, or auto-pause features, `visibility-listener` provides a simple, reliable API to track page visibility across all browsers.

### Key Features

✨ **Zero Dependencies** - Lightweight and fast  
🔄 **Cross-Browser Compatible** - Works on modern and legacy browsers (including IE)  
📦 **Tiny Bundle Size** - Minimal impact on your application  
🎯 **TypeScript Support** - Fully typed for better developer experience  
🧹 **Memory Safe** - Proper cleanup to prevent memory leaks  
🔌 **Framework Agnostic** - Works with React, Vue, Angular, or vanilla JS

---

## Installation

```bash
npm install visibility-listener
```

---

## Quick Start

```javascript
import createVisibilityStateListener from 'visibility-listener';

const listener = createVisibilityStateListener();

listener.on('update', (state) => {
  if (state === 'visible') {
    console.log('User is viewing the page');
  } else if (state === 'hidden') {
    console.log('User switched to another tab');
  }
});

listener.start();
```

---

## Real-World Examples

See practical implementations and use cases in our [Examples Guide](./EXAMPLES.md):

- 🎬 **[Auto-Pause Video Player](./EXAMPLES.md#1-auto-pause-video-player)** - Save bandwidth by pausing videos when users switch tabs
- 🔄 **[Pause Real-Time Updates](./EXAMPLES.md#2-pause-real-time-updates)** - Stop expensive API calls when page is hidden
- 📊 **[Analytics & User Engagement](./EXAMPLES.md#3-analytics--user-engagement-tracking)** - Track actual time users spend viewing content
- 🎮 **[Gaming & Animations](./EXAMPLES.md#4-gaming--animations)** - Pause game loops to save CPU and battery
- 🔔 **[Notifications & Alerts](./EXAMPLES.md#5-notifications--alerts)** - Show alerts when users return to your app
- ⚛️ **[React Integration](./EXAMPLES.md#react-integration)** - Custom hooks and React patterns

[**→ View all examples with code**](./EXAMPLES.md)

---

## API Reference

### Creating a Listener

#### `createVisibilityStateListener(options?)`

Creates a new visibility state listener instance.

**Parameters:**
- `options` (optional): Configuration object
  - `window` - Custom window object (useful for testing or iframes)
  - `document` - Custom document object (useful for testing or iframes)
  - `eventNames.update` - Custom event name (default: `'update'`)

**Returns:** `VisibilityStateListener` instance

**Example:**
```javascript
// Basic usage
const listener = createVisibilityStateListener();

// With custom event name
const listener = createVisibilityStateListener({
  eventNames: {
    update: 'visibilityChanged'
  }
});

// For testing with custom document
const listener = createVisibilityStateListener({
  window: mockWindow,
  document: mockDocument
});
```

---

### Instance Methods

#### `listener.on(eventName, callback)`

Registers an event listener for visibility changes.

**Parameters:**
- `eventName` (string) - Event name to listen for (default: `'update'`)
- `callback` (function) - Handler function called with the new visibility state

**Returns:** `void`

**Example:**
```javascript
listener.on('update', (state) => {
  console.log('Visibility changed to:', state);
  // state can be: 'visible', 'hidden', 'prerender', etc.
});
```

---

#### `listener.start()`

Starts listening for visibility changes. Safe to call multiple times.

**Returns:** `boolean` - `true` if started successfully, `false` if initialization error

**Example:**
```javascript
if (listener.start()) {
  console.log('Listener started successfully');
} else {
  console.error('Failed to start:', listener.getError());
}
```

---

#### `listener.pause()`

Pauses the listener. Events won't be emitted, but the listener remains attached.

**Returns:** `boolean` - `true` if paused successfully, `false` if error

**Example:**
```javascript
// Temporarily stop tracking
listener.pause();

// Resume tracking
listener.start();
```

---

#### `listener.destroy()`

Completely removes all event listeners and cleans up resources. **Always call this when you're done** to prevent memory leaks.

**Returns:** `void`

**Example:**
```javascript
// Cleanup when component unmounts
useEffect(() => {
  const listener = createVisibilityStateListener();
  listener.start();
  
  return () => {
    listener.destroy(); // Important!
  };
}, []);
```

---

#### `listener.getState()`

Gets the current visibility state.

**Returns:** `string` - Current state (`'visible'`, `'hidden'`, `'prerender'`, etc.)

**Example:**
```javascript
const currentState = listener.getState();
if (currentState === 'visible') {
  console.log('Page is currently visible');
}
```

---

#### `listener.getLastStateChangeTime()`

Gets the timestamp of the most recent visibility change.

**Returns:** `number | null` - Timestamp in milliseconds, or `null` if no changes yet

**Example:**
```javascript
const lastChange = listener.getLastStateChangeTime();
if (lastChange) {
  const timeSinceChange = Date.now() - lastChange;
  console.log(`Last change was ${timeSinceChange}ms ago`);
}
```

---

#### `listener.getStateChangeCount()`

Gets the total number of visibility changes since the listener started.

**Returns:** `number` - Count of state changes

**Example:**
```javascript
const changes = listener.getStateChangeCount();
console.log(`User switched tabs ${changes} times`);
```

---

#### `listener.hasError()`

Checks if there was an initialization error.

**Returns:** `boolean` - `true` if error exists, `false` otherwise

**Example:**
```javascript
if (listener.hasError()) {
  console.error('Error:', listener.getError());
}
```

---

#### `listener.getError()`

Gets the error message if initialization failed.

**Returns:** `string | null` - Error code or `null` if no error

**Example:**
```javascript
const error = listener.getError();
if (error) {
  console.error('Initialization failed:', error);
}
```

---

## TypeScript Support

Full TypeScript definitions are included. Import types as needed:

```typescript
import createVisibilityStateListener, { ErrorCodes } from 'visibility-listener';
import type { 
  VisibilityStateListener,
  VisibilityStateListenerOptions 
} from 'visibility-listener';

const listener: VisibilityStateListener = createVisibilityStateListener();

// Type-safe error checking
if (listener.getError() === ErrorCodes.INVALID_GLOBALS) {
  console.error('Window or document not available');
}
```

---

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome | ✅ All versions |
| Firefox | ✅ All versions |
| Safari | ✅ All versions |
| Edge | ✅ All versions |
| IE | ✅ IE 9+ |
| Mobile Safari | ✅ All versions |
| Chrome Android | ✅ All versions |

The library automatically detects and uses the best available API:
- **Modern browsers**: Page Visibility API
- **Older browsers**: Focus/blur events
- **Legacy IE**: `attachEvent`/`detachEvent`

---

## Advanced Usage

### Detecting Visibility States

The listener can detect various visibility states:

- `'visible'` - Page is currently visible
- `'hidden'` - Page is hidden (minimized, background tab, etc.)
- `'prerender'` - Page is being prerendered (rare)

```javascript
listener.on('update', (state) => {
  switch (state) {
    case 'visible':
      console.log('User is actively viewing');
      break;
    case 'hidden':
      console.log('User switched away');
      break;
    case 'prerender':
      console.log('Page is being prerendered');
      break;
  }
});
```

### Multiple Listeners

You can register multiple callbacks for the same event:

```javascript
const listener = createVisibilityStateListener();

// Multiple handlers are all called
listener.on('update', handleAnalytics);
listener.on('update', handleVideo);
listener.on('update', handlePolling);

listener.start();
```

### Conditional Execution

Check state before performing expensive operations:

```javascript
function updateDashboard() {
  if (listener.getState() === 'visible') {
    // Only update if user is watching
    fetchAndRenderData();
  }
}
```

---

## Best Practices

### 1. Always Clean Up

```javascript
// ❌ Bad - memory leak
const listener = createVisibilityStateListener();
listener.start();

// ✅ Good - proper cleanup
const listener = createVisibilityStateListener();
listener.start();
// ... later
listener.destroy();
```

### 2. Check State Before Heavy Operations

```javascript
// ✅ Good - save resources
function expensiveOperation() {
  if (listener.getState() === 'hidden') {
    return; // Don't process if user isn't watching
  }
  // ... expensive code
}
```

### 3. Use with Throttling for Rapid Changes

```javascript
import { throttle } from 'lodash';

const handleVisibilityChange = throttle((state) => {
  // Handle state change
}, 1000);

listener.on('update', handleVisibilityChange);
```

---

## Troubleshooting

### Listener not working?

```javascript
// Check for errors
if (listener.hasError()) {
  console.error('Error:', listener.getError());
}

// Verify it started
if (!listener.start()) {
  console.error('Failed to start listener');
}
```

### Not receiving events?

```javascript
// Make sure you called start()
listener.start();

// Check if paused
listener.start(); // Will resume if paused

// Verify callback is registered before starting
listener.on('update', callback);
listener.start(); // Register first, then start
```

---

## License

This project is licensed under the [MIT License](https://github.com/ftonato/visibility-listener/blob/main/LICENSE).
