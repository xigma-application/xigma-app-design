// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { hasVectorStroke } from '../hasVectorStroke';

const rectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [],
  height: 10,
  id: 'r',
  name: 'r',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('hasVectorStroke', () => {
  it('should be true with stroke paints and a positive width', () => {
    expect(hasVectorStroke(rectangle({ strokeWidth: 1, strokes: [{ color: '#000000', opacity: 100, type: 'solid' }] }))).toBe(true);
  });

  it('should be false without paints, with an empty list, or without width', () => {
    expect(hasVectorStroke(rectangle({ strokeWidth: 1 }))).toBe(false);
    expect(hasVectorStroke(rectangle({ strokeWidth: 1, strokes: [] }))).toBe(false);
    expect(hasVectorStroke(rectangle({ strokes: [{ color: '#000000', opacity: 100, type: 'solid' }] }))).toBe(false);
  });
});
