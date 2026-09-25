// types
import { GapMode, LayoutMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { isAutoSpacingDisabled } from '../isAutoSpacingDisabled';

const frame = (layoutMode: LayoutMode, horizontalGapMode?: GapMode, verticalGapMode?: GapMode): TFrameNode =>
  ({ horizontalGapMode, layoutMode, verticalGapMode }) as TFrameNode;

describe('isAutoSpacingDisabled', () => {
  it('should be enabled when every frame spaces its flow axis automatically', () => {
    // result
    expect(isAutoSpacingDisabled([frame(LayoutMode.horizontal, GapMode.auto), frame(LayoutMode.vertical, undefined, GapMode.auto)])).toBe(
      false,
    );
  });

  it('should be disabled without frames or when any frame uses a fixed gap on its flow axis', () => {
    // result
    expect(isAutoSpacingDisabled([])).toBe(true);
    expect(
      isAutoSpacingDisabled([frame(LayoutMode.horizontal, GapMode.auto), frame(LayoutMode.vertical, GapMode.auto, GapMode.fixed)]),
    ).toBe(true);
  });
});
