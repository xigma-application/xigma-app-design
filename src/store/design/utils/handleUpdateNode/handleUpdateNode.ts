// types
import { TDesignState } from '../../types';
import { TSceneNodeChanges } from 'types/design/types';

// utils
import { getActivePage } from '../getActivePage';
import { invalidateVectorWidthProfile } from './invalidateVectorWidthProfile';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { syncAutoLayoutChildren } from '../autoLayout/syncAutoLayoutChildren/syncAutoLayoutChildren';
import { syncBoundNode } from './syncBoundNode';
import { syncConstrainedFrameChildren } from './syncConstrainedFrameChildren';
import { syncGroupBounds } from '../syncGroupBounds';

export const handleUpdateNode = (state: TDesignState, payload: { changes: TSceneNodeChanges; id: string }): void => {
  const node = getActivePage(state).nodes[payload.id];

  if (node) {
    const previousBox = isBoxSceneNode(node)
      ? { height: node.height, rotation: node.rotation, width: node.width, x: node.x, y: node.y }
      : undefined;

    Object.assign(node, payload.changes);
    syncBoundNode(state, node);
    invalidateVectorWidthProfile(node, payload.changes);
    syncGroupBounds(state, node.parentId);
    syncAutoLayoutChildren(state, node.id);
    syncAutoLayoutChildren(state, node.parentId);
    syncConstrainedFrameChildren(state, node.id, previousBox);
  }
};
