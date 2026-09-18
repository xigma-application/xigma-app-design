// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TPathOutlineStyle } from '../getPathOutlineStyles';

// utils
import { resolveFrozenPatternSourceTile } from '../resolveFrozenPatternSourceTile';
import { resolvePatternSourceTile, TResolvedPatternSourceTile } from '../resolvePatternSourceTile';

export const resolvePatternPaintTile = (
  context: TDrawSceneContext,
  paint: TFrameNode['fills'][number],
  nodesById: Record<string, TSceneNode>,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  editingPathId: string | null | undefined,
  patternSourceDepth: number,
): TResolvedPatternSourceTile | null => {
  if (paint.type === 'pattern') {
    if (paint.sourceNodeId) {
      return resolvePatternSourceTile(context, paint.sourceNodeId, nodesById, pathOutlineStyles, refs, editingPathId, patternSourceDepth);
    }

    if (paint.frozenSourceSnapshot) {
      return resolveFrozenPatternSourceTile(
        context,
        paint.frozenSourceSnapshot,
        pathOutlineStyles,
        refs,
        editingPathId,
        patternSourceDepth,
      );
    }
  }

  return null;
};
