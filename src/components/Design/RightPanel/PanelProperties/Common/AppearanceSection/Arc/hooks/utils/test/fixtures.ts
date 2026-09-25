// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

export const makeEllipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fill: '#d9d9d9',
  height: 100,
  id: 'ellipse',
  name: 'Ellipse',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});
