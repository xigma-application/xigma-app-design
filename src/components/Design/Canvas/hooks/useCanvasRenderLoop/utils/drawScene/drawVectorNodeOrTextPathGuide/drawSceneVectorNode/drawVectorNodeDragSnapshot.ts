// types
import { TDrawSceneContext } from '../../types';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorFillPaints } from 'utils/canvas/drawVectorNode/drawVectorFillPaints';
import { drawVectorThickStrokeVertices } from 'utils/canvas/drawVectorNode/drawVectorThickStrokeVertices';

export const drawVectorNodeDragSnapshot = (context: TDrawSceneContext, snapshot: TVectorNodeDragSnapshot): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, viewport } = context;
  const { dragSnapshotFaceBufferCache, dragSnapshotProgram, dragSnapshotStrokeBufferCache, isAlphaWriteEnabled } = imageContext;
  const translateLocation = gl.getUniformLocation(dragSnapshotProgram, 'u_translate');

  gl.useProgram(dragSnapshotProgram);
  gl.uniform2f(translateLocation, snapshot.deltaX, snapshot.deltaY);
  snapshot.facesByPaint.forEach(({ paint, points }) => {
    drawVectorFillPaints(
      gl,
      dragSnapshotProgram,
      buffer,
      dragSnapshotFaceBufferCache,
      null,
      points,
      paint,
      canvasWidth,
      canvasHeight,
      viewport,
      isAlphaWriteEnabled,
    );
  });

  drawVectorThickStrokeVertices(
    gl,
    dragSnapshotProgram,
    buffer,
    dragSnapshotStrokeBufferCache,
    snapshot.strokeVertices,
    snapshot.strokeColor,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
