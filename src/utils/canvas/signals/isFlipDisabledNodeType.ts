// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const isFlipDisabledNodeType = (node: TSceneNode): boolean => node.type === NodeType.frame || node.type === NodeType.section;
