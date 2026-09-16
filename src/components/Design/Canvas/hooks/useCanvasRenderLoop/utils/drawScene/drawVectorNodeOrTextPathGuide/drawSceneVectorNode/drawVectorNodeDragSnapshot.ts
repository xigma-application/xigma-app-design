// types
import { TDrawSceneContext } from '../../types';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorFillPaints } from 'utils/canvas/drawVectorNode/drawVectorFillPaints';
import { drawVectorThickStrokeVertices } from 'utils/canvas/drawVectorNode/drawVectorThickStrokeVertices';

export const drawVectorNodeDragSnapshot = (context: TDrawSceneContext, snapshot: TVectorNodeDragSnapshot): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, viewport } = context;
  const {
    cache: imageTextureCache,
    dragGradientProgram,
    dragSnapshotFaceBufferCache,
    dragSnapshotProgram,
    dragSnapshotStrokeBufferCache,
    imagePaintTextureSizeCache,
    isAlphaWriteEnabled,
    patternTileProgram,
    program: imageProgram,
  } = imageContext;
  const translateLocation = gl.getUniformLocation(dragSnapshotProgram, 'u_translate');
  const gradientTranslateLocation = gl.getUniformLocation(dragGradientProgram, 'u_translate');

  gl.useProgram(dragSnapshotProgram);
  gl.uniform2f(translateLocation, snapshot.deltaX, snapshot.deltaY);
  gl.useProgram(dragGradientProgram);
  gl.uniform2f(gradientTranslateLocation, snapshot.deltaX, snapshot.deltaY);

  snapshot.facesByPaint.forEach(({ paint, points }) => {
    drawVectorFillPaints(
      gl,
      dragSnapshotProgram,
      dragGradientProgram,
      patternTileProgram,
      imageProgram,
      imageTextureCache,
      imagePaintTextureSizeCache,
      buffer,
      dragSnapshotFaceBufferCache,
      null,
      points,
      paint,
      [],
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
