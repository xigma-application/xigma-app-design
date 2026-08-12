import { useMemo } from 'react';

// hooks
import { TKeysMap, useKeyboardHandler } from 'hooks';

// others
import { shortcuts } from './shortcuts';

// store
import { setActiveTool } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { ToolName } from 'types/design/enums';

export const useToolbarShortcuts = (): void => {
  const dispatch = useAppDispatch();

  const keysMap: TKeysMap = useMemo(
    () => [
      { action: (): any => dispatch(setActiveTool(ToolName.default)), ...shortcuts[ToolName.default] },
      { action: (): any => dispatch(setActiveTool(ToolName.frame)), ...shortcuts[ToolName.frame] },
      { action: (): any => dispatch(setActiveTool(ToolName.hand)), ...shortcuts[ToolName.hand] },
      { action: (): any => dispatch(setActiveTool(ToolName.rectangle)), ...shortcuts[ToolName.rectangle] },
      { action: (): any => dispatch(setActiveTool(ToolName.line)), ...shortcuts[ToolName.line] },
      { action: (): any => dispatch(setActiveTool(ToolName.ellipse)), ...shortcuts[ToolName.ellipse] },
      { action: (): any => dispatch(setActiveTool(ToolName.comment)), ...shortcuts[ToolName.comment] },
      { action: (): any => dispatch(setActiveTool(ToolName.media)), ...shortcuts[ToolName.media] },
      { action: (): any => dispatch(setActiveTool(ToolName.text)), ...shortcuts[ToolName.text] },
      { action: (): any => dispatch(setActiveTool(ToolName.default)), ...shortcuts.escape },
    ],
    [dispatch],
  );

  useKeyboardHandler(true, [], keysMap, undefined, true);
};
