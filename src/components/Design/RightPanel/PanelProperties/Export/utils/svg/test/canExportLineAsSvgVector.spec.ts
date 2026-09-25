// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode } from 'types/design/types';

// utils
import { canExportLineAsSvgVector } from '../canExportLineAsSvgVector';

const line = (overrides: Partial<TLineNode> = {}): TLineNode => ({
  height: 0,
  id: 'l',
  name: 'l',
  parentId: null,
  rotation: 0,
  strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  width: 10,
  x: 0,
  y: 0,
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
