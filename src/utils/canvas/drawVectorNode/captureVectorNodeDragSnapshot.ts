// types
import { TVectorNode } from 'types/design/types';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { flattenVectorSegments } from '../vectorNetwork/flattenVectorSegments';
import { getVectorFillRotation } from './getVectorFillRotation';
import { getVectorNodeBounds } from '../vectorNetwork/getVectorNodeBounds';
import { getDrawnVectorNode } from '../render/getDrawnVectorNode';
import { getThickVectorPathVertices } from '../vectorNetwork/getThickVectorPathVertices/getThickVectorPathVertices';
import { getVectorStrokeShapeFaces } from '../vector/stroke/getVectorStrokeShapeFaces';
import { getVisibleSolidStrokePaints } from '../vector/stroke/getVisibleSolidStrokePaints';
import { getVectorSnapshotEffectLayers } from '../vector/effects/getVectorSnapshotEffectLayers';
import { groupFilledFacesForRendering } from './groupFilledFacesForRendering';

const getFacesByPaint = (
  renderedNode: TVectorNode,
  strokeFaces: TVectorNodeDragSnapshot['facesByPaint'],
): TVectorNodeDragSnapshot['facesByPaint'] => [
  ...groupFilledFacesForRendering(renderedNode).map(({ paint, polygons }) => ({ paint, points: polygons })),
  ...strokeFaces,
];

const getStrokeVertices = (renderedNode: TVectorNode, strokeFaces: TVectorNodeDragSnapshot['facesByPaint']): number[] =>
  renderedNode.widthProfile || strokeFaces.length > 0
    ? []
    : getThickVectorPathVertices(flattenVectorSegments(renderedNode), renderedNode.strokeWidth / 2);

export const captureVectorNodeDragSnapshot = (node: TVectorNode): TVectorNodeDragSnapshot => {
  const renderedNode = getDrawnVectorNode(node);
  const strokeFaces = getVectorStrokeShapeFaces(renderedNode);
  const facesByPaint = getFacesByPaint(renderedNode, strokeFaces);
  const strokeVertices = getStrokeVertices(renderedNode, strokeFaces);

  return {
    deltaX: 0,
    deltaY: 0,
    effectLayers: getVectorSnapshotEffectLayers(renderedNode),
    facesByPaint,
    fillBounds: getVectorNodeBounds(renderedNode),
    fillRotation: getVectorFillRotation(node),
    strokeVertices,
    strokes: getVisibleSolidStrokePaints(renderedNode.strokes),
  };
};
