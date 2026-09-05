// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TAutoLayoutFrame } from './types';
import { TSceneNode } from 'types/design/types';

export const isAutoLayoutFrame = (node: TSceneNode | null): node is TAutoLayoutFrame =>
  node !== null && node.type === NodeType.frame && (node.layoutMode === LayoutMode.horizontal || node.layoutMode === LayoutMode.vertical);
