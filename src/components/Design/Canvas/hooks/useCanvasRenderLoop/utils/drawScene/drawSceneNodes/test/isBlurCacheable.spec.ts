// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { isBlurCacheable } from '../isBlurCacheable';

const node = {
  fills: [{ color: '#000000', opacity: 100, type: 'solid' }],
  id: 'r1',
  type: NodeType.rectangle,
} as unknown as TRectangleNode;

describe('isBlurCacheable', () => {
  it('should allow solid and gradient paints', () => {
    // result
    expect(isBlurCacheable(node)).toBe(true);
    expect(isBlurCacheable({ ...node, fills: [{ type: 'gradient-linear' }] } as unknown as TRectangleNode)).toBe(true);
  });

  it('should refuse image paints in fills or strokes, which may load after the first frame', () => {
    // result
    expect(isBlurCacheable({ ...node, fills: [{ type: 'image' }] } as unknown as TRectangleNode)).toBe(false);
    expect(isBlurCacheable({ ...node, strokes: [{ type: 'pattern' }] } as unknown as TRectangleNode)).toBe(false);
  });
});
