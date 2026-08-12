// utils
import { extractVideoFrame } from './extractVideoFrame';

export type TArmedMedia = {
  naturalHeight: number;
  naturalWidth: number;
  src: string;
};

const loadArmedImage = (file: File, onLoad: (armed: TArmedMedia) => void): void => {
  const src = URL.createObjectURL(file);
  const image = new Image();

  image.onload = (): void => {
    onLoad({ naturalHeight: image.naturalHeight, naturalWidth: image.naturalWidth, src });
  };
  image.src = src;
};

export const loadArmedMedia = (file: File, onLoad: (armed: TArmedMedia) => void): void => {
  if (file.type.startsWith('video/')) {
    extractVideoFrame(file, onLoad);
  } else {
    loadArmedImage(file, onLoad);
  }
};
