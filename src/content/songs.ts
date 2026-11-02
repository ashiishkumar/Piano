import { SongScore } from '../types/music';
import { ZTH_EXERCISES } from './zeroToHeroExercises';
import { ZTH_CHAPTER_2H_SONGS, ZTH_CHAPTER_4_SONGS } from './zeroToHeroSongs';

/**
 * Complete Song & Exercise Library for the PIX Series Zero to Hero Piano Course (Modules 1–10).
 * Every item in ALL_SONGS corresponds 1-to-1 with a ready `score` lesson in `src/content/path.ts`.
 */
export const CONTENT_SONGS: SongScore[] = [
  ...ZTH_EXERCISES,
  ...ZTH_CHAPTER_2H_SONGS,
  ...ZTH_CHAPTER_4_SONGS,
];

export const ALL_SONGS: SongScore[] = CONTENT_SONGS;

export { ZTH_EXERCISES, ZTH_CHAPTER_2H_SONGS, ZTH_CHAPTER_4_SONGS };
