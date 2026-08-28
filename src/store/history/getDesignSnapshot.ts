// types
import { RootState } from 'store';
import { TDesignSnapshot } from 'store/design/types';

export const getDesignSnapshot = (state: RootState): TDesignSnapshot => {
  const page = state.design.pages[state.design.activePageId];

  return { nodes: page.nodes, rootOrder: page.rootOrder, selectedIds: state.design.selectedIds };
};
