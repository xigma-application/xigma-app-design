// types
import { TPaint } from 'types/design/paint/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getCropPaintChanges } from 'components/Design/Canvas/utils/getCropPaintChanges';
import { isImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/utils/isImageFrameNode';
import { scaleFillsCrop } from 'components/Design/Canvas/utils/scaleFillsCrop';

export const getDimensionChangeCropFills = (
  selectedNode: TSceneNode | undefined,
  width: number,
  height: number,
  nextWidth: number,
  nextHeight: number,
): { fills?: TPaint[]; strokes?: TPaint[] } =>
  selectedNode && isImageFrameNode(selectedNode)
    ? getCropPaintChanges(selectedNode, (paints) =>
        scaleFillsCrop(paints, {
          newCenterX: selectedNode.x + nextWidth / 2,
          newCenterY: selectedNode.y + nextHeight / 2,
          oldCenterX: selectedNode.x + width / 2,
          oldCenterY: selectedNode.y + height / 2,
          scaleX: width !== 0 ? nextWidth / width : 1,
          scaleY: height !== 0 ? nextHeight / height : 1,
        }),
      )
    : {};
