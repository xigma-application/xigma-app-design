// store
import { selectActivePage, selectRenderOrderedNodes } from 'store/design/selectors';
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';
import { RootState } from 'store';

// types
import { TSceneNode } from 'types/design/types';

// utils
import { getMarqueeCandidateNodes } from './getMarqueeCandidateNodes';

export const getMarqueeLeafNodes = (state: RootState, nodesById: Record<string, TSceneNode>, isControlPressed: boolean): TSceneNode[] =>
  isControlPressed
    ? selectRenderOrderedNodes(state).filter((node) => !isContainerNode(node) || node.childIds.length === 0)
    : getMarqueeCandidateNodes(selectActivePage(state).rootOrder, nodesById);
