// types
import { NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getAutoLayoutWrapFilledLines } from '../getAutoLayoutWrapFilledLines';

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

describe('getAutoLayoutWrapFilledLines', () => {
  it('should compute the content box from the frame and padding', () => {
    const layoutFrame = frame({ height: 80, width: 120 });
    const padding = { paddingBottom: 5, paddingLeft: 10, paddingRight: 10, paddingTop: 5 };

    const { contentBox } = getAutoLayoutWrapFilledLines(layoutFrame, padding, true, 0, SizingMode.fixed, SizingMode.fixed, []);

    expect(contentBox).toEqual({ height: 70, width: 100, x: 10, y: 5 });
  });

  it('should use the content box’s height as the available primary space for vertical layout', () => {
    const layoutFrame = frame({ height: 120, width: 80 });
    const lines = [[{ height: 20, id: 'a', width: 10 }]];

    const { filledLines } = getAutoLayoutWrapFilledLines(layoutFrame, NO_PADDING, false, 0, SizingMode.fixed, SizingMode.fixed, lines);

    expect(filledLines).toEqual([[{ height: 20, id: 'a', width: 10 }]]);
  });

  it('should fill each line independently, using each line’s own thickness as the counter size', () => {
    const layoutFrame = frame();
    const lines = [
      [
        { height: 0, heightSizingMode: SizingMode.fill, id: 'a', width: 30 },
        { height: 50, id: 'b', width: 20 },
      ],
      [{ height: 20, id: 'c', width: 30 }],
    ];

    const { filledLines } = getAutoLayoutWrapFilledLines(layoutFrame, NO_PADDING, true, 10, SizingMode.fixed, SizingMode.fixed, lines);

    expect(filledLines).toEqual([
      [
        { height: 50, heightSizingMode: SizingMode.fill, id: 'a', width: 30 },
        { height: 50, id: 'b', width: 20 },
      ],
      [{ height: 20, id: 'c', width: 30 }],
    ]);
  });
});
