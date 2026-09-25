// types
import { TBooleanNode, TSceneNode } from 'types/design/types';
import { TBooleanShape } from './types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TPathOutlineStyle } from '../getPathOutlineStyles';

// utils
import { drawBoxPaints } from '../drawBoxLeafNode/drawBoxPaints';
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
    getBooleanStrokeRings(shape, strokeWidth).forEach((ring) => {
      drawBoxPaints(
        context,
        { ...shape.bounds, rotation: 0 },
        strokes,
        ring,
        opacity,
        nodesById,
        pathOutlineStyles,
        refs,
        editingPathId,
        patternSourceDepth,
      );
    });
  }
};
