// types
import { GapMode, LayoutMode } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getFrameGapState } from '../getFrameGapState';

vi.mock('store/design/utils/autoLayout/getAutoLayoutGapHandles/getAutoLayoutEffectiveGaps', () => ({
  getAutoLayoutEffectiveGaps: (_frame: unknown, children: unknown[]): unknown => ({ horizontal: children.length * 10, vertical: 7 }),
}));

const frame = (extra: Partial<TFrameNode>): TFrameNode => ({ childIds: ['a', 'missing'], ...extra }) as TFrameNode;
const nodes = { a: { id: 'a' } } as unknown as Record<string, TSceneNode>;

describe('getFrameGapState', () => {
  it('should read a fixed gap, defaulting the mode to fixed and the value to zero', () => {
    // result
    expect(getFrameGapState(frame({ horizontalGap: 12 }), nodes, 'horizontal')).toEqual({ mode: GapMode.fixed, value: 12 });
    expect(getFrameGapState(frame({}), nodes, 'horizontal')).toEqual({ mode: GapMode.fixed, value: 0 });
  });

  it('should read the vertical gap, falling back to the horizontal gap in a wrapping row', () => {
    // result
    expect(getFrameGapState(frame({ verticalGap: 4 }), nodes, 'vertical')).toEqual({ mode: GapMode.fixed, value: 4 });
    expect(getFrameGapState(frame({ horizontalGap: 9, layoutMode: LayoutMode.horizontal }), nodes, 'vertical')).toEqual({
      mode: GapMode.fixed,
      value: 9,
    });
    expect(getFrameGapState(frame({ horizontalGap: 9, layoutMode: LayoutMode.vertical }), nodes, 'vertical')).toEqual({
      mode: GapMode.fixed,
      value: 0,
    });
  });

  it('should measure an automatic gap from the existing children', () => {
    // result
    expect(getFrameGapState(frame({ horizontalGapMode: GapMode.auto }), nodes, 'horizontal')).toEqual({ mode: GapMode.auto, value: 10 });
    expect(getFrameGapState(frame({ verticalGapMode: GapMode.auto }), nodes, 'vertical')).toEqual({ mode: GapMode.auto, value: 7 });
  });
});
