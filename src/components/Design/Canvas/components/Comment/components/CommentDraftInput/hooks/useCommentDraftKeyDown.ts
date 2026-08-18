import { KeyboardEvent } from 'react';

// store
import { cancelCommentDraft } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useCommentDraftKeyDown = (onSubmit: () => void): ((event: KeyboardEvent<HTMLDivElement>) => void) => {
  const dispatch = useAppDispatch();

  return (event: KeyboardEvent<HTMLDivElement>): void => {
    event.stopPropagation();

    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      onSubmit();
    } else if (event.key === 'Escape') {
      event.currentTarget.blur();
      dispatch(cancelCommentDraft());
    }
  };
};
