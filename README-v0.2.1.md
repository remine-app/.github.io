# Re:chant Web App v0.2.1

v0.2.0 GitHub Actions TypeScript build hotfix.

- IndexedDB request helper accepts native IDBRequest result variance safely.
- delete()/clear() request typing corrected.
- content/audio catalog maps explicitly use string song IDs so strict TypeScript does not infer unknown keys.
- Runtime behavior and Dropbox/local-audio architecture are unchanged.
