// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getAutoLayoutWrapSizingModes } from '../getAutoLayoutWrapSizingModes';

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

describe('getAutoLayoutWrapSizingModes', () => {
  it('should resolve width as primary and height as counter for horizontal layout', () => {
    const layoutFrame = frame({ heightSizingMode: SizingMode.fixed, maxWidth: 300, widthSizingMode: SizingMode.hug });

    const sizingModes = getAutoLayoutWrapSizingModes(layoutFrame, LayoutMode.horizontal);

    expect(sizingModes).toEqual({
      counterMode: SizingMode.fixed,
      heightMode: SizingMode.fixed,
      isHorizontal: true,
      primaryMax: 300,
      primaryMode: SizingMode.hug,
      widthMode: SizingMode.hug,
    });
  });

  it('should resolve height as primary and width as counter for vertical layout', () => {
    const layoutFrame = frame({ heightSizingMode: SizingMode.hug, maxHeight: 250, widthSizingMode: SizingMode.fixed });

    const sizingModes = getAutoLayoutWrapSizingModes(layoutFrame, LayoutMode.vertical);

    expect(sizingModes).toEqual({
      counterMode: SizingMode.fixed,
      heightMode: SizingMode.hug,
      isHorizontal: false,
      primaryMax: 250,
      primaryMode: SizingMode.hug,
      widthMode: SizingMode.fixed,
    });
  });

  it('should default missing sizing modes to fixed', () => {
    const layoutFrame = frame();

    const sizingModes = getAutoLayoutWrapSizingModes(layoutFrame, LayoutMode.horizontal);

    expect(sizingModes.heightMode).toBe(SizingMode.fixed);
    expect(sizingModes.widthMode).toBe(SizingMode.fixed);
  });
});
