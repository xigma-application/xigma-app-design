// types
import { TDrawSceneContext } from '../../types';
import { TPaint } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorFillGroup } from './drawVectorFillGroup';
import { getFaceGroupBlendMode } from './getFaceGroupBlendMode';
import { isColorPaint } from 'utils/design/paint/isColorPaint';
import { drawVectorFillPaints } from 'utils/canvas/drawVectorNode/drawVectorFillPaints';
import { drawVectorThickStrokeVertices } from 'utils/canvas/drawVectorNode/drawVectorThickStrokeVertices';

const isMovedOnCpu = (paint: TPaint[]): boolean => Boolean(getFaceGroupBlendMode(paint)) || !paint.every(isColorPaint);

const drawMovedDragFaces = (context: TDrawSceneContext, snapshot: TVectorNodeDragSnapshot, paint: TPaint[], points: TPoint[][]): void => {
  const { deltaX, deltaY, fillBounds, fillRotation } = snapshot;
  const movedPoints = points.map((face) => face.map((point) => ({ x: point.x + deltaX, y: point.y + deltaY })));
  const movedBounds = fillBounds ? { ...fillBounds, x: fillBounds.x + deltaX, y: fillBounds.y + deltaY } : null;
  const movedRotation = fillRotation && {
    center: { x: fillRotation.center.x + deltaX, y: fillRotation.center.y + deltaY },
    degrees: fillRotation.degrees,
    localBounds: { ...fillRotation.localBounds, x: fillRotation.localBounds.x + deltaX, y: fillRotation.localBounds.y + deltaY },
  };

  drawVectorFillGroup(context, null, movedBounds, movedPoints, paint, [], movedRotation);
};

export const drawVectorNodeDragSnapshot = (context: TDrawSceneContext, snapshot: TVectorNodeDragSnapshot, opacity = 1): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, imageFilterQuality, viewport } = context;
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
    if (isMovedOnCpu(paint)) {
      drawMovedDragFaces(context, snapshot, paint, points);
    } else {
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
        snapshot.fillBounds ?? null,
        points,
        paint,
        [],
        canvasWidth,
        canvasHeight,
        viewport,
        isAlphaWriteEnabled,
        imageFilterQuality,
      );
    }
  });

  snapshot.strokes.forEach((paint) =>
    drawVectorThickStrokeVertices(
      gl,
      dragSnapshotProgram,
      buffer,
      dragSnapshotStrokeBufferCache,
      snapshot.strokeVertices,
      paint.color,
      canvasWidth,
      canvasHeight,
      viewport,
      (paint.opacity / 100) * opacity,
    ),
  );
};
