import { MouseEvent } from 'react';

// store
import { toggleNodeHidden, toggleNodeLocked } from 'store/design/slice';
import { useAppDispatch } from 'store';

export type TUseTreeItemActionsResult = {
  handleStopPropagation: TFunc<[MouseEvent<HTMLElement>]>;
  handleToggleHidden: TFunc;
  handleToggleLocked: TFunc;
};

export const useTreeItemActions = (id: string): TUseTreeItemActionsResult => {
  const dispatch = useAppDispatch();

  const handleToggleLocked = (): void => {
    dispatch(toggleNodeLocked(id));
  };

  const handleToggleHidden = (): void => {
    dispatch(toggleNodeHidden(id));
  };

  const handleStopPropagation = (event: MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
  };

  return { handleStopPropagation, handleToggleHidden, handleToggleLocked };
};
