// types
import { TVectorNode } from 'types/design/types';
import { NodeType } from 'types/design/enums';

// utils
import { TVectorNodeLoopsBase } from '../assembleVectorNodeFromLoopGeometries/assembleVectorNodeFromLoopGeometries';
import { getHoleParentByKey } from './getHoleParentByKey';
import { getNodeFaces } from './getNodeFaces';
import { mergeNodeFields } from './mergeNodeFields';

export const mergeVectorNodeGeometriesWithHoleDetection = (
  nodes: TVectorNode[],
  base: TVectorNodeLoopsBase,
  fillColor: string,
): TVectorNode | null => {
  if (nodes.length === 0) {
    return null;
  }

  const faces = getNodeFaces(nodes);
  const holeParentByKey = getHoleParentByKey(faces);
  const { fillColorOverrideByKey, filledFaceKeys, segments, vertices } = mergeNodeFields(nodes);

  return {
    fillColor,
    fillColorOverrideByKey,
    filledFaceKeys,
    holeParentByKey,
    id: base.id,
    name: base.name,
    parentId: base.parentId,
    rotation: base.rotation,
    segments,
    strokeColor: fillColor,
    strokeWidth: 0,
    type: NodeType.vector,
    vertexHandleModes: {},
    vertices,
  };
};
