import { PDFName, PDFPage } from 'pdf-lib';

// types
import { TDraftRect } from 'types/canvas';
import { TLineNode, TSceneNode } from 'types/design/types';

// utils
import { drawPdfPolygons } from './drawPdfPolygons';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { getLineStrokeShape } from 'utils/canvas/line/stroke/getLineStrokeShape';
import { getLineVectorStroke } from '../getLineVectorStroke';

export const drawPdfLineShape = (
  page: PDFPage,
  node: TLineNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  const shape = getLineStrokeShape(node);
  const stroke = getLineVectorStroke(node);

  if (shape) {
    if (stroke) {
      drawPdfPolygons(
        page,
        shape.polygons,
        stroke.color,
        (getEffectiveOpacity(node, nodesById) * stroke.opacity) / 100,
        bounds,
        graphicsStates,
        shape.fillRule,
      );
    }
  }
};
