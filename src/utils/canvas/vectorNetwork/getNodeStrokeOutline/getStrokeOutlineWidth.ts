// others
import { LINE_RENDER_STROKE_WIDTH } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TStrokeableNode } from './types';

export const getStrokeOutlineWidth = (node: TStrokeableNode): number => {
  switch (node.type) {
    case NodeType.line:
      return node.strokeWidth ?? LINE_RENDER_STROKE_WIDTH;
    default:
      return node.strokeWidth ?? 0;
  }
};
