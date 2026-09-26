// store
import { TImageEditorState } from 'store/design/types';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getNodeBounds } from '../../utils/getNodeBounds';
import { isImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/utils/isImageFrameNode';
import { rotatePoint } from 'utils/math/rotatePoint';
import { worldToScreen } from '../../utils/worldToScreen';

const BUTTON_SIZE_PX = 24;
const EDGE_OFFSET_PX = 5;

export const getImageCropExpandButtonPosition = (
  imageEditor: TImageEditorState | null,
  nodes: Record<string, TSceneNode>,
  viewport: TViewport,
): TPoint | null => {
  if (imageEditor?.mode === 'crop') {
    const node = nodes[imageEditor.nodeId];

    if (isImageFrameNode(node)) {
      const bounds = getNodeBounds(node);
      const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
      const inset = (BUTTON_SIZE_PX / 2 + EDGE_OFFSET_PX) / viewport.zoom;
      const localButtonCenter: TPoint = { x: bounds.x + bounds.width - inset, y: bounds.y + bounds.height - inset };

      return worldToScreen(rotatePoint(localButtonCenter, center, node.rotation), viewport);
    }
  }

  return null;
};
