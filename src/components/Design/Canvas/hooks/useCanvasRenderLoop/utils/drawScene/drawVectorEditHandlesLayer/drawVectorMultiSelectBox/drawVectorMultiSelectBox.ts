import { RefObject } from 'react';

// types
import { TVectorHandleHover, TVectorMultiSelectBox } from 'types/design/canvas/types';
import { TVectorMultiSelectResizeDragState, TVectorMultiSelectRotateDragState } from 'types/design/selectionTool/types';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawVectorMultiSelectResizeDragBox } from './drawVectorMultiSelectResizeDragBox';
import { drawVectorMultiSelectRotateDragBox } from './drawVectorMultiSelectRotateDragBox';
import { drawVectorMultiSelectStaticBox } from './drawVectorMultiSelectStaticBox';
import { getVectorMultiSelectVertexIds } from '../../../../../../utils/getVectorMultiSelectVertexIds';
import { isVectorMultiSelectBoxEligible } from '../../../../../../utils/isVectorMultiSelectBoxEligible';

export const drawVectorMultiSelectBox = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  selectedVertexIds: string[],
  selectedSegmentIds: string[],
  selectedHandles: TVectorHandleHover[],
  vectorMultiSelectBoxRef: RefObject<TVectorMultiSelectBox | null>,
  vectorMultiSelectResizeDrag: TVectorMultiSelectResizeDragState | null,
  vectorMultiSelectRotateDrag: TVectorMultiSelectRotateDragState | null,
  isVectorMultiDragMoving: boolean,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const vertexIds = getVectorMultiSelectVertexIds(nodes, vectorEditingNodeIds, selectedVertexIds, selectedSegmentIds);

  if (isVectorMultiSelectBoxEligible(vertexIds, selectedHandles)) {
    if (vectorMultiSelectResizeDrag) {
      drawVectorMultiSelectResizeDragBox(gl, program, buffer, vectorMultiSelectResizeDrag, canvasWidth, canvasHeight, viewport);
    } else if (vectorMultiSelectRotateDrag) {
      drawVectorMultiSelectRotateDragBox(gl, program, buffer, vectorMultiSelectRotateDrag, canvasWidth, canvasHeight, viewport);
    } else if (!isVectorMultiDragMoving) {
      drawVectorMultiSelectStaticBox(
        gl,
        program,
        buffer,
        nodes,
        vectorEditingNodeIds,
        vertexIds,
        selectedHandles,
        vectorMultiSelectBoxRef,
        canvasWidth,
        canvasHeight,
        viewport,
      );
    }
  } else if (vectorMultiSelectBoxRef.current) {
    vectorMultiSelectBoxRef.current = null;
  }
};
