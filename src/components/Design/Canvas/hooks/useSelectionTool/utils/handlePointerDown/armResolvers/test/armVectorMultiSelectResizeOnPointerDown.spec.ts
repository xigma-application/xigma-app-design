// utils
import { armVectorMultiSelectResizeOnPointerDown } from '../armVectorMultiSelectResizeOnPointerDown';
import { createMultiSelectContext } from './multiSelectFixtures';

const eligibleMock = vi.fn();
const boxMock = vi.fn();
const handleMock = vi.fn();
const segmentHitMock = vi.fn();
const armMock = vi.fn();

vi.mock('../../../../../../utils/getVectorMultiSelectVertexIds', () => ({ getVectorMultiSelectVertexIds: (): string[] => ['a', 'b'] }));
vi.mock('../../../../../../utils/isVectorMultiSelectBoxEligible', () => ({
  isVectorMultiSelectBoxEligible: (...args: unknown[]): unknown => eligibleMock(...args),
}));
vi.mock('../../../../../../utils/getVectorMultiSelectBox', () => ({
  getVectorMultiSelectBox: (...args: unknown[]): unknown => boxMock(...args),
}));
vi.mock('../../../../../../utils/getVectorMultiSelectResizeHandle', () => ({
  getVectorMultiSelectResizeHandle: (...args: unknown[]): unknown => handleMock(...args),
}));
vi.mock('../armVectorLassoOnPointerDown/hitsSelectedSegment', () => ({
  hitsSelectedSegment: (...args: unknown[]): unknown => segmentHitMock(...args),
}));
vi.mock('../../armVectorMultiSelectResizeDrag', () => ({
  armVectorMultiSelectResizeDrag: (...args: unknown[]): unknown => armMock(...args),
}));

const box = { bounds: { height: 20, width: 20, x: 0, y: 0 }, rotation: 10 };

describe('armVectorMultiSelectResizeOnPointerDown', () => {
  beforeEach(() => {
    armMock.mockClear();
    eligibleMock.mockReturnValue(true);
    segmentHitMock.mockReturnValue(false);
    boxMock.mockReturnValue(box);
    handleMock.mockReturnValue('topLeft');
  });

  it('should arm resizing the selected vertices from the hit box handle', () => {
    // mock
    const ctx = createMultiSelectContext();

    // before
    const result = armVectorMultiSelectResizeOnPointerDown(ctx as never);

    // result
    expect(result).toBe(true);
    expect(handleMock).toHaveBeenCalledWith({ x: 5, y: 5 }, box.bounds, 'viewport', 10);
    expect(armMock).toHaveBeenCalledWith(
      'canvas',
      ctx.event,
      'resizeRef',
      expect.any(Object),
      expect.any(Array),
      ['a', 'b'],
      ['h'],
      box.bounds,
      10,
      'topLeft',
    );
  });

  it('should not resize a flat box, a missed handle or a missing box', () => {
    // mock
    boxMock.mockReturnValueOnce({ bounds: { height: 0, width: 20, x: 0, y: 0 }, rotation: 0 });

    // result
    expect(armVectorMultiSelectResizeOnPointerDown(createMultiSelectContext() as never)).toBeUndefined();
    handleMock.mockReturnValue(null);
    expect(armVectorMultiSelectResizeOnPointerDown(createMultiSelectContext() as never)).toBeUndefined();
    boxMock.mockReturnValue(null);
    expect(armVectorMultiSelectResizeOnPointerDown(createMultiSelectContext() as never)).toBeUndefined();
    expect(armMock).not.toHaveBeenCalled();
  });

  it('should leave the pointer alone on a selected segment, when not eligible or with Shift', () => {
    // mock
    segmentHitMock.mockReturnValueOnce(true);

    // result
    expect(armVectorMultiSelectResizeOnPointerDown(createMultiSelectContext() as never)).toBeUndefined();
    eligibleMock.mockReturnValue(false);
    expect(armVectorMultiSelectResizeOnPointerDown(createMultiSelectContext() as never)).toBeUndefined();
    expect(armVectorMultiSelectResizeOnPointerDown(createMultiSelectContext(true) as never)).toBeUndefined();
    expect(armMock).not.toHaveBeenCalled();
  });
});
