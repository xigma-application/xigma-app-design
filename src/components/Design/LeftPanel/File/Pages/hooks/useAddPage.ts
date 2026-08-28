import { useState } from 'react';

// store
import { addPage } from 'store/design/slice';
import { useAppDispatch } from 'store';

export type TUseAddPageResult = {
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

  return { handleAddPage, pendingEditPageId };
};
