// types
import { TExtractedVideoFrame } from 'utils/canvas/extractVideoFrame';

export const OBJECT_URLS_BY_FILE_HASH = new Map<string, string>();

export const VIDEO_FRAMES_BY_FILE_HASH = new Map<string, TExtractedVideoFrame>();

export const FILE_HASH_PROMISES = new WeakMap<Blob, Promise<string>>();
