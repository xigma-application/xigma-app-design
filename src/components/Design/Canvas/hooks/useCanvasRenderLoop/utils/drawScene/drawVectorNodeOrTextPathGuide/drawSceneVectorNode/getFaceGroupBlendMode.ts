// types
import { BlendMode } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';

export const getFaceGroupBlendMode = (paints: TPaint[]): BlendMode | undefined => {
  const blendMode = paints.find((paint) => paint.blendMode)?.blendMode;

  if (blendMode && blendMode !== BlendMode.normal && blendMode !== BlendMode.passThrough) {
    return blendMode;
  }
};
