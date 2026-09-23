// store
import { moveNodes } from 'store/design/slice';
import { store } from 'store';

// types
import { LayoutMode } from 'types/design/enums';
import { TAutoLayoutDropTargetHover } from 'types/design/canvas/types';

// utils
import { addChildren, addFrame, addRoot, makeManualGrid, resetPage } from './multiParentFixtures';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { getGrabbedSlotDelta } from '../getGrabbedSlotDelta';

describe('getGrabbedSlotDelta', () => {
  beforeEach(resetPage);

  it('should read the step count from a same-frame reorder preview of a vertical list', () => {
    // mock
    const frame = addFrame(LayoutMode.vertical, 0, 0);
    const [a] = addChildren(frame, 3);
    const refs = createCanvasRefs({
      transform: {
        autoLayoutReorderPreviewRef: { current: { activeIndex: 2, frameId: frame, positions: {} } },
        dropTargetFrameIdRef: { current: frame },
      },
    });

    // result
    expect(getGrabbedSlotDelta([a], a, refs)).toEqual({ steps: 2, x: 0, y: 2 });
  });

  it('should fall back to the drop indicator index of a horizontal list', () => {
    // mock
    const frame = addFrame(LayoutMode.horizontal, 0, 0);
    const [a] = addChildren(frame, 3);
    const refs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: { current: { frameId: frame, index: 1 } as unknown as TAutoLayoutDropTargetHover },
        dropTargetFrameIdRef: { current: frame },
      },
    });

    // result
    expect(getGrabbedSlotDelta([a], a, refs)).toEqual({ steps: 1, x: 1, y: 0 });
  });

  it('should be a zero-step delta when a list drag has neither preview nor indicator', () => {
    // mock
    const frame = addFrame(LayoutMode.vertical, 0, 0);
    const [a] = addChildren(frame, 3);
    const refs = createCanvasRefs({ transform: { dropTargetFrameIdRef: { current: frame } } });

    // result
    expect(getGrabbedSlotDelta([a], a, refs)).toEqual({ steps: 0, x: 0, y: 0 });
  });

  it('should ignore a reorder preview and indicator that belong to another frame', () => {
    // mock
    const frame = addFrame(LayoutMode.vertical, 0, 0);
    const [a] = addChildren(frame, 3);
    const refs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: { current: { frameId: 'other', index: 2 } as unknown as TAutoLayoutDropTargetHover },
        autoLayoutReorderPreviewRef: { current: { activeIndex: 2, frameId: 'other', positions: {} } },
        dropTargetFrameIdRef: { current: frame },
      },
    });

    // result
    expect(getGrabbedSlotDelta([a], a, refs)).toEqual({ steps: 0, x: 0, y: 0 });
  });

  it('should read the cell delta of a grid drop between the original and the hovered cell', () => {
    // mock
    const frame = addFrame(LayoutMode.grid, 0, 0);
    const [a] = addChildren(frame, 1);

    makeManualGrid(frame, [{ childId: a, column: 0, row: 0 }]);

    const refs = createCanvasRefs({
      transform: {
        dropTargetFrameIdRef: { current: frame },
        gridDropTargetRef: { current: { cells: [{ column: 2, row: 1 }], frameId: frame } },
      },
    });

    // result
    expect(getGrabbedSlotDelta([a], a, refs)).toEqual({ steps: null, x: 2, y: 1 });
  });

  it('should derive the target cell of a grid insert indicator from its reading-order index', () => {
    // mock — 3 columns: insert index 4 is column 1, row 1
    const frame = addFrame(LayoutMode.grid, 0, 0);
    const [a] = addChildren(frame, 1);

    makeManualGrid(frame, [{ childId: a, column: 0, row: 0 }]);

    const refs = createCanvasRefs({
      transform: {
        dropTargetFrameIdRef: { current: frame },
        gridDropTargetRef: { current: { cells: [], frameId: frame, indicator: { column: 1, row: 1, side: 'left' }, insertIndex: 4 } },
      },
    });

    // result
    expect(getGrabbedSlotDelta([a], a, refs)).toEqual({ steps: null, x: 1, y: 1 });
  });

  it('should be a zero cell delta when the grid drag has no hover or the hover belongs to another frame', () => {
    // mock
    const frame = addFrame(LayoutMode.grid, 0, 0);
    const [a] = addChildren(frame, 1);

    makeManualGrid(frame, [{ childId: a, column: 0, row: 0 }]);

    const noHover = createCanvasRefs({ transform: { dropTargetFrameIdRef: { current: frame } } });
    const otherHover = createCanvasRefs({
      transform: {
        dropTargetFrameIdRef: { current: frame },
        gridDropTargetRef: { current: { cells: [{ column: 2, row: 2 }], frameId: 'other' } },
      },
    });

    // result
    expect(getGrabbedSlotDelta([a], a, noHover)).toEqual({ steps: null, x: 0, y: 0 });
    expect(getGrabbedSlotDelta([a], a, otherHover)).toEqual({ steps: null, x: 0, y: 0 });
  });

  it('should use the first node of the group when the grabbed node is not in it', () => {
    // mock
    const frame = addFrame(LayoutMode.grid, 0, 0);
    const [a] = addChildren(frame, 1);

    makeManualGrid(frame, [{ childId: a, column: 0, row: 0 }]);

    const refs = createCanvasRefs({
      transform: {
        dropTargetFrameIdRef: { current: frame },
        gridDropTargetRef: { current: { cells: [{ column: 1, row: 0 }], frameId: frame } },
      },
    });

    // result
    expect(getGrabbedSlotDelta([a], null, refs)).toEqual({ steps: null, x: 1, y: 0 });
  });

  it('should be null when the group was dropped into a different frame', () => {
    // mock
    const frame = addFrame(LayoutMode.vertical, 0, 0);
    const [a] = addChildren(frame, 2);
    const refs = createCanvasRefs({ transform: { dropTargetFrameIdRef: { current: 'elsewhere' } } });

    // result
    expect(getGrabbedSlotDelta([a], a, refs)).toBeNull();
  });

  it('should be null for a free-form parent and for a root node', () => {
    // mock
    const freeform = addFrame(undefined, 0, 0);
    const [child] = addChildren(freeform, 1);
    const root = addRoot(500, 500);

    store.dispatch(moveNodes({ nodeIds: [child], targetIndex: 0, targetParentId: freeform }));

    const insideFreeform = createCanvasRefs({ transform: { dropTargetFrameIdRef: { current: freeform } } });
    const atRoot = createCanvasRefs({ transform: { dropTargetFrameIdRef: { current: null } } });

    // result
    expect(getGrabbedSlotDelta([child], child, insideFreeform)).toBeNull();
    expect(getGrabbedSlotDelta([root], root, atRoot)).toBeNull();
  });

  it('should be null for an empty group', () => {
    // mock
    const refs = createCanvasRefs();

    // result
    expect(getGrabbedSlotDelta([], null, refs)).toBeNull();
  });
});
