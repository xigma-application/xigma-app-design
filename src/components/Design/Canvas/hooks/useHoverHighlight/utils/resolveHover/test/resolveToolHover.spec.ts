import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { resolveToolHover } from '../resolveToolHover';

const createCanvas = (): HTMLCanvasElement => document.createElement('canvas');

const addFrameNode = (x: number, y: number, size = 100): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: size, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: size, x, y }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('resolveToolHover', () => {
  beforeEach(() => {
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
    resolveToolHover(canvas, hoverRef, setClassName, ToolName.default, { x: 0, y: 0 }, IDENTITY_VIEWPORT, store.getState());

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
    resolveToolHover(canvas, hoverRef, setClassName, ToolName.default, { x: 1010, y: 1010 }, IDENTITY_VIEWPORT, store.getState());

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
    resolveToolHover(canvas, hoverRef, setClassName, ToolName.default, { x: 9000, y: 9000 }, IDENTITY_VIEWPORT, store.getState());

    // result
    expect(hoverRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith(null);
  });
});
