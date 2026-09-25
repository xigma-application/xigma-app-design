// utils
import { armVectorMultiSelectBoxOnPointerDown } from '../armVectorMultiSelectBoxOnPointerDown';
import { createMultiSelectContext } from './multiSelectFixtures';

const eligibleMock = vi.fn();
const boxMock = vi.fn();
const armMock = vi.fn();

vi.mock('../../../../../../utils/getVectorMultiSelectVertexIds', () => ({ getVectorMultiSelectVertexIds: (): string[] => ['a', 'b'] }));
vi.mock('../../../../../../utils/isVectorMultiSelectBoxEligible', () => ({
  isVectorMultiSelectBoxEligible: (...args: unknown[]): unknown => eligibleMock(...args),
}));
vi.mock('../../../../../../utils/getVectorMultiSelectBox', () => ({
  getVectorMultiSelectBox: (...args: unknown[]): unknown => boxMock(...args),
}));
vi.mock('../../armVectorMultiDrag', () => ({ armVectorMultiDrag: (...args: unknown[]): unknown => armMock(...args) }));

describe('armVectorMultiSelectBoxOnPointerDown', () => {
  beforeEach(() => {
    armMock.mockClear();
    eligibleMock.mockReturnValue(true);
  });

  it('should drag the selected vertices when pressed inside their rotated box', () => {
    // mock
    const box = { bounds: { height: 20, width: 20, x: 0, y: 0 }, rotation: 45 };
    boxMock.mockReturnValue(box);
    const ctx = createMultiSelectContext();

    // before
    const result = armVectorMultiSelectBoxOnPointerDown(ctx as never);

    // result
    expect(result).toBe(true);
    expect(armMock).toHaveBeenCalledWith(
      'canvas',
      ctx.event,
      ctx.canvasRefs,
      expect.any(Object),
      expect.any(Array),
      ['a', 'b'],
      ['h'],
      { x: 5, y: 5 },
      null,
      box,
    );
  });

  it('should leave the pointer alone outside the box, without a box, when not eligible or with Shift', () => {
    // mock
    boxMock.mockReturnValueOnce({ bounds: { height: 2, width: 2, x: 100, y: 100 }, rotation: 0 }).mockReturnValueOnce(null);

    // result
    expect(armVectorMultiSelectBoxOnPointerDown(createMultiSelectContext() as never)).toBeUndefined();
    expect(armVectorMultiSelectBoxOnPointerDown(createMultiSelectContext() as never)).toBeUndefined();
    eligibleMock.mockReturnValue(false);
    expect(armVectorMultiSelectBoxOnPointerDown(createMultiSelectContext() as never)).toBeUndefined();
    expect(armVectorMultiSelectBoxOnPointerDown(createMultiSelectContext(true) as never)).toBeUndefined();
    expect(armMock).not.toHaveBeenCalled();
  });
});
