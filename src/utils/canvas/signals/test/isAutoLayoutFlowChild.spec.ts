// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { isAutoLayoutFlowChild } from '../isAutoLayoutFlowChild';

const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#000',
  height: 10,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('isAutoLayoutFlowChild', () => {
  it('should return true for a plain box node with no ignoreAutoLayout flag', () => {
    const node = rect({ id: 'a' });

    expect(isAutoLayoutFlowChild('a', { a: node })).toBe(true);
  });

  it('should return false for a box node with ignoreAutoLayout set', () => {
    const node = rect({ id: 'a', ignoreAutoLayout: true });

    expect(isAutoLayoutFlowChild('a', { a: node })).toBe(false);
  });

  it('should return true when the id no longer resolves to a node', () => {
    expect(isAutoLayoutFlowChild('gone', {})).toBe(true);
  });
});
