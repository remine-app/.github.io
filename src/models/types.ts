export type PracticeMode='follow'|'practice';
export type FuturePracticeMode=PracticeMode|'scoring';
export type HintMode='hint'|'lyrics-only';

export interface Chant{ id:string;text:string;startMs?:number;endMs?:number;lineStartMs?:number;lineEndMs?:number;chantLeadMs?:number }
export interface LyricSegment{type:'lyric'|'chant'|string;text:string}
export interface LyricLine{ id:string;index:number;startMs:number;endMs:number;lyric:string;chants:Chant[];segments?:LyricSegment[] }
export interface RequiredAudio{audioVersion:string;durationMs:number;sha256:string;byteLength:number}
export interface AudioCatalogTrack extends RequiredAudio{songId:string;title?:string;artist?:string;downloadUrl?:string}
export interface Song{songId:string;title:string;artist:string;album?:string;version?:string;durationMs:number;coverUrl?:string;audioUrl?:string;audioVersion?:string;audioDownloadUrl?:string;lyrics:LyricLine[];contentReady:boolean;audioReady:boolean;requiredAudio?:RequiredAudio}
export interface Settings{seekLeadMs:number;defaultPracticeMode:PracticeMode;practiceHintMode:HintMode}
export interface PracticeSession{id:string;songId:string;mode:PracticeMode;startedAt:string;endedAt?:string;practicedMs:number;lastPositionMs:number}
export interface SongProgress{songId:string;positionMs:number;mode:PracticeMode;lastPracticedAt:string;practiceMs:number;sessions:number}
export interface ChantAttempt{songId:string;chantId:string;expectedStartMs:number;actualStartMs?:number;expectedText:string;timingScore?:number;pronunciationScore?:number;totalScore?:number}
export interface ScoreRecord{id:string;songId:string;userId?:string;score:number;timingScore?:number;pronunciationScore?:number;createdAt:string}
export interface InstalledAudioMeta{songId:string;audioVersion:string;durationMs:number;byteLength:number;sha256:string;installedAt:string;fileName:string}
