// types
import { TSceneNodeChanges } from 'types/design/types';

// utils
import { getRotatedAxisSigns } from '../getRotatedAxisSigns';

export const getResizeChanges = (
  origin: { flip: { x: boolean; y: boolean } | null; rotation: number },
  scaleX: number,
  scaleY: number,
  isSingleBoxOrigin: boolean,
  height: number,
  width: number,
  x: number,
  y: number,
): TSceneNodeChanges => {
  const flipSign = isSingleBoxOrigin ? { x: scaleX, y: scaleY } : getRotatedAxisSigns(scaleX, scaleY, origin.rotation);
  const roundedX = origin.rotation !== 0 ? x : Math.round(x);
  const roundedY = origin.rotation !== 0 ? y : Math.round(y);

  return origin.flip
    ? { flipX: origin.flip.x !== flipSign.x < 0, flipY: origin.flip.y !== flipSign.y < 0, height, width, x: roundedX, y: roundedY }
    : { height, width, x: roundedX, y: roundedY };
};
