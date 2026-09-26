// types
import { TVectorNode } from 'types/design/types';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { bakeVectorNodeRotation } from 'components/Design/Canvas/utils/bakeVectorNodeRotation';
import { flattenVectorSegments } from '../vectorNetwork/flattenVectorSegments';
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
  const renderedNode: TVectorNode = node.rotation ? { ...node, ...bakeVectorNodeRotation(node) } : node;
  const strokeFaces = getVectorStrokeShapeFaces(renderedNode);
  const facesByPaint = getFacesByPaint(renderedNode, strokeFaces);
  const strokeVertices = getStrokeVertices(renderedNode, strokeFaces);

  return {
    deltaX: 0,
    deltaY: 0,
    effectLayers: getVectorSnapshotEffectLayers(renderedNode),
    facesByPaint,
    strokeVertices,
    strokes: getVisibleSolidStrokePaints(renderedNode.strokes),
  };
};
