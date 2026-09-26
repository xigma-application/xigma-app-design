// types
import { TDrawSceneContext } from '../../../types';
import { TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorThickStrokeVertices } from 'utils/canvas/drawVectorNode/drawVectorThickStrokeVertices';
import { rotateSnapshotPoint } from './rotateSnapshotPoint';

const rotateStrokeVertices = (vertices: number[], snapshot: TVectorNodeRotateSnapshot): number[] => {
  const rotatedVertices: number[] = [];

  for (let index = 0; index < vertices.length; index += 2) {
    const rotated = rotateSnapshotPoint({ x: vertices[index], y: vertices[index + 1] }, snapshot);
    rotatedVertices.push(rotated.x, rotated.y);
  }

  return rotatedVertices;
};

export const drawVectorNodeRotateSnapshotStroke = (context: TDrawSceneContext, snapshot: TVectorNodeRotateSnapshot, opacity = 1): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const rotatedStrokeVertices = rotateStrokeVertices(snapshot.strokeVertices, snapshot);

  drawVectorThickStrokeVertices(
    gl,
    program,
    buffer,
    null,
    rotatedStrokeVertices,
    snapshot.strokeColor,
    canvasWidth,
    canvasHeight,
    viewport,
    opacity,
  );
};
