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

    // before — 8px from the start endpoint, past the inner move zone, within the outer rotate ring
    const result = armGradientRotateOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 8, y: 50 },
      selectedNodes: [rectangle],
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result — start (0,50) and end (100,50) are perfectly antipodal through the box center, so the
    // angle offset is a no-op (0, modulo the 2π wraparound atan2 happens to produce here)
    expect(result).toBe(true);
    expect(armGradientRotateDragMock).toHaveBeenCalledWith(
      canvas,
      event,
      canvasRefs.gradientRotate.gradientRotateDragRef,
      'rect-1',
      0,
      'start',
      { x: 8, y: 50 },
      'box',
      { x: 50, y: 50 },
      50,
      -2 * Math.PI,
    );
  });

  it('should arm in "line" mode, pivoting around the line\'s own midpoint, when the endpoints do not sit on the box edge', () => {
    // mock — a short gradient fully inside the box, from (30,50) to (70,60): neither end touches an edge
    store.dispatch(setGradientEditor({ nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }));

    const dispatch = vi.fn();
    const insideRectangle: TRectangleNode = {
      ...rectangle,
      fills: [{ ...rectangle.fills[0], end: { x: 0.7, y: 0.6 }, start: { x: 0.3, y: 0.5 } } as TRectangleNode['fills'][0]],
    };

    // before — hit-test 7px from the start endpoint (30,50), past its inner move zone
    const result = armGradientRotateOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 37, y: 50 },
      selectedNodes: [insideRectangle],
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(result).toBe(true);

    const [, , , , , , , mode, pivot, radius] = armGradientRotateDragMock.mock.calls[0];

    expect(mode).toBe('line');
    expect(pivot.x).toBeCloseTo(50, 5);
    expect(pivot.y).toBeCloseTo(55, 5);
    expect(radius).toBeCloseTo(Math.hypot(40, 10) / 2, 5);
  });

  it('should stay in "box" mode for a corner-to-corner line, even though both corners share the bottom edge — each also touches a distinct edge (left vs right)', () => {
    // mock — start at the bottom-left corner (0,100), end at the bottom-right corner (100,100)
    store.dispatch(setGradientEditor({ nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }));

    const dispatch = vi.fn();
    const cornerRectangle: TRectangleNode = {
      ...rectangle,
      fills: [{ ...rectangle.fills[0], end: { x: 1, y: 1 }, start: { x: 0, y: 1 } } as TRectangleNode['fills'][0]],
    };

    // before — 8px from the start corner, past its inner move zone
    const result = armGradientRotateOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 8, y: 100 },
      selectedNodes: [cornerRectangle],
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result — "box" mode ignores the stored pivot/radius at continue-time (it recomputes from the
    // live bounds center each frame instead), so only the mode itself matters here
    expect(result).toBe(true);

    const [, , , , , , , mode] = armGradientRotateDragMock.mock.calls[0];

    expect(mode).toBe('box');
  });

  it('should fall back to "line" mode when both endpoints sit on the same single edge — no distinct wall to justify a box-center pivot', () => {
    // mock — both endpoints sit only on the top edge, at different x positions
    store.dispatch(setGradientEditor({ nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }));

    const dispatch = vi.fn();
    const sameEdgeRectangle: TRectangleNode = {
      ...rectangle,
      fills: [{ ...rectangle.fills[0], end: { x: 0.8, y: 0 }, start: { x: 0.2, y: 0 } } as TRectangleNode['fills'][0]],
    };

    // before — 8px from the start endpoint (20,0), past its inner move zone
    const result = armGradientRotateOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 20, y: 8 },
      selectedNodes: [sameEdgeRectangle],
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(result).toBe(true);

    const [, , , , , , , mode, pivot, radius] = armGradientRotateDragMock.mock.calls[0];

    expect(mode).toBe('line');
    expect(pivot).toEqual({ x: 50, y: 0 });
    expect(radius).toBeCloseTo(30, 5);
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
