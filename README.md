# Re:chant Web App v0.1.0

Mobile-first React/TypeScript/Vite application for RESCENE fanchant practice. This is a **working audio-first scaffold**, not a released production PWA.

## Launch (Windows PowerShell)

```powershell
npm run app
```

The command installs dependencies if missing and starts Vite with an opened browser. Alternatively `npm install` followed by `npm run dev`. `npm run build` validates TypeScript and builds the site. Requires Node 20.19+ or Node 22.12+ for contemporary Vite releases. For Windows, `run-app.mjs` uses `cmd.exe` rather than directly spawning `npm.cmd`.

## Actual input files

- `public/packs/audio/manifest.json` and `public/packs/audio/audio/love-attack.mp3` extracted from the provided Rechant Audio Pack v1.0.0. SHA256 from source manifest (see it).
- **No finalized Studio-exported lyrics/chant JSON or album art was supplied.** The app explicitly displays a "content not yet installed" placeholder; it does not invent synchronized lyrics, chants, or original artwork. Actual Love Attack audio plays.
- The UI is based on the supplied pink/white three-screen mockup, with the previously agreed **two practice modes**.

## Add a Studio content pack

1. Copy a JSON file into `public/packs/content/songs/love-attack.json`, containing `songId`, `title`, `artist`, `lyrics` (array of `{id,index,startMs,endMs,lyric,chants:[{id,text,startMs?,endMs?}]}`). Studio's actual export may use different field names; inspect and adapt instead of silently losing timing/inline chants.
2. Add the actual, properly licensed art as `public/packs/content/assets/love-attack/cover.webp`.
3. In `public/packs/content/manifest.json`, set:

```json
{"schemaVersion":"rechant-content-pack-1","packVersion":"1.0.0","songs":[{"songId":"love-attack","dataFile":"songs/love-attack.json","cover":"assets/love-attack/cover.webp"}]}
```

Then restart/reload. `songId` connects audio and content. Only paths inside the local `/packs/` trees are accepted. Studio data must be checked before publishing, particularly where a lyric line and a chant are independently timed.

## Features in v0.1.0

- Home, Songs, Practice, Settings, 3-button bottom bar; in-browser persistence (settings and recent positions, approximate accumulated practice time/session count).
- Real MP3 playback; play/pause, ±10s, range seek, previous/next lyric navigation when lyric pack is present.
- Follow / practice; practice: hint masks versus lyrics-only; seek-before-lyric customizable 0.0–3.0s.
- Automatically centers active lyric on active-index transitions. User manual scrolling suspends tracking, with a "current position" recovery button.
- Dedicated song/album/audio service and data models. Scoring and ranking type definitions are reserved for later without collecting microphone data.

## Not implemented yet

- Voice scoring, user accounts, synchronized server rankings, offline music caching, service worker, official app icons, artist artwork, mobile browser end-to-end verification.
- The audio pack may include copyrighted recorded material. Verify that distributing the audio and art online is authorized before deployment.

## Architecture

`src/pages/` screens; `src/components/` reusable elements; `src/services/songs.ts` pack loader; `src/services/audio.ts` dedicated HTMLAudioElement wrapper; `src/services/activeLyric.ts` time indexing; `src/repositories/local.ts` browser preferences and practice progress; `src/models/types.ts` includes future `ChantAttempt` and `ScoreRecord` models.

Future scoring should connect to the audio timeline and a separately permissioned microphone recording service; do not treat `HTMLAudioElement.currentTime` as a sample-accurate clock for ranking. For rankings, add server validation/identity and anti-cheat controls; never trust client-submitted scores as authoritative.
