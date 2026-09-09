// types
import { NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getAutoLayoutWrapAvailablePrimarySpace } from '../getAutoLayoutWrapAvailablePrimarySpace';

const NO_PADDING = { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 };

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 100,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getAutoLayoutWrapAvailablePrimarySpace', () => {
  it('should return the content box’s width for horizontal layout when not hugging', () => {
    const layoutFrame = frame({ width: 120 });
    const padding = { ...NO_PADDING, paddingLeft: 10, paddingRight: 10 };

    const availablePrimary = getAutoLayoutWrapAvailablePrimarySpace(layoutFrame, true, SizingMode.fixed, undefined, padding);

    expect(availablePrimary).toBe(100);
  });

  it('should return the content box’s height for vertical layout when not hugging', () => {
    const layoutFrame = frame({ height: 120 });
    const padding = { ...NO_PADDING, paddingBottom: 10, paddingTop: 10 };

    const availablePrimary = getAutoLayoutWrapAvailablePrimarySpace(layoutFrame, false, SizingMode.fixed, undefined, padding);

    expect(availablePrimary).toBe(100);
  });

  it('should return maxWidth minus the primary padding when hugging with a max set', () => {
    const layoutFrame = frame({ width: 999 });
    const padding = { ...NO_PADDING, paddingLeft: 10, paddingRight: 10 };

    const availablePrimary = getAutoLayoutWrapAvailablePrimarySpace(layoutFrame, true, SizingMode.hug, 200, padding);

    expect(availablePrimary).toBe(180);
  });

  it('should fall back to the content box’s width when hugging without a max', () => {
    const layoutFrame = frame({ width: 150 });

    const availablePrimary = getAutoLayoutWrapAvailablePrimarySpace(layoutFrame, true, SizingMode.hug, undefined, NO_PADDING);

    expect(availablePrimary).toBe(150);
  });
});
