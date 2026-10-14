---
name: Supabase task ownership
description: Records why anonymous Supabase task access is scoped to an app installation instead of being open to all clients.
---

The to-do app uses a random per-installation ID in a request header, and Supabase row-level security only exposes rows matching that ID. This keeps the simple app account-free; it does not synchronize tasks across installations.

**Why:** The user requested Supabase storage but did not request accounts. A public client key still requires row-level security, and exposing every task to every anonymous client would be unsafe.

**How to apply:** Preserve the device-scoped policy for this account-free experience. Add authentication and migrate ownership to authenticated users before enabling cross-device task sync.
