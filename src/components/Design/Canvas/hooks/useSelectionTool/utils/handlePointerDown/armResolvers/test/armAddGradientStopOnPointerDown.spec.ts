// store
import { setGradientEditor } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { armAddGradientStopOnPointerDown } from '../armAddGradientStopOnPointerDown';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const rectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
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
  ...overrides,
});

describe('armAddGradientStopOnPointerDown', () => {
  beforeEach(() => {
    store.dispatch(setGradientEditor(null));
  });

  it('should insert a new stop at the clicked position, sorted into place, and select it', () => {
    // mock
    store.dispatch(setGradientEditor({ nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }));

    const dispatch = vi.fn();

    // before — the line runs world (0,50) -> (100,50); clicking its midpoint should insert position 0.5
    const result = armAddGradientStopOnPointerDown({
      dispatch,
      point: { x: 50, y: 50 },
      selectedNodes: [rectangle()],
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(result).toBe(true);

    const updateCall = dispatch.mock.calls.find(([action]) => action.type === 'design/updateNode');
    const fills = updateCall![0].payload.changes.fills;

    expect(fills[0].stops).toHaveLength(3);
    expect(fills[0].stops[1]).toEqual({ color: '#808080', opacity: 100, position: 0.5 });

    const selectCall = dispatch.mock.calls.find(([action]) => action.type === 'design/setGradientEditor');

    expect(selectCall![0].payload).toEqual({ nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: 1 });
  });

  it('should take the actual interpolated gradient color at the clicked position, not just a neighboring stop', () => {
    // mock
    store.dispatch(setGradientEditor({ nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }));

    const dispatch = vi.fn();

    // before — clicking near the black (position 1) end, 80% of the way from white to black (kept
    // outside the endpoint's own 10px rotate-handle radius, which now takes priority closer in)
    const result = armAddGradientStopOnPointerDown({
      dispatch,
      point: { x: 80, y: 50 },
      selectedNodes: [rectangle()],
      viewport: IDENTITY_VIEWPORT,
    } as never);

    expect(result).toBe(true);

    const updateCall = dispatch.mock.calls.find(([action]) => action.type === 'design/updateNode');
    const fills = updateCall![0].payload.changes.fills;
    const newStop = fills[0].stops.find((stop: { position: number }) => stop.position === 0.8);

    // result — the new stop matches the gradient's own rendered color there, so adding it doesn't
    // visually change the gradient at all
    expect(newStop).toEqual({ color: '#333333', opacity: 100, position: 0.8 });
  });

  it('should return undefined and dispatch nothing when there is no active gradient editor', () => {
    // mock
    const dispatch = vi.fn();

    // before
    const result = armAddGradientStopOnPointerDown({
      dispatch,
      point: { x: 50, y: 50 },
      selectedNodes: [rectangle()],
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should return undefined when the point is too far from the line', () => {
    // mock
    store.dispatch(setGradientEditor({ nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }));

    const dispatch = vi.fn();

    // before
    const result = armAddGradientStopOnPointerDown({
      dispatch,
      point: { x: 50, y: 80 },
      selectedNodes: [rectangle()],
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should only touch the fill at the editor’s own paintIndex, leaving earlier fills in the stack untouched', () => {
    // mock — a solid fill stacked below the gradient one being edited (paintIndex: 1)
    store.dispatch(setGradientEditor({ nodeId: 'rect-1', paintIndex: 1, selectedStopIndex: null }));

    const dispatch = vi.fn();
    const solidFill = { color: '#ff0000', opacity: 100, type: 'solid' as const };

    // before
    const result = armAddGradientStopOnPointerDown({
      dispatch,
      point: { x: 50, y: 50 },
      selectedNodes: [rectangle({ fills: [solidFill, ...rectangle().fills] })],
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(result).toBe(true);

    const updateCall = dispatch.mock.calls.find(([action]) => action.type === 'design/updateNode');
    const fills = updateCall![0].payload.changes.fills;

    expect(fills[0]).toEqual(solidFill);
    expect(fills[1].stops).toHaveLength(3);
  });

  it('should return undefined once the gradient is already at MAX_STOPS', () => {
    // mock
    store.dispatch(setGradientEditor({ nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }));

    const dispatch = vi.fn();
    const maxedOutStops = Array.from({ length: 8 }, (_unused, index) => ({
      color: '#ffffff',
      opacity: 100,
      position: index / 7,
    }));

    // before
    const result = armAddGradientStopOnPointerDown({
      dispatch,
      point: { x: 50, y: 50 },
      selectedNodes: [
        rectangle({
          fills: [{ end: { x: 1, y: 0.5 }, opacity: 100, start: { x: 0, y: 0.5 }, stops: maxedOutStops, type: 'gradient-linear' }],
        }),
      ],
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
