// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const hasFrameStrokeOverChildren = (node: TSceneNode): boolean =>
  node.type === NodeType.frame &&
  node.childIds.length > 0 &&
  Boolean(node.strokeWidth) &&
  (Boolean(node.strokeColor) || (node.strokes ?? []).length > 0);
