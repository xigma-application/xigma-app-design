// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode } from 'types/design/types';

// utils
import { getResizeHandleAtPoint } from '../getResizeHandleAtPoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const frame = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  parentId: string | null = null,
  rotation = 0,
): TFrameNode => ({
  fill: '#ff0000',
  height,
  id,
  name: 'Frame',
  parentId,
  rotation,
  type: NodeType.frame,
  width,
  x,
  y,
});

const line: TLineNode = {
  id: 'line-1',
  name: 'Line',
  parentId: null,
  stroke: '#000000',
  type: NodeType.line,
  x1: 0,
  x2: 100,
  y1: 0,
  y2: 0,
};

describe('getResizeHandleAtPoint', () => {
  it('should return null when nothing is selected', () => {
    // result
    expect(getResizeHandleAtPoint({ x: 0, y: 0 }, [], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null when the single selected node is a line', () => {
    // result
    expect(getResizeHandleAtPoint({ x: 0, y: 0 }, [line], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null when the selected nodes are multiple but do not share a parent', () => {
    // mock
    const nodeA = frame('a', 0, 0, 100, 100, null);
    const nodeB = frame('b', 200, 0, 100, 100, 'other-parent');

    // result
    expect(getResizeHandleAtPoint({ x: 0, y: 0 }, [nodeA, nodeB], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should detect each corner handle on a single selected node, with its own rotation', () => {
    // mock
    const node = frame('a', 0, 0, 100, 100, null, 30);

    // result
    expect(getResizeHandleAtPoint({ x: 0, y: 0 }, [node], IDENTITY_VIEWPORT)).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'nw',
      rotation: 30,
    });
    expect(getResizeHandleAtPoint({ x: 100, y: 0 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ handle: 'ne' });
    expect(getResizeHandleAtPoint({ x: 100, y: 100 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ handle: 'se' });
    expect(getResizeHandleAtPoint({ x: 0, y: 100 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ handle: 'sw' });
  });

  it('should detect each edge handle on a single selected node', () => {
    // mock
    const node = frame('a', 0, 0, 100, 100);

    // result
    expect(getResizeHandleAtPoint({ x: 50, y: 0 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ handle: 'n' });
    expect(getResizeHandleAtPoint({ x: 50, y: 100 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ handle: 's' });
    expect(getResizeHandleAtPoint({ x: 0, y: 50 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ handle: 'w' });
    expect(getResizeHandleAtPoint({ x: 100, y: 50 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ handle: 'e' });
  });

  it('should not detect an edge handle outside the bounds span, or far from any edge', () => {
    // mock
    const node = frame('a', 0, 0, 100, 100);

    // result — above the top-left corner's hit radius, so out of the horizontal span for "n"
    expect(getResizeHandleAtPoint({ x: -20, y: 0 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    // dead center, far from every corner and edge
    expect(getResizeHandleAtPoint({ x: 50, y: 50 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should prioritize a corner over an overlapping edge', () => {
    // mock
    const node = frame('a', 0, 0, 100, 100);

    // result — (0,0) is within both the "nw" corner radius and the "n"/"w" edge tolerance
    expect(getResizeHandleAtPoint({ x: 0, y: 0 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ handle: 'nw' });
  });

  it('should widen the hit radius in world units as the viewport zooms out', () => {
    // mock
    const node = frame('a', 0, 0, 100, 100);

    // result — CORNER_HANDLE_SIZE is 6, so 10 world units off the "nw" corner misses at zoom 1
    // but hits at zoom 0.5 (12px radius covers more world space)
    expect(getResizeHandleAtPoint({ x: -10, y: 0 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    expect(getResizeHandleAtPoint({ x: -10, y: 0 }, [node], { x: 0, y: 0, zoom: 0.5 })).toMatchObject({ handle: 'nw' });
  });

  it('should use the combined bounds and zero rotation for a group selection', () => {
    // mock
    const nodeA = frame('a', 0, 0, 100, 100, 'parent-1');
    const nodeB = frame('b', 200, 0, 100, 100, 'parent-1');

    // result
    expect(getResizeHandleAtPoint({ x: 0, y: 0 }, [nodeA, nodeB], IDENTITY_VIEWPORT)).toEqual({
      bounds: { height: 100, width: 300, x: 0, y: 0 },
      handle: 'nw',
      rotation: 0,
    });
  });

  it('should return null for a group selection when the point misses every handle', () => {
    // mock
    const nodeA = frame('a', 0, 0, 100, 100, 'parent-1');
    const nodeB = frame('b', 200, 0, 100, 100, 'parent-1');

    // result
    expect(getResizeHandleAtPoint({ x: 150, y: 50 }, [nodeA, nodeB], IDENTITY_VIEWPORT)).toBeNull();
  });
});
