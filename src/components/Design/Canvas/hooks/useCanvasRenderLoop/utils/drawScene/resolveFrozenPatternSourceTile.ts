// constant
import { MAX_PATTERN_SOURCE_RESOLUTION_DEPTH } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TPathOutlineStyle } from './getPathOutlineStyles';
import { TSceneNode } from 'types/design/types';

// utils
import { getRotatedNodeBounds } from '../../../../utils/getRotatedNodeBounds';
import { renderNodeListToPatternSourceTile, TResolvedPatternSourceTile } from './renderNodeListToPatternSourceTile';

export const resolveFrozenPatternSourceTile = (
  context: TDrawSceneContext,
  snapshot: TSceneNode[],
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  editingPathId: string | null | undefined,
  patternSourceDepth: number,
): TResolvedPatternSourceTile | null => {
  const [root] = snapshot;

  if (patternSourceDepth < MAX_PATTERN_SOURCE_RESOLUTION_DEPTH && root && !root.hidden) {
    const bounds = getRotatedNodeBounds(root);

    if (bounds.width > 0 && bounds.height > 0) {
      const nodesById = Object.fromEntries(snapshot.map((node) => [node.id, node]));
      return renderNodeListToPatternSourceTile(
        context,
        snapshot,
        nodesById,
        pathOutlineStyles,
        refs,
        editingPathId,
        patternSourceDepth,
        bounds,
      );
    }
  }

  return null;
};
