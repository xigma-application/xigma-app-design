// store
import { selectActiveTool, selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { ToolName } from 'types/design/enums';

export const useIsNoSelection = (): boolean => {
  const activeTool = useAppSelector(selectActiveTool);
  const selectedNodes = useAppSelector(selectSelectedNodes);

  return activeTool !== ToolName.frame && selectedNodes.length === 0;
};
