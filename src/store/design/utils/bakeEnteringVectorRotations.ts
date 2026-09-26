// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../types';

// utils
import { getActivePage } from './getActivePage';
import { getBakedVectorRotationChanges } from 'utils/canvas/vectorNetwork/getBakedVectorRotationChanges';

export const bakeEnteringVectorRotations = (state: TDesignState, enteringIds: string[]): void => {
  const { nodes } = getActivePage(state);

  enteringIds.forEach((id) => {
    const node = nodes[id];

    if (node?.type === NodeType.vector && node.rotation) {
      nodes[id] = { ...node, ...getBakedVectorRotationChanges(node) };
    }
  });
};
