// types
import { TDraftRect } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { drawSvgPaintPolygons } from './drawSvgPaintPolygons';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';

export const drawSvgVectorFills = async (
  elements: string[],
  defs: string[],
  renderedNode: TVectorNode,
  opacity: number,
  bounds: TDraftRect,
): Promise<void> => {
  const nodeBounds = getVectorNodeBounds(renderedNode);

  for (const { paint, polygons } of groupFilledFacesForRendering(renderedNode)) {
    await drawSvgPaintPolygons(elements, defs, paint, polygons, opacity, bounds, nodeBounds);
  }
};
