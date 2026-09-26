// types
import { TVectorNode } from 'types/design/types';
import { TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { flattenVectorSegments } from '../vectorNetwork/flattenVectorSegments';
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { getThickVectorPathVertices } from '../vectorNetwork/getThickVectorPathVertices/getThickVectorPathVertices';
import { getVectorNodeBounds } from '../vectorNetwork/getVectorNodeBounds';
import { getVectorStrokeShapeFaces } from '../vector/stroke/getVectorStrokeShapeFaces';
import { getVisibleSolidStrokePaints } from '../vector/stroke/getVisibleSolidStrokePaints';
import { getVectorSnapshotEffectLayers } from '../vector/effects/getVectorSnapshotEffectLayers';
import { groupFilledFacesForRendering } from './groupFilledFacesForRendering';

const getFacesByPaint = (
  renderedNode: TVectorNode,
  strokeFaces: TVectorNodeRotateSnapshot['facesByPaint'],
): TVectorNodeRotateSnapshot['facesByPaint'] => [
  ...groupFilledFacesForRendering(renderedNode).map(({ paint, polygons }) => ({ paint, points: polygons })),
  ...strokeFaces,
];

const getStrokeVertices = (renderedNode: TVectorNode, strokeFaces: TVectorNodeRotateSnapshot['facesByPaint']): number[] =>
  renderedNode.widthProfile || strokeFaces.length > 0
    ? []
    : getThickVectorPathVertices(flattenVectorSegments(renderedNode), renderedNode.strokeWidth / 2);

export const captureVectorNodeRotateSnapshot = (node: TVectorNode): TVectorNodeRotateSnapshot => {
  const renderedNode = getRenderedVectorNode(node);
  const strokeFaces = getVectorStrokeShapeFaces(renderedNode);
  const facesByPaint = getFacesByPaint(renderedNode, strokeFaces);
  const strokeVertices = getStrokeVertices(renderedNode, strokeFaces);
  const bounds = getVectorNodeBounds(node);
  const pivot = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

  return {
    deltaDegrees: 0,
    effectLayers: getVectorSnapshotEffectLayers(renderedNode),
    facesByPaint,
    pivot,
    strokeVertices,
    strokes: getVisibleSolidStrokePaints(renderedNode.strokes),
  };
};
