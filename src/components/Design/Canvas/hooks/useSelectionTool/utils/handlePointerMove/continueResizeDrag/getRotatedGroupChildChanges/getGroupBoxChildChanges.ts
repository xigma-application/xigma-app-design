// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNodeChanges } from 'types/design/types';

// utils
import { isAxisSwapped } from './isAxisSwapped';

type TBoxChildOrigin = { flip: { x: boolean; y: boolean } | null; height: number; rotation: number; width: number; x: number; y: number };

export const getGroupBoxChildChanges = (
  childOrigin: TBoxChildOrigin,
  groupOrigin: TDraftRect,
  groupRotation: number,
  newGroupBox: TDraftRect,
  mirror: TPoint,
  nextPoint: (worldPoint: TPoint) => TPoint,
): TSceneNodeChanges => {
  const magX = groupOrigin.width === 0 ? 1 : newGroupBox.width / groupOrigin.width;
  const magY = groupOrigin.height === 0 ? 1 : newGroupBox.height / groupOrigin.height;
  const target = nextPoint({ x: childOrigin.x + childOrigin.width / 2, y: childOrigin.y + childOrigin.height / 2 });
  const width = Math.round(childOrigin.width * magX);
  const height = Math.round(childOrigin.height * magY);
  const x = Math.round(target.x - width / 2);
  const y = Math.round(target.y - height / 2);

  if (childOrigin.flip) {
    const swapped = isAxisSwapped(childOrigin.rotation - groupRotation);
    const flipMirror = swapped ? { x: mirror.y, y: mirror.x } : mirror;

    return {
      flipX: flipMirror.x < 0 ? !childOrigin.flip.x : childOrigin.flip.x,
      flipY: flipMirror.y < 0 ? !childOrigin.flip.y : childOrigin.flip.y,
      height,
      width,
      x,
      y,
    };
  }

  return { height, width, x, y };
};
