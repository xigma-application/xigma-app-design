// types
import { RootState } from 'store';
import { TDesignSnapshot } from 'store/design/types';

export const getDesignSnapshot = (state: RootState): TDesignSnapshot => ({
  nodes: state.design.nodes,
  rootOrder: state.design.rootOrder,
  selectedIds: state.design.selectedIds,
});
