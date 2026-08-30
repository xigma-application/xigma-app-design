// others
import { VECTOR_CUT_CROSSING_FILL, VECTOR_EDIT_OUTLINE_STROKE, VECTOR_VERTEX_SIZE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorWidthPoint, TViewport } from 'types/design/types';
import { TVectorChainOrder } from 'utils/canvas/vectorNetwork/getVectorChainOrder/getVectorChainOrder';

// utils
import { drawDefaultWidthHandleDiamond } from './drawDefaultWidthHandleDiamond';
import { drawLine } from 'utils/canvas/drawLine';
import { drawSelectedWidthHandleDiamond } from './drawSelectedWidthHandleDiamond';
import { drawSelectedWidthPointAnchor } from './drawSelectedWidthPointAnchor';
import { drawVectorCutPointMarker } from '../drawVectorCutPointMarker';
import { getVectorChainPositionAtFraction } from 'utils/canvas/vectorNetwork/getVectorChainPositionAtFraction';
import { getVectorSegmentNormalAtT } from 'utils/canvas/vectorNetwork/getVectorSegmentNormalAtT';
import { getVectorSegmentPointAtT } from 'utils/canvas/vectorNetwork/getVectorSegmentPointAtT';

const drawWidthHandleDiamond = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  handle: TPoint,
  size: number,
  isSelected: boolean,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (isSelected) {
    drawSelectedWidthHandleDiamond(gl, program, buffer, handle, size, canvasWidth, canvasHeight, viewport);
  } else {
    drawDefaultWidthHandleDiamond(gl, program, buffer, handle, size, canvasWidth, canvasHeight, viewport);
  }
};

const drawWidthPointAnchor = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  anchor: TPoint,
  size: number,
  isSelected: boolean,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (isSelected) {
    drawSelectedWidthPointAnchor(gl, program, buffer, anchor, size, canvasWidth, canvasHeight, viewport);
  } else {
    drawVectorCutPointMarker(gl, program, buffer, anchor, canvasWidth, canvasHeight, viewport);
  }
};

export const drawWidthPointHandles = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  bakedNode: TVectorNode,
  chainOrder: TVectorChainOrder,
  widthPoint: TVectorWidthPoint,
  isLeftSelected: boolean,
  isRightSelected: boolean,
  isPointSelected: boolean,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const { segmentId, t } = getVectorChainPositionAtFraction(bakedNode, chainOrder, widthPoint.position);
  const segment = bakedNode.segments[segmentId];
  const anchor = getVectorSegmentPointAtT(bakedNode, segment, t);
  const normal = getVectorSegmentNormalAtT(bakedNode, segment, t);
  const leftHandle: TPoint = { x: anchor.x + normal.x * widthPoint.leftOffset, y: anchor.y + normal.y * widthPoint.leftOffset };
  const rightHandle: TPoint = { x: anchor.x - normal.x * widthPoint.rightOffset, y: anchor.y - normal.y * widthPoint.rightOffset };
  const size = VECTOR_VERTEX_SIZE / viewport.zoom;
  const lineStroke = isPointSelected ? VECTOR_CUT_CROSSING_FILL : VECTOR_EDIT_OUTLINE_STROKE;

  drawLine(
    gl,
    program,
    buffer,
    { x1: leftHandle.x, x2: rightHandle.x, y1: leftHandle.y, y2: rightHandle.y },
    lineStroke,
    1 / viewport.zoom,
    canvasWidth,
    canvasHeight,
    viewport,
  );
  drawWidthHandleDiamond(gl, program, buffer, leftHandle, size, isLeftSelected, canvasWidth, canvasHeight, viewport);
  drawWidthHandleDiamond(gl, program, buffer, rightHandle, size, isRightSelected, canvasWidth, canvasHeight, viewport);
  drawWidthPointAnchor(gl, program, buffer, anchor, size, isPointSelected, canvasWidth, canvasHeight, viewport);
};
