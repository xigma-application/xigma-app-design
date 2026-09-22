// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getExportContentBounds } from './getExportContentBounds';
import { unionRects } from './unionRects';

export const getPageExportBounds = (rootOrder: string[], nodesById: Record<string, TSceneNode>): TDraftRect | null =>
  rootOrder.reduce<TDraftRect | null>((accumulated, id) => {
    const node = nodesById[id];

    if (node && !node.hidden) {
      return unionRects(accumulated, getExportContentBounds(id, nodesById));
    }

    return accumulated;
  }, null);
