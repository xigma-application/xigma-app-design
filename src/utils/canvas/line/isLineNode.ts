// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TSceneNode } from 'types/design/types';

export const isLineNode = (node: TSceneNode | undefined): node is TLineNode => node?.type === NodeType.line;
