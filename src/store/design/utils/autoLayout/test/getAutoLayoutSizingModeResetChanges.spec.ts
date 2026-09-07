// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode, TLineNode, TRectangleNode } from 'types/design/types';

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

const rectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
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
  ...overrides,
});

const line: TLineNode = {
  id: 'line-1',
  name: 'Line',
  parentId: null,
  stroke: '#000',
  type: NodeType.line,
  x1: 0,
  x2: 10,
  y1: 0,
  y2: 0,
};

describe('getAutoLayoutSizingModeResetChanges', () => {
  it('should reset the width axis to fixed when the width changed while it was hugging, on a horizontal-flow frame', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(frame({ widthSizingMode: SizingMode.hug }), true, false);

    // result
    expect(changes).toEqual({ widthSizingMode: SizingMode.fixed });
  });

  it('should reset the height axis to fixed when the height changed while it was hugging, on a horizontal-flow frame', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(frame({ heightSizingMode: SizingMode.hug }), false, true);

    // result
    expect(changes).toEqual({ heightSizingMode: SizingMode.fixed });
  });

  it('should reset the width axis onto the counter axis field for a vertical-flow frame', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(
      frame({ layoutMode: LayoutMode.vertical, widthSizingMode: SizingMode.hug }),
      true,
      false,
    );

    // result
    expect(changes).toEqual({ widthSizingMode: SizingMode.fixed });
  });

  it('should reset the height axis onto the primary axis field for a vertical-flow frame', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(
      frame({ heightSizingMode: SizingMode.hug, layoutMode: LayoutMode.vertical }),
      false,
      true,
    );

    // result
    expect(changes).toEqual({ heightSizingMode: SizingMode.fixed });
  });

  it('should reset both axes when both changed and both were hugging', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(
      frame({ heightSizingMode: SizingMode.hug, widthSizingMode: SizingMode.hug }),
      true,
      true,
    );

    // result
    expect(changes).toEqual({ heightSizingMode: SizingMode.fixed, widthSizingMode: SizingMode.fixed });
  });

  it('should return no changes when the axis did not change, even while hugging', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(frame({ widthSizingMode: SizingMode.hug }), false, false);

    // result
    expect(changes).toEqual({});
  });

  it('should return no changes when the axis changed but was already fixed', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(frame({ widthSizingMode: SizingMode.fixed }), true, true);

    // result
    expect(changes).toEqual({});
  });

  it('should return no changes for a free-form frame left at the default fixed sizing', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(frame({ layoutMode: LayoutMode.freeForm }), true, true);

    // result
    expect(changes).toEqual({});
  });

  it('should return no changes for a plain rectangle left at the default fixed sizing', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(rectangle(), true, true);

    // result
    expect(changes).toEqual({});
  });

  it('should reset a filling child rectangle back to fixed when its width changed, even though it is not a frame', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(rectangle({ widthSizingMode: SizingMode.fill }), true, false);

    // result
    expect(changes).toEqual({ widthSizingMode: SizingMode.fixed });
  });

  it('should reset a filling child height back to fixed when its height changed', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(rectangle({ heightSizingMode: SizingMode.fill }), false, true);

    // result
    expect(changes).toEqual({ heightSizingMode: SizingMode.fixed });
  });

  it('should return no changes for a node without a box geometry, like a line', () => {
    // action
    const changes = getAutoLayoutSizingModeResetChanges(line, true, true);

    // result
    expect(changes).toEqual({});
  });
});
