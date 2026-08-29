import { useState } from 'react';

// store
import { addPage } from 'store/design/slice';
import { useAppDispatch } from 'store';

export type TUseAddPageResult = {
  clearPendingEditPageId: TFunc;
  handleAddPage: TFunc;
  pendingEditPageId: string | null;
};

export const useAddPage = (onAdded: TFunc): TUseAddPageResult => {
  const dispatch = useAppDispatch();
  const [pendingEditPageId, setPendingEditPageId] = useState<string | null>(null);

  const handleAddPage = (): void => {
    const { payload } = dispatch(addPage());

    setPendingEditPageId(payload.id);
    onAdded();
  };

  const clearPendingEditPageId = (): void => {
    setPendingEditPageId(null);
  };

  return { clearPendingEditPageId, handleAddPage, pendingEditPageId };
};
