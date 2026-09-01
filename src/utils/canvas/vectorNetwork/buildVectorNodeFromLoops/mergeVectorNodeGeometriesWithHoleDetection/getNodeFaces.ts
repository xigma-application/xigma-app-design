// types
import { TVectorNode } from 'types/design/types';
import { TNodeFace } from './types';

// utils
import { getBounds } from './getBounds';
import { getVectorFaceSignedArea } from '../../getVectorFaceSignedArea';
import { getVectorFillLoopPoints } from '../../getVectorFillLoopPoints/getVectorFillLoopPoints';

export const getNodeFaces = (nodes: TVectorNode[]): TNodeFace[] =>
  nodes.flatMap((node) =>
    node.filledFaceKeys
      .map((key) => {
        const points = getVectorFillLoopPoints(node, key);

        return points && { bounds: getBounds(points), key, points, sign: Math.sign(getVectorFaceSignedArea(points)) };
      })
      .filter((face): face is TNodeFace => Boolean(face)),
  );
