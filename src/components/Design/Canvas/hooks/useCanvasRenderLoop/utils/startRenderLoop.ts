import { RefObject } from 'react';

// types
import { TCornerRadiusDragState, TPolygonCornerRadiusDragState } from '../../useSelectionTool/types';
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
): void => {
  const isDraggingCornerRadius = Boolean(cornerRadiusDragRef?.current) || Boolean(polygonCornerRadiusDragRef?.current);

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
    ),
  );

  return (): void => cancelAnimationFrame(frameIdRef.current);
};
