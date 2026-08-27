// types
import { TDesignState } from '../types';
import { TSceneNode } from 'types/design/types';

export const handleReplaceNode = (state: TDesignState, payload: { id: string; node: TSceneNode }): void => {
  if (state.nodes[payload.id]) {
    state.nodes[payload.id] = payload.node;
  }
};
