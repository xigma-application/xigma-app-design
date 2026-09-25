import { PDFName, PDFPage } from 'pdf-lib';

// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode, TStarNode } from 'types/design/types';

// utils
import { drawPdfStarShape } from './drawPdfStarShape';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';

export const drawPdfSimpleShape = (
  page: PDFPage,
  node: TStarNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => drawPdfStarShape(page, node, getEffectiveOpacity(node, nodesById), bounds, graphicsStates);
