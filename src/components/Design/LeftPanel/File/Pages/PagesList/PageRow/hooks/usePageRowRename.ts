import { useState } from 'react';

export type TUsePageRowRenameResult = {
  isRenameRequested: boolean;
  onEditingChange: TFunc<[boolean]>;
  onRename: TFunc;
};

export const usePageRowRename = (): TUsePageRowRenameResult => {
  const [isRenameRequested, setIsRenameRequested] = useState(false);

  const onRename = (): void => {
    window.requestAnimationFrame(() => setIsRenameRequested(true));
  };

  const onEditingChange = (editing: boolean): void => {
    if (!editing) {
      setIsRenameRequested(false);
    }
  };

  return { isRenameRequested, onEditingChange, onRename };
};
