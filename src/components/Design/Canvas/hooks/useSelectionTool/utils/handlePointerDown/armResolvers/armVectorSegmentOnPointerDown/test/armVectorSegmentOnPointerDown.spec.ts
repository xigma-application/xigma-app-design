// store
import { setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// utils
import { armVectorSegmentOnPointerDown } from '../armVectorSegmentOnPointerDown';

const edgeHitMock = vi.fn();
const midpointMock = vi.fn();
const clickMock = vi.fn();

vi.mock('../../../../../../../utils/getVectorEdgeAtPointAcrossOpenNodes', () => ({
  getVectorEdgeAtPointAcrossOpenNodes: (...args: unknown[]): unknown => edgeHitMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/getVectorSegmentMidpointAtPoint', () => ({
  getVectorSegmentMidpointAtPoint: (...args: unknown[]): unknown => midpointMock(...args),
}));
vi.mock('../armVectorSegmentClick', () => ({ armVectorSegmentClick: (...args: unknown[]): unknown => clickMock(...args) }));

const context = { canvas: 'canvas', canvasRefs: 'refs', event: 'event', point: { x: 1, y: 2 }, viewport: { x: 0, y: 0, zoom: 1 } };

describe('armVectorSegmentOnPointerDown', () => {
  beforeAll(() => {
    store.dispatch(setVectorEditingNodeIds(['v']));
  });

  afterAll(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  beforeEach(() => {
    clickMock.mockClear();
    edgeHitMock.mockReturnValue({ hit: { segmentId: 's1' }, node: 'node' });
  });

  it('should click the hit segment, allowing a split when pressed on its midpoint', () => {
    // mock
    midpointMock.mockReturnValue({ segmentId: 's1' });

    // before
    const result = armVectorSegmentOnPointerDown(context as never);

    // result
    expect(result).toBe(true);
    expect(clickMock).toHaveBeenCalledWith('canvas', 'event', 'refs', 'node', 's1', true, { x: 1, y: 2 });
  });

  it('should not split when the midpoint belongs to another segment or none is hit', () => {
    // mock
    midpointMock.mockReturnValueOnce({ segmentId: 's2' }).mockReturnValueOnce(null);

    // before
    armVectorSegmentOnPointerDown(context as never);
    armVectorSegmentOnPointerDown(context as never);

    // result
    expect(clickMock.mock.calls.map((call) => call[5])).toEqual([false, false]);
  });

  it('should leave the pointer alone off every segment', () => {
    // mock
    edgeHitMock.mockReturnValue(null);

    // result
    expect(armVectorSegmentOnPointerDown(context as never)).toBeUndefined();
    expect(clickMock).not.toHaveBeenCalled();
  });
});
