// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode } from 'types/design/types';

// utils
import { canExportLineAsSvgVector } from '../canExportLineAsSvgVector';

const line = (overrides: Partial<TLineNode> = {}): TLineNode => ({
  id: 'l',
  name: 'l',
  parentId: null,
  stroke: '#000000',
  type: NodeType.line,
  x1: 0,
  x2: 10,
  y1: 0,
  y2: 0,
  ...overrides,
});

describe('canExportLineAsSvgVector', () => {
  it('should allow a plain line', () => {
    expect(canExportLineAsSvgVector(line(), {})).toBe(true);
  });

  it('should reject a hidden line', () => {
    expect(canExportLineAsSvgVector(line({ hidden: true }), {})).toBe(false);
  });

  it('should reject a line whose ancestor is unsafe', () => {
    const parent: TFrameNode = {
      childIds: ['l'],
      clipContent: true,
      fills: [],
      height: 5,
      id: 'p',
      name: 'p',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 5,
      x: 0,
      y: 0,
    };

    expect(canExportLineAsSvgVector(line({ parentId: 'p' }), { p: parent })).toBe(false);
  });
});
