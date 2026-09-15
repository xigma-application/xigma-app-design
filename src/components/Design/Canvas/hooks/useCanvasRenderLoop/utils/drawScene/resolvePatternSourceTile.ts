// constant
import { MAX_PATTERN_SOURCE_RESOLUTION_DEPTH } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TPathOutlineStyle } from './getPathOutlineStyles';
import { TSceneNode } from 'types/design/types';

// utils
import { collectPatternSourceSubtree } from './collectPatternSourceSubtree';
import { getRotatedNodeBounds } from '../../../../utils/getRotatedNodeBounds';
import { renderNodeListToPatternSourceTile, TResolvedPatternSourceTile } from './renderNodeListToPatternSourceTile';

export type { TResolvedPatternSourceTile } from './renderNodeListToPatternSourceTile';

export const resolvePatternSourceTile = (
  context: TDrawSceneContext,
  sourceNodeId: string,
  nodesById: Record<string, TSceneNode>,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  editingPathId: string | null | undefined,
  patternSourceDepth: number,
): TResolvedPatternSourceTile | null => {
  if (patternSourceDepth < MAX_PATTERN_SOURCE_RESOLUTION_DEPTH) {
    const sourceNode = nodesById[sourceNodeId];

    if (sourceNode && !sourceNode.hidden) {
      const bounds = getRotatedNodeBounds(sourceNode);

      if (bounds.width > 0 && bounds.height > 0) {
        return renderNodeListToPatternSourceTile(
          context,
          collectPatternSourceSubtree(sourceNodeId, nodesById),
          nodesById,
          pathOutlineStyles,
          refs,
          editingPathId,
          patternSourceDepth,
          bounds,
        );
      }
    }
  }

  return null;
};
