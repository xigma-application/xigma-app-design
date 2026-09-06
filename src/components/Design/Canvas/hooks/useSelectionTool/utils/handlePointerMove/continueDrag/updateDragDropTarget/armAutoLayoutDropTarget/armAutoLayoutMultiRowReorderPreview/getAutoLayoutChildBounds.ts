// store
import { getAutoLayoutNodeLocalBounds } from 'store/design/utils/autoLayout/getAutoLayoutNodeLocalBounds';

// types
import { TAutoLayoutFrame } from '../../types';
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

export const getAutoLayoutChildBounds = (
  childIds: string[],
  nodesById: Record<string, TSceneNode>,
  frame: TAutoLayoutFrame,
): TDraftRect[] =>
  childIds
    .map((id) => nodesById[id])
    .filter(Boolean)
    .map((child) => getAutoLayoutNodeLocalBounds(child, frame));
