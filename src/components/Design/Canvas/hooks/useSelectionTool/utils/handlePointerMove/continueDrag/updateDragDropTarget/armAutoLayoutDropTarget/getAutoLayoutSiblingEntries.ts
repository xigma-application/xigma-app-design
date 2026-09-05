// store
import { getRotatedNodeBounds } from 'store/design/utils/getRotatedNodeBounds';

// types
import { TDraftRect } from 'types/canvas';
import { TFrameNode, TSceneNode } from 'types/design/types';

export const getAutoLayoutSiblingEntries = (
  desiredParent: TFrameNode,
  movedNodeIds: string[],
  nodesById: Record<string, TSceneNode>,
): { bounds: TDraftRect; sibling: TSceneNode }[] =>
  desiredParent.childIds
    .filter((id) => !movedNodeIds.includes(id))
    .map((id) => nodesById[id])
    .filter(Boolean)
    .map((sibling) => ({ bounds: getRotatedNodeBounds(sibling), sibling }));
