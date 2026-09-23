// store
import { RootState } from 'store';
import { selectNodes } from 'store/design/selectors';

export const getLastAddedNodeId = (state: RootState): string => {
  const nodeIds = Object.keys(selectNodes(state));
  return nodeIds[nodeIds.length - 1];
};
