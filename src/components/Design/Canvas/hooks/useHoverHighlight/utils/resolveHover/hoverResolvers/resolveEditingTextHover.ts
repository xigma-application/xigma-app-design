// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getCollidesWithEditingText } from '../../getCollidesWithEditingText';

export const resolveEditingTextHover = ({
  point,
  editingTextBox,
  editingContent,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  if (getCollidesWithEditingText(editingTextBox, editingContent, point, viewport.zoom)) {
    return { className: null, cursor: 'text', nodeId: null };
  }
};
