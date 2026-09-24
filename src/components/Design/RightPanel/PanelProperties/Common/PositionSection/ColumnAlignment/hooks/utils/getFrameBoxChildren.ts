// types
import { TBoxSceneNode, TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

const isExistingBoxSceneNode = (node: TSceneNode | undefined): node is TBoxSceneNode => node !== undefined && isBoxSceneNode(node);

export const getFrameBoxChildren = (nodes: Record<string, TSceneNode>, frame: TFrameNode): TBoxSceneNode[] =>
  frame.childIds.map((id) => nodes[id]).filter(isExistingBoxSceneNode);
