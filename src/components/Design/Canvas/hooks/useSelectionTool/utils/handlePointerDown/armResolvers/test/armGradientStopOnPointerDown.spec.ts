// store
import { setGradientEditor } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { armGradientStopOnPointerDown } from '../armGradientStopOnPointerDown';

const armGradientStopDragMock = vi.fn();

vi.mock('../../armGradientStopDrag', () => ({
  armGradientStopDrag: (...args: unknown[]): void => armGradientStopDragMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const rectangle: TRectangleNode = {
  fills: [
    {
      end: { x: 1, y: 0.5 },
      opacity: 100,
      start: { x: 0, y: 0.5 },
      stops: [
        { color: '#ffffff', opacity: 100, position: 0 },
        { color: '#000000', opacity: 100, position: 1 },
      ],
      type: 'gradient-linear',
    },
  ],
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
};

const canvas = {} as HTMLCanvasElement;
const event = {} as PointerEvent;
const canvasRefs = { gradientStop: { gradientStopDragRef: { current: null } } };

describe('armGradientStopOnPointerDown', () => {
  beforeEach(() => {
    armGradientStopDragMock.mockClear();
    store.dispatch(setGradientEditor(null));
  });

  it('should arm the drag and select the hit stop when there is an active gradient editor and the point lands on a stop', () => {
    // mock
    store.dispatch(setGradientEditor({ nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }));

    const dispatch = vi.fn();

    // before — stop 1 world position: (100, 50) offset up by 22 -> (100, 28)
    const result = armGradientStopOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 100, y: 28 },
      selectedNodes: [rectangle],
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(result).toBe(true);
    expect(armGradientStopDragMock).toHaveBeenCalledWith(
      canvas,
      event,
      canvasRefs.gradientStop.gradientStopDragRef,
      'rect-1',
      0,
      1,
      '#000000',
      100,
    );
    expect(dispatch).toHaveBeenCalledWith(setGradientEditor({ nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: 1 }));
  });

  it('should return undefined and arm nothing when there is no active gradient editor', () => {
    // mock
    const dispatch = vi.fn();

    // before
    const result = armGradientStopOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 100, y: 28 },
      selectedNodes: [rectangle],
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(result).toBeUndefined();
    expect(armGradientStopDragMock).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should return undefined when the point is far from every stop', () => {
    // mock
    store.dispatch(setGradientEditor({ nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }));

    const dispatch = vi.fn();

    // before
    const result = armGradientStopOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 50, y: 28 },
      selectedNodes: [rectangle],
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(result).toBeUndefined();
    expect(armGradientStopDragMock).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
