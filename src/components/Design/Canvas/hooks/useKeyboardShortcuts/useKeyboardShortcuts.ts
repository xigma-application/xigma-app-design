import { useMemo } from 'react';

// hooks
import { TKeysMap, useKeyboardHandler } from 'hooks';

// others
import { shortcuts } from './shortcuts';

// store
import { toggleActionsPanelOpen, toggleUiMinimized } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { KeyboardKeys } from 'types/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

// utils
import { dispatchTool } from './utils/dispatchTool';
import { getDefaultMoveTool } from './utils/getDefaultMoveTool';
import { handleBringToFront } from './utils/handleBringToFront';
import { handleCopySelection } from './utils/handleCopySelection';
import { handleDeleteSelection } from './utils/handleDeleteSelection/handleDeleteSelection';
import { handleDuplicateSelection } from './utils/handleDuplicateSelection';
import { handleEnterTextEdit } from './utils/handleEnterTextEdit';
import { handleEnterVectorEdit } from './utils/handleEnterVectorEdit';
import { handleFlattenSelection } from './utils/handleFlattenSelection';
import { handleFlipSelection } from './utils/handleFlipSelection';
import { handleGroupSelection } from './utils/handleGroupSelection';
import { handleLeave } from './utils/handleLeave';
import { handleOutlineStroke } from './utils/handleOutlineStroke/handleOutlineStroke';
import { handlePasteSelection } from './utils/handlePasteSelection';
import { handleRedo } from './utils/handleRedo';
import { handleSelectAll } from './utils/handleSelectAll';
import { handleSendToBack } from './utils/handleSendToBack';
import { handleUndo } from './utils/handleUndo';
import { handleUngroupSelection } from './utils/handleUngroupSelection';
import { handleUseSelectionAsMask } from './utils/handleUseSelectionAsMask';
import { nudgeMap } from './utils/nudgeMap';

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
      { action: (): any => dispatchTool(dispatch, ToolName.cut), ...shortcuts[ToolName.cut] },
      { action: (): any => dispatchTool(dispatch, ToolName.erase), ...shortcuts[ToolName.erase] },
      { action: (): any => dispatchTool(dispatch, ToolName.media), ...shortcuts[ToolName.media] },
      { action: (): any => dispatchTool(dispatch, ToolName.paint), ...shortcuts[ToolName.paint] },
      { action: (): any => dispatchTool(dispatch, ToolName.text), ...shortcuts[ToolName.text] },
      { action: (): any => dispatchTool(dispatch, ToolName.shapeBuilder), ...shortcuts[ToolName.shapeBuilder] },
      { action: (): any => dispatchTool(dispatch, ToolName.variableWidth), ...shortcuts[ToolName.variableWidth] },
      { action: (): any => handleLeave(dispatch, refs), ...shortcuts.escape },
      { action: (): any => handleEnterVectorEdit(dispatch, refs), secondaryKey: KeyboardKeys.enter },
      { action: (event): any => handleEnterTextEdit(event, dispatch), secondaryKey: KeyboardKeys.enter },
      { action: (): any => handleRedo(dispatch, refs), ...shortcuts.redo },
      { action: (): any => handleUndo(dispatch, refs), ...shortcuts.undo },
      { action: (): any => handleDeleteSelection(dispatch, refs), secondaryKey: KeyboardKeys.delete },
      { action: (): any => handleDeleteSelection(dispatch, refs), secondaryKey: KeyboardKeys.backspace },
      { action: (): any => handleSelectAll(dispatch, refs), ...shortcuts.selectAll },
      { action: (): any => dispatch(toggleUiMinimized()), ...shortcuts.toggleUiMinimized },
      { action: (): any => dispatch(toggleActionsPanelOpen()), ...shortcuts.openActions },
      { action: (): any => handleDuplicateSelection(dispatch, refs), ...shortcuts.duplicate },
      { action: (): any => handleGroupSelection(dispatch), ...shortcuts.group },
      { action: (): any => handleUngroupSelection(dispatch), ...shortcuts.ungroup },
      { action: (): any => handleUseSelectionAsMask(dispatch), ...shortcuts.useAsMask },
      { action: (): any => handleFlattenSelection(dispatch), ...shortcuts.flatten },
      { action: (): any => handleFlipSelection(dispatch, 'horizontal'), ...shortcuts.flipHorizontal },
      { action: (): any => handleFlipSelection(dispatch, 'vertical'), ...shortcuts.flipVertical },
      { action: (): any => handleOutlineStroke(dispatch), ...shortcuts.outlineStroke },
      { action: (): any => handleBringToFront(dispatch), ...shortcuts.bringToFront },
      { action: (): any => handleSendToBack(dispatch), ...shortcuts.sendToBack },
      { action: (): any => handleCopySelection(refs), ...shortcuts.copy },
      { action: (): any => handlePasteSelection(dispatch, refs), ...shortcuts.paste },
      ...nudgeMap(dispatch, refs),
    ],
    [dispatch, refs.vectorEdit.selectedVectorVertexIdsRef, refs.vectorEdit.selectedVectorHandlesRef],
  );

  useKeyboardHandler(true, [], keysMap, undefined, true);
};
