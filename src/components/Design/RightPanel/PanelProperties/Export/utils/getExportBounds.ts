// types
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
  if (nodeId === null) {
    const pageBounds = getPageExportBounds(rootOrder, nodesById) ?? EMPTY_EXPORT_BOUNDS;
    return { contentBounds: pageBounds, fullBounds: pageBounds };
  }

  const node = nodesById[nodeId];

  return {
    contentBounds: getExportContentBounds(nodeId, nodesById),
    fullBounds: node ? getRotatedNodeBounds(node) : EMPTY_EXPORT_BOUNDS,
  };
};
