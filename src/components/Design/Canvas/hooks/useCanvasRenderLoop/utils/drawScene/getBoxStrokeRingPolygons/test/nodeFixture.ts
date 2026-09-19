// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

export const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [],
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  strokeAlign: StrokeAlign.inside,
  strokeWidth: 4,
  type: NodeType.rectangle,
  width: 100,
  x: 10,
  y: 20,
  ...overrides,
});
