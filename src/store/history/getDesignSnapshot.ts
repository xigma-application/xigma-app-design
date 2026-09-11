// types
import { RootState } from 'store';
import { TDesignSnapshot } from 'store/design/types';

export const getDesignSnapshot = (state: RootState): TDesignSnapshot => ({
  activePageId: state.design.activePageId,
  gridTrackSelection: state.design.gridTrackSelection ?? null,
  pages: state.design.pages,
  panelGridTrackSelection: state.design.panelGridTrackSelection ?? null,
});
