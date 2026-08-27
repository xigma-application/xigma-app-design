import { KeyboardEvent as ReactKeyboardEvent } from 'react';

// store
import { selectActiveTool, selectEditingTextBox, selectSelectedIds, selectVectorEditingNodeIds } from 'store/design/selectors';
import { setSelection, startTextEdit } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

export const handleEnterTextEdit = (event: KeyboardEvent | ReactKeyboardEvent<HTMLElement>, dispatch: AppDispatch): void => {
  const state = store.getState();
  const activeTool = selectActiveTool(state);
  const selectedIds = selectSelectedIds(state);
  const isEditingText = Boolean(selectEditingTextBox(state));
  const isVectorEditing = selectVectorEditingNodeIds(state).length > 0;
  const isSelectionTool = activeTool === ToolName.default || activeTool === ToolName.move;
  const [selectedId] = selectedIds;
  const node = selectedId ? state.design.nodes[selectedId] : undefined;

  if (isSelectionTool && !isEditingText && !isVectorEditing && selectedIds.length === 1 && node?.type === NodeType.text) {
    event.preventDefault();
    dispatch(setSelection([node.id]));
    dispatch(
      startTextEdit({
        box: {
          flipX: node.flipX,
          flipY: node.flipY,
          height: node.height,
          pathFlip: node.pathFlip,
          pathId: node.pathId,
          pathStartOffset: node.pathStartOffset,
          rotation: node.rotation,
          width: node.width,
          x: node.x,
          y: node.y,
        },
        content: node.content,
        id: node.id,
      }),
    );
  }
};
