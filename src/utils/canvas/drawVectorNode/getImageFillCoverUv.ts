export type TImageFillCoverUv = { uMax: number; uMin: number; vMax: number; vMin: number };

export const getImageFillCoverUv = (boundsWidth: number, boundsHeight: number, imageWidth: number, imageHeight: number): TImageFillCoverUv => {
  if (boundsWidth > 0 && boundsHeight > 0 && imageWidth > 0 && imageHeight > 0) {
    const boundsAspect = boundsWidth / boundsHeight;
    const imageAspect = imageWidth / imageHeight;
    const cropWidthFrac = boundsAspect > imageAspect ? 1 : boundsAspect / imageAspect;
    const cropHeightFrac = boundsAspect > imageAspect ? imageAspect / boundsAspect : 1;

    return {
      uMax: (1 - cropWidthFrac) / 2 + cropWidthFrac,
      uMin: (1 - cropWidthFrac) / 2,
      vMax: (1 - cropHeightFrac) / 2 + cropHeightFrac,
      vMin: (1 - cropHeightFrac) / 2,
    };
  }

  return { uMax: 1, uMin: 0, vMax: 1, vMin: 0 };
};
