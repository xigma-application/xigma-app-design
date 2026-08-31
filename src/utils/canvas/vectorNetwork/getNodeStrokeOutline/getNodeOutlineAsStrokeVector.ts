// types
import { NodeType } from 'types/design/enums';
import { TStrokeableNode } from './types';
import { TVectorNode } from 'types/design/types';

// utils
import { convertNodeToVector } from 'utils/canvas/vectorNetwork/convertShapeToVector/convertNodeToVector';
import { getNodeStrokeOutline } from './getNodeStrokeOutline';
import { mergeVectorNodeGeometries } from 'utils/canvas/vectorNetwork/buildVectorNodeFromLoops/mergeVectorNodeGeometries';

export const getNodeOutlineAsStrokeVector = (node: TStrokeableNode): TVectorNode | null => {
  const strokeVector = getNodeStrokeOutline(node);

  if (strokeVector) {
    if (node.type === NodeType.line) {
      return { ...strokeVector, id: node.id };
    }

    const fillVector = node.type === NodeType.vector ? node : convertNodeToVector(node);

    return mergeVectorNodeGeometries(
      [fillVector, strokeVector],
      { id: node.id, name: node.name, parentId: node.parentId, rotation: node.rotation },
      fillVector.fillColor ?? '',
    );
  }

  return null;
};
