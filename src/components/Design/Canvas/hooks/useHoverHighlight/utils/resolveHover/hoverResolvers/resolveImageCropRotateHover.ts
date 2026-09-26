// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getImageCropRect } from 'components/Design/Canvas/utils/getImageCropRect';
import { getNodePaints } from 'utils/design/paint/getNodePaints';
import { getRotateCursorAngle } from 'utils/math/getRotateCursorAngle';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { isImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/utils/isImageFrameNode';
import { isImageCropRotateHandleAtPoint } from 'components/Design/Canvas/utils/isImageCropRotateHandleAtPoint';

export const resolveImageCropRotateHover = ({
  imageEditor,
  point,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  if (imageEditor?.mode === 'crop' && (imageEditor.selectedTarget ?? 'frame') === 'image') {
    const node = selectedNodes.find((selectedNode) => selectedNode.id === imageEditor.nodeId);

    if (node && isImageFrameNode(node)) {
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
