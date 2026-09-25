// store
import { setImageEditor } from 'store/design/slice';
import { store } from 'store';

// utils
import { armRotateOnPointerDown } from '../armRotateOnPointerDown';

const groupHitMock = vi.fn();
const rotateHandleMock = vi.fn();
const armMock = vi.fn();

vi.mock('../../../../../../utils/getSelectionGroupHit', () => ({
  getSelectionGroupHit: (nodes: unknown, resolve: (group: unknown) => unknown): unknown => {
    resolve('group');
    return groupHitMock(nodes);
  },
}));
vi.mock('../../../../../../utils/getRotateHandleAtPoint', () => ({
  getRotateHandleAtPoint: (...args: unknown[]): unknown => rotateHandleMock(...args),
}));
vi.mock('../../armRotateDrag', () => ({ armRotateDrag: (...args: unknown[]): unknown => armMock(...args) }));

const canvasRefs = { transform: { rotateDragRef: 'ref' } };
const context = {
  canvas: 'canvas',
  canvasRefs,
  event: 'event',
  point: { x: 1, y: 2 },
  selectedNodes: [{ id: 'img' }],
  viewport: 'viewport',
};

describe('armRotateOnPointerDown', () => {
  beforeEach(() => {
    armMock.mockClear();
    groupHitMock.mockReturnValue({ bounds: 'bounds', group: 'group', rotation: 30 });
    store.dispatch(setImageEditor(null));
  });

  it('should arm rotating the selection group whose rotate handle is hit', () => {
    // before
    const result = armRotateOnPointerDown(context as never);

    // result
    expect(result).toBe(true);
    expect(rotateHandleMock).toHaveBeenCalledWith({ x: 1, y: 2 }, 'group', 'viewport');
    expect(armMock).toHaveBeenCalledWith('canvas', 'event', 'ref', 'group', 'bounds', 30, { x: 1, y: 2 }, canvasRefs);
  });

  it('should still rotate while cropping another layer or while the crop frame itself is selected', () => {
    // before
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'other', paintIndex: 0, selectedTarget: 'image' } as never));
    armRotateOnPointerDown(context as never);
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'img', paintIndex: 0, selectedTarget: 'crop' } as never));
    armRotateOnPointerDown(context as never);

    // result
    expect(armMock).toHaveBeenCalledTimes(2);
  });

  it('should leave the pointer to the crop tool while the cropped image of a selected layer is targeted', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'img', paintIndex: 0, selectedTarget: 'image' } as never));

    // result
    expect(armRotateOnPointerDown(context as never)).toBeUndefined();
    expect(armMock).not.toHaveBeenCalled();
  });

  it('should leave the pointer alone when no rotate handle is hit', () => {
    // mock
    groupHitMock.mockReturnValue(null);

    // result
    expect(armRotateOnPointerDown(context as never)).toBeUndefined();
  });
});
