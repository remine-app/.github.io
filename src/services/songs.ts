import type { Song, LyricLine, Chant } from '../models/types';

const BASE = import.meta.env.BASE_URL;
const AUDIO = `${BASE}packs/audio/`;
const CONTENT = `${BASE}packs/content/`;

async function json(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw Error(`${r.status}: ${url}`);
  return r.json();
}

function safeFile(v: string): boolean {
  return !v.startsWith('/') && !v.includes('..') && !v.includes('://');
}

function normalizeLine(row: any, index: number): LyricLine {
  return {
    id: String(row.id ?? row.lineId ?? `line-${String(index + 1).padStart(3, '0')}`),
    index: Number.isFinite(row.index) ? row.index : index,
    startMs: Number(row.startMs ?? row.sourceStartMs ?? 0),
    endMs: Number(row.endMs ?? row.sourceEndMs ?? 0),
    lyric: String(row.lyric ?? row.text ?? ''),
    chants: Array.isArray(row.chants)
      ? row.chants.map((ch: any, i: number): Chant => ({
          id: String(ch.id ?? `chant-${index}-${i}`),
          text: String(ch.text ?? ''),
          startMs: Number.isFinite(ch.startMs) ? ch.startMs : undefined,
          endMs: Number.isFinite(ch.endMs) ? ch.endMs : undefined,
        }))
      : [],
  };
}

export async function loadSongs(): Promise<Song[]> {
  const a = await json(`${AUDIO}manifest.json`);
  let entries: any[] = [];

  try {
    const c = await json(`${CONTENT}manifest.json`);
    entries = Array.isArray(c.songs) ? c.songs : [];
  } catch {
    // Audio-only packs are allowed during early development.
  }

  const result: Song[] = [];

  for (const t of a.tracks ?? []) {
    if (!safeFile(t.fileName)) continue;

    const e = entries.find((x: any) => x.songId === t.songId);
    let data: any = {};

    if (e?.dataFile && safeFile(e.dataFile)) {
      try {
        data = await json(`${CONTENT}${e.dataFile}`);
      } catch {
        // Keep the song available even when its content pack is not ready yet.
      }
    }

    const cover = e?.cover ?? data.cover;

    result.push({
      songId: t.songId,
      title: String(
        data.title ??
          t.songId
            .split('-')
            .map((s: string) => s[0].toUpperCase() + s.slice(1))
            .join(' '),
      ),
      artist: String(data.artist ?? 'RESCENE'),
      durationMs: Number(t.durationMs),
      coverUrl:
        typeof cover === 'string' && safeFile(cover)
          ? `${CONTENT}${cover}`
          : undefined,
      audioUrl: `${AUDIO}${t.fileName}`,
      lyrics: Array.isArray(data.lyrics)
        ? data.lyrics.map(normalizeLine).sort((x: LyricLine, y: LyricLine) => x.startMs - y.startMs)
        : [],
      contentReady: Array.isArray(data.lyrics) && data.lyrics.length > 0,
      audioReady: true,
    });
  }

  return result;
}
