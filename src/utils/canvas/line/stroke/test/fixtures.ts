// types
import { NodeType } from 'types/design/enums';
import { TLineNode } from 'types/design/types';

export const makeLine = (overrides: Partial<TLineNode> = {}): TLineNode => ({
  height: 0,
  id: 'line',
  name: 'Line',
  parentId: null,
  rotation: 0,
  strokeWidth: 4,
  strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});
