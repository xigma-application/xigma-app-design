// types
import { TPaint } from 'types/design/paint/types';

// utils
import { getVisibleSolidStrokePaints } from '../getVisibleSolidStrokePaints';

describe('getVisibleSolidStrokePaints', () => {
  it('should keep only the visible solid strokes', () => {
    // mock
    const solid: TPaint = { color: '#ff0000', opacity: 100, type: 'solid' };
    const hidden: TPaint = { color: '#00ff00', opacity: 100, type: 'solid', visible: false };
    const image: TPaint = { opacity: 100, ref: 'blob:image', rotation: 0, scaleMode: 'fill', type: 'image' };

    // result
    expect(getVisibleSolidStrokePaints([solid, hidden, image])).toEqual([solid]);
  });
});
