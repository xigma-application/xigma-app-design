// store
import { setGradientEditor } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { armGradientRotateOnPointerDown } from '../armGradientRotateOnPointerDown';

const armGradientRotateDragMock = vi.fn();

vi.mock('../../armGradientRotateDrag', () => ({
  armGradientRotateDrag: (...args: unknown[]): void => armGradientRotateDragMock(...args),
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
const canvasRefs = { gradientRotate: { gradientRotateDragRef: { current: null } } };

// the line runs world (0,50) -> (100,50): start at (0,50), end at (100,50)

describe('armGradientRotateOnPointerDown', () => {
  beforeEach(() => {
    armGradientRotateDragMock.mockClear();
    store.dispatch(setGradientEditor(null));
  });

  it('should arm the rotate drag on the start endpoint', () => {
    // mock
    store.dispatch(setGradientEditor({ nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }));

    const dispatch = vi.fn();

    // before
    const result = armGradientRotateOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 5, y: 50 },
      selectedNodes: [rectangle],
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(result).toBe(true);
    expect(armGradientRotateDragMock).toHaveBeenCalledWith(
      canvas,
      event,
      canvasRefs.gradientRotate.gradientRotateDragRef,
      'rect-1',
      0,
      'start',
      { x: 5, y: 50 },
    );
  });

  it('should return undefined and arm nothing when there is no active gradient editor', () => {
    // mock
    const dispatch = vi.fn();

    // before
    const result = armGradientRotateOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 5, y: 50 },
      selectedNodes: [rectangle],
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(result).toBeUndefined();
    expect(armGradientRotateDragMock).not.toHaveBeenCalled();
  });

  it('should return undefined when the point is far from every endpoint', () => {
    // mock
    store.dispatch(setGradientEditor({ nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }));

    const dispatch = vi.fn();

    // before
    const result = armGradientRotateOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 50, y: 50 },
      selectedNodes: [rectangle],
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(result).toBeUndefined();
    expect(armGradientRotateDragMock).not.toHaveBeenCalled();
  });
});
