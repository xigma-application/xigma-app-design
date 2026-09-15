// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getGridSectionHighlightCells } from '../getGridSectionHighlightCells';

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
  gridColumnCount: 3,
  gridRowCount: 2,
  height: 100,
  id: 'frame-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getGridSectionHighlightCells', () => {
  it('should derive cells from a live track selection, spanning the whole cross axis', () => {
    // mock
    const frame = buildFrame();
    const nodesById = { 'frame-1': frame };

    // action
    const result = getGridSectionHighlightCells(nodesById, null, { axis: 'column', frameId: 'frame-1', indices: [1] });

    // result — column 1, spanning both rows (rowCount: 2)
    expect(result).toEqual({
      cells: [
        { column: 1, row: 0 },
        { column: 1, row: 1 },
      ],
      frameId: 'frame-1',
    });
  });

  it('should span the column axis when the selection is by row', () => {
    // mock
    const frame = buildFrame();
    const nodesById = { 'frame-1': frame };

    // action
    const result = getGridSectionHighlightCells(nodesById, null, { axis: 'row', frameId: 'frame-1', indices: [0] });

    // result — row 0, spanning all 3 columns (gridColumnCount: 3)
    expect(result?.cells).toEqual([
      { column: 0, row: 0 },
      { column: 1, row: 0 },
      { column: 2, row: 0 },
    ]);
  });

  it('should fall back to the given static highlight cells when there is no live track selection', () => {
    // mock
    const frame = buildFrame();
    const nodesById = { 'frame-1': frame };
    const highlight = { cells: [{ column: 0, row: 0 }], frameId: 'frame-1' };

    // action
    const result = getGridSectionHighlightCells(nodesById, highlight, null);

    // result
    expect(result).toEqual(highlight);
  });

  it('should prefer the live track selection over a static highlight for the same frame', () => {
    // mock
    const frame = buildFrame();
    const nodesById = { 'frame-1': frame };
    const highlight = { cells: [{ column: 0, row: 0 }], frameId: 'frame-1' };

    // action
    const result = getGridSectionHighlightCells(nodesById, highlight, { axis: 'column', frameId: 'frame-1', indices: [2] });

    // result
    expect(result?.cells).toEqual([
      { column: 2, row: 0 },
      { column: 2, row: 1 },
    ]);
  });

  it('should return null when neither a highlight nor a track selection is given', () => {
    // mock
    const frame = buildFrame();
    const nodesById = { 'frame-1': frame };

    // action
    const result = getGridSectionHighlightCells(nodesById, null, null);

    // result
    expect(result).toBeNull();
  });

  it('should return null when the resolved frame no longer exists', () => {
    // mock
    const highlight = { cells: [{ column: 0, row: 0 }], frameId: 'gone' };

    // action
    const result = getGridSectionHighlightCells({}, highlight, null);

    // result
    expect(result).toBeNull();
  });
});
