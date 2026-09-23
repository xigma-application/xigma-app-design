// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect } from 'types/canvas';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { collectPatternSourceSubtree } from './collectPatternSourceSubtree';
import { getPageExportBounds } from 'utils/canvas/getPageExportBounds';
import { getRenderOrderedNodes } from 'store/design/utils/getRenderOrderedNodes';
import { getRotatedNodeBounds } from '../../../../utils/getRotatedNodeBounds';
import { renderNodeAtScale } from './renderExport/renderNodeAtScale';

export type TRenderedPatternThumbnailPixels = { height: number; pixels: Uint8Array; width: number };

const getThumbnailSource = (
  sourceNodeId: string | null,
  nodesById: Record<string, TSceneNode>,
  rootOrder: string[],
): { bounds: TDraftRect; nodes: TSceneNode[] } | null => {
  switch (sourceNodeId) {
    case null: {
      const bounds = getPageExportBounds(rootOrder, nodesById);

      return bounds ? { bounds, nodes: getRenderOrderedNodes(rootOrder, nodesById).filter((node) => !node.hidden) } : null;
    }
    default: {
      const sourceNode = nodesById[sourceNodeId];

      return sourceNode && !sourceNode.hidden
        ? { bounds: getRotatedNodeBounds(sourceNode), nodes: collectPatternSourceSubtree(sourceNodeId, nodesById) }
        : null;
    }
  }
};

export const renderPatternSourceThumbnail = (
  context: TDrawSceneContext,
  sourceNodeId: string | null,
  nodesById: Record<string, TSceneNode>,
  refs: TCanvasRefs,
  size: number,
  rootOrder: string[],
  backgroundColor?: readonly [number, number, number, number],
): TRenderedPatternThumbnailPixels | null => {
  const source = getThumbnailSource(sourceNodeId, nodesById, rootOrder);

  if (source && source.bounds.width > 0 && source.bounds.height > 0) {
    const scale = Math.min(size / source.bounds.width, size / source.bounds.height);

    return renderNodeAtScale(
      context,
      sourceNodeId,
      source.nodes,
      nodesById,
      refs,
      scale,
      {
        height: source.bounds.height,
        width: source.bounds.width,
        x: source.bounds.x,
        y: source.bounds.y,
      },
      sourceNodeId === null ? backgroundColor : undefined,
    );
  }

  return null;
};
