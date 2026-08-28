import { ChangeEvent, FocusEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';

export type TUseEditableInputResult = {
  draft: string;
  handleBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  handleChange: TFunc<[ChangeEvent<HTMLInputElement>]>;
  handleDisplayKeyDown: TFunc<[KeyboardEvent<HTMLElement>]>;
  handleFocus: TFunc<[FocusEvent<HTMLInputElement>]>;
  handleKeyDown: TFunc<[KeyboardEvent<HTMLInputElement>]>;
  isEditing: boolean;
  startEditing: TFunc;
};

export const useEditableInput = (
  value: string,
  onChange: TFunc<[string]>,
  onEditingChange: TFunc<[boolean]>,
  autoEdit = false,
): TUseEditableInputResult => {
  const [draft, setDraft] = useState(value);
  const [isEditing, setIsEditing] = useState(autoEdit);
  const isCancellingRef = useRef(false);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const setEditing = (editing: boolean): void => {
    setIsEditing(editing);
    onEditingChange(editing);
  };

  const startEditing = (): void => {
    setDraft(value);
    setEditing(true);
  };

  const handleDisplayKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      startEditing();
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setDraft(event.target.value);
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>): void => {
    event.currentTarget.select();
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>): void => {
    const nextValue = event.currentTarget.value.trim();

    setEditing(false);

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

  return { draft, handleBlur, handleChange, handleDisplayKeyDown, handleFocus, handleKeyDown, isEditing, startEditing };
};
