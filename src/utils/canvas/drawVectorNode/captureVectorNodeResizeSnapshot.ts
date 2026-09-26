// types
import { TVectorNode } from 'types/design/types';
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { flattenVectorSegments } from '../vectorNetwork/flattenVectorSegments';
import { getVectorNodeBounds } from '../vectorNetwork/getVectorNodeBounds';
import { getVectorStrokeShapeFaces } from '../vector/stroke/getVectorStrokeShapeFaces';
import { getVisibleSolidStrokePaints } from '../vector/stroke/getVisibleSolidStrokePaints';
import { groupFilledFacesForRendering } from './groupFilledFacesForRendering';

const getFacesByPaint = (
  node: TVectorNode,
  strokeFaces: TVectorNodeResizeSnapshot['facesByPaint'],
): TVectorNodeResizeSnapshot['facesByPaint'] => [
  ...groupFilledFacesForRendering(node).map(({ paint, polygons }) => ({ paint, points: polygons })),
  ...strokeFaces,
];

const getFlattenedSegments = (
  node: TVectorNode,
  strokeFaces: TVectorNodeResizeSnapshot['facesByPaint'],
): TVectorNodeResizeSnapshot['flattenedSegments'] => (strokeFaces.length > 0 ? [] : flattenVectorSegments(node));

export const captureVectorNodeResizeSnapshot = (node: TVectorNode, rotation: number): TVectorNodeResizeSnapshot => {
  const strokeFaces = getVectorStrokeShapeFaces(node);
  const facesByPaint = getFacesByPaint(node, strokeFaces);
  const bounds = getVectorNodeBounds(node);
  const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

  return {
    anchorX: null,
    anchorY: null,
    facesByPaint,
    flattenedSegments: getFlattenedSegments(node, strokeFaces),
    pivot: center,
    rotation,
    scaleX: 1,
    scaleY: 1,
    scaledCenter: center,
    strokeWidth: node.strokeWidth,
    strokes: getVisibleSolidStrokePaints(node.strokes),
  };
};
