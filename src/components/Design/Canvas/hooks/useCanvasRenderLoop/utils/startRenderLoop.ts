import { RefObject } from 'react';

// types
import {
  TCornerRadiusDragState,
  TEllipseArcDragState,
  TEllipseArcRatioDragState,
  TEllipseArcRotateDragState,
  TPolygonCornerRadiusDragState,
  TStarCornerRadiusDragState,
} from '../../useSelectionTool/types';
import { TDraftRect } from 'types/canvas';
import { TDraftEntity } from 'types/design/types';
import { TImageRenderContext } from '../types';

// utils
import { drawScene } from './drawScene/drawScene';

type TFrameIdRef = { current: number };

const tick = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  canvas: HTMLCanvasElement,
  frameIdRef: TFrameIdRef,
  draftRef?: RefObject<TDraftEntity | null>,
  marqueeRef?: RefObject<TDraftRect | null>,
  hoverRef?: RefObject<string | null>,
  sliceRef?: RefObject<(TDraftRect & { rotation: number }) | null>,
  cornerRadiusDragRef?: RefObject<TCornerRadiusDragState | null>,
  polygonCornerRadiusDragRef?: RefObject<TPolygonCornerRadiusDragState | null>,
  starCornerRadiusDragRef?: RefObject<TStarCornerRadiusDragState | null>,
  ellipseArcDragRef?: RefObject<TEllipseArcDragState | null>,
  ellipseArcRotateDragRef?: RefObject<TEllipseArcRotateDragState | null>,
  ellipseArcRatioDragRef?: RefObject<TEllipseArcRatioDragState | null>,
): void => {
  const isDraggingCornerRadius =
    Boolean(cornerRadiusDragRef?.current?.hasMoved) ||
    Boolean(polygonCornerRadiusDragRef?.current?.hasMoved) ||
    Boolean(starCornerRadiusDragRef?.current?.hasMoved);

  drawScene(
    gl,
    program,
    buffer,
    imageContext,
    canvas,
    draftRef?.current,
    marqueeRef?.current,
    hoverRef?.current,
    sliceRef?.current,
    isDraggingCornerRadius,
    ellipseArcDragRef?.current?.draggedHandlePosition ?? null,
    ellipseArcRotateDragRef?.current?.draggedHandlePosition ?? null,
    ellipseArcRatioDragRef?.current?.draggedHandlePosition ?? null,
  );
  frameIdRef.current = requestAnimationFrame(() =>
    tick(
      gl,
      program,
      buffer,
      imageContext,
      canvas,
      frameIdRef,
      draftRef,
      marqueeRef,
      hoverRef,
      sliceRef,
      cornerRadiusDragRef,
      polygonCornerRadiusDragRef,
      starCornerRadiusDragRef,
      ellipseArcDragRef,
      ellipseArcRotateDragRef,
      ellipseArcRatioDragRef,
    ),
  );
};

export const startRenderLoop = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  canvas: HTMLCanvasElement,
  draftRef?: RefObject<TDraftEntity | null>,
  marqueeRef?: RefObject<TDraftRect | null>,
  hoverRef?: RefObject<string | null>,
  sliceRef?: RefObject<(TDraftRect & { rotation: number }) | null>,
  cornerRadiusDragRef?: RefObject<TCornerRadiusDragState | null>,
  polygonCornerRadiusDragRef?: RefObject<TPolygonCornerRadiusDragState | null>,
  starCornerRadiusDragRef?: RefObject<TStarCornerRadiusDragState | null>,
  ellipseArcDragRef?: RefObject<TEllipseArcDragState | null>,
  ellipseArcRotateDragRef?: RefObject<TEllipseArcRotateDragState | null>,
  ellipseArcRatioDragRef?: RefObject<TEllipseArcRatioDragState | null>,
): (() => void) => {
  const frameIdRef: TFrameIdRef = { current: 0 };

  frameIdRef.current = requestAnimationFrame(() =>
    tick(
      gl,
      program,
      buffer,
      imageContext,
      canvas,
      frameIdRef,
      draftRef,
      marqueeRef,
      hoverRef,
      sliceRef,
      cornerRadiusDragRef,
      polygonCornerRadiusDragRef,
      starCornerRadiusDragRef,
      ellipseArcDragRef,
      ellipseArcRotateDragRef,
      ellipseArcRatioDragRef,
    ),
  );

  return (): void => cancelAnimationFrame(frameIdRef.current);
};
