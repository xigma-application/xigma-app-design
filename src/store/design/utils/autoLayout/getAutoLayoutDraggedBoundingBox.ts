// types
import { TDraftRect } from 'types/canvas';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getAutoLayoutNodeLocalBounds } from './getAutoLayoutNodeLocalBounds';

export const getAutoLayoutDraggedBoundingBox = (selectedNodes: TSceneNode[], frame: TFrameNode): TDraftRect => {
  const bounds = selectedNodes.map((node) => getAutoLayoutNodeLocalBounds(node, frame));
  const minX = Math.min(...bounds.map((bound) => bound.x));
  const minY = Math.min(...bounds.map((bound) => bound.y));
  const maxX = Math.max(...bounds.map((bound) => bound.x + bound.width));
  const maxY = Math.max(...bounds.map((bound) => bound.y + bound.height));

  return { height: maxY - minY, width: maxX - minX, x: minX, y: minY };
};
