// types
import { TDesignState } from '../types';
import { TSceneNode } from 'types/design/types';

export const handleAddNode = (state: TDesignState, node: TSceneNode): void => {
  state.nodes[node.id] = node;
  state.rootOrder.push(node.id);
};
