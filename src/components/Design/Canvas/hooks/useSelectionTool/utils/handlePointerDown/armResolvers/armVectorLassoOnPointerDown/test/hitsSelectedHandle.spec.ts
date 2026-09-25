// utils
import { hitsSelectedHandle } from '../hitsSelectedHandle';

const handleHitMock = vi.fn();

vi.mock('../../../../../../../utils/getVectorHandleAtPointAcrossOpenNodes/getVectorHandleAtPointAcrossOpenNodes', () => ({
  getVectorHandleAtPointAcrossOpenNodes: (...args: unknown[]): unknown => handleHitMock(...args),
}));

const context = {
  canvasRefs: {
    vectorEdit: {
      selectedVectorHandlesRef: { current: [{ end: 'start', segmentId: 's1' }] },
      selectedVectorSegmentIdsRef: { current: [] },
      selectedVectorVertexIdsRef: { current: [] },
    },
  },
  point: { x: 1, y: 2 },
  viewport: { x: 0, y: 0, zoom: 1 },
};

describe('hitsSelectedHandle', () => {
  it('should be true when the pointer is on a selected handle', () => {
    // mock
    handleHitMock.mockReturnValue({ hit: { end: 'start', segmentId: 's1' } });

    // result
    expect(hitsSelectedHandle(context as never, ['v'])).toBe(true);
  });

  it('should be false on an unselected handle or off every handle', () => {
    // mock
    handleHitMock
      .mockReturnValueOnce({ hit: { end: 'end', segmentId: 's1' } })
      .mockReturnValueOnce({ hit: { end: 'start', segmentId: 's2' } })
      .mockReturnValueOnce(null);

    // result
    expect(hitsSelectedHandle(context as never, ['v'])).toBe(false);
    expect(hitsSelectedHandle(context as never, ['v'])).toBe(false);
    expect(hitsSelectedHandle(context as never, ['v'])).toBe(false);
  });
});
