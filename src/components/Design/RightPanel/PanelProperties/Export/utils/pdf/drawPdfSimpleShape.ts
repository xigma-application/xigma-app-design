import { PDFName, PDFPage } from 'pdf-lib';

// types
import { NodeType } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TPolygonNode, TSceneNode, TStarNode } from 'types/design/types';

// utils
import { drawPdfPolygonShape } from './drawPdfPolygonShape';
import { drawPdfStarShape } from './drawPdfStarShape';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';

export const drawPdfSimpleShape = (
  page: PDFPage,
  node: TPolygonNode | TStarNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  const opacity = getEffectiveOpacity(node, nodesById);

  switch (node.type) {
    case NodeType.polygon:
      drawPdfPolygonShape(page, node, opacity, bounds, graphicsStates);
      break;
    default:
      drawPdfStarShape(page, node, opacity, bounds, graphicsStates);
  }
};
