// types
import { TMaskRenderer } from './types';

// utils
import { glassBackdropStates } from './glassBackdropStates';
import { releaseGlassBackdropTarget } from './releaseGlassBackdropTarget';

export const releaseGlassBackdrop = (renderer: TMaskRenderer): void => {
  const state = glassBackdropStates.get(renderer);

  if (state) {
    releaseGlassBackdropTarget(renderer, state);
  }

  glassBackdropStates.delete(renderer);
};
