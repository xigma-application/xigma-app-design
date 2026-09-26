// types
import { TExtractedVideoFrame } from 'utils/canvas/extractVideoFrame';
import { TMediaFillType } from 'utils/design/paint/getNodeMediaFillType';

// utils
import { getFileObjectUrl } from 'utils/media/getFileObjectUrl';
import { getFileVideoFrame } from 'utils/media/getFileVideoFrame';
import { videoSrcUrlCache } from 'shared/UITools/ColorPicker/Body/VideoPanel/utils/videoSrcUrlCache';

export type TArmedMedia = TExtractedVideoFrame & { kind: TMediaFillType };

const loadArmedImage = async (file: File, onLoad: (armed: TArmedMedia) => void): Promise<void> => {
  const src = await getFileObjectUrl(file);
  const image = new Image();

  image.onload = (): void => {
    onLoad({ kind: 'image', naturalHeight: image.naturalHeight, naturalWidth: image.naturalWidth, src });
  };
  image.src = src;
};

const loadArmedVideo = async (file: File, onLoad: (armed: TArmedMedia) => void): Promise<void> => {
  const videoSrcUrl = await getFileObjectUrl(file);

  await getFileVideoFrame(file, (frame) => {
    videoSrcUrlCache.set(frame.src, videoSrcUrl);
    onLoad({ ...frame, kind: 'video' });
  });
};

export const loadArmedMedia = (file: File, onLoad: (armed: TArmedMedia) => void): void => {
  if (file.type.startsWith('video/')) {
    void loadArmedVideo(file, onLoad);
  } else {
    void loadArmedImage(file, onLoad);
  }
};
