// types
import { TLineNode, TSceneNode } from 'types/design/types';

// utils
import { isLineNode } from '../line/isLineNode';

export const isOffsetVectorNode = (node: TSceneNode | undefined): node is TLineNode => isLineNode(node);
