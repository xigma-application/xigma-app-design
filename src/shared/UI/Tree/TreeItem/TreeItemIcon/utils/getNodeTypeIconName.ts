// @xigma
import { TIconProps } from '@xigma/components';

// others
import { NODE_TYPE_ICON } from '../constants';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const getNodeTypeIconName = (node: TSceneNode): TIconProps['name'] =>
  node.type === NodeType.text && node.pathId ? 'TextOnPathTool' : NODE_TYPE_ICON[node.type];
