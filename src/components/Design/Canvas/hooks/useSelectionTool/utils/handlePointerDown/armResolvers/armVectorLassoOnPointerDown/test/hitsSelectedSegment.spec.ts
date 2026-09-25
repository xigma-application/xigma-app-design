// utils
import { hitsSelectedSegment } from '../hitsSelectedSegment';

const edgeHitMock = vi.fn();

vi.mock('../../../../../../../utils/getVectorEdgeAtPointAcrossOpenNodes', () => ({
  getVectorEdgeAtPointAcrossOpenNodes: (...args: unknown[]): unknown => edgeHitMock(...args),
}));

const context = {
  canvasRefs: { vectorEdit: { selectedVectorSegmentIdsRef: { current: ['s1'] } } },
  point: { x: 1, y: 2 },
  viewport: { x: 0, y: 0, zoom: 1 },
};

describe('hitsSelectedSegment', () => {
  it('should be true on a selected segment and false on another one or off every segment', () => {
    // mock
    edgeHitMock
      .mockReturnValueOnce({ hit: { segmentId: 's1' } })
      .mockReturnValueOnce({ hit: { segmentId: 's2' } })
      .mockReturnValueOnce(null);

    // result
    expect(hitsSelectedSegment(context as never, ['v'])).toBe(true);
    expect(hitsSelectedSegment(context as never, ['v'])).toBe(false);
    expect(hitsSelectedSegment(context as never, ['v'])).toBe(false);
  });
});
