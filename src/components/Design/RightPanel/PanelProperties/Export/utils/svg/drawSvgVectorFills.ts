// types
import { TDraftRect } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { drawSvgPaintPolygons } from './drawSvgPaintPolygons';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';

export const drawSvgVectorFills = (
  elements: string[],
  defs: string[],
  renderedNode: TVectorNode,
  opacity: number,
  bounds: TDraftRect,
): void => {
  const nodeBounds = getVectorNodeBounds(renderedNode);

  groupFilledFacesForRendering(renderedNode).forEach(({ paint, polygons }) => {
    drawSvgPaintPolygons(elements, defs, paint, polygons, opacity, bounds, nodeBounds);
  });
};
