// store
import { setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// utils
import { armVectorHandleOnPointerDown } from '../armVectorHandleOnPointerDown';

const handleHitMock = vi.fn();
const clickMock = vi.fn();

vi.mock('../../../../../../../utils/getVectorHandleAtPointAcrossOpenNodes/getVectorHandleAtPointAcrossOpenNodes', () => ({
  getVectorHandleAtPointAcrossOpenNodes: (...args: unknown[]): unknown => handleHitMock(...args),
}));
vi.mock('../armVectorHandleClick', () => ({ armVectorHandleClick: (...args: unknown[]): unknown => clickMock(...args) }));

const context = {
  canvas: 'canvas',
  canvasRefs: {
    vectorEdit: {
      selectedVectorHandlesRef: { current: ['h'] },
      selectedVectorSegmentIdsRef: { current: ['s'] },
      selectedVectorVertexIdsRef: { current: ['a'] },
    },
  },
  event: 'event',
  point: { x: 1, y: 2 },
  selectionRefs: 'selectionRefs',
  viewport: { x: 0, y: 0, zoom: 1 },
};

describe('armVectorHandleOnPointerDown', () => {
  beforeAll(() => {
    store.dispatch(setVectorEditingNodeIds(['v']));
  });

  afterAll(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should handle a click on a vector handle of the edited vectors', () => {
    // mock
    handleHitMock.mockReturnValue({ hit: 'hit', node: 'node' });

    // before
    const result = armVectorHandleOnPointerDown(context as never);

    // result
    expect(result).toBe(true);
    expect(handleHitMock).toHaveBeenCalledWith({ x: 1, y: 2 }, ['v'], expect.any(Object), expect.any(Number), ['a'], ['h'], ['s']);
    expect(clickMock).toHaveBeenCalledWith('canvas', 'event', context.canvasRefs, 'selectionRefs', 'node', 'hit', { x: 1, y: 2 });
  });

  it('should leave the pointer alone when no handle is hit', () => {
    // mock
    handleHitMock.mockReturnValue(null);
    clickMock.mockClear();

    // result
    expect(armVectorHandleOnPointerDown(context as never)).toBeUndefined();
    expect(clickMock).not.toHaveBeenCalled();
  });
});
