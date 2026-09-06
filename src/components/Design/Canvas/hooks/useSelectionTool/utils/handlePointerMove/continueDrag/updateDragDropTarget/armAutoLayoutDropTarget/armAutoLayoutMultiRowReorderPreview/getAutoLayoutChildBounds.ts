// store
import { getRotatedNodeBounds } from 'store/design/utils/getRotatedNodeBounds';

// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

export const getAutoLayoutChildBounds = (childIds: string[], nodesById: Record<string, TSceneNode>): TDraftRect[] =>
  childIds
    .map((id) => nodesById[id])
    .filter(Boolean)
    .map((child) => getRotatedNodeBounds(child));
