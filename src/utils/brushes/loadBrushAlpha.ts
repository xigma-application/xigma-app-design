// types
import { TBrushAlpha } from './types';

export const loadBrushAlpha = async (url: string): Promise<TBrushAlpha | null> => {
  const response = await fetch(url);
  const bitmap = await createImageBitmap(await response.blob());
  const canvas = document.createElement('canvas');

  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const context = canvas.getContext('2d');

  if (context) {
    context.drawImage(bitmap, 0, 0);

    const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height);
    const alpha = new Float32Array(bitmap.width * bitmap.height);

    for (let index = 0; index < alpha.length; index += 1) {
      alpha[index] = data[index * 4 + 3] / 255;
    }

    return { data: alpha, height: bitmap.height, width: bitmap.width };
  }

  return null;
};
