import { RefObject } from 'react';

// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TVectorHandleHover, TVectorMultiSelectBox } from 'types/design/canvas/types';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { getVectorMultiSelectBox } from '../../../../../../utils/getVectorMultiSelectBox';

export const drawVectorMultiSelectStaticBox = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  selectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
  vectorMultiSelectBoxRef: RefObject<TVectorMultiSelectBox | null>,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const box = getVectorMultiSelectBox(nodes, vectorEditingNodeIds, selectedVertexIds, selectedHandles, vectorMultiSelectBoxRef);

  if (box) {
    drawRect(gl, program, buffer, { ...box.bounds, stroke: DRAFT_FRAME_STROKE }, canvasWidth, canvasHeight, viewport, box.rotation);
  }
};
