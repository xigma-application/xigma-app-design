// types
import { TDesignState } from '../../types';
import { TSceneNodeChanges } from 'types/design/types';

// utils
import { getActivePage } from '../getActivePage';
import { invalidateVectorWidthProfile } from './invalidateVectorWidthProfile';
import { syncAutoLayoutChildren } from '../autoLayout/syncAutoLayoutChildren';
import { syncBoundNode } from './syncBoundNode';
import { syncGroupBounds } from '../syncGroupBounds';

export const handleUpdateNode = (state: TDesignState, payload: { changes: TSceneNodeChanges; id: string }): void => {
  const node = getActivePage(state).nodes[payload.id];

  if (node) {
    Object.assign(node, payload.changes);
    syncBoundNode(state, node);
    invalidateVectorWidthProfile(node, payload.changes);
    syncGroupBounds(state, node.parentId);
    syncAutoLayoutChildren(state, node.id);
    syncAutoLayoutChildren(state, node.parentId);
  }
};
