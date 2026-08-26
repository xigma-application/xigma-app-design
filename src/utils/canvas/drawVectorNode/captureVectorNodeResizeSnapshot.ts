// types
import { TVectorNode } from 'types/design/types';
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { flattenVectorSegments } from '../vectorNetwork/flattenVectorSegments';
import { groupFilledFacesByColor } from './groupFilledFacesByColor';

export const captureVectorNodeResizeSnapshot = (node: TVectorNode): TVectorNodeResizeSnapshot => {
  const facesByColor = [...groupFilledFacesByColor(node)].map(([color, points]) => ({ color, points }));

  return {
    anchorX: null,
    anchorY: null,
    facesByColor,
    flattenedSegments: flattenVectorSegments(node),
    scaleX: 1,
    scaleY: 1,
    strokeColor: node.strokeColor,
    strokeWidth: node.strokeWidth,
  };
};
