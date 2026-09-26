// @xigma
import { TIconProps } from '@xigma/components';

// others
import { BOOLEAN_OPERATION_ICON } from 'utils/design/booleanOperation/constants';
import { getFrameLayoutIconName } from './getFrameLayoutIconName';
import { MEDIA_FILL_ICON, NODE_TYPE_ICON } from '../constants';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeMediaFillType, TMediaFillType } from 'utils/design/paint/getNodeMediaFillType';

const getIconStatus = (
  node: TSceneNode,
  isMask: boolean,
  layoutIconName: TIconProps['name'] | undefined,
): 'default' | 'frameLayout' | 'mask' | 'media' | 'textOnPath' => {
  switch (true) {
    case isMask:
      return 'mask';
    case Boolean(layoutIconName):
      return 'frameLayout';
    case node.type === NodeType.text && Boolean(node.pathId):
      return 'textOnPath';
    case Boolean(getNodeMediaFillType(node)):
      return 'media';
    default:
      return 'default';
  }
};

export const getNodeTypeIconName = (node: TSceneNode, isMask: boolean): TIconProps['name'] => {
  const layoutIconName = node.type === NodeType.frame ? getFrameLayoutIconName(node) : undefined;
  const iconStatus = getIconStatus(node, isMask, layoutIconName);

  switch (iconStatus) {
    case 'mask':
      return 'MaskGroup';
    case 'frameLayout':
      return layoutIconName as TIconProps['name'];
    case 'textOnPath':
      return 'TextOnPathTool';
    case 'media':
      return MEDIA_FILL_ICON[getNodeMediaFillType(node) as TMediaFillType];
    default:
      return node.type === NodeType.boolean ? BOOLEAN_OPERATION_ICON[node.booleanOperation] : NODE_TYPE_ICON[node.type];
  }
};
