// store
import { getAutoLayoutChildLocalBounds } from './getAutoLayoutChildLocalBounds';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export const getAutoLayoutNodeLocalBounds = (node: TSceneNode, frame: TFrameNode): TDraftRect => {
  const worldBounds = getAutoLayoutChildLocalBounds(node, frame.rotation);

  if (frame.rotation !== 0) {
    const frameCenter: TPoint = { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 };
    const worldCenter: TPoint = { x: worldBounds.x + worldBounds.width / 2, y: worldBounds.y + worldBounds.height / 2 };
    const localCenter = rotatePoint(worldCenter, frameCenter, -frame.rotation);

    return {
      height: worldBounds.height,
      width: worldBounds.width,
      x: localCenter.x - worldBounds.width / 2,
      y: localCenter.y - worldBounds.height / 2,
    };
  }

  return worldBounds;
};
