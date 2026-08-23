import { useMemo } from 'react';

// store
import { setActiveTool } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { ToolName } from 'types/design/enums';

export const useSelectVectorEditTool = (toolName: ToolName | undefined): (() => void) | undefined => {
  const dispatch = useAppDispatch();

  return useMemo((): (() => void) | undefined => {
    if (toolName !== undefined) {
      return (): void => {
        dispatch(setActiveTool(toolName));
      };
    }

    return undefined;
  }, [dispatch, toolName]);
};
