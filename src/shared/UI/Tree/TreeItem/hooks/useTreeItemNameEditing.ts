import { useState } from 'react';

export type TUseTreeItemNameEditingResult = {
  isEditing: boolean;
  isRenameRequested: boolean;
  onEditingChange: TFunc<[boolean]>;
  onRenameRequested: TFunc;
};

export const useTreeItemNameEditing = (): TUseTreeItemNameEditingResult => {
  const [isEditing, setIsEditing] = useState(false);
  const [isRenameRequested, setIsRenameRequested] = useState(false);

  const onRenameRequested = (): void => {
    window.requestAnimationFrame(() => setIsRenameRequested(true));
  };

  const onEditingChange = (editing: boolean): void => {
    setIsEditing(editing);

    if (!editing) {
      setIsRenameRequested(false);
    }
  };

  return { isEditing, isRenameRequested, onEditingChange, onRenameRequested };
};
