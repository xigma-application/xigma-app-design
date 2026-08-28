import { RefObject } from 'react';

// store
import { addNode, setActiveTool, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveHover } from '../resolveHover';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const addFrameNode = (x: number, y: number, size = 100): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: size, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: size, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('resolveHover', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setSelection([]));
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
    resolveHover(canvas, pointerEvent(0, 0), hoverRef, setClassName, ToolName.default, createCanvasRefs());

    // result — resize wins over the plain node-hover fallback: hover clears, no positioning class
    expect(hoverRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should fall back to plain node hover when no resolver matches', () => {
    // mock
    const idA = addFrameNode(1000, 1000);

    const canvas = createCanvas();
    const hoverRef: RefObject<string | null> = { current: null };
    const setClassName = vi.fn();

    // before
    resolveHover(canvas, pointerEvent(1010, 1010), hoverRef, setClassName, ToolName.default, createCanvasRefs());

    // result
    expect(hoverRef.current).toBe(idA);
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should clear the hover when the fallback point misses every node', () => {
    // mock
    addFrameNode(2000, 2000);

    const canvas = createCanvas();
    const hoverRef: RefObject<string | null> = { current: null };
    const setClassName = vi.fn();

    // before
    resolveHover(canvas, pointerEvent(9000, 9000), hoverRef, setClassName, ToolName.default, createCanvasRefs());

    // result
    expect(hoverRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should keep the comment cursor class (not reset it) while hovering a node under the Comment tool', () => {
    // mock — a selected node's resize handle sits exactly here, which would win under the default
    // tool; the Comment tool must skip all handle/resize resolvers and never touch the selection
    const idA = addFrameNode(3000, 3000);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const hoverRef: RefObject<string | null> = { current: null };
    const setClassName = vi.fn();

    // before
    resolveHover(canvas, pointerEvent(3000, 3000), hoverRef, setClassName, ToolName.comment, createCanvasRefs());

    // result — still hovers the node (for the outline) but the cursor class stays 'comment'
    expect(hoverRef.current).toBe(idA);
    expect(setClassName).toHaveBeenCalledWith('comment');
  });

  it('should keep the comment cursor class over empty canvas under the Comment tool', () => {
    // mock
    addFrameNode(3100, 3100);

    const canvas = createCanvas();
    const hoverRef: RefObject<string | null> = { current: null };
    const setClassName = vi.fn();

    // before
    resolveHover(canvas, pointerEvent(9000, 9000), hoverRef, setClassName, ToolName.comment, createCanvasRefs());

    // result
    expect(hoverRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith('comment');
  });
});
