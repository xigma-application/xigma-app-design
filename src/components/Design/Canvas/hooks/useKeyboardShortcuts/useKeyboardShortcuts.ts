import { useMemo } from 'react';

// hooks
import { TKeysMap, useKeyboardHandler } from 'hooks';

// others
import { shortcuts } from './shortcuts';

// store
import { redo, undo } from 'store/history/actions';
import { useAppDispatch } from 'store';

// types
import { KeyboardKeys } from 'types/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

// utils
import { dispatchTool } from './utils/dispatchTool';
import { getDefaultMoveTool } from './utils/getDefaultMoveTool';
import { handleDeleteSelection } from './utils/handleDeleteSelection/handleDeleteSelection';
import { handleEnterMultiVectorEdit } from './utils/handleEnterMultiVectorEdit';
import { handleLeave } from './utils/handleLeave';

export const useKeyboardShortcuts = (refs: TCanvasRefs): void => {
  const dispatch = useAppDispatch();

  const keysMap: TKeysMap = useMemo(
    () => [
      { action: (): any => dispatchTool(dispatch, getDefaultMoveTool()), ...shortcuts[ToolName.default] },
      { action: (): any => dispatchTool(dispatch, ToolName.frame), ...shortcuts[ToolName.frame] },
      { action: (): any => dispatchTool(dispatch, ToolName.hand), ...shortcuts[ToolName.hand] },
      { action: (): any => dispatchTool(dispatch, ToolName.lasso), ...shortcuts[ToolName.lasso] },
      { action: (): any => dispatchTool(dispatch, ToolName.scale), ...shortcuts[ToolName.scale] },
      { action: (): any => dispatchTool(dispatch, ToolName.rectangle), ...shortcuts[ToolName.rectangle] },
      { action: (): any => dispatchTool(dispatch, ToolName.section), ...shortcuts[ToolName.section] },
      { action: (): any => dispatchTool(dispatch, ToolName.slice), ...shortcuts[ToolName.slice] },
      { action: (): any => dispatchTool(dispatch, ToolName.line), ...shortcuts[ToolName.line] },
      { action: (): any => dispatchTool(dispatch, ToolName.arrow), ...shortcuts[ToolName.arrow] },
      { action: (): any => dispatchTool(dispatch, ToolName.ellipse), ...shortcuts[ToolName.ellipse] },
      { action: (): any => dispatchTool(dispatch, ToolName.pen), ...shortcuts[ToolName.pen] },
      { action: (): any => dispatchTool(dispatch, ToolName.pencil), ...shortcuts[ToolName.pencil] },
      { action: (): any => dispatchTool(dispatch, ToolName.comment), ...shortcuts[ToolName.comment] },
      { action: (): any => dispatchTool(dispatch, ToolName.media), ...shortcuts[ToolName.media] },
      { action: (): any => dispatchTool(dispatch, ToolName.paint), ...shortcuts[ToolName.paint] },
      { action: (): any => dispatchTool(dispatch, ToolName.text), ...shortcuts[ToolName.text] },
      { action: (): any => handleLeave(dispatch, refs), ...shortcuts.escape },
      { action: (): any => handleEnterMultiVectorEdit(dispatch), secondaryKey: KeyboardKeys.enter },
      { action: (): any => dispatch(redo()), ...shortcuts.redo },
      { action: (): any => dispatch(undo()), ...shortcuts.undo },
      { action: (): any => handleDeleteSelection(dispatch, refs), secondaryKey: KeyboardKeys.delete },
      { action: (): any => handleDeleteSelection(dispatch, refs), secondaryKey: KeyboardKeys.backspace },
    ],
    [dispatch, refs.selectedVectorVertexIdsRef, refs.selectedVectorHandlesRef],
  );

  useKeyboardHandler(true, [], keysMap, undefined, true);
};
