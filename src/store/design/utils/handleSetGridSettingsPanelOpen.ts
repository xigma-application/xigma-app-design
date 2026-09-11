// types
import { TDesignState } from '../types';

// utils
import { resetGridTrackAffordanceState } from './resetGridTrackAffordanceState';

export const handleSetGridSettingsPanelOpen = (state: TDesignState, isOpen: boolean): void => {
  if (isOpen) {
    state.isGridSettingsPanelOpen = true;
  } else {
    resetGridTrackAffordanceState(state);
  }
};
