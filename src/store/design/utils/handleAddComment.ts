// others
import { MOCK_COMMENT_AUTHOR } from '../constants';

// types
import { TDesignState } from '../types';

export const handleAddComment = (state: TDesignState, payload: { content: string; id: string }): void => {
  if (state.commentDraftPosition) {
    state.comments[payload.id] = {
      author: MOCK_COMMENT_AUTHOR,
      content: payload.content,
      createdAt: Date.now(),
      id: payload.id,
      x: state.commentDraftPosition.x,
      y: state.commentDraftPosition.y,
    };
    state.commentDraftPosition = null;
  }
};
