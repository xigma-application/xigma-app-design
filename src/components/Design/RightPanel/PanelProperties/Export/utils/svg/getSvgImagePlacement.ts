// types
import { TDraftRect } from 'types/canvas';
import { TImagePaint, TVideoPaint } from 'types/design/paint/types';

export type TSvgImagePlacement = { preserveAspectRatio: string; rect: TDraftRect; rotation: number };

export const getSvgImagePlacement = (paint: TImagePaint | TVideoPaint, boxRect: TDraftRect, boxRotation: number): TSvgImagePlacement => {
  if (paint.crop) {
    return { preserveAspectRatio: 'none', rect: paint.crop, rotation: paint.crop.rotation };
  }

  return { preserveAspectRatio: paint.scaleMode === 'fit' ? 'xMidYMid meet' : 'xMidYMid slice', rect: boxRect, rotation: boxRotation };
};
