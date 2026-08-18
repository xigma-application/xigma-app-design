// types
import { TDesignState } from '../types';

export const handleUpdateCommentContent = (state: TDesignState, payload: { content: string; id: string }): void => {
  const comment = state.comments[payload.id];

  if (comment) {
    comment.content = payload.content;
  }
};
