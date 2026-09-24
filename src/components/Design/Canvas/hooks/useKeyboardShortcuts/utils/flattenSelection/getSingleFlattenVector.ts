// types
import { NodeType } from 'types/design/enums';
import { TFlattenEntry } from './types';
import { TVectorNode } from 'types/design/types';

// utils
import { convertNodeToVector, isConvertibleToVectorNode } from 'utils/canvas/vectorNetwork/convertShapeToVector/convertNodeToVector';

export const getSingleFlattenVector = ({ node, vector }: TFlattenEntry): TVectorNode | null => {
  switch (true) {
    case node.type === NodeType.vector:
      return null;
    case isConvertibleToVectorNode(node):
      return convertNodeToVector(node);
    default:
      return { ...vector, id: node.id, name: node.name, parentId: node.parentId };
  }
};
