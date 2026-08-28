// types
import { TDesignState } from '../types';

// utils
import { getActivePage } from './getActivePage';

export const handleUpdateCommentContent = (state: TDesignState, payload: { content: string; id: string }): void => {
  const comment = getActivePage(state).comments[payload.id];

  if (comment) {
    comment.content = payload.content;
  }
};
