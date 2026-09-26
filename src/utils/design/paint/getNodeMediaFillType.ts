// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export type TMediaFillType = 'image' | 'video';

const getPaintsMediaFillType = (paintTypes: string[]): TMediaFillType | null => {
  switch (true) {
    case paintTypes.length === 0:
      return null;
    case paintTypes.every((type) => type === 'image'):
      return 'image';
    case paintTypes.every((type) => type === 'video'):
      return 'video';
    default:
      return null;
  }
};

export const getNodeMediaFillType = (node: TSceneNode): TMediaFillType | null =>
  node.type === NodeType.rectangle ? getPaintsMediaFillType(node.fills.map((paint) => paint.type)) : null;
