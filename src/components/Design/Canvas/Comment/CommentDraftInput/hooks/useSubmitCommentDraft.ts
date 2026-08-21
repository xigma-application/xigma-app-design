import { MouseEvent } from 'react';

// store
import { addComment } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useSubmitCommentDraft = (value: string): { onClick: () => void; onMouseDown: (event: MouseEvent) => void } => {
  const dispatch = useAppDispatch();

  return {
    onClick: (): void => {
      if (value) {
        dispatch(addComment(value));
      }
    },
    onMouseDown: (event: MouseEvent): void => event.preventDefault(),
  };
};
