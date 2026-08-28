// types
import { RootState } from 'store';
import { TDesignSnapshot } from 'store/design/types';

export const getDesignSnapshot = (state: RootState): TDesignSnapshot => ({
  activePageId: state.design.activePageId,
  pages: state.design.pages,
  selectedIds: state.design.selectedIds,
});
