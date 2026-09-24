// types
import { TFlipAxis } from './types';
import { TFrameNode, TSceneNodeChanges } from 'types/design/types';
import { TPoint } from 'types/canvas';

export const getMirroredPosition = (frame: TFrameNode, axis: TFlipAxis, mirrorCenter: TPoint | null): TSceneNodeChanges => {
  if (mirrorCenter) {
    return axis === 'horizontal' ? { x: 2 * mirrorCenter.x - frame.x - frame.width } : { y: 2 * mirrorCenter.y - frame.y - frame.height };
  }

  return {};
};
