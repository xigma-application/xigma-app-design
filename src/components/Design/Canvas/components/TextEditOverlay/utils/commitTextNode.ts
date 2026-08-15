// others
import { TEXT_FILL, TEXT_FONT_FAMILY, TEXT_FONT_SIZE, TEXT_NAME } from '../../../constants';

// store
import { addNode, updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TEditingTextBox } from 'types/canvas';

export const commitTextNode = (dispatch: AppDispatch, box: TEditingTextBox, editingNodeId: string | null, content: string): void => {
  if (editingNodeId) {
    dispatch(updateNode({ changes: { content }, id: editingNodeId }));
  } else {
    dispatch(
      addNode({
        content,
        fill: TEXT_FILL,
        flipX: box.flipX,
        flipY: box.flipY,
        fontFamily: TEXT_FONT_FAMILY,
        fontSize: TEXT_FONT_SIZE,
        height: box.height,
        name: TEXT_NAME,
        parentId: null,
        pathFlip: box.pathFlip,
        pathId: box.pathId,
        pathStartOffset: box.pathStartOffset,
        rotation: box.rotation,
        type: NodeType.text,
        width: box.width,
        x: box.x,
        y: box.y,
      }),
    );
  }
};
