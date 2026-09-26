// types
import { TVectorNode } from 'types/design/types';
import { NodeType } from 'types/design/enums';

// utils
import { getHoleParentByKey } from './getHoleParentByKey';
import { getNodeFaces } from './getNodeFaces';
import { makeSolidPaint } from 'utils/design/paint/makeSolidPaint';
import { mergeNodeFields } from './mergeNodeFields';
import { TVectorNodeLoopsBase } from '../assembleVectorNodeFromLoopGeometries/assembleVectorNodeFromLoopGeometries';

export const mergeVectorNodeGeometriesWithHoleDetection = (
  nodes: TVectorNode[],
  base: TVectorNodeLoopsBase,
  fillColor: string,
): TVectorNode | null => {
  if (nodes.length !== 0) {
    const faces = getNodeFaces(nodes);
    const holeParentByKey = getHoleParentByKey(faces);
    const { fillByKey, filledFaceKeys, segments, vertices } = mergeNodeFields(nodes);
    
    return {
      defaultFill: [makeSolidPaint(fillColor)],
      fillByKey,
      filledFaceKeys,
      holeParentByKey,
      id: base.id,
      name: base.name,
      parentId: base.parentId,
      rotation: base.rotation,
      segments,
      strokeWidth: 0,
      strokes: [],
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices,
    };
  }
  
  return null;
};
