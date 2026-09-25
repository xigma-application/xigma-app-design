// utils
import { armVectorMultiSelectRotateOnPointerDown } from '../armVectorMultiSelectRotateOnPointerDown';
import { createMultiSelectContext } from './multiSelectFixtures';

const eligibleMock = vi.fn();
const boxMock = vi.fn();
const ringMock = vi.fn();
const segmentHitMock = vi.fn();
const armMock = vi.fn();

vi.mock('../../../../../../utils/getVectorMultiSelectVertexIds', () => ({ getVectorMultiSelectVertexIds: (): string[] => ['a', 'b'] }));
vi.mock('../../../../../../utils/isVectorMultiSelectBoxEligible', () => ({
  isVectorMultiSelectBoxEligible: (...args: unknown[]): unknown => eligibleMock(...args),
}));
vi.mock('../../../../../../utils/getVectorMultiSelectBox', () => ({
  getVectorMultiSelectBox: (...args: unknown[]): unknown => boxMock(...args),
}));
vi.mock('../../../../../../utils/isInVectorMultiSelectRotateRing', () => ({
  isInVectorMultiSelectRotateRing: (...args: unknown[]): unknown => ringMock(...args),
}));
vi.mock('../armVectorLassoOnPointerDown/hitsSelectedSegment', () => ({
  hitsSelectedSegment: (...args: unknown[]): unknown => segmentHitMock(...args),
}));
vi.mock('../../armVectorMultiSelectRotateDrag', () => ({
  armVectorMultiSelectRotateDrag: (...args: unknown[]): unknown => armMock(...args),
}));

const box = { bounds: { height: 20, width: 20, x: 0, y: 0 }, rotation: 10 };

describe('armVectorMultiSelectRotateOnPointerDown', () => {
  beforeEach(() => {
    armMock.mockClear();
    eligibleMock.mockReturnValue(true);
    segmentHitMock.mockReturnValue(false);
    boxMock.mockReturnValue(box);
    ringMock.mockReturnValue(true);
  });

  it('should arm rotating the selected vertices from the rotate ring', () => {
    // mock
    const ctx = createMultiSelectContext();

    // before
    const result = armVectorMultiSelectRotateOnPointerDown(ctx as never);

    // result
    expect(result).toBe(true);
    expect(ringMock).toHaveBeenCalledWith({ x: 5, y: 5 }, box.bounds, 'viewport', 10);
    expect(armMock).toHaveBeenCalledWith(
      'canvas',
      ctx.event,
      'rotateRef',
      expect.any(Object),
      expect.any(Array),
      ['a', 'b'],
      ['h'],
      box.bounds,
      10,
      { x: 5, y: 5 },
    );
  });

  it('should leave the pointer alone off the ring, without a box, on a selected segment, when not eligible or with Shift', () => {
    // mock
    ringMock.mockReturnValueOnce(false);

    // result
    expect(armVectorMultiSelectRotateOnPointerDown(createMultiSelectContext() as never)).toBeUndefined();
    boxMock.mockReturnValueOnce(null);
    expect(armVectorMultiSelectRotateOnPointerDown(createMultiSelectContext() as never)).toBeUndefined();
    segmentHitMock.mockReturnValueOnce(true);
    expect(armVectorMultiSelectRotateOnPointerDown(createMultiSelectContext() as never)).toBeUndefined();
    eligibleMock.mockReturnValue(false);
    expect(armVectorMultiSelectRotateOnPointerDown(createMultiSelectContext() as never)).toBeUndefined();
    expect(armVectorMultiSelectRotateOnPointerDown(createMultiSelectContext(true) as never)).toBeUndefined();
    expect(armMock).not.toHaveBeenCalled();
  });
});
