import { PDFName, PDFPage } from 'pdf-lib';

// types
import { TDraftRect } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { drawPdfPaintPolygons } from './drawPdfPaintPolygons';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';

export const drawPdfVectorFills = (
  page: PDFPage,
  renderedNode: TVectorNode,
  opacity: number,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  groupFilledFacesForRendering(renderedNode).forEach(({ paint, polygons }) => {
    drawPdfPaintPolygons(page, paint, polygons, opacity, bounds, graphicsStates);
  });
};
