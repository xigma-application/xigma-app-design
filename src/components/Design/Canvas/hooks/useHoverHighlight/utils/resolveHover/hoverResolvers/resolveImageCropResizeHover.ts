// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getImageCropRect } from 'components/Design/Canvas/utils/getImageCropRect';
import { getImageCropResizeHandleAtPoint } from 'components/Design/Canvas/utils/getImageCropResizeHandleAtPoint';
import { getResizeCursorAngle } from 'utils/math/getResizeCursorAngle';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

export const resolveImageCropResizeHover = ({
  imageEditor,
  point,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  if (imageEditor?.mode === 'crop' && (imageEditor.selectedTarget ?? 'frame') === 'image') {
    const node = selectedNodes.find((selectedNode) => selectedNode.id === imageEditor.nodeId);

    if (node && isAppearanceNode(node)) {
      const paint = node.fills[imageEditor.paintIndex];

      if (paint?.type === 'image' || paint?.type === 'video') {
        const crop = getImageCropRect(node, paint);
        const handle = getImageCropResizeHandleAtPoint(point, crop, viewport);

        if (handle) {
          return {
            className: null,
            cursor: getRotatedCursorUrl('resize', getResizeCursorAngle(handle, crop.rotation)) ?? '',
            nodeId: null,
          };
        }
      }
    }
  }
};
