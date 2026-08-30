// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getCollidesWithEditingText } from '../../getCollidesWithEditingText';

export const resolveEditingTextHover = ({
  point,
  editingTextBox,
  editingContent,
  nodesById,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const pathNode = editingTextBox?.pathId ? nodesById[editingTextBox.pathId] : undefined;

  if (getCollidesWithEditingText(editingTextBox, editingContent, point, viewport.zoom, pathNode)) {
    return { className: null, cursor: 'text', nodeId: null };
  }
};
