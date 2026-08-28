import { RefObject } from 'react';

// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveToolHover } from '../resolveToolHover';

vi.mock('utils/canvas/getRotatedResizeCursorUrl', () => ({ getRotatedResizeCursorUrl: vi.fn(() => 'url(resize.png), auto') }));

const createCanvas = (): HTMLCanvasElement => document.createElement('canvas');

const addFrameNode = (x: number, y: number, size = 100): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: size, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: size, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addSquareVectorNode = (x: number, y: number, size = 100): string => {
  store.dispatch(
    addNode({
      fillColor: '#ff0000',
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
        s4: { endId: 'v1', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        v1: { id: 'v1', x, y },
        v2: { id: 'v2', x: x + size, y },
        v3: { id: 'v3', x: x + size, y: y + size },
        v4: { id: 'v4', x, y: y + size },
      },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('resolveToolHover', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should apply the first matching resolver result and stop checking the rest', () => {
    // mock — a selected node's own "nw" resize handle also sits under the fallback node-hover check;
    // resize must win, proving the loop stops at the first matching resolver instead of falling through
    const idA = addFrameNode(0, 0);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const hoverRef: RefObject<string | null> = { current: null };
    const setClassName = vi.fn();

    // before
    resolveToolHover(
      canvas,
      hoverRef,
      setClassName,
      ToolName.default,
      { x: 0, y: 0 },
      IDENTITY_VIEWPORT,
      store.getState(),
      createCanvasRefs(),
    );

    // result — resize wins over the plain node-hover fallback: hover clears, no positioning class
    expect(hoverRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should not show a resize/rotate handle cursor for a vector node currently in Vector Edit Mode', () => {
    // mock — the same "nw" corner that wins as a resize handle for a plain selected node (above) must
    const idA = addSquareVectorNode(0, 0);

    store.dispatch(setSelection([idA]));
    store.dispatch(setVectorEditingNodeIds([idA]));

    const canvas = createCanvas();
    const hoverRef: RefObject<string | null> = { current: null };
    const setClassName = vi.fn();

    // before
    resolveToolHover(
      canvas,
      hoverRef,
      setClassName,
      ToolName.default,
      { x: 0, y: 0 },
      IDENTITY_VIEWPORT,
      store.getState(),
      createCanvasRefs(),
    );

    // result — falls through past the (suppressed) resize resolver to plain node hover instead
    expect(hoverRef.current).toBe(idA);
  });

  it('should show a resize cursor when hovering a corner of the bounding box of 2+ selected vertices in Vector Edit Mode — the actual bug this covers: a standalone resolver in useSelectionTool used to lose a race against this hook’s own pointermove listener, which always runs afterward and clears canvas.style.cursor back to blank', () => {
    // mock — v1(0,0)/v3(100,100) selected (diagonal corners), bounds "se" at (100,100)
    const idA = addSquareVectorNode(0, 0);

    store.dispatch(setVectorEditingNodeIds([idA]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v3'];

    const canvas = createCanvas();
    const hoverRef: RefObject<string | null> = { current: null };
    const setClassName = vi.fn();

    // before
    resolveToolHover(canvas, hoverRef, setClassName, ToolName.default, { x: 100, y: 100 }, IDENTITY_VIEWPORT, store.getState(), canvasRefs);

    // result — the resolver's own cursor write lands on the canvas element, independent of setClassName
    // (which stays a no-op throughout Vector Edit Mode)
    expect(canvas.style.cursor).toBe('url(resize.png), auto');
    expect(hoverRef.current).toBeNull();
  });

  it('should fall back to plain node hover when no resolver matches', () => {
    // mock
    const idA = addFrameNode(1000, 1000);

    const canvas = createCanvas();
    const hoverRef: RefObject<string | null> = { current: null };
    const setClassName = vi.fn();

    // before
    resolveToolHover(
      canvas,
      hoverRef,
      setClassName,
      ToolName.default,
      { x: 1010, y: 1010 },
      IDENTITY_VIEWPORT,
      store.getState(),
      createCanvasRefs(),
    );

    // result
    expect(hoverRef.current).toBe(idA);
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should clear the hover when the point misses every resolver and every node', () => {
    // mock
    addFrameNode(2000, 2000);

    const canvas = createCanvas();
    const hoverRef: RefObject<string | null> = { current: null };
    const setClassName = vi.fn();

    // before
    resolveToolHover(
      canvas,
      hoverRef,
      setClassName,
      ToolName.default,
      { x: 9000, y: 9000 },
      IDENTITY_VIEWPORT,
      store.getState(),
      createCanvasRefs(),
    );

    // result
    expect(hoverRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith(null);
  });
});
