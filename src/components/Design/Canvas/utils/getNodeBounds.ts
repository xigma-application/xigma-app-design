// types
import { NodeType } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';

export const getNodeBounds = (node: TSceneNode): TDraftRect =>
  node.type === NodeType.vector ? getVectorNodeBounds(node) : { height: node.height, width: node.width, x: node.x, y: node.y };
