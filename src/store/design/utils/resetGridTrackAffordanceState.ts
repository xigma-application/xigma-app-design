// types
import { TDesignState } from '../types';

export const resetGridTrackAffordanceState = (state: TDesignState): void => {
  state.gridTrackSelection = null;
  state.panelGridTrackSelection = null;
  state.gridSectionHighlight = null;
  state.isGridSettingsPanelOpen = false;
};
