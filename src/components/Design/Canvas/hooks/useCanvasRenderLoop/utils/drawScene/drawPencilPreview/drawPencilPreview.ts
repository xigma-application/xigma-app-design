// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';

// utils
import { drawRawPencilPreview } from './drawRawPencilPreview';
import { drawSmoothedPencilPreview } from './drawSmoothedPencilPreview';

export const drawPencilPreview = (context: TDrawSceneContext, refs: TCanvasRefs, canvasWidth: number, canvasHeight: number): void => {
  const { buffer, gl, program, viewport } = context;
  const previewPoints = refs.pencil.pencilPreviewPointsRef.current;
  const rawPreviewPoints = refs.pencil.pencilRawPreviewPointsRef.current;
  const showRawPreview = refs.pencil.pencilShowRawPreviewRef.current;

  if (showRawPreview) {
    drawRawPencilPreview(gl, program, buffer, rawPreviewPoints, canvasWidth, canvasHeight, viewport);
  } else {
    drawSmoothedPencilPreview(gl, program, buffer, previewPoints, canvasWidth, canvasHeight, viewport);
  }
};
