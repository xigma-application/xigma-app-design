import { PDFName, PDFPage } from 'pdf-lib';

// types
import { NodeType } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TPdfShapeNode } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawPdfBoxShape } from './drawPdfBoxShape';
import { drawPdfSimpleShape } from './drawPdfSimpleShape';

export const drawPdfShape = (
  page: PDFPage,
  node: TPdfShapeNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  if (node.type === NodeType.frame || node.type === NodeType.rectangle) {
    drawPdfBoxShape(page, node, nodesById, bounds, graphicsStates);
  } else {
    drawPdfSimpleShape(page, node, nodesById, bounds, graphicsStates);
  }
};
