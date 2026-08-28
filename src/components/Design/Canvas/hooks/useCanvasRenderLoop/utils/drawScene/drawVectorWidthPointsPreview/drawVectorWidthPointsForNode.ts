// types
import { TSceneNode, TViewport } from 'types/design/types';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { drawWidthPointHandles } from './drawWidthPointHandles';
import { getPreviewWidthPoints } from './getPreviewWidthPoints';
import { getRenderedVectorNode } from 'components/Design/Canvas/utils/getRenderedVectorNode';
import { getVectorChainOrder } from 'utils/canvas/vectorNetwork/getVectorChainOrder';
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';
import { isVectorWidthHandleSelected } from './isVectorWidthHandleSelected';

export const drawVectorWidthPointsForNode = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  nodes: Record<string, TSceneNode>,
  nodeId: string,
  refs: TCanvasRefs,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const node = getVectorEditingNode(nodes, nodeId);
  const bakedNode = node && getRenderedVectorNode(node);
  const chainOrder = bakedNode && getVectorChainOrder(bakedNode);

  if (node && bakedNode && chainOrder) {
    const points = getPreviewWidthPoints(node, refs.vectorWidth.vectorWidthPointDragRef.current);
    const selectedHandles = refs.vectorEdit.selectedVectorWidthHandlesRef.current;

    Object.values(points).forEach((widthPoint) => {
      const isLeftSelected = isVectorWidthHandleSelected(selectedHandles, nodeId, widthPoint.id, 'left');
      const isRightSelected = isVectorWidthHandleSelected(selectedHandles, nodeId, widthPoint.id, 'right');
      const isPointSelected = isVectorWidthHandleSelected(selectedHandles, nodeId, widthPoint.id, 'point');

      drawWidthPointHandles(
        gl,
        program,
        buffer,
        bakedNode,
        chainOrder,
        widthPoint,
        isLeftSelected,
        isRightSelected,
        isPointSelected,
        canvasWidth,
        canvasHeight,
        viewport,
      );
    });
  }
};
