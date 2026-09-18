// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getNodePaints } from 'utils/design/paint/getNodePaints';
import { getImageCropResizeHandleAtPoint } from 'components/Design/Canvas/utils/getImageCropResizeHandleAtPoint';
import { getImageTileRect } from 'components/Design/Canvas/utils/getImageTileRect';
import { getResizeCursorAngle } from 'utils/math/getResizeCursorAngle';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

export const resolveImageTileScaleHover = ({
  imageEditor,
  point,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  if (imageEditor?.mode === 'tile') {
    const node = selectedNodes.find((selectedNode) => selectedNode.id === imageEditor.nodeId);

    if (node && isAppearanceNode(node) && node.rotation === 0) {
      const paint = getNodePaints(node, imageEditor.property)[imageEditor.paintIndex];

      if (paint?.type === 'image' || paint?.type === 'video') {
        const tileRect = getImageTileRect(node, paint);
        const handle = tileRect ? getImageCropResizeHandleAtPoint(point, tileRect, viewport) : null;

        if (handle) {
          return {
            className: null,
            cursor: getRotatedCursorUrl('resize', getResizeCursorAngle(handle, 0)) ?? '',
            nodeId: null,
          };
        }
      }
    }
  }
};
