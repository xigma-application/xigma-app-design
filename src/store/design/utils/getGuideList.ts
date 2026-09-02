// types
import { NodeType } from 'types/design/enums';
import { TGuide } from 'types/design/guides/types';
import { TDesignState } from '../types';

// utils
import { getActivePage } from './getActivePage';

export const getGuideList = (state: TDesignState, frameId: string | null): TGuide[] | undefined => {
  if (frameId !== null) {
    const frame = getActivePage(state).nodes[frameId];
    return frame?.type === NodeType.frame ? frame.guides : undefined;
  }

  return getActivePage(state).guides;
};
