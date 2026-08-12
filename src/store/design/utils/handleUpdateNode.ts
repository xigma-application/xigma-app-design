// types
import { TDesignState } from '../types';
import { TSceneNodeChanges } from 'types/design/types';

export const handleUpdateNode = (state: TDesignState, payload: { changes: TSceneNodeChanges; id: string }): void => {
  const node = state.nodes[payload.id];

  if (node) {
    Object.assign(node, payload.changes);
  }
};
