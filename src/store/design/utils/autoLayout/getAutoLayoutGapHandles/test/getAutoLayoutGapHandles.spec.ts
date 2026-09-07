// types
import { GapMode, LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { getAutoLayoutGapHandles } from '../getAutoLayoutGapHandles';

const rect = (x: number, y: number, width = 50, height = 50): TRectangleNode => ({
  fill: '#000',
  height,
  id: `rect-${x}-${y}`,
  name: 'Rectangle',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width,
  x,
  y,
});

const frame = (layoutMode: LayoutMode, overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 200,
  id: 'frame-1',
  layoutMode,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getAutoLayoutGapHandles', () => {
  it('should return no handles when the frame is not an auto-layout frame', () => {
    // action
    const handles = getAutoLayoutGapHandles(frame(LayoutMode.freeForm), [rect(0, 0), rect(70, 0)]);

    // result
    expect(handles).toEqual({ horizontal: [], vertical: [] });
  });

  it('should return no handles for a single child', () => {
    // action
    const handles = getAutoLayoutGapHandles(frame(LayoutMode.horizontal), [rect(0, 0)]);

    // result
    expect(handles).toEqual({ horizontal: [], vertical: [] });
  });

  it('should return one horizontal handle for two children in a single row', () => {
    // action
    const handles = getAutoLayoutGapHandles(frame(LayoutMode.horizontal), [rect(0, 0), rect(70, 0)]);

    // result
    expect(handles.horizontal).toEqual([{ height: 50, width: 20, x: 50, y: 0 }]);
    expect(handles.vertical).toEqual([]);
  });

  it('should return one vertical handle for two children in a single column', () => {
    // action
    const handles = getAutoLayoutGapHandles(frame(LayoutMode.vertical), [rect(0, 0), rect(0, 70)]);

    // result
    expect(handles.vertical).toEqual([{ height: 20, width: 50, x: 0, y: 50 }]);
    expect(handles.horizontal).toEqual([]);
  });

  it('should skip the horizontal handle for a lone item wrapped onto its own row, but still show the row-gap handle', () => {
    // mock — row 0 has two children (0..120 wide), row 1 wraps a single child back to x=0
    const children = [rect(0, 0), rect(70, 0), rect(0, 70)];

    // action
    const handles = getAutoLayoutGapHandles(frame(LayoutMode.horizontal, { layoutWrap: true }), children);

    // result
    expect(handles.horizontal).toEqual([{ height: 50, width: 20, x: 50, y: 0 }]);
    expect(handles.vertical).toEqual([{ height: 20, width: 120, x: 0, y: 50 }]);
  });

  it('should skip the vertical handle for a lone item wrapped onto its own column, but still show the column-gap handle', () => {
    // mock — column 0 has two children (0..120 tall), column 1 wraps a single child back to y=0
    const children = [rect(0, 0), rect(0, 70), rect(70, 0)];

    // action
    const handles = getAutoLayoutGapHandles(frame(LayoutMode.vertical, { layoutWrap: true }), children);

    // result
    expect(handles.vertical).toEqual([{ height: 20, width: 50, x: 0, y: 50 }]);
    expect(handles.horizontal).toEqual([{ height: 120, width: 20, x: 50, y: 0 }]);
  });

  it('should hide the horizontal handles when horizontalGapMode is auto — there is no single gap to drag', () => {
    // action
    const handles = getAutoLayoutGapHandles(frame(LayoutMode.horizontal, { horizontalGapMode: GapMode.auto }), [rect(0, 0), rect(70, 0)]);

    // result
    expect(handles).toEqual({ horizontal: [], vertical: [] });
  });

  it('should hide the vertical handles when verticalGapMode is auto — there is no single gap to drag', () => {
    // action
    const handles = getAutoLayoutGapHandles(frame(LayoutMode.vertical, { verticalGapMode: GapMode.auto }), [rect(0, 0), rect(0, 70)]);

    // result
    expect(handles).toEqual({ horizontal: [], vertical: [] });
  });
});
