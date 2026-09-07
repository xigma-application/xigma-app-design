// @xigma
import { TIconProps } from '@xigma/components';

// others
import { getFrameLayoutIconName } from './getFrameLayoutIconName';
import { NODE_TYPE_ICON } from '../constants';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

const getIconStatus = (node: TSceneNode, layoutIconName: TIconProps['name'] | undefined): 'default' | 'frameLayout' | 'mask' | 'textOnPath' => {
  switch (true) {
    case node.isMask:
      return 'mask';
    case Boolean(layoutIconName):
      return 'frameLayout';
    case node.type === NodeType.text && Boolean(node.pathId):
      return 'textOnPath';
    default:
      return 'default';
  }
};

export const getNodeTypeIconName = (node: TSceneNode): TIconProps['name'] => {
  const layoutIconName = node.type === NodeType.frame ? getFrameLayoutIconName(node) : undefined;
  const iconStatus = getIconStatus(node, layoutIconName);

  switch (iconStatus) {
    case 'mask':
      return 'MaskGroup';
    case 'frameLayout':
      return layoutIconName as TIconProps['name'];
    case 'textOnPath':
      return 'TextOnPathTool';
    default:
      return NODE_TYPE_ICON[node.type];
  }
};
