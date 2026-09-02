// types
import { TDesignState, TUpdateGuidePayload } from '../types';

// utils
import { getGuideList } from './getGuideList';

export const handleUpdateGuide = (state: TDesignState, payload: TUpdateGuidePayload): void => {
  const guide = getGuideList(state, payload.frameId)?.find((candidate) => candidate.id === payload.id);

  if (guide) {
    guide.position = payload.position;
  }
};
