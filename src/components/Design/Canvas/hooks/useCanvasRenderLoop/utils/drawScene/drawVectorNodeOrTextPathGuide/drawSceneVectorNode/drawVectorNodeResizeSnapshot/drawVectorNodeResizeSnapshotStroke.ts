// types
import { TDrawSceneContext } from '../../../types';
import { TFlattenedVectorSegment } from 'utils/canvas/vectorNetwork/flattenVectorSegments';
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorThickStrokeVertices } from 'utils/canvas/drawVectorNode/drawVectorThickStrokeVertices';
import { getThickVectorPathVertices } from 'utils/canvas/vectorNetwork/getThickVectorPathVertices/getThickVectorPathVertices';
import { scalePoint } from './scalePoint';

const scaleFlattenedSegments = (segments: TFlattenedVectorSegment[], snapshot: TVectorNodeResizeSnapshot): TFlattenedVectorSegment[] =>
  segments.map((segment) => ({ ...segment, points: segment.points.map((point) => scalePoint(point, snapshot)) }));

export const drawVectorNodeResizeSnapshotStroke = (context: TDrawSceneContext, snapshot: TVectorNodeResizeSnapshot): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const scaledSegments = scaleFlattenedSegments(snapshot.flattenedSegments, snapshot);
  const strokeVertices = getThickVectorPathVertices(scaledSegments, snapshot.strokeWidth / 2);

  drawVectorThickStrokeVertices(gl, program, buffer, null, strokeVertices, snapshot.strokeColor, canvasWidth, canvasHeight, viewport);
};
