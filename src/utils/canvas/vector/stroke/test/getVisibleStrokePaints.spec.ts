// utils
import { getVisibleStrokePaints } from '../getVisibleStrokePaints';

describe('getVisibleStrokePaints', () => {
  it('should drop the hidden strokes', () => {
    // mock
    const visible = { color: '#ff0000', opacity: 100, type: 'solid' as const };
    const hidden = { color: '#00ff00', opacity: 100, type: 'solid' as const, visible: false };

    // result
    expect(getVisibleStrokePaints([visible, hidden])).toEqual([visible]);
  });
});
