// types
import { TVectorNode } from 'types/design/types';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { bakeVectorNodeRotation } from 'components/Design/Canvas/utils/bakeVectorNodeRotation';
import { flattenVectorSegments } from '../vectorNetwork/flattenVectorSegments';
import { getThickVectorPathVertices } from '../vectorNetwork/getThickVectorPathVertices/getThickVectorPathVertices';
import { groupFilledFacesForRendering } from './groupFilledFacesForRendering';

export const captureVectorNodeDragSnapshot = (node: TVectorNode): TVectorNodeDragSnapshot => {
  const renderedNode: TVectorNode = node.rotation ? { ...node, ...bakeVectorNodeRotation(node) } : node;
  const facesByPaint = groupFilledFacesForRendering(renderedNode).map(({ paint, polygons }) => ({ paint, points: polygons }));
  const strokeVertices = renderedNode.widthProfile
    ? []
    : getThickVectorPathVertices(flattenVectorSegments(renderedNode), renderedNode.strokeWidth / 2);

  return { deltaX: 0, deltaY: 0, facesByPaint, strokeColor: renderedNode.strokeColor, strokeVertices };
};
