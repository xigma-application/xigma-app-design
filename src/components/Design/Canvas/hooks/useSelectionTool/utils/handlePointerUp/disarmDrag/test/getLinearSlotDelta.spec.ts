// types
import { LayoutMode } from 'types/design/enums';
import { TAutoLayoutFrame } from '../../../handlePointerMove/continueDrag/updateDragDropTarget/types';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getLinearSlotDelta } from '../getLinearSlotDelta';

const frame = (layoutMode: LayoutMode): TAutoLayoutFrame =>
  ({ childIds: ['a', 'b', 'c'], id: 'f', layoutMode }) as unknown as TAutoLayoutFrame;
const refs = (preview: unknown, dropTarget: unknown): TCanvasRefs =>
  ({
    transform: { autoLayoutDropTargetRef: { current: dropTarget }, autoLayoutReorderPreviewRef: { current: preview } },
  }) as unknown as TCanvasRefs;

describe('getLinearSlotDelta', () => {
  it('should step along the row by how far the reorder preview moved the dragged layer', () => {
    // result
    expect(getLinearSlotDelta(frame(LayoutMode.horizontal), ['a'], refs({ activeIndex: 2, frameId: 'f' }, null))).toEqual({
      steps: 2,
      x: 2,
      y: 0,
    });
  });

  it('should step down the column by the drop indicator index', () => {
    // result
    expect(
      getLinearSlotDelta(frame(LayoutMode.vertical), ['c'], refs({ activeIndex: 0, frameId: 'other' }, { frameId: 'f', index: 0 })),
    ).toEqual({
      steps: -2,
      x: 0,
      y: -2,
    });
  });

  it('should not move without a preview or indicator for this frame', () => {
    // result
    expect(getLinearSlotDelta(frame(LayoutMode.vertical), ['a'], refs(null, { frameId: 'other', index: 1 }))).toEqual({
      steps: 0,
      x: 0,
      y: 0,
    });
  });
});
