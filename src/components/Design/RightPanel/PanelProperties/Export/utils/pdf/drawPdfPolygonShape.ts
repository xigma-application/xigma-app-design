import { PDFName, PDFPage } from 'pdf-lib';

// types
import { TDraftRect } from 'types/canvas';
import { TPolygonNode, TSceneNode } from 'types/design/types';
import { TPaint } from 'types/design/paint/types';

// utils
import { drawPdfPaintPolygons } from './drawPdfPaintPolygons';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { getPolygonStrokeShapes } from 'utils/canvas/shapes/getPolygonStrokeShapes';
import { getPolygonWorldPoints } from 'utils/canvas/shapes/getPolygonWorldPoints';

export const drawPdfPolygonShape = (
  page: PDFPage,
  node: TPolygonNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  const opacity = getEffectiveOpacity(node, nodesById);

  drawPdfPaintPolygons(page, node.fills, [getPolygonWorldPoints(node)], opacity, bounds, graphicsStates);

  ((node.strokes?.length ? getPolygonStrokeShapes(node) : null) ?? []).forEach(({ polygons }) => {
    drawPdfPaintPolygons(page, node.strokes as TPaint[], polygons, opacity, bounds, graphicsStates);
  });
};
