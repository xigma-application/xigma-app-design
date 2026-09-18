// types
import { TSceneNode } from 'types/design/types';

// utils
import { getCropPaintChanges } from 'components/Design/Canvas/utils/getCropPaintChanges';
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';
import { getGroupSubtreeNodes } from '../../nodeHierarchy/getGroupSubtreeNodes';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { translateFillsCrop } from 'components/Design/Canvas/utils/translateFillsCrop';

export const moveConstrainedChildSubtree = (nodes: Record<string, TSceneNode>, child: TSceneNode, deltaX: number, deltaY: number): void => {
  getGroupSubtreeNodes(child, nodes).forEach((subtreeNode) => {
    Object.assign(subtreeNode, getGeometryDeltaChanges(subtreeNode, deltaX, deltaY));

    if (isAppearanceNode(subtreeNode)) {
      Object.assign(
        subtreeNode,
        getCropPaintChanges(subtreeNode, (paints) => translateFillsCrop(paints, deltaX, deltaY)),
      );
    }
  });
};
