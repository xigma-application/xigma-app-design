// store
import { setGridTrackSelection, setGridTrackValueEditRequest } from 'store/design/slice';
import { store } from 'store';

// utils
import { armGridTrackValueEditOnPointerDown } from '../armGridTrackValueEditOnPointerDown';

describe('armGridTrackValueEditOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setGridTrackSelection(null));
    store.dispatch(setGridTrackValueEditRequest(null));
  });

  it('should open a value edit and return true when the clicked value is already part of the current selection', () => {
    // mock
    store.dispatch(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [2] }));
    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 2, frameId: 'frame-1', hoveredHandlePart: 'value', hoveredPillAxis: 'column', rowIndex: 0 },
        },
      },
    };

    // before
    const result = armGridTrackValueEditOnPointerDown({ canvasRefs, dispatch } as never);

    // result
    expect(result).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(setGridTrackValueEditRequest({ axis: 'column', frameId: 'frame-1', index: 2 }));
  });

  it('should keep an existing multi-selection intact — the caller must not also run the ordinary select resolver', () => {
    // mock — the whole point: clicking an already-selected value must not collapse the group,
    // so this resolver must consume the pointerdown itself rather than let selection logic run
    store.dispatch(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [0, 2] }));
    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 0, frameId: 'frame-1', hoveredHandlePart: 'value', hoveredPillAxis: 'column', rowIndex: 0 },
        },
      },
    };

    // before
    const result = armGridTrackValueEditOnPointerDown({ canvasRefs, dispatch } as never);

    // result
    expect(result).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(setGridTrackValueEditRequest({ axis: 'column', frameId: 'frame-1', index: 0 }));
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: setGridTrackSelection.type }));
  });

  it('should return undefined, leaving selection to run, when the clicked value is not yet selected', () => {
    // mock
    store.dispatch(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [1] }));
    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 3, frameId: 'frame-1', hoveredHandlePart: 'value', hoveredPillAxis: 'column', rowIndex: 0 },
        },
      },
    };

    // before
    const result = armGridTrackValueEditOnPointerDown({ canvasRefs, dispatch } as never);

    // result
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should return undefined when nothing is currently selected at all', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 0, frameId: 'frame-1', hoveredHandlePart: 'value', hoveredPillAxis: 'column', rowIndex: 0 },
        },
      },
    };

    // before
    const result = armGridTrackValueEditOnPointerDown({ canvasRefs, dispatch } as never);

    // result
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should return undefined when the selection belongs to a different frame', () => {
    // mock
    store.dispatch(setGridTrackSelection({ axis: 'column', frameId: 'other-frame', indices: [0] }));
    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 0, frameId: 'frame-1', hoveredHandlePart: 'value', hoveredPillAxis: 'column', rowIndex: 0 },
        },
      },
    };

    // before
    const result = armGridTrackValueEditOnPointerDown({ canvasRefs, dispatch } as never);

    // result
    expect(result).toBeUndefined();
  });

  it('should return undefined when the selection belongs to a different axis', () => {
    // mock
    store.dispatch(setGridTrackSelection({ axis: 'row', frameId: 'frame-1', indices: [0] }));
    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 0, frameId: 'frame-1', hoveredHandlePart: 'value', hoveredPillAxis: 'column', rowIndex: 0 },
        },
      },
    };

    // before
    const result = armGridTrackValueEditOnPointerDown({ canvasRefs, dispatch } as never);

    // result
    expect(result).toBeUndefined();
  });

  it('should return undefined when the hovered handle part is the grip, not the value', () => {
    // mock
    store.dispatch(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [0] }));
    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 0, frameId: 'frame-1', hoveredHandlePart: 'grip', hoveredPillAxis: 'column', rowIndex: 0 },
        },
      },
    };

    // before
    const result = armGridTrackValueEditOnPointerDown({ canvasRefs, dispatch } as never);

    // result
    expect(result).toBeUndefined();
  });

  it('should return undefined when nothing is hovered', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = { hover: { hoveredGridTrackAffordanceRef: { current: null } } };

    // before
    const result = armGridTrackValueEditOnPointerDown({ canvasRefs, dispatch } as never);

    // result
    expect(result).toBeUndefined();
  });
});
