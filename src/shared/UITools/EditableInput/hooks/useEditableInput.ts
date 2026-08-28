import { ChangeEvent, FocusEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';

export type TUseEditableInputResult = {
  draft: string;
  handleBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  handleChange: TFunc<[ChangeEvent<HTMLInputElement>]>;
  handleKeyDown: TFunc<[KeyboardEvent<HTMLInputElement>]>;
};

export const useEditableInput = (value: string, onChange: TFunc<[string]>): TUseEditableInputResult => {
  const [draft, setDraft] = useState(value);
  const isCancellingRef = useRef(false);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setDraft(event.target.value);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>): void => {
    const nextValue = event.currentTarget.value.trim();

    if (isCancellingRef.current) {
      isCancellingRef.current = false;
      setDraft(value);
    } else if (nextValue && nextValue !== value) {
      onChange(nextValue);
    } else {
      setDraft(value);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }

    if (event.key === 'Escape') {
      isCancellingRef.current = true;
      event.currentTarget.blur();
    }
  };

  return { draft, handleBlur, handleChange, handleKeyDown };
};
