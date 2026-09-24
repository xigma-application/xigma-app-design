// utils
import { getFileObjectUrl } from 'utils/media/getFileObjectUrl';
import { getFileVideoFrame } from 'utils/media/getFileVideoFrame';
import { TExtractedVideoFrame } from 'utils/canvas/extractVideoFrame';

export type TArmedMedia = TExtractedVideoFrame;

const loadArmedImage = async (file: File, onLoad: (armed: TArmedMedia) => void): Promise<void> => {
  const src = await getFileObjectUrl(file);
  const image = new Image();

  image.onload = (): void => {
    onLoad({ naturalHeight: image.naturalHeight, naturalWidth: image.naturalWidth, src });
  };
  image.src = src;
};

export const loadArmedMedia = (file: File, onLoad: (armed: TArmedMedia) => void): void => {
  if (file.type.startsWith('video/')) {
    void getFileVideoFrame(file, onLoad);
  } else {
    void loadArmedImage(file, onLoad);
  }
};
