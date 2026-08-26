// types
import { TVectorNode } from 'types/design/types';
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { flattenVectorSegments } from '../vectorNetwork/flattenVectorSegments';
import { getVectorNodeBounds } from '../vectorNetwork/getVectorNodeBounds';
import { groupFilledFacesByColor } from './groupFilledFacesByColor';

export const captureVectorNodeResizeSnapshot = (node: TVectorNode, rotation: number): TVectorNodeResizeSnapshot => {
  const facesByColor = [...groupFilledFacesByColor(node)].map(([color, points]) => ({ color, points }));
  const bounds = getVectorNodeBounds(node);
  const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

  return {
    anchorX: null,
    anchorY: null,
    facesByColor,
    flattenedSegments: flattenVectorSegments(node),
    pivot: center,
    rotation,
    scaleX: 1,
    scaleY: 1,
    scaledCenter: center,
    strokeColor: node.strokeColor,
    strokeWidth: node.strokeWidth,
  };
};
