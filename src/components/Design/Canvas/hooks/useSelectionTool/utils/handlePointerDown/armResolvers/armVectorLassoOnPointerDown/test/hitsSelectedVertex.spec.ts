// utils
import { hitsSelectedVertex } from '../hitsSelectedVertex';

const vertexHitMock = vi.fn();

vi.mock('../../../../../../../utils/getVectorVertexAtPointAcrossOpenNodes', () => ({
  getVectorVertexAtPointAcrossOpenNodes: (...args: unknown[]): unknown => vertexHitMock(...args),
}));

const context = {
  canvasRefs: { vectorEdit: { selectedVectorVertexIdsRef: { current: ['a'] } } },
  point: { x: 1, y: 2 },
  viewport: { x: 0, y: 0, zoom: 1 },
};

describe('hitsSelectedVertex', () => {
  it('should be true on a selected vertex and false on another one or off every vertex', () => {
    // mock
    vertexHitMock.mockReturnValueOnce({ vertexId: 'a' }).mockReturnValueOnce({ vertexId: 'b' }).mockReturnValueOnce(null);

    // result
    expect(hitsSelectedVertex(context as never, ['v'])).toBe(true);
    expect(hitsSelectedVertex(context as never, ['v'])).toBe(false);
    expect(hitsSelectedVertex(context as never, ['v'])).toBe(false);
  });
});
