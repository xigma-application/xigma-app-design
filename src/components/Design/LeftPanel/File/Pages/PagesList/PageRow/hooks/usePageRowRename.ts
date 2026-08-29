import { useState } from 'react';

export type TUsePageRowRenameResult = {
  isRenameRequested: boolean;
  onEditingChange: TFunc<[boolean]>;
  onRename: TFunc;
};

export const usePageRowRename = (autoEdit: boolean = false, onAutoEditDismissed?: TFunc): TUsePageRowRenameResult => {
  const [isRenameRequested, setIsRenameRequested] = useState(false);

  const onRename = (): void => {
    window.requestAnimationFrame(() => setIsRenameRequested(true));
  };

  const onEditingChange = (editing: boolean): void => {
    if (!editing) {
      setIsRenameRequested(false);

      if (autoEdit) {
        onAutoEditDismissed?.();
      }
    }
  };

  return { isRenameRequested, onEditingChange, onRename };
};
