// types
import { TMaskRenderer, TScissorRect } from './types';

// utils
import { glassBackdropStates } from './glassBackdropStates';

export const markGlassBackdropDirty = (renderer: TMaskRenderer, rect: TScissorRect | null): void => {
  const state = glassBackdropStates.get(renderer);

  if (state?.backdrop) {
    if (rect) {
      state.dirty.push(rect);
    } else {
      state.fullyDirty = true;
    }
  }
};
