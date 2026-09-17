// types
import { TSceneNode } from 'types/design/types';

// utils
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';
import { getGroupSubtreeNodes } from '../../nodeHierarchy/getGroupSubtreeNodes';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { translateFillsCrop } from 'components/Design/Canvas/utils/translateFillsCrop';

export const moveConstrainedChildSubtree = (nodes: Record<string, TSceneNode>, child: TSceneNode, deltaX: number, deltaY: number): void => {
  getGroupSubtreeNodes(child, nodes).forEach((subtreeNode) => {
    Object.assign(subtreeNode, getGeometryDeltaChanges(subtreeNode, deltaX, deltaY));

    if (isAppearanceNode(subtreeNode)) {
      const fills = translateFillsCrop(subtreeNode.fills, deltaX, deltaY);

      if (fills) {
        subtreeNode.fills = fills;
      }
    }
  });
};
