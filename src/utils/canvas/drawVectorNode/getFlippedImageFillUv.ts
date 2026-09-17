// types
import { TImageFillCoverUv } from './getImageFillCoverUv';

export const getFlippedImageFillUv = (uv: TImageFillCoverUv, flipX: boolean, flipY: boolean): TImageFillCoverUv => ({
  uMax: flipX ? uv.uMin : uv.uMax,
  uMin: flipX ? uv.uMax : uv.uMin,
  vMax: flipY ? uv.vMin : uv.vMax,
  vMin: flipY ? uv.vMax : uv.vMin,
});
