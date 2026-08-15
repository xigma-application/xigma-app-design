import { RefObject } from 'react';

// types
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
): void => {
  drawScene(gl, program, buffer, imageContext, canvas, draftRef?.current, marqueeRef?.current, hoverRef?.current, sliceRef?.current);
  frameIdRef.current = requestAnimationFrame(() =>
    tick(gl, program, buffer, imageContext, canvas, frameIdRef, draftRef, marqueeRef, hoverRef, sliceRef),
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
): (() => void) => {
  const frameIdRef: TFrameIdRef = { current: 0 };

  frameIdRef.current = requestAnimationFrame(() =>
    tick(gl, program, buffer, imageContext, canvas, frameIdRef, draftRef, marqueeRef, hoverRef, sliceRef),
  );

  return (): void => cancelAnimationFrame(frameIdRef.current);
};
