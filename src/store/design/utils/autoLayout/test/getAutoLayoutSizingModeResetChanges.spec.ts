// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { getAutoLayoutSizingModeResetChanges } from '../getAutoLayoutSizingModeResetChanges';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 100,
  id: 'frame-1',
  layoutMode: LayoutMode.horizontal,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

const rectangle: TRectangleNode = {
  fill: '#000',
  height: 50,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 50,
  x: 0,
  y: 0,
};

describe('getAutoLayoutSizingModeResetChanges', () => {
  it('should reset the width axis to fixed when the width changed while it was hugging, on a horizontal-flow frame', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(frame({ primaryAxisSizingMode: SizingMode.hug }), true, false);

    // result
    expect(changes).toEqual({ primaryAxisSizingMode: SizingMode.fixed });
  });

  it('should reset the height axis to fixed when the height changed while it was hugging, on a horizontal-flow frame', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(frame({ counterAxisSizingMode: SizingMode.hug }), false, true);

    // result
    expect(changes).toEqual({ counterAxisSizingMode: SizingMode.fixed });
  });

  it('should reset the width axis onto the counter axis field for a vertical-flow frame', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(
      frame({ counterAxisSizingMode: SizingMode.hug, layoutMode: LayoutMode.vertical }),
      true,
      false,
    );

    // result
    expect(changes).toEqual({ counterAxisSizingMode: SizingMode.fixed });
  });

  it('should reset the height axis onto the primary axis field for a vertical-flow frame', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(
      frame({ layoutMode: LayoutMode.vertical, primaryAxisSizingMode: SizingMode.hug }),
      false,
      true,
    );

    // result
    expect(changes).toEqual({ primaryAxisSizingMode: SizingMode.fixed });
  });

  it('should reset both axes when both changed and both were hugging', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(
      frame({ counterAxisSizingMode: SizingMode.hug, primaryAxisSizingMode: SizingMode.hug }),
      true,
      true,
    );

    // result
    expect(changes).toEqual({ counterAxisSizingMode: SizingMode.fixed, primaryAxisSizingMode: SizingMode.fixed });
  });

  it('should return no changes when the axis did not change, even while hugging', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(frame({ primaryAxisSizingMode: SizingMode.hug }), false, false);

    // result
    expect(changes).toEqual({});
  });

  it('should return no changes when the axis changed but was already fixed', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(frame({ primaryAxisSizingMode: SizingMode.fixed }), true, true);

    // result
    expect(changes).toEqual({});
  });

  it('should return no changes for a non-auto-layout frame', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(frame({ layoutMode: LayoutMode.freeForm }), true, true);

    // result
    expect(changes).toEqual({});
  });

  it('should return no changes for a non-frame node', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(rectangle, true, true);

    // result
    expect(changes).toEqual({});
  });
});
