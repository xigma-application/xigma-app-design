// types
import { NodeType } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getExportContentBounds } from 'utils/canvas/getExportContentBounds';
import { getPageExportBounds } from 'utils/canvas/getPageExportBounds';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';

// others
import { EMPTY_EXPORT_BOUNDS } from '../constants';

export const getExportBounds = (
  nodeId: string | null,
  nodesById: Record<string, TSceneNode>,
  rootOrder: string[],
): { contentBounds: TDraftRect; fullBounds: TDraftRect } => {
  const node = nodeId === null ? undefined : nodesById[nodeId];

  switch (true) {
    case nodeId === null: {
      const pageBounds = getPageExportBounds(rootOrder, nodesById) ?? EMPTY_EXPORT_BOUNDS;
      return { contentBounds: pageBounds, fullBounds: pageBounds };
    }
    case node?.type === NodeType.slice: {
      const sliceBounds = getRotatedNodeBounds(node);
      return { contentBounds: sliceBounds, fullBounds: sliceBounds };
    }
    default:
      return {
        contentBounds: getExportContentBounds(nodeId, nodesById),
        fullBounds: node ? getRotatedNodeBounds(node) : EMPTY_EXPORT_BOUNDS,
      };
  }
};
