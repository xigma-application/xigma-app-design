import { PDFName, PDFPage } from 'pdf-lib';

// types
import { TDraftRect } from 'types/canvas';
import { TEllipseNode, TSceneNode } from 'types/design/types';
import { TPaint } from 'types/design/paint/types';

// utils
import { drawPdfPaintPolygons } from './drawPdfPaintPolygons';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { getEllipseStrokeShapes } from 'utils/canvas/shapes/getEllipseStrokeShapes';
import { getEllipseWorldPoints } from 'utils/canvas/shapes/getEllipseWorldPoints';

export const drawPdfEllipseShape = (
  page: PDFPage,
  node: TEllipseNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  const opacity = getEffectiveOpacity(node, nodesById);

  drawPdfPaintPolygons(
    page,
    node.fills,
    [getEllipseWorldPoints(node, node.flipX ?? false, node.flipY ?? false, node.rotation)],
    opacity,
    bounds,
    graphicsStates,
  );

  ((node.strokes?.length ? getEllipseStrokeShapes(node) : null) ?? []).forEach(({ polygons }) => {
    drawPdfPaintPolygons(page, node.strokes as TPaint[], polygons, opacity, bounds, graphicsStates);
  });
};
