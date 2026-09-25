// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorWidthPointHandleHit } from '../../../../../../../utils/getVectorWidthPointHandleAtPoint';

// utils
import { armVectorWidthRegulatorShiftToggle } from '../armVectorWidthRegulatorShiftToggle';

vi.mock('../../../../toggleVectorWidthRegulatorSelection', () => ({
  toggleVectorWidthRegulatorSelection: (selected: unknown[], nodeId: string, pointId: string): unknown => [
    ...selected,
    `${nodeId}:${pointId}`,
  ],
}));

const hit = { nodeId: 'v', point: { id: 'p1' } } as TVectorWidthPointHandleHit;
const refs = (): TCanvasRefs => ({ vectorEdit: { selectedVectorWidthHandlesRef: { current: ['old'] } } }) as unknown as TCanvasRefs;

describe('armVectorWidthRegulatorShiftToggle', () => {
  it('should toggle the regulator in the selection on a Shift press', () => {
    // mock
    const canvasRefs = refs();

    // before
    const result = armVectorWidthRegulatorShiftToggle(canvasRefs, { shiftKey: true } as PointerEvent, hit);

    // result
    expect(result).toBe(true);
    expect(canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current).toEqual(['old', 'v:p1']);
  });

  it('should do nothing without Shift or without a hit', () => {
    // result
    expect(armVectorWidthRegulatorShiftToggle(refs(), { shiftKey: false } as PointerEvent, hit)).toBeUndefined();
    expect(armVectorWidthRegulatorShiftToggle(refs(), { shiftKey: true } as PointerEvent, null)).toBeUndefined();
  });
});
