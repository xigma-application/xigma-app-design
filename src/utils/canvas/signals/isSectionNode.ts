// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TSectionNode } from 'types/design/types';

export const isSectionNode = (node: TSceneNode | undefined): node is TSectionNode => node?.type === NodeType.section;
