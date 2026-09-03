import { useState } from 'react';

export type TUseFileNameRenameResult = {
  isRenameRequested: boolean;
  onEditingChange: TFunc<[boolean]>;
  onRename: TFunc;
};

export const useFileNameRename = (): TUseFileNameRenameResult => {
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
