// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode } from 'types/design/types';

// utils
import { canExportLineAsVector } from '../canExportLineAsVector';

const line = (overrides: Partial<TLineNode> = {}): TLineNode => ({
  id: 'l',
  name: 'l',
  parentId: null,
  strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  x1: 0,
  x2: 10,
  y1: 0,
  y2: 0,
  ...overrides,
});

describe('canExportLineAsVector', () => {
  it('should allow a plain line', () => {
    expect(canExportLineAsVector(line(), {})).toBe(true);
  });

  it('should reject a hidden line', () => {
    expect(canExportLineAsVector(line({ hidden: true }), {})).toBe(false);
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

    expect(canExportLineAsVector(line({ parentId: 'p' }), { p: parent })).toBe(false);
  });
});
