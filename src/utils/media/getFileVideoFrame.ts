// others
import { VIDEO_FRAMES_BY_FILE_HASH } from './constants';

// utils
import { extractVideoFrame, TExtractedVideoFrame } from 'utils/canvas/extractVideoFrame';
import { getFileHash } from './getFileHash';

export const getFileVideoFrame = async (file: File, onLoad: (frame: TExtractedVideoFrame) => void): Promise<void> => {
  const hash = await getFileHash(file);
  const cachedFrame = VIDEO_FRAMES_BY_FILE_HASH.get(hash);

  if (cachedFrame) {
    onLoad(cachedFrame);
  } else {
    extractVideoFrame(file, (frame) => {
      VIDEO_FRAMES_BY_FILE_HASH.set(hash, frame);
      onLoad(frame);
    });
  }
};
