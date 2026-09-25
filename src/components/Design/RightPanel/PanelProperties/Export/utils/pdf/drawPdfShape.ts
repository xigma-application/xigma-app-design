import { PDFName, PDFPage } from 'pdf-lib';

// types
import { NodeType } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TPdfShapeNode } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawPdfBoxShape } from './drawPdfBoxShape';
import { drawPdfEllipseShape } from './drawPdfEllipseShape';
import { drawPdfLineShape } from './drawPdfLineShape';
import { drawPdfPolygonShape } from './drawPdfPolygonShape';
import { drawPdfVectorNodeShape } from './drawPdfVectorNodeShape';

export const drawPdfShape = (
  page: PDFPage,
  node: TPdfShapeNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  switch (node.type) {
    case NodeType.frame:
    case NodeType.rectangle:
      drawPdfBoxShape(page, node, nodesById, bounds, graphicsStates);
      break;
    case NodeType.ellipse:
      drawPdfEllipseShape(page, node, nodesById, bounds, graphicsStates);
      break;
    case NodeType.polygon:
    case NodeType.star:
      drawPdfPolygonShape(page, node, nodesById, bounds, graphicsStates);
      break;
    case NodeType.line:
      drawPdfLineShape(page, node, nodesById, bounds, graphicsStates);
      break;
    default:
      drawPdfVectorNodeShape(page, node, nodesById, bounds, graphicsStates);
  }
};
