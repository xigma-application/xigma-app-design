// others
import { PENCIL_CAP_RADIUS_PX } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { drawSvgPolygons } from './drawSvgPolygons';
import { getEllipsePoints } from 'utils/canvas/shapes/getEllipsePoints';
import { getOpenVectorEndpoints } from 'utils/canvas/vectorNetwork/getOpenVectorEndpoints';

const CAP_SEGMENTS = 16;

export const drawSvgVectorRoundedCaps = (elements: string[], renderedNode: TVectorNode, opacity: number, bounds: TDraftRect): void => {
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
      drawSvgPolygons(elements, polygons, renderedNode.strokeColor, opacity, bounds);
    }
  }
};
