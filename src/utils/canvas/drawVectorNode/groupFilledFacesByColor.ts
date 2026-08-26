// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorFillColorForLoopKey } from '../vectorNetwork/getVectorFillColorForLoopKey';
import { getVectorFillLoopPoints } from '../vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints';

export const groupFilledFacesByColor = (renderedNode: TVectorNode): Map<string, TPoint[][]> => {
  const facesByColor = new Map<string, TPoint[][]>();

  renderedNode.filledFaceKeys.forEach((key) => {
    const points = getVectorFillLoopPoints(renderedNode, key);

    if (points) {
      const color = getVectorFillColorForLoopKey(key);
      const faces = facesByColor.get(color) ?? [];

      faces.push(points);
      facesByColor.set(color, faces);
    }
  });

  return facesByColor;
};
