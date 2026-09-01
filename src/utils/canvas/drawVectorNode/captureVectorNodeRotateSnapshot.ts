// types
import { TVectorNode } from 'types/design/types';
import { TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { flattenVectorSegments } from '../vectorNetwork/flattenVectorSegments';
import { getRenderedVectorNode } from 'components/Design/Canvas/utils/getRenderedVectorNode';
import { getThickVectorPathVertices } from '../vectorNetwork/getThickVectorPathVertices/getThickVectorPathVertices';
import { getVectorNodeBounds } from '../vectorNetwork/getVectorNodeBounds';
import { groupFilledFacesForRendering } from './groupFilledFacesForRendering';

export const captureVectorNodeRotateSnapshot = (node: TVectorNode): TVectorNodeRotateSnapshot => {
  const renderedNode = getRenderedVectorNode(node);
  const facesByColor = groupFilledFacesForRendering(renderedNode).map(({ color, polygons }) => ({ color, points: polygons }));
  const strokeVertices = renderedNode.widthProfile
    ? []
    : getThickVectorPathVertices(flattenVectorSegments(renderedNode), renderedNode.strokeWidth / 2);
  const bounds = getVectorNodeBounds(node);
  const pivot = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

  return { deltaDegrees: 0, facesByColor, pivot, strokeColor: renderedNode.strokeColor, strokeVertices };
};
