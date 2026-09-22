// utils
import { bakeSvgImageOrientation } from './bakeSvgImageOrientation';
import { blobToDataUrl } from 'utils/blobToDataUrl';

export type TSvgImageAsset = { dataUrl: string; height: number; width: number };

export const loadSvgImageAsset = async (ref: string, rotation: number, flipX: boolean, flipY: boolean): Promise<TSvgImageAsset | null> => {
  try {
    const response = await fetch(ref);

    if (response.ok) {
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob);
      const isSideways = rotation === 90 || rotation === 270;
      const width = isSideways ? bitmap.height : bitmap.width;
      const height = isSideways ? bitmap.width : bitmap.height;

      if (rotation === 0 && !flipX && !flipY) {
        return { dataUrl: await blobToDataUrl(blob), height, width };
      }

      const bakedBlob = await bakeSvgImageOrientation(bitmap, rotation, flipX, flipY, width, height);

      if (bakedBlob) {
        return { dataUrl: await blobToDataUrl(bakedBlob), height, width };
      }
    }
  } catch {
    return null;
  }

  return null;
};
