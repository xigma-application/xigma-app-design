// types
import { TPaint } from 'types/design/paint/types';
import { TSceneNode } from 'types/design/types';

// utils
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { scaleFillsCrop } from 'components/Design/Canvas/utils/scaleFillsCrop';

export const getDimensionChangeCropFills = (
  selectedNode: TSceneNode | undefined,
  width: number,
  height: number,
  nextWidth: number,
  nextHeight: number,
): TPaint[] | undefined =>
  selectedNode && isAppearanceNode(selectedNode)
    ? scaleFillsCrop(selectedNode.fills, {
        newCenterX: selectedNode.x + nextWidth / 2,
        newCenterY: selectedNode.y + nextHeight / 2,
        oldCenterX: selectedNode.x + width / 2,
        oldCenterY: selectedNode.y + height / 2,
        scaleX: width !== 0 ? nextWidth / width : 1,
        scaleY: height !== 0 ? nextHeight / height : 1,
      })
    : undefined;
