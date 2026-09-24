// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

export const isFrameNode = (node: TSceneNode | undefined): node is TFrameNode => node?.type === NodeType.frame;
