// types
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { flipTextPoint } from 'utils/canvas/text/flipTextPoint';
import { getTextPathSampler } from 'utils/canvas/text/pathSampler/getTextPathSampler';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getPathTextHandlePoint = (node: TEditingTextBox, pathNode?: TSceneNode): TPoint | null => {
  let handlePoint: TPoint | null = null;

  if (node.pathId) {
    const sampler = getTextPathSampler(node, pathNode);
    const sample = sampler.sampleAtLength((node.pathStartOffset ?? 0) * sampler.totalLength);
    const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
    const localPoint = flipTextPoint({ x: center.x + sample.x, y: center.y + sample.y }, node);

    handlePoint = rotatePoint(localPoint, center, node.rotation);
  }

  return handlePoint;
};
