import { useState } from 'react';

export type TUseTreeItemNameEditingResult = {
  isEditing: boolean;
  onEditingChange: TFunc<[boolean]>;
};

export const useTreeItemNameEditing = (): TUseTreeItemNameEditingResult => {
  const [isEditing, setIsEditing] = useState(false);

  return { isEditing, onEditingChange: setIsEditing };
};
