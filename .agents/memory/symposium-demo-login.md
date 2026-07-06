---
name: Symposium demo login binding
description: Why the login flow must look up mock users by email rather than always synthesizing a fresh user.
---

In apps that use a Zustand mock-data store with a fixed list of seed users (e.g. `user_1`, `user_2`...), a login form that always calls `setCurrentUser` with a brand-new synthetic object (new id, blank fields) will silently disconnect the "logged in" user from any pre-seeded demo data (goals, units, match scores, friend lists) attached to the matching seed user record.

**Why:** This is easy to miss because the login form still "works" (you get to the dashboard), but any hand-crafted demo data (e.g. a specific goal/challenge pair tuned to produce a target match percentage with another mock user) will never show up, since the logged-in user is a different object than the seed user it was designed around.

**How to apply:** When wiring up demo/pitch-specific hardcoded data tied to a "current user" persona, always verify the login/auth entry point resolves to the actual seed user record by a stable key (email/id), not just createing a new stub user object.
