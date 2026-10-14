---
name: Expo preview warnings
description: Distinguishes a non-blocking React Native DevTools install warning from an Expo app startup failure.
---

In this Replit environment, Expo can report that the React Native DevTools helper cannot load `libglib-2.0.so.0` while Metro continues to start and serve the app.

**Why:** The helper warning is noisy but may not indicate a broken app; the preview can load normally.

**How to apply:** When this warning appears, confirm Metro is running and the app preview renders before treating it as a blocking issue.
