// types
import { NodeType } from 'types/design/enums';
import { TGuide } from 'types/design/guides/types';
import { TAddGuidePayload, TDesignState } from '../types';

// utils
import { getActivePage } from './getActivePage';

export const handleAddGuide = (state: TDesignState, payload: TAddGuidePayload): void => {
  const { axis, frameId, id, position } = payload;
  const guide: TGuide = { axis, id, position };

  if (frameId !== null) {
    const frame = getActivePage(state).nodes[frameId];

    if (frame?.type === NodeType.frame) {
      (frame.guides ??= []).push(guide);
    }
  } else {
    getActivePage(state).guides.push(guide);
  }
};
