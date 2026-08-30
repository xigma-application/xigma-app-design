// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';
import { TEXT_FONT_SIZE } from '../../../constants';

// types
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getCurvedCaretIndexAtPoint, TCurvedCaretHit } from 'utils/canvas/text/getCurvedCaretIndexAtPoint';
import { getStraightCaretIndexAtPoint, TStraightCaretHit } from 'utils/canvas/text/getStraightCaretIndexAtPoint';

export const getEditingCaretHit = (
  editingTextBox: TEditingTextBox | null,
  editingContent: string,
  point: TPoint,
  pathNode?: TSceneNode,
): TCurvedCaretHit | TStraightCaretHit | null => {
  if (editingTextBox) {
    return editingTextBox.pathId
      ? getCurvedCaretIndexAtPoint(MSDF_ATLAS_JSON, editingContent, TEXT_FONT_SIZE, editingTextBox, point, pathNode)
      : getStraightCaretIndexAtPoint(MSDF_ATLAS_JSON, editingContent, TEXT_FONT_SIZE, editingTextBox, point);
  }

  return null;
};
