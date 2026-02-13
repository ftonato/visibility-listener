# Real-World Use Cases

This document provides practical examples of how to use `visibility-listener` in real-world applications.

---

## Table of Contents

1. [Auto-Pause Video Player](#1-auto-pause-video-player)
2. [Pause Real-Time Updates](#2-pause-real-time-updates)
3. [Analytics & User Engagement Tracking](#3-analytics--user-engagement-tracking)
4. [Gaming & Animations](#4-gaming--animations)
5. [Notifications & Alerts](#5-notifications--alerts)
6. [React Integration](#react-integration)

---

## 1. Auto-Pause Video Player

Pause videos when users switch tabs to save bandwidth and improve user experience.

```javascript
import createVisibilityStateListener from 'visibility-listener';

const videoElement = document.querySelector('video');
const listener = createVisibilityStateListener();

listener.on('update', (state) => {
  if (state === 'hidden') {
    videoElement.pause();
  } else if (state === 'visible') {
    videoElement.play();
  }
});

listener.start();

// Cleanup when component unmounts
// listener.destroy();
```

**Use Case:** Video streaming platforms, educational websites, video tutorials

**Benefits:**
- Saves bandwidth
- Improves battery life
- Better user experience
- Reduces server load

---

## 2. Pause Real-Time Updates

Stop expensive API calls and WebSocket updates when the page isn't visible.

```javascript
import createVisibilityStateListener from 'visibility-listener';

const listener = createVisibilityStateListener();
let updateInterval;

listener.on('update', (state) => {
  if (state === 'visible') {
    // Resume updates when user returns
    updateInterval = setInterval(() => {
      fetchLatestData();
    }, 5000);
  } else {
    // Pause updates to save resources
    clearInterval(updateInterval);
  }
});

listener.start();
```

**Use Case:** Dashboards, stock tickers, live sports scores, real-time monitoring

**Benefits:**
- Reduces API calls
- Saves server resources
- Lower costs for metered APIs
- Improved application performance

---

## 3. Analytics & User Engagement Tracking

Track how long users actually spend viewing your content.

```javascript
import createVisibilityStateListener from 'visibility-listener';

const listener = createVisibilityStateListener();
let sessionStart = Date.now();

listener.on('update', (state) => {
  if (state === 'hidden') {
    const timeSpent = Date.now() - sessionStart;
    analytics.track('session_time', { duration: timeSpent });
  } else if (state === 'visible') {
    sessionStart = Date.now();
  }
});

listener.start();

// Get total number of visibility changes
console.log('Tab switches:', listener.getStateChangeCount());
```

**Use Case:** Content platforms, blogs, news sites, e-learning platforms

**Benefits:**
- Accurate engagement metrics
- Better understanding of user behavior
- Improved content strategy
- More reliable A/B testing

**Advanced Analytics Example:**

```javascript
import createVisibilityStateListener from 'visibility-listener';

const listener = createVisibilityStateListener();
let visibleTime = 0;
let lastVisibleStart = Date.now();
let totalSwitches = 0;

listener.on('update', (state) => {
  if (state === 'visible') {
    lastVisibleStart = Date.now();
  } else {
    visibleTime += Date.now() - lastVisibleStart;
    totalSwitches++;
    
    // Send analytics
    analytics.track('engagement', {
      totalVisibleTime: visibleTime,
      tabSwitches: totalSwitches,
      averageSessionLength: visibleTime / totalSwitches
    });
  }
});

listener.start();
```

---

## 4. Gaming & Animations

Pause game loops and animations to save CPU and battery.

```javascript
import createVisibilityStateListener from 'visibility-listener';

const listener = createVisibilityStateListener();
let gameLoop;

function startGame() {
  gameLoop = requestAnimationFrame(function animate() {
    updateGameState();
    render();
    gameLoop = requestAnimationFrame(animate);
  });
}

function stopGame() {
  cancelAnimationFrame(gameLoop);
}

listener.on('update', (state) => {
  if (state === 'visible') {
    startGame();
  } else {
    stopGame();
  }
});

listener.start();
```

**Use Case:** Browser games, interactive animations, data visualizations

**Benefits:**
- Saves CPU cycles
- Reduces battery drain
- Prevents overheating on mobile devices
- Better performance when tab is active

**Advanced Game Example:**

```javascript
import createVisibilityStateListener from 'visibility-listener';

class Game {
  constructor() {
    this.listener = createVisibilityStateListener();
    this.isPaused = false;
    this.gameLoop = null;
    
    this.setupVisibilityListener();
  }
  
  setupVisibilityListener() {
    this.listener.on('update', (state) => {
      if (state === 'hidden') {
        this.pause();
        this.showPauseOverlay();
      } else if (state === 'visible' && this.isPaused) {
        this.resume();
        this.hidePauseOverlay();
      }
    });
    
    this.listener.start();
  }
  
  pause() {
    this.isPaused = true;
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
  }
  
  resume() {
    this.isPaused = false;
    this.start();
  }
  
  start() {
    const animate = () => {
      if (!this.isPaused) {
        this.update();
        this.render();
        this.gameLoop = requestAnimationFrame(animate);
      }
    };
    animate();
  }
  
  destroy() {
    this.pause();
    this.listener.destroy();
  }
}

const game = new Game();
game.start();
```

---

## 5. Notifications & Alerts

Show notifications when users return to your application.

```javascript
import createVisibilityStateListener from 'visibility-listener';

const listener = createVisibilityStateListener();
let missedMessages = 0;

listener.on('update', (state) => {
  if (state === 'visible') {
    if (missedMessages > 0) {
      showNotification(`You have ${missedMessages} new messages!`);
      missedMessages = 0;
    }
  }
});

// Increment when messages arrive while hidden
socket.on('message', () => {
  if (listener.getState() === 'hidden') {
    missedMessages++;
  }
});

listener.start();
```

**Use Case:** Chat applications, collaboration tools, social media, email clients

**Benefits:**
- Keep users informed
- Improved user engagement
- Better notification management
- Reduced notification fatigue

**Advanced Notification Example:**

```javascript
import createVisibilityStateListener from 'visibility-listener';

class NotificationManager {
  constructor() {
    this.listener = createVisibilityStateListener();
    this.notifications = {
      messages: 0,
      mentions: 0,
      updates: 0
    };
    
    this.setupListener();
  }
  
  setupListener() {
    this.listener.on('update', (state) => {
      if (state === 'visible') {
        this.displayPendingNotifications();
        this.updateTabTitle('App Name');
      } else {
        // User left, prepare to collect notifications
        this.startCollecting();
      }
    });
    
    this.listener.start();
  }
  
  startCollecting() {
    // Reset counters when user leaves
    this.notificationsStartTime = Date.now();
  }
  
  addNotification(type) {
    if (this.listener.getState() === 'hidden') {
      this.notifications[type]++;
      this.updateTabTitle(`(${this.getTotalNotifications()}) App Name`);
    } else {
      // Show immediately if visible
      this.showToast(type);
    }
  }
  
  getTotalNotifications() {
    return Object.values(this.notifications).reduce((a, b) => a + b, 0);
  }
  
  displayPendingNotifications() {
    const total = this.getTotalNotifications();
    
    if (total > 0) {
      const timeAway = Date.now() - this.notificationsStartTime;
      
      this.showNotification({
        title: 'While you were away',
        body: this.formatNotificationSummary(),
        timeAway: timeAway
      });
      
      // Reset counters
      Object.keys(this.notifications).forEach(key => {
        this.notifications[key] = 0;
      });
    }
  }
  
  formatNotificationSummary() {
    const parts = [];
    if (this.notifications.messages > 0) {
      parts.push(`${this.notifications.messages} new messages`);
    }
    if (this.notifications.mentions > 0) {
      parts.push(`${this.notifications.mentions} mentions`);
    }
    if (this.notifications.updates > 0) {
      parts.push(`${this.notifications.updates} updates`);
    }
    return parts.join(', ');
  }
  
  updateTabTitle(title) {
    document.title = title;
  }
  
  destroy() {
    this.listener.destroy();
  }
}

// Usage
const notificationManager = new NotificationManager();

// When receiving new messages
socket.on('message', () => {
  notificationManager.addNotification('messages');
});

socket.on('mention', () => {
  notificationManager.addNotification('mentions');
});
```

---

## React Integration

Complete example of using `visibility-listener` in a React application.

### Basic React Hook

```jsx
import { useEffect } from 'react';
import createVisibilityStateListener from 'visibility-listener';

function VideoPlayer({ src }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const listener = createVisibilityStateListener();

    listener.on('update', (state) => {
      if (state === 'hidden') {
        videoRef.current?.pause();
      }
    });

    listener.start();

    // Cleanup on unmount
    return () => {
      listener.destroy();
    };
  }, []);

  return <video ref={videoRef} src={src} />;
}
```

### Custom React Hook

```jsx
import { useEffect, useState } from 'react';
import createVisibilityStateListener from 'visibility-listener';

function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const listener = createVisibilityStateListener();

    listener.on('update', (state) => {
      setIsVisible(state === 'visible');
    });

    listener.start();

    return () => {
      listener.destroy();
    };
  }, []);

  return isVisible;
}

// Usage
function Dashboard() {
  const isVisible = usePageVisibility();

  useEffect(() => {
    if (!isVisible) {
      console.log('Dashboard hidden, pausing updates');
      return;
    }

    const interval = setInterval(() => {
      fetchLatestData();
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return <div>Dashboard Content</div>;
}
```

### Advanced React Hook with Metrics

```jsx
import { useEffect, useState, useCallback } from 'react';
import createVisibilityStateListener from 'visibility-listener';

function useVisibilityMetrics() {
  const [metrics, setMetrics] = useState({
    isVisible: true,
    stateChangeCount: 0,
    lastChangeTime: null,
    totalHiddenTime: 0,
    totalVisibleTime: 0
  });

  useEffect(() => {
    const listener = createVisibilityStateListener();
    let hiddenStart = null;
    let visibleStart = Date.now();

    listener.on('update', (state) => {
      const now = Date.now();
      
      setMetrics(prev => {
        const updates = {
          isVisible: state === 'visible',
          stateChangeCount: prev.stateChangeCount + 1,
          lastChangeTime: now
        };

        if (state === 'hidden') {
          hiddenStart = now;
          updates.totalVisibleTime = prev.totalVisibleTime + (now - visibleStart);
        } else {
          if (hiddenStart) {
            updates.totalHiddenTime = prev.totalHiddenTime + (now - hiddenStart);
          }
          visibleStart = now;
        }

        return { ...prev, ...updates };
      });
    });

    listener.start();

    return () => {
      listener.destroy();
    };
  }, []);

  return metrics;
}

// Usage
function AnalyticsDashboard() {
  const metrics = useVisibilityMetrics();

  return (
    <div>
      <h2>Page Visibility Metrics</h2>
      <p>Currently: {metrics.isVisible ? 'Visible' : 'Hidden'}</p>
      <p>Tab switches: {metrics.stateChangeCount}</p>
      <p>Time visible: {Math.round(metrics.totalVisibleTime / 1000)}s</p>
      <p>Time hidden: {Math.round(metrics.totalHiddenTime / 1000)}s</p>
    </div>
  );
}
```

---

## More Examples

Have a use case not covered here? [Open an issue](https://github.com/ftonato/visibility-listener/issues) or [submit a PR](https://github.com/ftonato/visibility-listener/pulls) to share your implementation!
