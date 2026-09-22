import { PDFName, PDFPage } from 'pdf-lib';

// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { drawPdfVectorFills } from './drawPdfVectorFills';
import { drawPdfVectorRoundedCaps } from './drawPdfVectorRoundedCaps';
import { drawPdfVectorStroke } from './drawPdfVectorStroke';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';

export const drawPdfVectorNodeShape = (
  page: PDFPage,
  node: TVectorNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  const renderedNode = getRenderedVectorNode(node);
  const opacity = getEffectiveOpacity(node, nodesById);

  drawPdfVectorFills(page, renderedNode, opacity, bounds, graphicsStates);
  drawPdfVectorStroke(page, renderedNode, opacity, bounds, graphicsStates);
  drawPdfVectorRoundedCaps(page, renderedNode, opacity, bounds, graphicsStates);
};
