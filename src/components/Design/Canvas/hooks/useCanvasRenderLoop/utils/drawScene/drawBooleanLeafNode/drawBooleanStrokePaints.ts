// types
import { TBooleanNode, TSceneNode } from 'types/design/types';
import { TBooleanShape } from './types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TPathOutlineStyle } from '../getPathOutlineStyles';

// utils
import { getBooleanPaintBox } from './getBooleanPaintBox';
import { drawBoxPaints } from '../drawBoxLeafNode/drawBoxPaints';
import { getBooleanStrokeModePolygons } from './getBooleanStrokeModePolygons';
import { getBooleanStrokeRings } from './getBooleanStrokeRings';

export const drawBooleanStrokePaints = (
  context: TDrawSceneContext,
  node: TBooleanNode,
  shape: TBooleanShape,
  opacity: number,
  nodesById: Record<string, TSceneNode>,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  editingPathId: string | null | undefined,
  patternSourceDepth: number,
): void => {
  const strokes = node.strokes ?? [];
  const strokeWidth = node.strokeWidth ?? 1;

  if (strokes.length > 0 && strokeWidth > 0) {
    const modePolygons = getBooleanStrokeModePolygons(node, shape, strokeWidth);

    if (modePolygons) {
      drawBoxPaints(
        context,
        getBooleanPaintBox(node, shape),
        strokes,
        modePolygons,
        opacity,
        nodesById,
        pathOutlineStyles,
        refs,
        editingPathId,
        patternSourceDepth,
      );
    } else {
      getBooleanStrokeRings(shape, strokeWidth).forEach((ring) => {
        drawBoxPaints(
          context,
          getBooleanPaintBox(node, shape),
          strokes,
          ring,
          opacity,
          nodesById,
          pathOutlineStyles,
          refs,
          editingPathId,
          patternSourceDepth,
          null,
          'nonZero',
        );
      });
    }
  }
};
