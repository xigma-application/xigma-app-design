// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';
import { TSizeLabelSizingModes } from './types';

export const getSizeLabelSizingModes = (node: TSceneNode): TSizeLabelSizingModes | undefined => {
  switch (node.type) {
    case NodeType.line:
    case NodeType.vector:
      return undefined;
    default:
      return { height: node.heightSizingMode, width: node.widthSizingMode };
  }
};
