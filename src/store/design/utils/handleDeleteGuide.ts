// types
import { TDeleteGuidePayload, TDesignState } from '../types';

// utils
import { getGuideList } from './getGuideList';

export const handleDeleteGuide = (state: TDesignState, payload: TDeleteGuidePayload): void => {
  const guides = getGuideList(state, payload.frameId);

  if (guides) {
    const index = guides.findIndex((candidate) => candidate.id === payload.id);

    if (index !== -1) {
      guides.splice(index, 1);
    }
  }
};
