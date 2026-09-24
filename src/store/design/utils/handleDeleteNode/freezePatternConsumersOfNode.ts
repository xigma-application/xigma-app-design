import { current, isDraft } from '@reduxjs/toolkit';

// types
import { TDesignState } from '../../types';

// utils
import { getActivePage } from '../getActivePage';
import { getGroupSubtreeNodes } from '../nodeHierarchy/getGroupSubtreeNodes';

export const freezePatternConsumersOfNode = (state: TDesignState, sourceId: string): void => {
  const page = getActivePage(state);
  const nodesById = isDraft(page.nodes) ? current(page.nodes) : page.nodes;
  const sourceNode = nodesById[sourceId];

  if (sourceNode) {
    const snapshot = structuredClone(getGroupSubtreeNodes(sourceNode, nodesById));

    Object.values(page.nodes).forEach((consumer) => {
      if ('fills' in consumer) {
        [...consumer.fills, ...(consumer.strokes ?? [])].forEach((paint) => {
          if (paint.type === 'pattern' && paint.sourceNodeId === sourceId) {
            paint.frozenSourceSnapshot = snapshot;
            paint.sourceNodeId = null;
          }
        });
      }
    });
  }
};
