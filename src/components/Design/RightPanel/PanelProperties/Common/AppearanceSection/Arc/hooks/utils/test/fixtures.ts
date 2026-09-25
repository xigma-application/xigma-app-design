// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

export const makeEllipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fills: [{ color: '#d9d9d9', opacity: 100, type: 'solid' }],
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
