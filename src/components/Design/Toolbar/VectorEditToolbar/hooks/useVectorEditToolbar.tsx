import { useCallback } from 'react';

// hooks
import { useIsBendModifierHeld } from './useIsBendModifierHeld';

// store
import { selectActiveTool, selectVectorEditingNodeIds } from 'store/design/selectors';
import { setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { ToolName } from 'types/design/enums';

export type TUseVectorEditToolbar = {
  activeTool: ToolName;
  handleClose: () => void;
  isBendModifierHeld: boolean;
  vectorEditingNodeIds: string[];
};

export const getIsVectorEditToolActive = (toolName: ToolName | undefined, activeTool: ToolName, isBendModifierHeld: boolean): boolean => {
  switch (toolName) {
    case undefined:
      return false;
    case ToolName.move:
      return activeTool === ToolName.move && !isBendModifierHeld;
    case ToolName.bend:
      return activeTool === ToolName.bend || (activeTool === ToolName.move && isBendModifierHeld);
    default:
      return activeTool === toolName;
  }
};

export const useVectorEditToolbar = (): TUseVectorEditToolbar => {
  const dispatch = useAppDispatch();
  const vectorEditingNodeIds = useAppSelector(selectVectorEditingNodeIds);
  const activeTool = useAppSelector(selectActiveTool);
  const isBendModifierHeld = useIsBendModifierHeld();

  const handleClose = useCallback((): void => {
    dispatch(setActiveTool(ToolName.default));
    dispatch(setVectorEditingNodeIds([]));
  }, [dispatch]);

  return { activeTool, handleClose, isBendModifierHeld, vectorEditingNodeIds };
};
