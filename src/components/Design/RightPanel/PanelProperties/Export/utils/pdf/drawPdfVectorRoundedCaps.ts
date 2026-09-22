import { PDFName, PDFPage } from 'pdf-lib';

// others
import { PENCIL_CAP_RADIUS_PX } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { drawPdfPolygons } from './drawPdfPolygons';
import { getEllipsePoints } from 'utils/canvas/shapes/getEllipsePoints';
import { getOpenVectorEndpoints } from 'utils/canvas/vectorNetwork/getOpenVectorEndpoints';

const CAP_SEGMENTS = 16;

export const drawPdfVectorRoundedCaps = (
  page: PDFPage,
  renderedNode: TVectorNode,
  opacity: number,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  if (renderedNode.capStyle === 'round') {
    const polygons = getOpenVectorEndpoints(renderedNode).map((vertexId) => {
      const vertex = renderedNode.vertices[vertexId];

      return getEllipsePoints(
        {
          height: PENCIL_CAP_RADIUS_PX * 2,
          width: PENCIL_CAP_RADIUS_PX * 2,
          x: vertex.x - PENCIL_CAP_RADIUS_PX,
          y: vertex.y - PENCIL_CAP_RADIUS_PX,
        },
        CAP_SEGMENTS,
      );
    });

    if (polygons.length > 0) {
      drawPdfPolygons(page, polygons, renderedNode.strokeColor, opacity, bounds, graphicsStates);
    }
  }
};
