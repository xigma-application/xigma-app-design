// store
import { setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// utils
import { armVectorVertexOnPointerDown } from '../armVectorVertexOnPointerDown';

const vertexHitMock = vi.fn();
const clickMock = vi.fn();

vi.mock('../../../../../../../utils/getVectorVertexAtPointAcrossOpenNodes', () => ({
  getVectorVertexAtPointAcrossOpenNodes: (...args: unknown[]): unknown => vertexHitMock(...args),
}));
vi.mock('../armVectorVertexClick', () => ({ armVectorVertexClick: (...args: unknown[]): unknown => clickMock(...args) }));

const context = {
  canvas: 'canvas',
  canvasRefs: 'refs',
  event: 'event',
  point: { x: 1, y: 2 },
  selectionRefs: 'selectionRefs',
  viewport: { x: 0, y: 0, zoom: 1 },
};

describe('armVectorVertexOnPointerDown', () => {
  beforeAll(() => {
    store.dispatch(setVectorEditingNodeIds(['v']));
  });

  afterAll(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should click the hit vertex of an edited vector', () => {
    // mock
    vertexHitMock.mockReturnValue({ node: 'node', vertexId: 'a' });

    // before
    const result = armVectorVertexOnPointerDown(context as never);

    // result
    expect(result).toBe(true);
    expect(clickMock).toHaveBeenCalledWith('canvas', 'event', 'refs', 'selectionRefs', 'node', { vertexId: 'a' }, { x: 1, y: 2 });
  });

  it('should leave the pointer alone off every vertex', () => {
    // mock
    vertexHitMock.mockReturnValue(null);
    clickMock.mockClear();

    // result
    expect(armVectorVertexOnPointerDown(context as never)).toBeUndefined();
    expect(clickMock).not.toHaveBeenCalled();
  });
});
