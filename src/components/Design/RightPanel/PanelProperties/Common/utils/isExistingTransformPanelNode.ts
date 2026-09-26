// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { isExistingBoxSceneNode } from 'components/Design/Canvas/utils/isExistingBoxSceneNode';

export const isExistingTransformPanelNode = (node: TSceneNode | undefined): node is TBoxSceneNode | TVectorNode =>
  node?.type === NodeType.vector || isExistingBoxSceneNode(node);
