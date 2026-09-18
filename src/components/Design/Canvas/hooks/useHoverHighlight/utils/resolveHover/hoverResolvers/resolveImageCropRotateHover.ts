// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getNodePaints } from 'utils/design/paint/getNodePaints';
import { getImageCropRect } from 'components/Design/Canvas/utils/getImageCropRect';
import { getRotateCursorAngle } from 'utils/math/getRotateCursorAngle';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isImageCropRotateHandleAtPoint } from 'components/Design/Canvas/utils/isImageCropRotateHandleAtPoint';

export const resolveImageCropRotateHover = ({
  imageEditor,
  point,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  if (imageEditor?.mode === 'crop' && (imageEditor.selectedTarget ?? 'frame') === 'image') {
    const node = selectedNodes.find((selectedNode) => selectedNode.id === imageEditor.nodeId);

    if (node && isAppearanceNode(node)) {
      const paint = getNodePaints(node, imageEditor.property)[imageEditor.paintIndex];

      if (paint?.type === 'image' || paint?.type === 'video') {
        const crop = getImageCropRect(node, paint);

        if (isImageCropRotateHandleAtPoint(point, crop, viewport)) {
          return {
            className: null,
            cursor: getRotatedCursorUrl('rotate', getRotateCursorAngle(point, crop, crop.rotation)) ?? '',
            nodeId: null,
          };
        }
      }
    }
  }
};
