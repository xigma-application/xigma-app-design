import { InputEvent, useState } from 'react';

export const useCommentDraftValue = (): { onInput: (event: InputEvent<HTMLDivElement>) => void; value: string } => {
  const [value, setValue] = useState('');

  return {
    onInput: (event: InputEvent<HTMLDivElement>): void => setValue((event.currentTarget.textContent ?? '').trim()),
    value,
  };
};
