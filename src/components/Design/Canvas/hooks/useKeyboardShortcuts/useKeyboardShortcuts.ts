import { useMemo } from 'react';

// hooks
import { TKeysMap, useKeyboardHandler } from 'hooks';

// others
import { shortcuts } from './shortcuts';

// store
import { redo, undo } from 'store/history/actions';
import { setActiveTool } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { KeyboardKeys } from 'types/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

// utils
import { getDefaultMoveTool } from './utils/getDefaultMoveTool';
import { handleDeleteSelection } from './utils/handleDeleteSelection';
import { handleLeave } from './utils/handleLeave';

export const useKeyboardShortcuts = (refs: TCanvasRefs): void => {
  const dispatch = useAppDispatch();

  const keysMap: TKeysMap = useMemo(
    () => [
      { action: (): any => dispatch(setActiveTool(getDefaultMoveTool())), ...shortcuts[ToolName.default] },
      { action: (): any => dispatch(setActiveTool(ToolName.frame)), ...shortcuts[ToolName.frame] },
      { action: (): any => dispatch(setActiveTool(ToolName.hand)), ...shortcuts[ToolName.hand] },
      { action: (): any => dispatch(setActiveTool(ToolName.lasso)), ...shortcuts[ToolName.lasso] },
      { action: (): any => dispatch(setActiveTool(ToolName.scale)), ...shortcuts[ToolName.scale] },
      { action: (): any => dispatch(setActiveTool(ToolName.rectangle)), ...shortcuts[ToolName.rectangle] },
      { action: (): any => dispatch(setActiveTool(ToolName.section)), ...shortcuts[ToolName.section] },
      { action: (): any => dispatch(setActiveTool(ToolName.slice)), ...shortcuts[ToolName.slice] },
      { action: (): any => dispatch(setActiveTool(ToolName.line)), ...shortcuts[ToolName.line] },
      { action: (): any => dispatch(setActiveTool(ToolName.arrow)), ...shortcuts[ToolName.arrow] },
      { action: (): any => dispatch(setActiveTool(ToolName.ellipse)), ...shortcuts[ToolName.ellipse] },
      { action: (): any => dispatch(setActiveTool(ToolName.pen)), ...shortcuts[ToolName.pen] },
      { action: (): any => dispatch(setActiveTool(ToolName.pencil)), ...shortcuts[ToolName.pencil] },
      { action: (): any => dispatch(setActiveTool(ToolName.comment)), ...shortcuts[ToolName.comment] },
      { action: (): any => dispatch(setActiveTool(ToolName.media)), ...shortcuts[ToolName.media] },
      { action: (): any => dispatch(setActiveTool(ToolName.paint)), ...shortcuts[ToolName.paint] },
      { action: (): any => dispatch(setActiveTool(ToolName.text)), ...shortcuts[ToolName.text] },
      { action: (): any => handleLeave(dispatch), ...shortcuts.escape },
      { action: (): any => dispatch(redo()), ...shortcuts.redo },
      { action: (): any => dispatch(undo()), ...shortcuts.undo },
      { action: (): any => handleDeleteSelection(dispatch, refs), secondaryKey: KeyboardKeys.delete },
      { action: (): any => handleDeleteSelection(dispatch, refs), secondaryKey: KeyboardKeys.backspace },
    ],
    [dispatch, refs.selectedVectorVertexIdsRef, refs.selectedVectorHandlesRef],
  );

  useKeyboardHandler(true, [], keysMap, undefined, true);
};
