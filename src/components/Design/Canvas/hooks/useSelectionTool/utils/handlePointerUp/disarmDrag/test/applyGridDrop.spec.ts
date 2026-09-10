// store
import { updateNode } from 'store/design/slice';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { applyGridDrop } from '../applyGridDrop';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  gridColumnCount: 2,
  height: 200,
  id: 'grid-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

describe('applyGridDrop', () => {
  it('should turn automatic placement off for the frame', () => {
    // mock
    const dispatch = vi.fn();

    // action
    applyGridDrop(dispatch, frame(), { columnStart: 0, frameId: 'grid-1', rowStart: 0 }, ['a']);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { gridAutoPlacement: false }, id: 'grid-1' }));
  });

  it('should pin the dropped node to the hovered cell and stretch it to fill', () => {
    // mock
    const dispatch = vi.fn();

    // action
    applyGridDrop(dispatch, frame(), { columnStart: 1, frameId: 'grid-1', rowStart: 3 }, ['a']);

    // result
    expect(dispatch).toHaveBeenCalledWith(
      updateNode({
        changes: {
          gridColumnAnchorIndex: 1,
          gridRowAnchorIndex: 3,
          heightSizingMode: SizingMode.fill,
          widthSizingMode: SizingMode.fill,
        },
        id: 'a',
      }),
    );
  });

  it('should treat a frame with no explicit column count as a single column', () => {
    // mock
    const dispatch = vi.fn();

    // action — single column: cell index 2 => column 0, row 2
    applyGridDrop(dispatch, frame({ gridColumnCount: undefined }), { columnStart: 0, frameId: 'grid-1', rowStart: 2 }, ['a']);

    // result
    expect(dispatch).toHaveBeenCalledWith(
      updateNode({
        changes: { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 2, heightSizingMode: SizingMode.fill, widthSizingMode: SizingMode.fill },
        id: 'a',
      }),
    );
  });

  it('should fill the following cells in reading order for a multi-node drop', () => {
    // mock
    const dispatch = vi.fn();

    // action — 2-column grid, starting at column 1 row 0
    applyGridDrop(dispatch, frame(), { columnStart: 1, frameId: 'grid-1', rowStart: 0 }, ['a', 'b', 'c']);

    // result — cells (1,0), (0,1), (1,1)
    expect(dispatch).toHaveBeenCalledWith(
      updateNode({
        changes: { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 1, heightSizingMode: SizingMode.fill, widthSizingMode: SizingMode.fill },
        id: 'b',
      }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      updateNode({
        changes: { gridColumnAnchorIndex: 1, gridRowAnchorIndex: 1, heightSizingMode: SizingMode.fill, widthSizingMode: SizingMode.fill },
        id: 'c',
      }),
    );
  });
});
