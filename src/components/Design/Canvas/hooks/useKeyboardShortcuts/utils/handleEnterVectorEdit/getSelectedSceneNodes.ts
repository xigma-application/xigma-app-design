// store
import { selectSelectedIds } from 'store/design/selectors';
import { RootState } from 'store';

// types
import { TSceneNode } from 'types/design/types';

export const getSelectedSceneNodes = (state: RootState): TSceneNode[] =>
  selectSelectedIds(state)
    .map((id) => state.design.pages[state.design.activePageId].nodes[id])
    .filter((node): node is TSceneNode => Boolean(node));
