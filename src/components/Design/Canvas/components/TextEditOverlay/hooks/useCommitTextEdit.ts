import { FocusEvent } from 'react';

// others
import { TEXT_FILL, TEXT_FONT_FAMILY, TEXT_FONT_SIZE, TEXT_NAME } from '../../../constants';

// store
import { addNode, stopTextEdit, updateNode } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TEditingTextBox } from 'types/canvas';

// utils
import { getEditableTextContent } from '../utils/getEditableTextContent';

export const useCommitTextEdit = (
  box: TEditingTextBox | null,
  editingNodeId: string | null,
): ((event: FocusEvent<HTMLDivElement>) => void) => {
  const dispatch = useAppDispatch();

  return (event: FocusEvent<HTMLDivElement>): void => {
    if (box) {
      const content = getEditableTextContent(event.currentTarget);

      if (content.length > 0) {
        if (editingNodeId) {
          dispatch(updateNode({ changes: { content }, id: editingNodeId }));
        } else {
          dispatch(
            addNode({
              content,
              fill: TEXT_FILL,
              flipX: false,
              flipY: false,
              fontFamily: TEXT_FONT_FAMILY,
              fontSize: TEXT_FONT_SIZE,
              height: box.height,
              name: TEXT_NAME,
              parentId: null,
              rotation: 0,
              type: NodeType.text,
              width: box.width,
              x: box.x,
              y: box.y,
            }),
          );
        }
      }

      dispatch(stopTextEdit());
    }
  };
};
