import { KeyboardEvent, RefObject, useEffect, useRef, useState } from 'react';

type TParams = {
  initialValue: number | string;
  onCancel: TFunc;
  onCommit: TFunc<[string]>;
  onLiveChange?: TFunc<[string]>;
};

type TCanvasValueLabelInput = {
  handleBlur: TFunc;
  handleChange: TFunc<[string]>;
  handleKeyDown: TFunc<[KeyboardEvent<HTMLInputElement>]>;
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
};

export const useCanvasValueLabelInput = ({ initialValue, onCancel, onCommit, onLiveChange }: TParams): TCanvasValueLabelInput => {
  const inputRef = useRef<HTMLInputElement>(null);
  const settledRef = useRef(false);
  const [value, setValue] = useState(String(initialValue));

  const handleChange = (raw: string): void => {
    setValue(raw);
    onLiveChange?.(raw);
  };

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const settle = (run: TFunc): void => {
    if (!settledRef.current) {
      settledRef.current = true;
      run();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    event.stopPropagation();

    if (event.key === 'Enter') {
      settle(() => onCommit(value));
    }

    if (event.key === 'Escape') {
      settle(onCancel);
    }
  };

  return {
    handleBlur: (): void => settle(() => onCommit(value)),
    handleChange,
    handleKeyDown,
    inputRef,
    value,
  };
};
