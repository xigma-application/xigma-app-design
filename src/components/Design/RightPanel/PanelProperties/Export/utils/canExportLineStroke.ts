// types
import { TLineNode } from 'types/design/types';

// utils
import { getLineVectorStroke } from './getLineVectorStroke';

export const canExportLineStroke = (node: TLineNode): boolean =>
  node.strokes.every((paint) => paint.visible === false) || getLineVectorStroke(node) !== null;
