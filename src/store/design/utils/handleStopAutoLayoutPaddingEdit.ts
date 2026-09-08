// types
import { TAutoLayoutPaddingSide } from 'utils/canvas/autoLayoutPadding/types';
import { TDesignState } from '../types';

export const handleStopAutoLayoutPaddingEdit = (state: TDesignState, payload: { frameId: string; side: TAutoLayoutPaddingSide }): void => {
  if (state.editingAutoLayoutPadding?.frameId === payload.frameId) {
    if (state.editingAutoLayoutPadding.side === payload.side) {
      state.editingAutoLayoutPadding = null;
    }
  }
};
