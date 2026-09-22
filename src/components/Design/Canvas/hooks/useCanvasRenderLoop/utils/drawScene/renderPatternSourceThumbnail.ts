// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { collectPatternSourceSubtree } from './collectPatternSourceSubtree';
import { getRotatedNodeBounds } from '../../../../utils/getRotatedNodeBounds';
import { renderNodeAtScale } from './renderExport/renderNodeAtScale';

export type TRenderedPatternThumbnailPixels = { height: number; pixels: Uint8Array; width: number };

export const renderPatternSourceThumbnail = (
  context: TDrawSceneContext,
  sourceNodeId: string,
  nodesById: Record<string, TSceneNode>,
  refs: TCanvasRefs,
  size: number,
): TRenderedPatternThumbnailPixels | null => {
  const sourceNode = nodesById[sourceNodeId];

  if (sourceNode && !sourceNode.hidden) {
    const bounds = getRotatedNodeBounds(sourceNode);

    if (bounds.width > 0 && bounds.height > 0) {
      const scale = Math.min(size / bounds.width, size / bounds.height);
      return renderNodeAtScale(context, sourceNodeId, collectPatternSourceSubtree(sourceNodeId, nodesById), nodesById, refs, scale);
    }
  }

  return null;
};
