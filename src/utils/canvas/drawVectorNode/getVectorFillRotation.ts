// types
import { TBoxFillRotation } from './drawVectorPatternSourceTile';
import { TVectorNode } from 'types/design/types';

// utils
import { getDrawnVectorNode } from '../render/getDrawnVectorNode';
import { getVectorNodeBounds } from '../vectorNetwork/getVectorNodeBounds';
import { rotatePoint } from 'utils/math/rotatePoint';
import { rotateVectorNodeOrigin } from 'components/Design/Canvas/utils/rotateVectorNodeOrigin';

const cache = new WeakMap<TVectorNode, TBoxFillRotation | undefined>();

const computeVectorFillRotation = (node: TVectorNode): TBoxFillRotation | undefined => {
  const degrees = node.rotation + (node.fillRotation ?? 0);

  if (degrees) {
    const drawnNode = getDrawnVectorNode(node);
    const drawnBounds = getVectorNodeBounds(drawnNode);
    const center = { x: drawnBounds.x + drawnBounds.width / 2, y: drawnBounds.y + drawnBounds.height / 2 };

    const frame = getVectorNodeBounds(rotateVectorNodeOrigin(drawnNode, center, -degrees));
    const frameCenter = rotatePoint({ x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 }, center, degrees);

    return {
      center: frameCenter,
      degrees,
      localBounds: { ...frame, x: frameCenter.x - frame.width / 2, y: frameCenter.y - frame.height / 2 },
    };
  }
};

export const getVectorFillRotation = (node: TVectorNode): TBoxFillRotation | undefined => {
  if (!cache.has(node)) {
    cache.set(node, computeVectorFillRotation(node));
  }

  return cache.get(node);
};
