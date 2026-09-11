// store
import { setGridSettingsPanelOpen, setGridTrackSelection, setPanelGridTrackSelection } from 'store/design/slice';
import { store } from 'store';

// utils
import { armGridTrackAffordanceOnPointerDown } from '../armGridTrackAffordanceOnPointerDown';

const armGridTrackAffordanceDragMock = vi.fn();

vi.mock('../../armGridTrackAffordanceDrag', () => ({
  armGridTrackAffordanceDrag: (...args: unknown[]): void => armGridTrackAffordanceDragMock(...args),
}));

const plainEvent = { ctrlKey: false, metaKey: false, shiftKey: false };
const canvas = {} as HTMLCanvasElement;
const point = { x: 10, y: 20 };

describe('armGridTrackAffordanceOnPointerDown', () => {
  beforeEach(() => {
    armGridTrackAffordanceDragMock.mockClear();
  });

  afterEach(() => {
    store.dispatch(setGridTrackSelection(null));
    store.dispatch(setPanelGridTrackSelection(null));
  });

  it('should select the hovered column track and open the grid settings panel, and return true', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 2, frameId: 'frame-1', hoveredHandlePart: 'value', hoveredPillAxis: 'column', rowIndex: 0 },
        },
      },
      transform: { gridTrackAffordanceDragRef: { current: null } },
    };

    // before
    const result = armGridTrackAffordanceOnPointerDown({ canvas, canvasRefs, dispatch, event: plainEvent } as never);

    // result
    expect(result).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [2] }));
    expect(dispatch).toHaveBeenCalledWith(setPanelGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [2] }));
    expect(dispatch).toHaveBeenCalledWith(setGridSettingsPanelOpen(true));
    expect(armGridTrackAffordanceDragMock).not.toHaveBeenCalled();
  });

  it('should select the hovered row track when the value of the row pill is hovered', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 0, frameId: 'frame-1', hoveredHandlePart: 'value', hoveredPillAxis: 'row', rowIndex: 3 },
        },
      },
      transform: { gridTrackAffordanceDragRef: { current: null } },
    };

    // before
    armGridTrackAffordanceOnPointerDown({ canvas, canvasRefs, dispatch, event: plainEvent } as never);

    // result
    expect(dispatch).toHaveBeenCalledWith(setGridTrackSelection({ axis: 'row', frameId: 'frame-1', indices: [3] }));
  });

  it('should return undefined and dispatch nothing when no pill is hovered', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = {
      hover: { hoveredGridTrackAffordanceRef: { current: null } },
      transform: { gridTrackAffordanceDragRef: { current: null } },
    };

    // before
    const result = armGridTrackAffordanceOnPointerDown({ canvas, canvasRefs, dispatch, event: plainEvent } as never);

    // result
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
    expect(armGridTrackAffordanceDragMock).not.toHaveBeenCalled();
  });

  it('should return undefined when hovering the affordance zone but not directly over a pill', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 0, frameId: 'frame-1', hoveredHandlePart: null, hoveredPillAxis: null, rowIndex: 0 },
        },
      },
      transform: { gridTrackAffordanceDragRef: { current: null } },
    };

    // before
    const result = armGridTrackAffordanceOnPointerDown({ canvas, canvasRefs, dispatch, event: plainEvent } as never);

    // result
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should add the clicked track to the current selection on a Cmd/Ctrl click', () => {
    // mock
    store.dispatch(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [1] }));

    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 3, frameId: 'frame-1', hoveredHandlePart: 'value', hoveredPillAxis: 'column', rowIndex: 0 },
        },
      },
      transform: { gridTrackAffordanceDragRef: { current: null } },
    };

    // before
    armGridTrackAffordanceOnPointerDown({ canvas, canvasRefs, dispatch, event: { ...plainEvent, metaKey: true } } as never);

    // result
    expect(dispatch).toHaveBeenCalledWith(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [1, 3] }));
  });

  it('should select the inclusive range from the last selected track to the clicked one on a Shift click', () => {
    // mock
    store.dispatch(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [1] }));

    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 3, frameId: 'frame-1', hoveredHandlePart: 'value', hoveredPillAxis: 'column', rowIndex: 0 },
        },
      },
      transform: { gridTrackAffordanceDragRef: { current: null } },
    };

    // before
    armGridTrackAffordanceOnPointerDown({ canvas, canvasRefs, dispatch, event: { ...plainEvent, shiftKey: true } } as never);

    // result
    expect(dispatch).toHaveBeenCalledWith(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [1, 2, 3] }));
  });

  it('should ignore a current selection that belongs to a different axis when computing the click result', () => {
    // mock — the previous selection was on rows; clicking a column pill should start a fresh column selection
    store.dispatch(setGridTrackSelection({ axis: 'row', frameId: 'frame-1', indices: [1] }));

    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 3, frameId: 'frame-1', hoveredHandlePart: 'value', hoveredPillAxis: 'column', rowIndex: 0 },
        },
      },
      transform: { gridTrackAffordanceDragRef: { current: null } },
    };

    // before
    armGridTrackAffordanceOnPointerDown({ canvas, canvasRefs, dispatch, event: { ...plainEvent, metaKey: true } } as never);

    // result
    expect(dispatch).toHaveBeenCalledWith(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [3] }));
  });

  it('should arm a grip drag instead of dispatching a click selection, and return true', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 0, frameId: 'frame-1', hoveredHandlePart: 'grip', hoveredPillAxis: 'row', rowIndex: 3 },
        },
      },
      transform: { gridTrackAffordanceDragRef: { current: null } },
    };

    // before
    const result = armGridTrackAffordanceOnPointerDown({ canvas, canvasRefs, dispatch, event: plainEvent, point } as never);

    // result
    expect(result).toBe(true);
    expect(armGridTrackAffordanceDragMock).toHaveBeenCalledWith(
      canvas,
      plainEvent,
      canvasRefs.transform.gridTrackAffordanceDragRef,
      dispatch,
      'frame-1',
      'row',
      3,
      point,
    );
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should toggle a Cmd/Ctrl-held grip click into a select instead of dragging, matching the panel’s own handle behaviour', () => {
    // mock
    store.dispatch(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [0] }));

    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 2, frameId: 'frame-1', hoveredHandlePart: 'grip', hoveredPillAxis: 'column', rowIndex: 0 },
        },
      },
      transform: { gridTrackAffordanceDragRef: { current: null } },
    };

    // before
    armGridTrackAffordanceOnPointerDown({ canvas, canvasRefs, dispatch, event: { ...plainEvent, metaKey: true }, point } as never);

    // result
    expect(dispatch).toHaveBeenCalledWith(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [0, 2] }));
    expect(dispatch).toHaveBeenCalledWith(setPanelGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [0, 2] }));
    expect(armGridTrackAffordanceDragMock).not.toHaveBeenCalled();
  });

  it('should toggle a Shift-held grip click into a range-select instead of dragging', () => {
    // mock
    store.dispatch(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [0] }));

    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 2, frameId: 'frame-1', hoveredHandlePart: 'grip', hoveredPillAxis: 'column', rowIndex: 0 },
        },
      },
      transform: { gridTrackAffordanceDragRef: { current: null } },
    };

    // before
    armGridTrackAffordanceOnPointerDown({ canvas, canvasRefs, dispatch, event: { ...plainEvent, shiftKey: true }, point } as never);

    // result
    expect(dispatch).toHaveBeenCalledWith(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [0, 1, 2] }));
    expect(armGridTrackAffordanceDragMock).not.toHaveBeenCalled();
  });

  it('should still arm a plain (unmodified) grip click as a drag', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 2, frameId: 'frame-1', hoveredHandlePart: 'grip', hoveredPillAxis: 'column', rowIndex: 0 },
        },
      },
      transform: { gridTrackAffordanceDragRef: { current: null } },
    };

    // before
    armGridTrackAffordanceOnPointerDown({ canvas, canvasRefs, dispatch, event: plainEvent, point } as never);

    // result
    expect(armGridTrackAffordanceDragMock).toHaveBeenCalledWith(
      canvas,
      plainEvent,
      canvasRefs.transform.gridTrackAffordanceDragRef,
      dispatch,
      'frame-1',
      'column',
      2,
      point,
    );
    expect(dispatch).not.toHaveBeenCalled();
  });
});
