// store
import { setGradientEditor } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { armGradientRadiusOnPointerDown } from '../armGradientRadiusOnPointerDown';

const armGradientRadiusDragMock = vi.fn();

vi.mock('../../armGradientRadiusDrag', () => ({
  armGradientRadiusDrag: (...args: unknown[]): void => armGradientRadiusDragMock(...args),
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
      type: 'gradient-radial',
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
const canvasRefs = { gradientRadius: { gradientRadiusDragRef: { current: null } } };

// start (0,50), end (100,50) -> the radius handle sits at world (0, 150)

describe('armGradientRadiusOnPointerDown', () => {
  beforeEach(() => {
    armGradientRadiusDragMock.mockClear();
    store.dispatch(setGradientEditor(null));
  });

  it('should arm the radius drag when the handle is hit', () => {
    // mock
    store.dispatch(setGradientEditor({ nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }));

    const dispatch = vi.fn();

    // before
    const result = armGradientRadiusOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 0, y: 150 },
      selectedNodes: [rectangle],
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(result).toBe(true);
    expect(armGradientRadiusDragMock).toHaveBeenCalledWith(canvas, event, canvasRefs.gradientRadius.gradientRadiusDragRef, 'rect-1', 0);
  });

  it('should return undefined and arm nothing when there is no active gradient editor', () => {
    // mock
    const dispatch = vi.fn();

    // before
    const result = armGradientRadiusOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 0, y: 150 },
      selectedNodes: [rectangle],
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(result).toBeUndefined();
    expect(armGradientRadiusDragMock).not.toHaveBeenCalled();
  });

  it('should return undefined when the point is outside the handle tolerance', () => {
    // mock
    store.dispatch(setGradientEditor({ nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }));

    const dispatch = vi.fn();

    // before
    const result = armGradientRadiusOnPointerDown({
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
    expect(armGradientRadiusDragMock).not.toHaveBeenCalled();
  });
});
